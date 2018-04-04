// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var qs = require('qs');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');
var config = require('./config.json');

exports.handler = function (event, context, callback) {
  var body = qs.parse(event.body);
  console.log('THE DATA', body);
  console.log('context',JSON.stringify(context));
  var sns = new AWS.SNS();
  var message = body.name + ' ' + body.email + ' ' + body.message
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
    callback(null, { statusCode: 302, headers: { Location: config.thankYouURL }}) 

  });
};

