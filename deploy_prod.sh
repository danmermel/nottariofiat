#!/bin/bash
cd serverless_check
./deploy_prod.sh
cd ..
cd serverless_notify
./deploy_prod.sh
cd ..
cd serverless_get
./deploy_prod.sh
cd ..
cd serverless_pay
./deploy_prod.sh
cd ..
cd serverless_contact
./deploy_prod.sh
cd ..
cd serverless_s3queuer
./deploy_prod.sh
cd ..
cd serverless_s3upload
./deploy_prod.sh
cd ..
cd serverless_check_ipfs
./deploy_prod.sh
cd ..
