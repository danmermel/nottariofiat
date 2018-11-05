#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

cp "../config_${1}.json" ./config.json
zip -r nottariofiat.zip package.json index.js token.js db.js queue.js config.json node_modules/
aws lambda update-function-code --function-name "nottarioFiatPayment-${1}" --zip-file fileb://nottariofiat.zip


