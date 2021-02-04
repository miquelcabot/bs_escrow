const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledEscrowContractPath = '../build/Escrow.json';
const compiledEscrow = require(compiledEscrowContractPath);

let escrowContract;
let accounts;
let buyers = [];
let sellers = [];

// To prevent warning "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit"
require('events').EventEmitter.defaultMaxListeners = 0;

beforeEach(async () => {
  // We read the accounts of the Ganache network
  accounts = await web3.eth.getAccounts();

  // We set the buyers and sellers to specific accounts of the Ganache test network
  buyers[0] = accounts[0];
  buyers[1] = accounts[1];
  sellers[0] = accounts[2];
  sellers[1] = accounts[3];

  /*
  // We print the buyer's addresses
  buyers.forEach((address, index) => {
    console.log(`Buyer ${index} has the address: ${address}`);
  });
  // We print the sellers's addresses
  sellers.forEach((address, index) => {
    console.log(`Buyer ${index} has the address: ${address}`);
  });
  */

  escrowContract = await new web3.eth.Contract(JSON.parse(compiledEscrow.interface))
    .deploy({ data: compiledEscrow.bytecode, arguments: [] })
    .send({ from: accounts[0], gas: '6000000' });
});

describe('Escrow contract test', () => {
  it('deploys an Escrow contract', () => {
    // We check that the Escrow contract has been deployed
    console.log(`The Escrow smart contract has the ${escrowContract.options.address} address`)
    assert.ok(escrowContract.options.address);
  });

  it('a buyer makes a credit', async () => {
    // Buyer 0 makes a credit of 20 Ethers
    // We read the balance before the credit
    let balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    let balanceBuyer0Ethers = Web3.utils.fromWei(balanceBuyer0, 'ether');
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0Ethers} ethers before the credit`);
    // The buyer makes a credit of 20 ethers
    await escrowContract.methods
      .credit()
      .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('20', 'ether') });
    // We read the balance after the credit
    balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    balanceBuyer0Ethers = Web3.utils.fromWei(balanceBuyer0, 'ether');
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0Ethers} ethers after the credit`);
    // We check that the credit is of 20 ethers
    assert.equal(balanceBuyer0, Web3.utils.toWei('20', 'ether'))
  });

  it('a seller offers an item', async () => {
    // The seller adds an item
    let itemTitle = 'Coffee';
    let itemPrice = Web3.utils.toWei('3', 'ether');
    await escrowContract.methods
      .offer(itemTitle, itemPrice)
      .send({ from: sellers[0], gas: '6000000' });
    // We check that the item has been saved, and has the correct price
    let checkItemPrice = await escrowContract.methods.getItemPrice('Coffee').call();
    let checkItemPriceEthers = Web3.utils.fromWei(checkItemPrice, 'ether');
    console.log(`The item '${itemTitle}' has been saved with a price of ${checkItemPriceEthers} ethers`);
    assert.equal(itemPrice, checkItemPrice);
  });

  it('a buyer orders an item', async () => {
    // The buyer makes a credit of 20 ethers
    await escrowContract.methods
      .credit()
      .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('20', 'ether') });
    // The seller adds an item
    let itemTitle = 'Coffee';
    let itemPrice = Web3.utils.toWei('3', 'ether');
    await escrowContract.methods
      .offer(itemTitle, itemPrice)
      .send({ from: sellers[0], gas: '6000000' });

    // We read the balance before the order
    let balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    let balanceBuyer0Ethers = Web3.utils.fromWei(balanceBuyer0, 'ether');
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0Ethers} ethers before the order`);

    // The buyer orders an item
    await escrowContract.methods
      .order('Coffee')
      .send({ from: buyers[0], gas: '6000000' });
      
    // We read the last order id
    let lastOrderId = await escrowContract.methods.getLastOrderId().call();
    let balanceLastOrder = await escrowContract.methods.getOrderBalance(lastOrderId).call();
    let balanceLastOrderEthers = Web3.utils.fromWei(balanceLastOrder, 'ether');
    console.log(`The Buyer 0 has created the order number ${lastOrderId}, with a balance of ${balanceLastOrderEthers} ethers`);

    // We read the balance after the order
    balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    balanceBuyer0Ethers = Web3.utils.fromWei(balanceBuyer0, 'ether');
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0Ethers} ethers after the order`);

    assert.equal(lastOrderId, 1);
    assert.equal(itemPrice, balanceLastOrder);
  });

  it('a buyer completes an order', async () => {
    // The buyer makes a credit of 20 ethers
    await escrowContract.methods
      .credit()
      .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('20', 'ether') });
    // The seller adds an item
    let itemTitle = 'Coffee';
    let itemPrice = Web3.utils.toWei('3', 'ether');
    await escrowContract.methods
      .offer(itemTitle, itemPrice)
      .send({ from: sellers[0], gas: '6000000' });

    // The buyer orders an item
    await escrowContract.methods
      .order('Coffee')
      .send({ from: buyers[0], gas: '6000000' });
      
    // We read the last order id
    let lastOrderId = await escrowContract.methods.getLastOrderId().call();
    let balanceLastOrder = await escrowContract.methods.getOrderBalance(lastOrderId).call();
    let balanceLastOrderEthers = Web3.utils.fromWei(balanceLastOrder, 'ether');
    console.log(`The Buyer 0 has created the order number ${lastOrderId}, with a balance of ${balanceLastOrderEthers} ethers`);

    // The buyer completes an order
    await escrowContract.methods
      .complete(lastOrderId)
      .send({ from: buyers[0], gas: '6000000' });

    // We read the last order id
    balanceLastOrder = await escrowContract.methods.getOrderBalance(lastOrderId).call();
    balanceLastOrderEthers = Web3.utils.fromWei(balanceLastOrder, 'ether');
    console.log(`The Buyer 0 has created the order number ${lastOrderId}, with a balance of ${balanceLastOrderEthers} ethers`);

  });
});
