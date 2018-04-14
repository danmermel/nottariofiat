#!/bin/bash
cp ../config_test.json ./config.json
zip -r nottariofiat.zip package.json index.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatNotify --zip-file fileb://nottariofiat.zip


