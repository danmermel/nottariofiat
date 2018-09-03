// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var config = require('./config.json');
var db = require("./db.js");
var queue = require("./queue.js");

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

exports.handler = function (event, context, callback) {
  //grab the key of the s3 object that has triggered the function
  var key = event.Records[0].s3.object.key
  console.log("key is ", key);

  //then read that record from the db to see if it is a real thing!

  db.read(key, function (err,data) {

    if(err || Object.keys(data).length==0) {  
      //either error reading or no record found. Either way, die
      console.log("Error. No matching record found ");
      return callback ("Error. No matching record found", data);
    }
    // now write to the queue

    queue.add(config.ipfsQueue,"ipfs this", key, function(err,data) {
      if(err) {
        console.log("Error posting to the queue ");
        return callback(err);
      }
      //posted successfully to the queue
      console.log("Item added to queue")
      callback(null);
    });

  })

};

