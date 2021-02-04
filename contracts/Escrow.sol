pragma solidity ^0.4.25;

contract Escrow {
  // Mapping to store the addresses of the Account contracts (buyers and sellers)
  mapping(address => address) accounts;
  // Array to store the addresses of the Account contracts (buyers and sellers) 
  address[] accountsKeys;

  // Mapping to store the Order contracts
  mapping(uint => address) orders;
  // Array to store the keys of the Order contracts
  uint[] ordersKeys;

  // Struct to store the items offered by the buyers
  struct Item{
    string title;
    uint price;
    address seller;
  }
  // Mapping to store the items offered by the buyers
  mapping(string => Item) items;
  // Array to store the keys of the items offered by the buyers
  string[] itemsKeys;

  // Lets buyers to made a credit with funds
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

  // Returns the balance of the accounts
  function getBalance(address _account) public view returns (uint) {
    if (accounts[_account] == 0) {
      return 0;
    } else {
      return accounts[_account].balance;
    }
  }

  // Lets sellers to offer an item for sale
  function offer(string _title, uint _price) public {
    // We check that the item doesn't exist yet
    require(items[_title].price == 0, "This item already exists");
    // We add the item to the items mapping
    items[_title].title = _title;
    items[_title].price = _price;
    items[_title].seller = msg.sender;
    // We add the item to the itemsKeys array
    itemsKeys.push(_title);
  }

  // Returns the price of an item
  function getItemPrice(string _title) public view returns (uint) {
    return items[_title].price;
  }
 }

contract Account {
  // Address of the account (buyer or seller)
  address public accountAdress;
  
  // Constructor funcion to create the delivery
  constructor (address _sender) public payable {
    // Requires that the sender send a deposit of minimum 1 wei (>0 wei)
    require(msg.value>0, "Sender has to send a deposit of minimun 1 wei");
    accountAdress = _sender;
  }
}