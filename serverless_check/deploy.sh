#!/bin/bash
zip -r nottariofiat.zip package.json index.js db.js config.json node_modules/
aws lambda update-function-code --function-name nottarioFiatCheck --zip-file fileb://nottariofiat.zip


