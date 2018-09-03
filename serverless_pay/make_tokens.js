var tokenlib = require('./token.js');

tokenlib.create_bulk('int01', 'free', 25, function(err, data) {
  console.log(err, data);
});
