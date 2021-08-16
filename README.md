# Escrow Test

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
I have created an *Escrow* smart contract that have all the data and functions needed to complete this assessment.
In the *Escrow* smart contract there are three main data structures:
* *accounts*, a mapping to *Account*'s smart contracts, that have the information of buyer and seller accounts, and stores the credit of each account, in real ethers.
* *orders*, a mapping to *Order*'s smart contracts, that have the information of each order, and stores the payments for each one. To know the total amount held in the scrow, we have to count the balance of all the orders.
* *items*, a mapping to *Item*'s structs, that have the information of each item offered by the sellers.

The contracts *Account* and *Order* have a balance of ethers that represents their credit and escrow, respectively. For this reason, fund transfers are made from the contracts that has the balance. For example:
* The *Account*'s contracts have the credit of buyers and sellers
* The *Order*'s contracts have an escrow made by the buyer
* When the buyer completes an order, the *Order* contract transfers the escrow to the seller's *Account* contract
* When the buyer complains an order, the *Order* contract transfers the escrow to the buyer's *Account* contract

The solution has been tested with real Ethereum accounts and real *ether*, in the Rinkeby test network and in the Ganache local test network.

## Questions

The output of the `npm start` command executes the example inputs, and answers the following questions:
1. What is Buyer 1’s balance?
2. What is Seller 2’s balance?
3. What is the total amount held in escrow?

Output:
```
Buyer 0 has the address: 0xcF8A7aCFdD0D8765699149253D269286F855b826
Buyer 1 has the address: 0x2Da01C929E6Cd43CC10dfa72012a8a43C405CC1A
Seller 0 has the address: 0xB4D8De59BBD2468b71d2CF4521D985Da892BF8eb
Seller 1 has the address: 0x2f2eC0cB0A30361D379948AcFD6752048c556Bb0
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Credit   | 20
Buyer 0x2Da01C929E6Cd43CC10dfa72012a8a43C405CC1A  | Credit   | 40
Seller 0xB4D8De59BBD2468b71d2CF4521D985Da892BF8eb | Offer    | Coffee, 3
Seller 0x2f2eC0cB0A30361D379948AcFD6752048c556Bb0 | Offer    | T-Shirt, 5
Seller 0xB4D8De59BBD2468b71d2CF4521D985Da892BF8eb | Offer    | Tea, 2.5
Seller 0xB4D8De59BBD2468b71d2CF4521D985Da892BF8eb | Offer    | Cake, 3.5
Seller 0x2f2eC0cB0A30361D379948AcFD6752048c556Bb0 | Offer    | Shorts, 8
Seller 0x2f2eC0cB0A30361D379948AcFD6752048c556Bb0 | Offer    | Hoody, 12
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Order    | T-Shirt
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Credit   | 10
Buyer 0x2Da01C929E6Cd43CC10dfa72012a8a43C405CC1A  | Order    | Hoody
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Complete | T-Shirt
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Order    | Coffee
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Order    | Cake
Buyer 0x2Da01C929E6Cd43CC10dfa72012a8a43C405CC1A  | Complain | Hoody
Buyer 0x2Da01C929E6Cd43CC10dfa72012a8a43C405CC1A  | Order    | Tea
Buyer 0xcF8A7aCFdD0D8765699149253D269286F855b826  | Complete | Coffee
The Buyer 0 has a balance of 18.5 ethers
The Seller 1 has a balance of 5 ethers
The total amount held in escrow is 6 ethers
```
