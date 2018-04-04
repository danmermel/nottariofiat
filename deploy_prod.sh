#!/bin/bash
cd serverless_check
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

