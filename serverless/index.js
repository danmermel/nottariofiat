// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var qs = require('qs');
var db =  require('./db.js');
var queue = require('./queue.js');
var stripe=require('stripe')(process.env.stripe_secret_key);

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

exports.handler = function (event, context, callback) {
  var body = qs.parse(event.body);
  console.log(body);

// Get the payment token ID submitted by the form:
  var token = body.stripeToken;
  console.log(token);

// Charge the user's card:
  stripe.charges.create({
    amount: 999,
    currency: "gbp",
    description: "Example charge",
    source: token,
  }, function(err, charge) {
     console.log(err, charge);
     if(!err) {
       //build object
       var obj = {
        id: charge.id,    //use stripe ref as unique id
        stat: "paid",                     // new, paid, queued, submitted, completed, error
        stripe_ref: charge.id,
        new_date: new Date().toISOString(),
        paid_date:new Date().toISOString(),
        //queued_date: "",
        //submitted_date: "",
        //completed_date: "",
        hash: body.hash,
        name: body.name,
        type: body.type,
        size : body.size,
        lastModified: body.lastModified,
        //eth_transaction_id: "",
        //eth_contract_id: "",
        currency: charge.currency,
        amount: charge.amount,
        client_email : body.stripeEmail
       };
       db.write(obj, function(err,data) {
         console.log(err,data);
         if(!err) {
           queue.add(process.env.queue_url,"nottarise this", charge.id, function(err,data) {
             console.log(err,data);
             callback(null,{ "statusCode": 200, "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(data)});
           })
         }

       });
   
     };
  })
 
};

