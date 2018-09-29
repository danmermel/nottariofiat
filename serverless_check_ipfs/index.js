// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var db =  require('./db.js');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

exports.handler = function (event, context, callback) {
  var body = event.queryStringParameters;
  console.log(body);
  if (typeof body.id == 'undefined') {
    throw (new Error('missing id'));
  }
  db.read(body.id, function(err, data) {
   console.log(err, data);
   if (err) {
     throw(new Error('invalid id'));
   } else {
     callback(null, { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*'},body:JSON.stringify(data) }) 
     
   }
  })
};

