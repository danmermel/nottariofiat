var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var sqs = new AWS.SQS();

var add = function(qurl, body, id, callback) {
  var params = {
    MessageBody: body, /* required */
    QueueUrl: qurl, //'https://sqs.eu-west-1.amazonaws.com/160991186365/nottario-new.fifo', /* required */
    DelaySeconds: 0,
    MessageAttributes: {
    'id': {
      DataType: 'String', /* required */
      StringValue: id
    }
  },
  MessageDeduplicationId: new Date().getTime().toString(),
  MessageGroupId: 'nottarisation'
  };

  sqs.sendMessage(params, callback);
}

module.exports = {
  add: add
}
