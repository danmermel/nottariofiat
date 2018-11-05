#!/bin/bash
if [ -z $1 ] 
  then
  echo "Missing deployment stage"
  exit 1
fi
echo "Deployment stage = ${1}"


cd serverless_check
./deploy.sh $1
cd ..
cd serverless_notify
./deploy.sh $1
cd ..
cd serverless_get
./deploy.sh $1
cd ..
cd serverless_pay
./deploy.sh $1
cd ..
cd serverless_contact
./deploy.sh $1
cd ..
cd serverless_s3queuer
./deploy.sh $1
cd ..
cd serverless_s3upload
./deploy.sh $1
cd ..
cd serverless_check_ipfs
./deploy.sh $1
cd ..

