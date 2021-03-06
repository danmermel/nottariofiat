// Load the SDK for JavaScript
var AWS = require('aws-sdk');
var db =  require('./db.js');
var queue = require('./queue.js');
var config = require('./config.json');

// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config.json');

var id = process.argv[2];  //get the id

db.read(id, function (err,data) {
   if (!err && data.Item) {
     if  (data.Item.eth_transaction_id){
       console.log("Item already sent to the blockchain. Abort!")
       process.exit();
     }
     // if you get here, then put item back in the queue
     console.log("Re-queuing item ", id);
     queue.add(config.mainQueue,"re-nottarise this", id, function(err,data) {
       console.log(err,data);
       process.exit();
     })

   }
   else {
     console.log("Error reading db or item does not exist");
     process.exit();
   }
});

/*
var isNumeric = function(str) {
  return str.match(/^[0-9]+$/)
}

var provision = function(id, body, charge, callback) {
      //build object
       var obj = {
        id: id,    //use stripe ref as unique id
        stat: "paid",                     // new, paid, queued, submitted, completed, error
        stripe_ref: id,
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
             console.log(err,data);
             if (err) {
               // this is bad because we have taken payment, written to DB but not to the queue
               throw(new Error('failed to write to the queue'))
             } else {
               callback(null,{ "statusCode": 302, "headers": {"Location": body.success + '?' + id }});
             }
           })
         }

       });

}

exports.handler = function (event, context, callback) {
  var body = qs.parse(event.body);
  console.log(body);

// Get the payment token ID submitted by the form:
  var token = body.stripeToken;
  console.log(token);
  if (!body.name || !body.type || ! body.size || !body.lastModified ||  !body.hash) {
    console.log('Missing mandatory parameters');
    return callback(null,{ "statusCode": 302, "headers": {"Location": body.error }});
  }

  if (!isNumeric(body.lastModified) || !isNumeric(body.size)) {
    console.log('Non-numeric characters in lastModified or size');
    return callback(null,{ "statusCode": 302, "headers": {"Location": body.error }});
  }

  if(body.hash.length != 64) {
    console.log('Hash must be 64 characters');
    return callback(null,{ "statusCode": 302, "headers": {"Location": body.error }});
  } 

  if (!token && !body.voucherCode) {
    console.log('Missing token');
    return callback(null,{ "statusCode": 302, "headers": {"Location": body.error }});
  }

  // if we have a stripe token
  if (token) {

    // Charge the user's card:
    stripe.charges.create({
      amount: config.price,
      currency: config.currency,
      description: config.description,
      source: token,
    }, function(err, charge) {
       console.log(err, charge);
       if (err) {
         console.log('Failed stripe API call');
         return callback(null,{ "statusCode": 302, "headers": {"Location": body.error }});
       } else {
         provision(charge.id, body, charge, callback);
       }
     });
   } else if (body.voucherCode) {
     body.stripeEmail = body.voucherEmail;
     // redeem Nottario token
     tokenlib.spend_token(body.voucherCode, function(err, data) {
       console.log(err, data);
       if (err) {
         console.log('Invalid voucher code');
         return callback(null,{ "statusCode": 302, "headers": {"Location": body.error }});
       } else {
         provision(body.voucherCode, body, { currency: 'gbp', amount:0}, callback);
       }
     });
   }
};

*/
