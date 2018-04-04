// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var qs = require('qs');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

exports.handler = function (event, context, callback) {
  var body = qs.parse(event.body);
  console.log(body);
  if (typeof body.id == 'undefined') {
    throw (new Error('missing id'));
  }
  callback(null, { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*'},body:JSON.stringify( {} ) }) 
};

