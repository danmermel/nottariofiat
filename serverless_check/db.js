var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();
var config = require('./config.json);

var table = config.database;

var docClient = new AWS.DynamoDB.DocumentClient()

var read = function(id, callback) {

  var obj = { TableName : table,
	   Key: { "id": id}
      };

  docClient.get(obj, callback);  
}

module.exports = {
  read: read
};
