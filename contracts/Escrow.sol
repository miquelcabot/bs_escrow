// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

contract Escrow {
  mapping(address => address) public accounts;
  address[] public accountsKeys;

  function credit() public payable {
  }
}

contract Account {
  // Address of the account (buyer or seller)
  address public accountAdress;
  
  // Constructor funcion to create the delivery
  constructor (address _sender) payable {
    // Requires that the sender send a deposit of minimum 1 wei (>0 wei)
    require(msg.value>0, "Sender has to send a deposit of minimun 1 wei");
    accountAdress = _sender;
  }
}