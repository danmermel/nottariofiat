#!/bin/bash
cd serverless_check
./deploy_test.sh
cd ..
cd serverless_notify
./deploy_test.sh
cd ..
cd serverless_get
./deploy_test.sh
cd ..
cd serverless_pay
./deploy_test.sh
cd ..
cd serverless_contact
./deploy_test.sh
cd ..
cd serverless_s3queuer
./deploy_test.sh
cd ..
cd serverless_s3upload
./deploy_test.sh
cd ..
cd serverless_check_ipfs
./deploy_prod.sh
cd ..

