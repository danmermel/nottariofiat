#!/bin/bash
if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

cp "../config_${1}.json" ./config.json
zip -r serverless_check.zip package.json index.js db.js config.json 
aws lambda update-function-code --function-name "nottarioFiatipfsCheck-${1}" --zip-file fileb://serverless_check.zip


