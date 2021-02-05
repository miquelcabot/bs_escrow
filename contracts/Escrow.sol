pragma solidity ^0.4.25;

/**
  ------------------------------------------------------------------------------
  Escrow smart contract with all data and methods from the escrow logic
  ------------------------------------------------------------------------------
 */
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

  // Events
  event creditEvent(address buyer, uint amount);
  event offerEvent(address seller, string title, uint price);
  event orderEvent(address buyer, uint orderId, string title, uint price, address seller);
  event completeEvent(address buyer, uint orderId, string title, uint price, address seller);
  event complainEvent(address buyer, uint orderId, string title, uint price, address seller);

  // Constructor of the Escrow contract
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
    // Emit the creditEvent
    emit creditEvent(msg.sender, msg.value);
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
    // If the account doen't exist, we create it
    if (accounts[msg.sender] == Account(0)) {
      address newAccount = new Account(msg.sender);
      accounts[msg.sender] = Account(newAccount);
      accountsKeys.push(msg.sender);
    }
    // Emit the offerEvent
    emit offerEvent(msg.sender, _title, _price);
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

    // Emit the orderEvent
    emit orderEvent(msg.sender, lastOrderId, items[_itemTitle].title, items[_itemTitle].price, items[_itemTitle].seller);
  }

  // Get the Id of the last created order
  function getLastOrderId() public view returns (uint) {
    // We return the Id of the last created order
    return lastOrderId;
  }

  // Returns the balance of the order
  function getOrderBalance(uint _orderId) public view returns (uint) {
    if (orders[_orderId] == Order(0)) {
      // If the order doesn't exist
      return 0;
    } else {
      // If the order exists, return its balance
      return address(orders[_orderId]).balance;
    }
  }

  // The seller completes the Order
  function complete(uint _orderId) public {
    // We check that the order exists
    require(orders[_orderId] != Order(0), "The order doesn't exist");
    
    // We read the data of the order
    address _buyer = Order(orders[_orderId]).buyer();
    string memory _title = Order(orders[_orderId]).title();
    uint _price = Order(orders[_orderId]).price();
    address _seller = Order(orders[_orderId]).seller();

    // We complete the order
    Order(orders[_orderId]).complete(msg.sender, Account(_seller));

    // Emit the completeEvent
    emit completeEvent(_buyer, _orderId, _title, _price, _seller);
  }

  // The seller complains the Order
  function complain(uint _orderId) public {
    // We check that the order exists
    require(orders[_orderId] != Order(0), "The order doesn't exist");

    // We read the data of the order
    address _buyer = Order(orders[_orderId]).buyer();
    string memory _title = Order(orders[_orderId]).title();
    uint _price = Order(orders[_orderId]).price();
    address _seller = Order(orders[_orderId]).seller();

    // We complain the order
    Order(orders[_orderId]).complain(msg.sender, Account(_buyer));

    // Emit the complainEvent
    emit complainEvent(_buyer, _orderId, _title, _price, _seller);
  }

  // Counts the total amount held in escrow
  function getTotalHeld() public view returns (uint) {
    uint total = 0;
    // We iterate throw all the orders to count to total amount held
    for (uint i=0; i<ordersKeys.length; i++) {
      total += address(orders[ordersKeys[i]]).balance;
    }
    
    return total;
  }
 }

/**
  ------------------------------------------------------------------------------
  Account contract, that have the information of buyer and seller accounts, 
  and stores the credit of each account
  ------------------------------------------------------------------------------
 */
contract Account {
  // Address of the account (buyer or seller)
  address public accountAdress;
  
  // Constructor funcion to create the account
  constructor (address _sender) public payable {
    accountAdress = _sender;
  }

  // Creates an order from an account and place the payment into that order
  function order(uint _id, string _title, uint _price, address _seller) public returns (Order) {
    address newOrder = (new Order).value(_price)(_id, accountAdress, _title, _price, _seller);
    return Order(newOrder);
  }

  // Let thist contract receive transfers
  function() public payable {}
}

/**
  ------------------------------------------------------------------------------
  Order contract, that have the information of each order, and stores the 
  payments for each one
  ------------------------------------------------------------------------------
 */
contract Order {
  // Possible states
  enum State { notexists, created, completed, complained }

  uint public id;
  address public buyer;
  string public title;
  uint public price;
  address public seller;
  State public state;

  // Constructor funcion to create the order
  constructor (uint _id, address _sender, string _title, uint _price, address _seller) public payable {
    // Requires that the sender send a deposit of minimum 1 wei (>0 wei)
    require(msg.value>0, "Sender has to send a deposit of minimun 1 wei");
    id = _id;
    buyer = _sender;
    title = _title;
    price = _price;
    seller = _seller;
    state = State.created;
  }

  function complete(address _sender, Account _sellerAccount) public {
    // We check that the complete function is called by the buyer
    require(buyer == _sender, "You must be the buyer of this order");
    // We check that the order is created, and can't be yet completed or complained
    require(state == State.created, "To complete the order, it can't be yet completed or complained");
    // We paid the payment to the seller
    address(_sellerAccount).transfer(address(this).balance);
  }

  function complain(address _sender, Account _buyerAccount) public {
    // We check that the complain function is called by the buyer
    require(buyer == _sender, "You must be the buyer of this order");
    // We check that the order is created, and can't be yet completed or complained
    require(state == State.created, "To complain the order, it can't be yet completed or complained");
    // We refund the payment to the buyer
    address(_buyerAccount).transfer(address(this).balance);
  }
}