pragma solidity ^0.4.25;

contract Escrow {
  mapping(address => address) public accounts;
  address[] public accountsKeys;

  function credit() public payable {
    address newAccount = (new Account).value(msg.value)(msg.sender);
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