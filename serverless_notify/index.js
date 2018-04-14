// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var qs = require('qs');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');
var config = require('./config.json');

exports.handler = function (event, context, callback) {
  var body = event.Records[0];
  console.log('THE DATA', body);
  var table = body.eventSourceARN.match(/table\/([a-z-]+)\//)[1];  //the table name
  var sns = new AWS.SNS();
  var message = body.eventName + ' into ' + table + ' ' + JSON.stringify(body.dynamodb);
  sns.publish({
    Message: message,
    TopicArn:  config.contactTopic
  }, function(err, data) {
    if (err) {
      console.log(err.stack);
      callback(err, null);;
    }
    console.log('push sent');
    console.log(data);
    callback(null, {}) 

  });
};

