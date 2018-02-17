var contract = require('./contract.js');
/*contract.createContract('hash123', 'name55', 'text/plain', 44, 123, function(err, data) {

  console.log(err, data);
});
*/
contract.submitToBlockchain('hash123', 'name55', 'text/plain', 44, 123, function(err, data) {

  console.log(err, data);
});


