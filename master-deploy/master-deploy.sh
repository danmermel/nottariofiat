#!/bin/bash
SUFFIX="stage"
echo "$SUFFIX ${SUFFIX}"

echo "create main dynamodb table with one secondary index..."
aws dynamodb create-table --table-name "nottariodb-${SUFFIX}" \
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=eth_contract_id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput WriteCapacityUnits=1,ReadCapacityUnits=1 \
  --stream-specification StreamEnabled=true,StreamViewType='NEW_AND_OLD_IMAGES' \
  --global-secondary-indexes IndexName=eth_contract_id-index,KeySchema=["{AttributeName=eth_contract_id,KeyType=HASH}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=1,WriteCapacityUnits=1}"

echo "create tokens dynamodb table ..."
aws dynamodb create-table --table-name "tokensdb-${SUFFIX}" \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput WriteCapacityUnits=1,ReadCapacityUnits=1 

echo "create ipfs dynamodb table ..."
aws dynamodb create-table --table-name "ipfsdb-${SUFFIX}" \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput WriteCapacityUnits=1,ReadCapacityUnits=1 

echo "create nottario queue .."
aws sqs create-queue --queue-name "nottario-${SUFFIX}" --attributes VisibilityTimeout=60

echo "create error  queue .."
aws sqs create-queue --queue-name "errors-${SUFFIX}" 

echo "create ipfs queue .."
aws sqs create-queue --queue-name "ipfs-${SUFFIX}" --attributes VisibilityTimeout=60

echo "create s3 bucket for ipfs .."
aws s3 mb "s3://ipfsuploads-${SUFFIX}" --region eu-west-1

echo "add cors to bucket"
aws s3api put-bucket-cors --bucket ipfsuploads-${SUFFIX} --cors-configuration file://cors.json


echo "create role for lambda to access stuff.."
aws iam create-role --role-name nottario --assume-role-policy-document file://policy.json

echo "now add policies to the role to give access to services..."
# inline policy for lambda to be able to write logs
aws iam put-role-policy --role-name nottario --policy-name logs-inline --policy-document file://inline-policy.json
# AWS managed policies
aws iam attach-role-policy --role-name nottario --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam attach-role-policy --role-name nottario --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-role-policy --role-name nottario --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess
aws iam attach-role-policy --role-name nottario --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

echo "sleeping for 10 secs to allow the machine to settle!"
sleep 10

echo "create lambda functions"
aws lambda create-function --function-name "nottarioFiatCheck-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiats3Upload-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiatipfsCheck-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiatipfsQueuer-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiatContact-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiatPayment-${SUFFIX}" --timeout 30 --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiatGet-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 
aws lambda create-function --function-name "nottarioFiatNotify-${SUFFIX}" --runtime nodejs8.10 --role arn:aws:iam::160991186365:role/nottario --handler index.handler --zip-file fileb://dummy.zip 


# connecting table to lambda!
echo "create Lamda-->dynamodb link for Notify"
aws lambda add-permission \
    --function-name nottarioFiatNotify-$SUFFIX \
    --statement-id nottarioFiatNotify-$SUFFIX \
    --action "lambda:*" \
    --principal dynamodb.amazonaws.com \
    --source-arn "arn:aws:dynamodb:eu-west-1:160991186365:table/*/*/*"

# connecting  dynamodb table to lambda
DBARN=`aws dynamodb describe-table --table-name nottariodb-$SUFFIX --query "Table.LatestStreamArn" --output text`
echo "DBARN = $DBARN"
aws lambda create-event-source-mapping \
 --event-source-arn $DBARN \
 --function-name nottarioFiatNotify-$SUFFIX \
 --enabled \
 --batch-size 1 \
 --starting-position LATEST


API_ID=$(aws apigateway get-rest-apis --query 'items[?name==`nottario-${SUFFIX}`].id' --output text)
# If the API does not already exist
if [ "$API_ID" == "" ] 
  then
  echo "create api gateway"
  API_ID=$(aws apigateway create-rest-api --name "nottario-${SUFFIX}" --query id --output text)
  PARENT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path==`/`].id' --output text)

  # nottarioFiatCheck
  RESOURCE_ID=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "nottarioFiatCheck" --query id --output text)

  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method ANY --authorization-type NONE

  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID \
                                 --http-method ANY --integration-http-method POST \
                                 --type AWS_PROXY --uri "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiatCheck-${SUFFIX}/invocations" \
                                 --passthrough-behavior WHEN_NO_MATCH --cache-namespace $RESOURCE_ID \
                                 --content-handling CONVERT_TO_TEXT --timeout-in-millis 29000

echo "put method"
  aws apigateway put-method --rest-api-id $API_ID \
                            --resource-id $RESOURCE_ID \
                            --http-method OPTIONS \
                            --authorization-type NONE

