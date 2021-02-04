const path = require("path");
const fs = require("fs-extra"); // fs with extra functions
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const compiledEscrowPath = './build/Escrow.json';
const compiledEscrow = require(compiledEscrowPath);

// Mnemonic from a test account and an Infura provider
const provider = new HDWalletProvider(
  'tragic square news business dad cricket nurse athlete tide split about ring',
  'https://rinkeby.infura.io/v3/b2daf36eb4d74aed8ffac330c09dd2ee'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // We deploy the Escrow smart contract to the Rinkeby test network
  const result = await new web3.eth.Contract(JSON.parse(compiledEscrow.interface))
    .deploy({ data: compiledEscrow.bytecode, arguments: [] })
    .send({ from: accounts[0], gas: '6000000' });

  // We write the address of the deployed contract to the CONTRACTADDRESS file
  fs.writeFileSync('./CONTRACTADDRESS', result.options.address);
  
  console.log('Contract deployed to Rinkeby network, at address ', result.options.address);
};

deploy();
