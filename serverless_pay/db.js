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
  obj.PutRequest.Item.stripe_ref = {S: data.stripe_ref};
  obj.PutRequest.Item.new_date = {S: data.new_date};
  obj.PutRequest.Item.paid_date = {S: data.paid_date};
  //obj.PutRequest.Item.queued_date = {S: data.queued_date};
  //obj.PutRequest.Item.submitted_date = {S: data.submitted_date};
  //obj.PutRequest.Item.completed_date = {S: data.completed_date};
  obj.PutRequest.Item.hash = {S: data.hash};  
  obj.PutRequest.Item.name = {S: data.name};
  obj.PutRequest.Item.type = {S: data.type};
  obj.PutRequest.Item.size = {S: data.size};
  obj.PutRequest.Item.lastModified = {S: data.lastModified};
  //obj.PutRequest.Item.eth_transaction_id = {S: data.eth_transaction_id};
  //obj.PutRequest.Item.eth_contract_id = {S: data.eth_contract_id};
  obj.PutRequest.Item.currency = {S: data.currency};
  obj.PutRequest.Item.amount = {N: ""+data.amount};
  obj.PutRequest.Item.client_email = {S: data.client_email};

  params.RequestItems.nottariodb.push(obj);
  console.log(JSON.stringify(params))   
  dynamodb.batchWriteItem(params,callback);

};


module.exports = {
  write: write
};
