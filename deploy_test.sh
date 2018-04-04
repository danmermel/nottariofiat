#!/bin/bash
cd serverless_check
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
