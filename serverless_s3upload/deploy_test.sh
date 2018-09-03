#!/bin/bash
cp ../config_test.json ./config.json
zip -r s3upload.zip package.json db.js index.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiats3Upload --zip-file fileb://s3upload.zip


