pragma solidity ^0.4.25;

contract Escrow {
  // Mapping to store the addresses of the Account contracts (buyers and sellers)
  mapping(address => Account) accounts;
  // Array to store the addresses of the Account contracts (buyers and sellers) 
  address[] public accountsKeys;

  // Number of the last order Id
  uint lastOrderId;
  // Mapping to store the Order contracts
  mapping(uint => Order) orders;
  // Array to store the keys of the Order contracts
  uint[] public ordersKeys;

  // Struct to store the items offered by the buyers
  struct Item{
    string title;
    uint price;
    address seller;
  }
  // Mapping to store the items offered by the buyers
  mapping(string => Item) items;
  // Array to store the keys of the items offered by the buyers
  string[] public itemsKeys;

  constructor () public {
    lastOrderId = 0;
  }

  // Lets buyers to made a credit with funds
  function credit() public payable {
    if (accounts[msg.sender] == Account(0)) {
      // If the account doen't exist, we create it, and send the deposit to the Account contract
      address newAccount = (new Account).value(msg.value)(msg.sender);
      accounts[msg.sender] = Account(newAccount);
      accountsKeys.push(msg.sender);
    } else {
      // If the account exists, we transfer the deposit to the Account contract
      address(accounts[msg.sender]).transfer(msg.value);
    }
  }

  // Returns the balance of the accounts
  function getAccountBalance(address _account) public view returns (uint) {
    if (accounts[_account] == Account(0)) {
      // If the account doesn't exist
      return 0;
    } else {
      // If the accout exists, return its balance
      return address(accounts[_account]).balance;
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
  function getItemPrice(string _itemTitle) public view returns (uint) {
    return items[_itemTitle].price;
  }

  // Order item offered by seller
  function order(string _itemTitle) public {
    // We check that the buyer has an account
    require(accounts[msg.sender] != Account(0), "You haven't a buyer account");
    // We check that the item exists
    require(items[_itemTitle].price != 0, "This item doesn't exist");
    // We check that the buyer has enough funds
    require(items[_itemTitle].price <= address(accounts[msg.sender]).balance, "You haven't enough funds");

    // We create the order from the buyer's account
    lastOrderId++;
    address newOrder = Account(accounts[msg.sender])
      .order(lastOrderId, items[_itemTitle].title, items[_itemTitle].price, items[_itemTitle].seller);
    orders[lastOrderId] = Order(newOrder);
    ordersKeys.push(lastOrderId);
  }

  function getLastOrderId() public returns (uint) {
    // We return the Id of the last created order
    return lastOrderId;
  }

  // Get order information
  /*function getOrder(uint _id) public view returns (uint, address, string, uint, address) {
    // We check that the order exists
    require(Order(orders[_id]) != Order(0), "This order doesn't exist");
    return (
      Order(orders[_id]).id,
      Order(orders[_id]).buyer,
      Order(orders[_id]).title,
      Order(orders[_id]).price,
      Order(orders[_id]).seller
    );
  }*/

  // Returns the balance of the order
  function getOrderBalance(uint _id) public view returns (uint) {
    if (orders[_id] == Order(0)) {
      // If the order doesn't exist
      return 0;
    } else {
      // If the order exists, return its balance
      return address(orders[_id]).balance;
    }
  }
 }

contract Account {
  // Address of the account (buyer or seller)
  address public accountAdress;
  
  // Constructor funcion to create the account
  constructor (address _sender) public payable {
    // Requires that the sender send a deposit of minimum 1 wei (>0 wei)
    require(msg.value>0, "Sender has to send a deposit of minimun 1 wei");
    accountAdress = _sender;
  }

  function order(uint _id, string _title, uint _price, address _seller) public returns (Order) {
    address newOrder = (new Order).value(_price)(_id, accountAdress, _title, _price, _seller);
    return Order(newOrder);
  }

}

contract Order {
  uint public id;
  address public buyer;
  string public title;
  uint public price;
  address public seller;

  // Constructor funcion to create the order
  constructor (uint _id, address _sender, string _title, uint _price, address _seller) public payable {
    // Requires that the sender send a deposit of minimum 1 wei (>0 wei)
    require(msg.value>0, "Sender has to send a deposit of minimun 1 wei");
    id = _id;
    buyer = _sender;
    title = _title;
    price = _price;
    seller = _seller;
  }
}