#!/bin/bash
zip -r nottariofiat.zip package.json index.js db.js queue.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatPayment --zip-file fileb://nottariofiat.zip


