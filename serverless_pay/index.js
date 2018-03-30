// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var qs = require('qs');
var db =  require('./db.js');
var queue = require('./queue.js');
var config = require('./config.json');
var stripe=require('stripe')(config.stripeSecretKey);

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

exports.handler = function (event, context, callback) {
  var body = qs.parse(event.body);
  console.log(body);

// Get the payment token ID submitted by the form:
  var token = body.stripeToken;
  console.log(token);

  if (!token) {
    throw(new Error('missing stripe token'))
  }
// Charge the user's card:
  stripe.charges.create({
    amount: config.price,
    currency: config.currency,
    description: config.description,
    source: token,
  }, function(err, charge) {
     console.log(err, charge);
     if (err) {
       throw(new Error('stripe charge failed'))
     } else {
       //build object
       var obj = {
        id: charge.id,    //use stripe ref as unique id
        stat: "paid",                     // new, paid, queued, submitted, completed, error
        stripe_ref: charge.id,
        new_date: new Date().toISOString(),
        paid_date:new Date().toISOString(),
        hash: body.hash,
        name: body.name,
        type: body.type,
        size : body.size,
        lastModified: body.lastModified,
        currency: charge.currency,
        amount: charge.amount,
        client_email : body.stripeEmail
       };
       db.write(obj, function(err,data) {
         console.log(err,data);
         if (err) {
           // this is bad because we have taken payment but done nothing else
           throw(new Error('failed to write to database'))
         } else  {
           queue.add(config.mainQueue,"nottarise this", charge.id, function(err,data) {
             console.log(err,data);
             if (err) {
               // this is bad because we have taken payment, written to DB but not to the queue
               throw(new Error('failed to write to the queue'))
             } else {
               callback(null,{ "statusCode": 302, "headers": {"Location": body.success + '?' + charge.id }});
             }
           })
         }

       });
   
     };
  })
 
};

