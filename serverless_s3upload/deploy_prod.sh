#!/bin/bash
cp ../config_prod.json ./config.json
zip -r s3upload.zip package.json index.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiats3UploadProd --zip-file fileb://s3upload.zip


