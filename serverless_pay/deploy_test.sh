#!/bin/bash
cp ../config_test.json ./config.json
zip -r nottariofiat.zip package.json index.js token.js db.js queue.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatPayment --zip-file fileb://nottariofiat.zip


