var queue = require('./queue.js');
var db = require('./db.js');
var uuid = require('uuid/v4');

var url = 'https://sqs.eu-west-1.amazonaws.com/160991186365/nottario-new.fifo'

var id = uuid();
console.log('id', id);

var data = {
  id: id, 
  status: 'new',
  hash: 'safasfasf',
  name: 'dog.png',
  type: 'image/png',
  size: '1251251',
  lastModified: '15125121'
}
db.write(data, function(err, dbdata) {
  console.log(err, dbdata);
  if (!err) {
    queue.add(url,'nottarise this', id, function(err, qdata) {
      console.log(err, qdata);
    })
  }
})


