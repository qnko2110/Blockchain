const sha256 = require("crypto-js/sha256");
const {MerkleTree} = require('merkletreejs');

const DIFFICULTY = 4;

// --------------------------------------------------------------------------
function getTimestamp(date = Date.now()) {
    return Math.floor(date / 1000);
}

// --------------------------------------------------------------------------
class Block {
    constructor(index, timestamp, transactions, precedingHash = ' ') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = this.initTransactions(transactions);
        this.precedingHash = precedingHash;
        this.nonce = 0;
        this.markleRoot = this.computeMarkleRoot();
        this.hash = this.computeBlockHash();
    }
    isRoot() {
        return this.nonce === 0;
    }
    computeMarkleRoot() {
        const tree = this.computeMarkleTree();
        const root = tree.getRoot().toString('hex');
        return root;
    }
	computeMarkleTree() {
        let transactionsAsString = this.transactions.map(transaction => JSON.stringify(transaction));
        const leaves = transactionsAsString.map(x => sha256(x));
        const tree = new MerkleTree(leaves, sha256);
        return tree;
    }
    initTransactions(transactions) {
        transactions.forEach(transaction => {
            if (!this.isRoot()) {
                transaction.hash = this.computeTransactionHash(JSON.stringify(transaction));
            }
        });
        return transactions;
    }
    computeTransactionHash(transaction) {
        return sha256(
                transaction.from + transaction.to + transaction.amount
                ).toString();
    }
    computeBlockHash() {
        return sha256(
                this.index +
                this.precedingHash +
                this.timestamp +
				this.markleRoot +
                JSON.stringify(this.transactions) +
                this.nonce
                ).toString();
    }
    proofOfWork(difficulty) {
        while (this.hash.slice(0, difficulty) !== '0'.repeat(difficulty)) {
            this.nonce++;
            this.hash = this.computeBlockHash();
        }
    }
}
// -----------------------------------------------------------------------------
class Blockchain {
    constructor() {
        this.blocks = [this.addGenesisBlock()];
        this.difficulty = DIFFICULTY;
    }
    addGenesisBlock() {
        return new Block(0, getTimestamp(), [], '0');
    }

    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }
    addNewBlock(newBlock) {
        newBlock.precedingHash = this.getLatestBlock().hash;
        newBlock.proofOfWork(this.difficulty);
        this.blocks.push(newBlock);
    }
    checkChainValidity() {
        for (let i = 1; i < this.blocks.length; i++) {
            const currentBlock = this.blocks[i];
            const precedingBlock = this.blocks[i - 1];

            if (currentBlock.hash !== currentBlock.computeBlockHash()) {
                return false;
            }
            if (currentBlock.precedingHash !== precedingBlock.hash)
                return false;
        }
        return true;
    }
}
// -----------------------------------------------------------------------------

let myBlockchain = new Blockchain();
console.log("Mining blocks, please wait ...");
console.time("Mining time");

myBlockchain.addNewBlock(
    new Block(1, getTimestamp(),
		[
			{
				from: "Иван",
				to: "Георги",
				amount: 50
			},
			{
				from: "Иван",
				to: "Надя",
				amount: 23
			}
		]
	)
);

myBlockchain.addNewBlock(
	new Block(2, getTimestamp(),
		[
			{
				from: "Иван",
				to: "Петко",
				amount: 5
			}
		]
	)
);
console.timeEnd("Mining time");
console.log(JSON.stringify(myBlockchain, null, 3));
// -----------------------------------------------------------------------------

// Test Blockchain ...
const blockIndex = 1;
const transactionIndex = 0;
const block = myBlockchain.blocks[blockIndex];
const root = block.markleRoot;
const transactions = block.transactions;

transactions[transactionIndex].amount = 0;

// Find invalid blocks ...
let blockchainValidity = myBlockchain.checkChainValidity();
console.log(`Blockchain validity: ${blockchainValidity}`);

// Find invalid transaction ...
let transactionsAsString = transactions.map(transaction => JSON.stringify(transaction));
const leaves = transactionsAsString.map(x => sha256(x));
const tree = new MerkleTree(leaves, sha256);

const leaf = sha256(transactionsAsString[transactionIndex]);
const proof = tree.getProof(leaf);

const markleValidity = tree.verify(proof, leaf, root);
console.log(`Markle root validity: ${markleValidity}`);


// Find index of block with invalid transaction ...
let blocks = myBlockchain.blocks;
let numberOfBlocks = blocks.length;
for (let i = 0; i < numberOfBlocks; i++) {
    let cBlock = blocks[i];
    if (!cBlock.isRoot()) {
        let cRoot = cBlock.markleRoot;
        let cTransactions = cBlock.transactions;
        let cTransactionsAsString = cTransactions.map(transaction => JSON.stringify(transaction));
        let cLleaves = cTransactionsAsString.map(x => sha256(x));
        let cTree = new MerkleTree(cLleaves, sha256);
        let cLleaf = sha256(cTransactionsAsString[0]);
        let cPproof = cTree.getProof(cLleaf);
        let cMarkleValidity = cTree.verify(cPproof, cLleaf, cRoot);
        if (!cMarkleValidity) {
            console.log(`Transaction in block ${i} is invalid`);
        }
    }
}
// -----------------------------------------------------------------------------






