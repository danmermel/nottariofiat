// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var config = require('./config.json');
var kuuid = require('kuuid');
var db = require("./db.js");

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

exports.handler = function (event, context, callback) {
  var qs = event.queryStringParameters;
  console.log(qs);
  //generates unique key
  var key = kuuid.id();
  qs.id = key; //add it to the parameters

  db.write(qs, function (err, data) {
    if(err) {
      console.log("Error writing to db");
      return callback (err);
    }
    // metadata written to db. Now generate presigned url
    var params = {Bucket: config.ipfsbucket, 
                  Key: key };
    //generates a presigned url that allows the writer to PUT the object with 
    // the above key to the bucket in theconfig
    s3.getSignedUrl('putObject', params, function (err, url) {  
      console.log('Error is ', err);
      console.log('The URL is', url);
      var obj = {
        "url":url,
        "id": key
      };  
      //create an object because Lambda + API gateway expects an object being returned
      callback(null, { statusCode: 200, 
                       headers: { 'Access-Control-Allow-Origin': '*'},
                       body:JSON.stringify(obj)
      });
    });
  });
};

