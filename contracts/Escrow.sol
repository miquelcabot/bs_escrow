pragma solidity ^0.4.25;

contract Escrow {
  // Mapping for store the addresses of the Account contracts (buyers and sellers)
  mapping(address => address) public accounts;
  // Array to store the addresses of the Account contracts (buyers and sellers) 
  address[] public accountsKeys;

  function credit() public payable {
    if (accounts[msg.sender] == 0) {
      // If the account doen't exist, we create it, and send the deposit to the Account contract
      address newAccount = (new Account).value(msg.value)(msg.sender);
      accounts[msg.sender] = newAccount;
      accountsKeys.push(newAccount);
    } else {
      // If the account exists, we send the deposit to the Account contract
      accounts[msg.sender].send(msg.value);
    }
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