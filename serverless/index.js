// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

exports.handler = function (event, context, callback) {
  var body = JSON.stringify(event.body);
  console.log(body);
  callback(null,{ "statusCode": 200, "headers": {"Content-Type": "application/json"}, "body": body })
};
