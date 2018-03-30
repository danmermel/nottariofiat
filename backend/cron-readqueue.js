var ethereum = require("./contract.js");
var queue = require('./queue.js');
var db = require('./db.js');

var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');
var config = require('./config.json');

var sqs = new AWS.SQS();
var queueURL = config.mainQueue;

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
      var id = data.Messages[0].MessageAttributes.id.StringValue;
      db.read(id, function (err, dbdata) {
        if(err) {
          console.log("error reading database.. dying", err);
          process.exit();
        };
        console.log("dbdata is ", dbdata);
	var hash = dbdata.Item.hash;
	var name = dbdata.Item.name;
	var type = dbdata.Item.type;
	var size = parseInt(dbdata.Item.size);
	var lastModified = parseInt(dbdata.Item.lastModified);
        
        ethereum.submitToBlockchain(id,hash,name,type,size,lastModified,function(err, ethdata) {
          if (err) {
            // add to our error queue
            var url = config.errorQueue;
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
      });   
    } 
  }

});
