// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var config = require('./config.json');
var kuuid = require('kuuid');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

  var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    signatureVersion: 'v4'
  });

exports.handler = function (event, context, callback) {
  
  var params = {Bucket: config.ipfsbucket, 
		Key: kuuid.id() }; //generates unique key
  s3.getSignedUrl('putObject', params, function (err, url) {
    console.log('Error is ', err);
    console.log('The URL is', url);
     var obj = {"url":url};  //create an object because the return expects an object
    callback(null, { statusCode: 200, 
                     headers: { 'Access-Control-Allow-Origin': '*'},
                     body:JSON.stringify(obj)
    });
  });

};

