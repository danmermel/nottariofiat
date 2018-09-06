console.log('Go');
var queue = require('./queue.js');
var db = require('./db.js');
var fs = require('fs');
var child_process = require('child_process');
var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');
var config = require('./config.json');

var sqs = new AWS.SQS();
var queueURL = config.ipfsQueue;

var params = {
  QueueUrl: queueURL,
  MessageAttributeNames: ['All'],
  MaxNumberOfMessages: 1
};

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

console.log("starting..");
sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
    process.exit();
  }
  if(!data.Messages) {
    console.log("Nothing to process");
    process.exit();
  }
  var id = data.Messages[0].MessageAttributes.id.StringValue;
  var receiptHandle = data.Messages[0].ReceiptHandle  //for deleting queue item later
  console.log("The id is ", id);           // successful response
  var obj = {
    Bucket: config.ipfsbucket,
    Key: id
  }
  var filename = '/tmp/' + id;
  //create a write stream that will write into a file on disk
  var ws = fs.createWriteStream(filename)
  //create a readstram that is going to read the object from S3
  var rs = s3.getObject(obj).createReadStream(); 
  //pipe the s3 data into the file on disk as you read it
  rs.pipe(ws).on('close', function() {
    console.log('File has been saved to local storage');
    // now you call the ipfs action to add the file to the IPFS
    child_process.exec('curl -F file=@'+filename+' "http://localhost:5001/api/v0/add"', function(error, stdout, stderr) {
      if (error) {
        console.error(`exec error: ${error}`);
        process.exit();
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      var ipfs = JSON.parse(stdout);  //grab the output of the curl
      var hash = ipfs.Hash;
      console.log("IPFS hash is ", hash);
      // now update the database with the newly-created IPFS hash
      db.update_ipfs(id, hash, function (err, data) {
        if (err) { 
          console.log("Error updating database entry", err)
          process.exit()
        }
        console.log("Db update success. IPFS identifier added", data)
        // now delete the queue item so you don't process it again
        var params = {
          QueueUrl: queueURL, 
          ReceiptHandle : receiptHandle
        }
        sqs.deleteMessage(params, function (err, deldata){
          console.log(err,deldata);
          //now delete the object from S3
          s3.deleteObject(obj, function (err,data) {
            if(err) {
              console.log("Error deleting S3 object");
              process.exit()
            } 
            console.log("S3 object deleted")
            process.exit();
          })
        });

      })
    });
  })

});