echo "put integration"
  aws apigateway put-integration --rest-api-id $API_ID  \
                                 --resource-id $RESOURCE_ID \
                                 --http-method OPTIONS \
                                 --type MOCK \
                                 --passthrough-behavior WHEN_NO_MATCH \
                                 --cache-namespace $RESOURCE_ID \
                                 --timeout-in-millis 29000 \
                                 --request-templates '{"application/json": "{\"statusCode\": 200}"}'

echo "put method response"
  aws apigateway put-method-response --rest-api-id $API_ID  \
                                     --resource-id $RESOURCE_ID \
                                     --http-method OPTIONS  \
                                     --status-code 200  \
                                     --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\": false,\"method.response.header.Access-Control-Allow-Methods\": false,\"method.response.header.Access-Control-Allow-Headers\": false}"  \
                                     --response-models "{\"application/json\":\"Empty\"}"

echo "put integration response"
  aws apigateway put-integration-response  --rest-api-id $API_ID \
                                           --resource-id $RESOURCE_ID \
                                           --http-method OPTIONS \
                                           --status-code 200 \
                                           --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'*'\",\"method.response.header.Access-Control-Allow-Methods\":\"'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'\",\"method.response.header.Access-Control-Allow-Headers\":\"'*'\"}" \
                                           --response-templates "{\"application/json\":\"\"}"

  # nottarioFiatContact
  RESOURCE_ID=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "nottarioFiatContact" --query id --output text)
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method ANY --authorization-type NONE
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID \
                                 --http-method ANY --integration-http-method POST \
                                 --type AWS_PROXY --uri "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiatContact-${SUFFIX}/invocations" \
                                 --passthrough-behavior WHEN_NO_MATCH --cache-namespace $RESOURCE_ID \
                                 --content-handling CONVERT_TO_TEXT --timeout-in-millis 29000


  # nottarioFiatGet
  RESOURCE_ID=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "nottarioFiatGet" --query id --output text)
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method ANY --authorization-type NONE
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID \
                                 --http-method ANY --integration-http-method POST \
                                 --type AWS_PROXY --uri "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiatGet-${SUFFIX}/invocations" \
                                 --passthrough-behavior WHEN_NO_MATCH --cache-namespace $RESOURCE_ID \
                                 --content-handling CONVERT_TO_TEXT --timeout-in-millis 29000

  # nottarioFiatipfsCheck
  RESOURCE_ID=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "nottarioFiatipfsCheck" --query id --output text)
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method ANY --authorization-type NONE
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID \
                                 --http-method ANY --integration-http-method POST \
                                 --type AWS_PROXY --uri "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiatipfsCheck-${SUFFIX}/invocations" \
                                 --passthrough-behavior WHEN_NO_MATCH --cache-namespace $RESOURCE_ID \
                                 --content-handling CONVERT_TO_TEXT --timeout-in-millis 29000



echo "put method"
  aws apigateway put-method --rest-api-id $API_ID \
                            --resource-id $RESOURCE_ID \
                            --http-method OPTIONS \
                            --authorization-type NONE

echo "put integration"
  aws apigateway put-integration --rest-api-id $API_ID  \
                                 --resource-id $RESOURCE_ID \
                                 --http-method OPTIONS \
                                 --type MOCK \
                                 --passthrough-behavior WHEN_NO_MATCH \
                                 --cache-namespace $RESOURCE_ID \
                                 --timeout-in-millis 29000 \
                                 --request-templates '{"application/json": "{\"statusCode\": 200}"}'

echo "put method response"
  aws apigateway put-method-response --rest-api-id $API_ID  \
                                     --resource-id $RESOURCE_ID \
                                     --http-method OPTIONS  \
                                     --status-code 200  \
                                     --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\": false,\"method.response.header.Access-Control-Allow-Methods\": false,\"method.response.header.Access-Control-Allow-Headers\": false}"  \
                                     --response-models "{\"application/json\":\"Empty\"}"

echo "put integration response"
  aws apigateway put-integration-response  --rest-api-id $API_ID \
                                           --resource-id $RESOURCE_ID \
                                           --http-method OPTIONS \
                                           --status-code 200 \
                                           --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'*'\",\"method.response.header.Access-Control-Allow-Methods\":\"'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'\",\"method.response.header.Access-Control-Allow-Headers\":\"'*'\"}" \
                                           --response-templates "{\"application/json\":\"\"}"



  # nottarioFiatPayment
  RESOURCE_ID=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "nottarioFiatPayment" --query id --output text)
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method ANY --authorization-type NONE
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID \
                                 --http-method ANY --integration-http-method POST \
                                 --type AWS_PROXY --uri "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiatPayment-${SUFFIX}/invocations" \
                                 --passthrough-behavior WHEN_NO_MATCH --cache-namespace $RESOURCE_ID \
                                 --content-handling CONVERT_TO_TEXT --timeout-in-millis 29000

  # nottarioFiats3Upload
  RESOURCE_ID=$(aws apigateway create-resource --rest-api-id $API_ID --parent-id $PARENT_ID --path-part "nottarioFiats3Upload" --query id --output text)
  aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method ANY --authorization-type NONE
  aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID \
                                 --http-method ANY --integration-http-method POST \
                                 --type AWS_PROXY --uri "arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiats3Upload-${SUFFIX}/invocations" \
                                 --passthrough-behavior WHEN_NO_MATCH --cache-namespace $RESOURCE_ID \
                                 --content-handling CONVERT_TO_TEXT --timeout-in-millis 29000


