#!/bin/bash

if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"

cp "../config_${1}.json" ./config.json
zip -r s3upload.zip package.json db.js index.js config.json node_modules/
aws lambda update-function-code --function-name "nottarioFiats3Upload-${1}" --zip-file fileb://s3upload.zip


