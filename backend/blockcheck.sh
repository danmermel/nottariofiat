#!/bin/bash

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/daniel/.local/bin

domain="api"
if [ $HOSTNAME == 'windermere' ]
  then
    domain="rinkeby"
  fi

hexblock=`curl -s "https://${domain}.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken" | jq -r .result`
decblock=$(($hexblock))

ourhexblock=`curl -s -X POST -H 'Content-type: application/json' --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}' http://localhost:8545 | jq -r .result`
ourdecblock=$(($ourhexblock))
echo "$ourdecblock / $decblock"
let blockdiff=$decblock-$ourdecblock
echo "Diff is $blockdiff"
if [ $blockdiff -ge 100 ]
  then
   aws sns publish --topic-arn arn:aws:sns:eu-west-1:160991186365:webmails --message "Out of sync by $blockdiff blocks on $HOSTNAME"
fi
