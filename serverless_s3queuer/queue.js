var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var sqs = new AWS.SQS();

var add = function(qurl, body, id, callback) {
  var params = {
    MessageBody: body, /* required */
    QueueUrl: qurl,  /* required */
    DelaySeconds: 0,
    MessageAttributes: {
    'id': {
      DataType: 'String', /* required */
      StringValue: id
    }
  },
  MessageDeduplicationId: new Date().getTime().toString(),
  MessageGroupId: 'ipfsation'
  };

  sqs.sendMessage(params, callback);
}

module.exports = {
  add: add
}
