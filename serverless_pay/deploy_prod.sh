#!/bin/bash
cp ../config_prod.json ./config.json
zip -r nottariofiat.zip package.json index.js db.js queue.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatPaymentProd --zip-file fileb://nottariofiat.zip


