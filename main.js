const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledEscrow = require('./build/Escrow.json');

let escrowContract;
let accounts;
let buyers = [];
let sellers = [];

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

  // Buyer 0 makes a credit of 20 ethers
  await escrowContract.methods
    .credit()
    .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('20', 'ether') });

  // Buyer 1 makes a credit of 40 ethers
  await escrowContract.methods
    .credit()
    .send({ from: buyers[1], gas: '6000000', value: Web3.utils.toWei('40', 'ether') });

  // Seller 0 offers Coffee, 3
  await escrowContract.methods
    .offer('Coffee', Web3.utils.toWei('3', 'ether'))
    .send({ from: sellers[0], gas: '6000000' });

  // Seller 1 offers T-Shirt, 5
  await escrowContract.methods
    .offer('T-Shirt', Web3.utils.toWei('5', 'ether'))
    .send({ from: sellers[1], gas: '6000000' });

  // Seller 0 offers Tea, 2.5
  await escrowContract.methods
    .offer('Tea', Web3.utils.toWei('2.5', 'ether'))
    .send({ from: sellers[0], gas: '6000000' });

  // Seller 0 offers Cake, 3.5
  await escrowContract.methods
    .offer('Cake', Web3.utils.toWei('3.5', 'ether'))
    .send({ from: sellers[0], gas: '6000000' });

  // Seller 1 offers Shorts, 8
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

  // Buyer 0 | Credit | 10
  await escrowContract.methods
    .credit()
    .send({ from: buyers[0], gas: '6000000', value: Web3.utils.toWei('40', 'ether') });

  // Buyer 1 | Order | Hoody
  await escrowContract.methods
    .order('Hoody')
    .send({ from: buyers[0], gas: '6000000' });
    
  // Buyer 0 | Complete | T-Shirt
  // Buyer 0 | Order | Coffee
  await escrowContract.methods
    .order('Coffee')
    .send({ from: buyers[0], gas: '6000000' });
    
  // Buyer 0 | Order | Cake
  await escrowContract.methods
    .order('Cake')
    .send({ from: buyers[0], gas: '6000000' });
  
  // Buyer 1 | Complain | Hoody
  // Buyer 1 | Order | Tea
  await escrowContract.methods
    .order('Tea')
    .send({ from: buyers[0], gas: '6000000' });
  
  // Buyer 0 | Complete | Coffee
}

main();
