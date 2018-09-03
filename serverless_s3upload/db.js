var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();
var config = require('./config.json');
var table = config.ipfsDatabase;

var docClient = new AWS.DynamoDB.DocumentClient()

var write  = function(data, callback) {

  var params = {
    RequestItems: {
    }
  };
  params.RequestItems[table] = []

  var obj = {
    PutRequest: {
      Item: {}
    }
  };
  obj.PutRequest.Item.id = {S: data.id};
  obj.PutRequest.Item.name = {S: data.name};
  obj.PutRequest.Item.type = {S: data.type};
  obj.PutRequest.Item.size = {S: data.size};
  obj.PutRequest.Item.lastModified = {S: data.lastModified};

  params.RequestItems[table].push(obj);
  console.log(JSON.stringify(params))   
  dynamodb.batchWriteItem(params,callback);

};

var read = function(id, callback) {

  var obj = { TableName : table,
	   Key: { "id": id}
      };

  docClient.get(obj, callback);  
}


module.exports = {
  write: write,
  read: read
};