echo "put method"
  aws apigateway put-method --rest-api-id $API_ID \
                            --resource-id $RESOURCE_ID \
                            --http-method OPTIONS \
                            --authorization-type NONE

echo "put integration"
  aws apigateway put-integration --rest-api-id $API_ID  \
                                 --resource-id $RESOURCE_ID \
                                 --http-method OPTIONS \
                                 --type MOCK \
                                 --passthrough-behavior WHEN_NO_MATCH \
                                 --cache-namespace $RESOURCE_ID \
                                 --timeout-in-millis 29000 \
                                 --request-templates '{"application/json": "{\"statusCode\": 200}"}'

echo "put method response"
  aws apigateway put-method-response --rest-api-id $API_ID  \
                                     --resource-id $RESOURCE_ID \
                                     --http-method OPTIONS  \
                                     --status-code 200  \
                                     --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\": false,\"method.response.header.Access-Control-Allow-Methods\": false,\"method.response.header.Access-Control-Allow-Headers\": false}"  \
                                     --response-models "{\"application/json\":\"Empty\"}"

echo "put integration response"
  aws apigateway put-integration-response  --rest-api-id $API_ID \
                                           --resource-id $RESOURCE_ID \
                                           --http-method OPTIONS \
                                           --status-code 200 \
                                           --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'*'\",\"method.response.header.Access-Control-Allow-Methods\":\"'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'\",\"method.response.header.Access-Control-Allow-Headers\":\"'*'\"}" \
                                           --response-templates "{\"application/json\":\"\"}"


  # create stage name
  aws apigateway create-deployment --rest-api-id $API_ID --stage-name ${SUFFIX}

  # Allow lambda function to be executed by API Gateway

  aws lambda add-permission \
    --function-name nottarioFiatContact-${SUFFIX} \
    --statement-id nottarioFiatContact-${SUFFIX} \
    --action "lambda:*" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:eu-west-1:160991186365:${API_ID}/*/*/nottarioFiatContact"

  aws lambda add-permission \
    --function-name nottarioFiatCheck-${SUFFIX} \
    --statement-id nottarioFiatCheck-${SUFFIX} \
    --action "lambda:*" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:eu-west-1:160991186365:${API_ID}/*/*/nottarioFiatCheck"

  aws lambda add-permission \
    --function-name nottarioFiats3Upload-${SUFFIX} \
    --statement-id nottarioFiats3Upload-${SUFFIX} \
    --action "lambda:*" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:eu-west-1:160991186365:${API_ID}/*/*/nottarioFiats3Upload"

  aws lambda add-permission \
    --function-name nottarioFiatipfsCheck-${SUFFIX} \
    --statement-id nottarioFiatipfsCheck-${SUFFIX} \
    --action "lambda:*" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:eu-west-1:160991186365:${API_ID}/*/*/nottarioFiatipfsCheck"

  aws lambda add-permission \
    --function-name nottarioFiatPayment-${SUFFIX} \
    --statement-id nottarioFiatPayment-${SUFFIX} \
    --action "lambda:*" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:eu-west-1:160991186365:${API_ID}/*/*/nottarioFiatPayment"

  aws lambda add-permission \
    --function-name nottarioFiatGet-${SUFFIX} \
    --statement-id nottarioFiatGet-${SUFFIX} \
    --action "lambda:*" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:eu-west-1:160991186365:${API_ID}/*/*/nottarioFiatGet"



fi

# connecting table to lambda!
echo "create S3->Lambda permission for ipfsQueuer"
aws lambda add-permission \
    --function-name nottarioFiatipfsQueuer-$SUFFIX \
    --statement-id nottarioFiatipfsQueuer-$SUFFIX \
    --action "lambda:*" \
    --principal s3.amazonaws.com \
    --source-arn "arn:aws:s3:::ipfsuploads-stage"

echo "create ipfs trigger from S3"
LAMBDACONFIG='{"LambdaFunctionConfigurations":[{"Id":"IPFS_upload_trigger","LambdaFunctionArn":"arn:aws:lambda:eu-west-1:160991186365:function:nottarioFiatipfsQueuer-SUFFIX","Events":["s3:ObjectCreated:*"]}]}'
CONFIG=`echo $LAMBDACONFIG | sed s/SUFFIX/${SUFFIX}/`
aws s3api put-bucket-notification-configuration --bucket "ipfsuploads-${SUFFIX}" --notification-configuration "$CONFIG"




