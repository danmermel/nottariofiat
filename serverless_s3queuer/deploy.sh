#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

cp "../config_${1}.json" ./config.json
zip -r s3queuer.zip package.json queue.js db.js index.js config.json 
aws lambda update-function-code --function-name "nottarioFiatipfsQueuer-${1}" --zip-file fileb://s3queuer.zip


