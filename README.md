# Boson Escrow
Boson Protocol - Engineer Technical Interview - Problem Statement

## Requirements
Requirements: [NodeJS](https://nodejs.org/en/).

To install all dependencies:
```
npm install
```
## Execution
To compile the smart contract:
```
npm run compile
```

To deploy to Rinkeby test network:
```
npm run deploy
```

To execute the test in the Ganache local test network:
```
npm run test
```

To execute the program in the Ganache local test network:
```
npm start
```

## Explanation
I have created an *Escrow* smart contract that have all the data and functions.
In the *Escrow* smart contract there are three main data structures:
* *accounts*, a mapping to *Account*'s smart contracts, that have the information of buyer and seller accounts, and stores the credit of each account, in real ethers.
* *orders*, a mapping to *Order*'s smart contracts, that have the information of each order, and stores the payments for each one. To know the total amount held in the scrow, we have to count the balance of all the orders.
* *items*, a mapping to *Item*'s structs, that have the information of each item offered by the sellers.

The solution has been tested with real Ethereum accounts and real *ether*, in the Rinkeby test network and in the Ganache local test network.
