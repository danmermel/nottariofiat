var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();

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
  obj.PutRequest.Item.status = {S: data.status};
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

}

module.exports = {
  write: write,
  read: read
};
