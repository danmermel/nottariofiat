var queue = require('./queue.js');
var db = require('./db.js');
var uuid = require('uuid/v4');
var config = require('./config.json');
var url = config.mainQueue;

var id = uuid();
console.log('id', id);

var data = {
  id: id, 
  stat: 'new',
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


