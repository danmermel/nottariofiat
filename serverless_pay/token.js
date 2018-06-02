var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();
var config = require('./config.json');
var table = config.tokenDatabase;

var docClient = new AWS.DynamoDB.DocumentClient()

var generate_id = function () {
  var my_id = "";

  for (var i = 0; i < 16 ; i++) {
    var number = Math.random();
    number *= 26;
    number = Math.floor(number) + 65;
    my_id += String.fromCharCode(number);
    if ((i+1) % 4 == 0 && i != 15) {
      my_id += "-";
    }
  }
  return "NOT-" + my_id;

}

var create_token  = function(customer_reference, order_reference, callback) {
  token_factory(customer_reference, order_reference, 1, callback);
}

var create_bulk  = function(customer_reference, order_reference, num_tokens, callback) {
  token_factory(customer_reference, order_reference, num_tokens, callback);
}


var token_factory  = function(customer_reference, order_reference, num_tokens, callback) {

  if (num_tokens < 1 || num_tokens > 25) {
    return callback("invalid num_tokens");
  }

  var params = {
    RequestItems: {
    }
  };
  params.RequestItems[table] = []
  var ids = [];

  for(var i = 0; i < num_tokens; i++) {

    var obj = {
      PutRequest: {
        Item: {}
      }
    };

    var id = generate_id();
    ids.push(id);
    obj.PutRequest.Item.id = {S: id};
    obj.PutRequest.Item.stat = {S: "new"};
    obj.PutRequest.Item.new_date = {S: new Date().toISOString()};
    obj.PutRequest.Item.customer_reference = {S: customer_reference};
    obj.PutRequest.Item.order_reference = {S: order_reference};

    params.RequestItems[table].push(obj);

  } 
  console.log(JSON.stringify(params))   
  dynamodb.batchWriteItem(params,function (err,data) {
    if(err) {
      callback(err);
    } else {
      callback (null,ids)
    }
  });

};


var get_token = function (id, callback) {

  var obj = { TableName : table,
              KeyConditionExpression: "id = :id",
              ExpressionAttributeValues: { ":id":id}
      };

  docClient.query(obj, function(err,data){
    if (err) {
      callback(err);
    } else {
      if (data.Count == 1){ 
        callback(null, data.Items[0]);
      } else {      // no error but no data either
        callback(null,null);
      }
      
    }
  });  

}

var spend_token = function(id, callback) {

  get_token(id, function(err, data) {
    // failed to read the token from the database
    if (err || data == null) {
      return callback('invalid token');
    }
    if (data.stat != 'new') {
      return callback('token status not new');
    }

    var params = {
      TableName:table,
      Key:{
        "id": id
      },
      UpdateExpression: "set stat = :s, spent_date = :sd",
      ExpressionAttributeValues:{
        ":s": 'spent',
        ":sd": new Date().toISOString()
      },
      ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, callback);
  });

}

var cancel_token = function(id, callback) {

  get_token(id, function(err, data) {
    // failed to read the token from the database
    if (err || data == null) {
      return callback('invalid token');
    }
    if (data.stat != 'new') {
      return callback('token status not new');
    }

    var params = {
      TableName:table,
      Key:{
        "id": id
      },
      UpdateExpression: "set stat = :s, cancelled_date = :sd",
      ExpressionAttributeValues:{
        ":s": 'cancelled',
        ":sd": new Date().toISOString()
      },
      ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, callback);
  });

}

module.exports = {
  create_token: create_token,
  create_bulk: create_bulk,
  get_token: get_token,
  spend_token: spend_token,
  cancel_token: cancel_token
};
