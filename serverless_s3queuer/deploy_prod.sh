#!/bin/bash
cp ../config_prod.json ./config.json
zip -r s3queuer.zip package.json queue.js db.js index.js config.json 
aws lambda update-function-code --function-name nottarioFiats3ipfsQueuerProd --zip-file fileb://s3queuer.zip


