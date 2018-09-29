#!/bin/bash
cp ../config_prod.json ./config.json
zip -r serverless_check.zip package.json index.js db.js config.json 
aws lambda update-function-code --function-name nottarioFiatipfsCheckProd --zip-file fileb://serverless_check.zip


