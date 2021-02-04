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

  // We print the buyer's addresses
  buyers.forEach((address, index) => {
    console.log(`Buyer ${index} has the address: ${address}`);
  });
  // We print the sellers's addresses
  sellers.forEach((address, index) => {
    console.log(`Buyer ${index} has the address: ${address}`);
  });

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
    // Buyer 0 makes a credit of 20 wei
    // We read the balance before the credit
    let balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0} wei before the credit`);
    // The buyer makes a credit of 20 wei
    await escrowContract.methods
      .credit()
      .send({ from: buyers[0], gas: '6000000', value: 20 });
    // We read the balance after the credit
    balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0} wei after the credit`);
    // We check that the credit is of 20 wei
    assert.equal(balanceBuyer0, 20)
  });

  it('a seller offers an item', async () => {
    // The seller adds an item
    let itemTitle = 'Coffee';
    let itemPrice = 3;
    await escrowContract.methods
      .offer(itemTitle, itemPrice)
      .send({ from: sellers[0], gas: '6000000' });
    // We check that the item has been saved, and has the correct price
    let checkItemPrice = await escrowContract.methods.getItemPrice('Coffee').call();
    console.log(`The item '${itemTitle}' has been saved with a price of ${checkItemPrice} wei`);
    assert.equal(itemPrice, checkItemPrice);
  });

  it('a buyer orders an item', async () => {
    // The buyer makes a credit of 20 wei
    await escrowContract.methods
      .credit()
      .send({ from: buyers[0], gas: '6000000', value: 20 });
    // The seller adds an item
    let itemTitle = 'Coffee';
    let itemPrice = 3;
    await escrowContract.methods
      .offer(itemTitle, itemPrice)
      .send({ from: sellers[0], gas: '6000000' });

    // We read the balance before the order
    let balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0} wei before the order`);

    // The buyer orders an item
    await escrowContract.methods
      .order('Coffee')
      .send({ from: buyers[0], gas: '6000000' });

      
    // We read the last order id
    let lastOrderId = await escrowContract.methods.getLastOrderId().call();
    let balanceLastOrder = await escrowContract.methods.getOrderBalance(lastOrderId).call();
    console.log(`The Buyer 0 has created the order number ${lastOrderId}, with a balance of ${balanceLastOrder} wei`);

    // We read the balance after the order
    balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
    console.log(`The Buyer 0 has a balance of ${balanceBuyer0} wei after the order`);

    assert.equal(lastOrderId, 1);
    assert.equal(itemPrice, balanceLastOrder);
  });

/*
  it("non receivers can't accept delivery", async function() {
    try { 
      await deliveryContract.methods
        .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
        .send({ from: accounts[3], gas: '6000000' });
      assert(false);
    } catch (err) {
      assert(err);
    } 
  });

  it("receiver can accept delivery", async function() {
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[1], gas: '6000000' });
    let state = await deliveryContract.methods.getState(accounts[1]).call();
    assert.equal(state, "accepted");
  });

  it("non sender can't finish delivery", async function() {
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[1], gas: '6000000' });
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[2], gas: '6000000' });
    try { 
      await deliveryContract.methods
        .finish(accounts[1], "0x"+w.toString(16))
        .send({ from: accounts[3], gas: '6000000' });
      assert(false);
    } catch (err) {
      assert(err);
    } 
  });

  it("sender can finish delivery", async function() {
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[1], gas: '6000000' });
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[2], gas: '6000000' });
    await deliveryContract.methods
      .finish(accounts[1], "0x"+w.toString(16))
      .send({ from: accounts[0], gas: '6000000' });
    let state = await deliveryContract.methods.getState(accounts[1]).call();
    assert.equal(state, "finished");
  });

  it("received message is correct", async function() {
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[1], gas: '6000000' });
    await deliveryContract.methods
      .accept("0x"+z1.toString(16), "0x"+z2.toString(16), "0x"+yb.toString(16), "0x"+c.toString(16))
      .send({ from: accounts[2], gas: '6000000' });
    await deliveryContract.methods
      .finish(accounts[1], "0x"+w.toString(16))
      .send({ from: accounts[0], gas: '6000000' });

    let _c2 = bigInt((await deliveryContract.methods.c2().call()).substr(2), 16);
    let _ya = bigInt((await deliveryContract.methods.ya().call()).substr(2), 16);
    let _p = bigInt((await deliveryContract.methods.p().call()).substr(2), 16);
    let _w = bigInt((await deliveryContract.methods.getW(accounts[1]).call()).substr(2), 16);

    let _r = _w.subtract(c.multiply(xb.mod(_p)));  // r = w-c*xb mod q

    const messageReceived = _c2.divide(_ya.modPow(_r, _p));
    const messageReceivedBuffer = Buffer.from(messageReceived.toString(16), 'hex');
    assert.equal(messageReceivedBuffer, MESSAGE);
  });*/
});
