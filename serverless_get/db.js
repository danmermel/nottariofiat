var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();

var table = "nottariodb";

var docClient = new AWS.DynamoDB.DocumentClient()

var read = function(id, callback) {

  var obj = { TableName : table,
              IndexName : "eth_contract_id-index",
              KeyConditionExpression: "eth_contract_id = :id",
              ExpressionAttributeValues: { ":id":id}
      };

  docClient.query(obj, callback);  
}

module.exports = {
  read: read
};
