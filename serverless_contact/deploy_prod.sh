#!/bin/bash
cp ../config_prod.json ./config.json
zip -r nottariofiat.zip package.json index.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatContactProd --zip-file fileb://nottariofiat.zip


