var ethereum = require("./contract.js");
var queue = require('./queue.js');

var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var sqs = new AWS.SQS();
var queueURL = 'https://sqs.eu-west-1.amazonaws.com/160991186365/nottario-new.fifo';

var params = {
  QueueUrl: queueURL,
  MessageAttributeNames: ['All'],
  MaxNumberOfMessages: 1
};
sqs.receiveMessage(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else {
    console.log(JSON.stringify(data));           // successful response
    if(data.Messages && data.Messages.length > 0) {   //there is data to process
      var hash = data.Messages[0].MessageAttributes.hash.StringValue;
      var lastModified = parseInt(data.Messages[0].MessageAttributes.lastModified.StringValue);
      var name = data.Messages[0].MessageAttributes.name.StringValue;
      var size = parseInt(data.Messages[0].MessageAttributes.size.StringValue);
      var type = data.Messages[0].MessageAttributes.type.StringValue;
      ethereum.submitToBlockchain(hash,name,type,size,lastModified,function(err, ethdata) {
        if (err) {
          // add to our error queue
          var url = 'https://sqs.eu-west-1.amazonaws.com/160991186365/errors.fifo';
          queue.add(url,'error', hash, name, type, size.toString(), lastModified.toString(), function(err, data) { 
            console.log(err, data);
          })

        }
        console.log (err,ethdata);
        // now delete message
        var params = {
          QueueUrl: queueURL, 
          ReceiptHandle : data.Messages[0].ReceiptHandle
        }
        sqs.deleteMessage(params, function (err, deldata){
          console.log(err,deldata);
        });

      }) 
    } 
  }

});
