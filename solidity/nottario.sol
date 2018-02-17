pragma solidity ^0.4.0;

contract nottario {

  bytes32 public hash;
  bytes32 public name;
  address public owner;
  bytes32 public mime_type;
  uint public size;
  uint public file_timestamp;
  uint public timestamp;

  function nottario(bytes32 _hash, bytes32 _name, bytes32 _mime_type, uint _size, uint _file_timestamp) public {
    owner = msg.sender;
    name = _name;
    hash = _hash;
    mime_type = _mime_type;
    size = _size;
    file_timestamp = _file_timestamp;
    timestamp = now;
  }
}
