var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();

var table = "nottariodb";

var docClient = new AWS.DynamoDB.DocumentClient()

var write  = function(data, callback) {

  var params = {
    RequestItems: {
      nottariodb: []
    }
  };

  var obj = {
    PutRequest: {
      Item: {}
    }
  };
  obj.PutRequest.Item.id = {S: data.id};
  obj.PutRequest.Item.stat = {S: data.stat};
  obj.PutRequest.Item.hash = {S: data.hash};
  obj.PutRequest.Item.name = {S: data.name};
  obj.PutRequest.Item.type = {S: data.type};
  obj.PutRequest.Item.size = {S: data.size};
  obj.PutRequest.Item.lastModified = {S: data.lastModified};
  params.RequestItems.nottariodb.push(obj);
  console.log(JSON.stringify(params))   
  dynamodb.batchWriteItem(params,callback);

};

var read = function(id, callback) {

  var obj = { TableName : table,
	   Key: { "id": id}
      };

  docClient.get(obj, callback);  
}

var update = function (id, tx, add, stat,  callback) {

  var params = {
    TableName:table,
    Key:{
        "id": id
    },
    UpdateExpression: "set eth_transaction_id = :r, eth_contract_id = :s, stat = :t",
    ExpressionAttributeValues:{
        ":r":tx,
        ":s":add,
        ":t":stat
    },
    ReturnValues:"UPDATED_NEW"
  };

  console.log("Updating the item...");
  docClient.update(params, callback);

}

module.exports = {
  write: write,
  read: read,
  update: update
};
