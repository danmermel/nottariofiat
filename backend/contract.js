// solidity contract code
var abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"hash","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"size","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"file_timestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"mime_type","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_hash","type":"bytes32"},{"name":"_name","type":"bytes32"},{"name":"_mime_type","type":"bytes32"},{"name":"_size","type":"uint256"},{"name":"_file_timestamp","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
var bin = "0x6060604052341561000f57600080fd5b60405160a08061033b8339810160405280805190602001909190805190602001909190805190602001909190805190602001909190805190602001909190505033600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508360018160001916905550846000816000191690555082600381600019169055508160048190555080600581905550426006819055505050505050610261806100da6000396000f300606060405260043610610083576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde031461008857806309bd5a60146100b95780638da5cb5b146100ea578063949d225d1461013f578063b80777ea14610168578063c3d7537514610191578063ed73907a146101ba575b600080fd5b341561009357600080fd5b61009b6101eb565b60405180826000191660001916815260200191505060405180910390f35b34156100c457600080fd5b6100cc6101f1565b60405180826000191660001916815260200191505060405180910390f35b34156100f557600080fd5b6100fd6101f7565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561014a57600080fd5b61015261021d565b6040518082815260200191505060405180910390f35b341561017357600080fd5b61017b610223565b6040518082815260200191505060405180910390f35b341561019c57600080fd5b6101a4610229565b6040518082815260200191505060405180910390f35b34156101c557600080fd5b6101cd61022f565b60405180826000191660001916815260200191505060405180910390f35b60015481565b60005481565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60045481565b60065481565b60055481565b600354815600a165627a7a72305820b8d80ce614a1b551463e49aee29429dd2aa43bed7f4cef47cb05f9afe1110c7c0029"
var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');
var db = require('./db.js');
var config = require('./config.json')

var submitToBlockchain = function(id, hash, name, type, size, lastModified, callback) {

  var nottarioContract = new web3.eth.Contract(abi, {from: config.ethWallet, gas: 500000, data: bin});
  var txhash = null;
  var completed_date = null;
  var submitted_date = null;
  var args = [ "0x"+hash, web3.utils.asciiToHex(name), web3.utils.asciiToHex(type), size, lastModified];
  console.log(args);
  nottarioContract.deploy({
    arguments: args
  }).send()
  .on('error', function(err) { console.log('error',err); callback(err, {tx: txhash, address: null}); })
  .on('transactionHash', function(th) { 
    console.log('tx', th); 
    txhash = th;
    submitted_date = new Date().toISOString();
    db.update(id,txhash,"TBC","submitted", submitted_date, "TBC",  function (err,data) {
      console.log("db updated..", err, data);
    })
   })
  .on('receipt', function(receipt) { 
    console.log('receipt', receipt); 
    completed_date = new Date().toISOString();
    db.update(id,txhash,receipt.contractAddress,"completed", submitted_date, completed_date,  function (err,data) {
      console.log("db updated..", err, data);
      callback(null, { tx: txhash, address: receipt.contractAddress }); 
    });
  }); 
};
/*
var waitForContractToBeMined = function(tx, callback) {
  var timer = setInterval(function() {
    web3.eth.getTransactionReceipt(tx , function(err, data) {    //while  the tx has not been mined the tx receipt is null
      if (err)  {
        clearInterval(timer);
        callback(err, null);
      } else if (data != null && data.contractAddress) {   
        clearInterval(timer);
        callback(null, data.contractAddress);
      }
    });
   }, 2000); // two seconds
};


var createContract = function(hash, name, type, size, lastModified, callback) {


  var tx = null;
  var address = null;

  submitToBlockchain(hash, name, type, size, lastModified, function(err, data) {

    if (err) {
      return callback(err, null);;
    }

    tx = data;
    // write to db


    waitForContractToBeMined(tx, function(err, data) {
      if (err) {
        return callback(err, null);;
      }

      address =  data
      //write to db
      // done
      callback(null, { tx: tx, address: address });
    
    });
 
  });

};


/*
createContract('hash', 'name', 'type', 'size', 'lastModified', function(err, data) {

  console.log(err, data);
});

*/

module.exports = {
  submitToBlockchain: submitToBlockchain
}
