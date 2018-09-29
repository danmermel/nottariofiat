#!/bin/bash
cp ../config_test.json ./config.json
zip -r serverless_check.zip package.json index.js db.js config.json 
aws lambda update-function-code --function-name nottarioFiatipfsCheck --zip-file fileb://serverless_check.zip


