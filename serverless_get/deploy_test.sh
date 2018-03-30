#!/bin/bash
cp ../config_test.json ./config.json
zip -r nottariofiat.zip package.json index.js db.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatGet --zip-file fileb://nottariofiat.zip


