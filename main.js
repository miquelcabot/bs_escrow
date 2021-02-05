const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledEscrow = require('./build/Escrow.json');

let escrowContract;
let accounts;
let buyers = [];
let sellers = [];

let orderIdTShirt, orderIdHoody, orderIdCoffee;

const main = async () => {
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
    console.log(`Seller ${index} has the address: ${address}`);
  });

  // Deployment of the Escrow contract
  escrowContract = await new web3.eth.Contract(JSON.parse(compiledEscrow.interface))
    .deploy({ data: compiledEscrow.bytecode, arguments: [] })
    .send({ from: accounts[0], gas: '6000000' });

  // We subscribe to the Escrow contract events
  escrowContract.events.creditEvent().on("data", (event) => {
    let buyer = event.returnValues.buyer;
    let amount = Web3.utils.fromWei(event.returnValues.amount, 'ether');
    console.log(`Buyer ${buyer}  | Credit   | ${amount}`);
  });

  escrowContract.events.offerEvent().on("data", (event) => {
    let seller = event.returnValues.seller;
    let title = event.returnValues.title;
    let price = Web3.utils.fromWei(event.returnValues.price, 'ether');
    console.log(`Seller ${seller} | Offer    | ${title}, ${price}`);
  });

  escrowContract.events.orderEvent().on("data", (event) => {
    let buyer = event.returnValues.buyer;
    let title = event.returnValues.title;
    console.log(`Buyer ${buyer}  | Order    | ${title}`);
  });

  escrowContract.events.completeEvent().on("data", (event) => {
    let buyer = event.returnValues.buyer;
    let title = event.returnValues.title;
    console.log(`Buyer ${buyer}  | Complete | ${title}`);
  });

  escrowContract.events.complainEvent().on("data", (event) => {
    let buyer = event.returnValues.buyer;
    let title = event.returnValues.title;
    console.log(`Buyer ${buyer}  | Complain | ${title}`);
  });

  // Buyer 0 | Credit | 20
  await escrowContract.methods
    .credit()
    .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('20', 'ether') });

  // Buyer 1 | Credit | 40
  await escrowContract.methods
    .credit()
    .send({ from: buyers[1], gas: '6000000', value: Web3.utils.toWei('40', 'ether') });

  // Seller 0 | Offer | Coffee, 3
  await escrowContract.methods
    .offer('Coffee', Web3.utils.toWei('3', 'ether'))
    .send({ from: sellers[0], gas: '6000000' });

  // Seller 1 | Offer | T-Shirt, 5
  await escrowContract.methods
    .offer('T-Shirt', Web3.utils.toWei('5', 'ether'))
    .send({ from: sellers[1], gas: '6000000' });

  // Seller 0 | Offer | Tea, 2.5
  await escrowContract.methods
    .offer('Tea', Web3.utils.toWei('2.5', 'ether'))
    .send({ from: sellers[0], gas: '6000000' });

  // Seller 0 | Offer | Cake, 3.5
  await escrowContract.methods
    .offer('Cake', Web3.utils.toWei('3.5', 'ether'))
    .send({ from: sellers[0], gas: '6000000' });

  // SSeller 1 | Offer | Shorts, 8
  await escrowContract.methods
    .offer('Shorts', Web3.utils.toWei('8', 'ether'))
    .send({ from: sellers[1], gas: '6000000' });

  // Seller 1 offers Hoody, 12
  await escrowContract.methods
    .offer('Hoody', Web3.utils.toWei('12', 'ether'))
    .send({ from: sellers[1], gas: '6000000' });

  // Buyer 0 | Order | T-Shirt
  await escrowContract.methods
    .order('T-Shirt')
    .send({ from: buyers[0], gas: '6000000' });
  orderIdTShirt = await escrowContract.methods.getLastOrderId().call();

  // Buyer 0 | Credit | 10
  await escrowContract.methods
    .credit()
    .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('10', 'ether') });

  // Buyer 1 | Order | Hoody
  await escrowContract.methods
    .order('Hoody')
    .send({ from: buyers[1], gas: '6000000' });
    orderIdHoody = await escrowContract.methods.getLastOrderId().call();
    
  // Buyer 0 | Complete | T-Shirt
  await escrowContract.methods
    .complete(orderIdTShirt)
    .send({ from: buyers[0], gas: '6000000' });

  // Buyer 0 | Order | Coffee
  await escrowContract.methods
    .order('Coffee')
    .send({ from: buyers[0], gas: '6000000' });
  orderIdCoffee = await escrowContract.methods.getLastOrderId().call();
    
  // Buyer 0 | Order | Cake
  await escrowContract.methods
    .order('Cake')
    .send({ from: buyers[0], gas: '6000000' });
  
  // Buyer 1 | Complain | Hoody
  await escrowContract.methods
    .complain(orderIdHoody)
    .send({ from: buyers[1], gas: '6000000' });

  // Buyer 1 | Order | Tea
  await escrowContract.methods
    .order('Tea')
    .send({ from: buyers[1], gas: '6000000' });
  
  // Buyer 0 | Complete | Coffee
  await escrowContract.methods
    .complete(orderIdCoffee)
    .send({ from: buyers[0], gas: '6000000' });

  // 1. What is Buyer 0’s balance?
  let balanceBuyer0 = await escrowContract.methods.getAccountBalance(buyers[0]).call();
  let balanceBuyer0Ethers = Web3.utils.fromWei(balanceBuyer0, 'ether');
  console.log(`The Buyer 0 has a balance of ${balanceBuyer0Ethers} ethers`);
  
  // 2. What is Seller 1’s balance?
  let balanceSeller1 = await escrowContract.methods.getAccountBalance(sellers[1]).call();
  let balanceSeller1Ethers = Web3.utils.fromWei(balanceSeller1, 'ether');
  console.log(`The Seller 1 has a balance of ${balanceSeller1Ethers} ethers`);

  // 3. What is the total amount held in escrow?
  let totalHeld = await escrowContract.methods.getTotalHeld().call();
  let totalHeldEthers = Web3.utils.fromWei(totalHeld, 'ether');
  console.log(`The total amount held in escrow is ${totalHeldEthers} ethers`);
}

main();
