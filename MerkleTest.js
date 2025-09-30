const sha256 = require('crypto-js/sha256');
const {MerkleTree} = require('merkletreejs');
// -----------------------------------------------------------------------------
function calculateHash(transaction) {
 return sha256(
 transaction.from + transaction.to + transaction.amount
 ).toString();
}
function addHashToTransactions(transactions) {
 transactions.forEach(transaction => transaction.hash =
calculateHash(transaction));
}
function calculateMarkleTree(transactions) {
 const leaves = transactions.map(x => sha256(x));
 const tree = new MerkleTree(leaves, sha256);
 return tree;
}

function calculateMarkleRoot(tree) {
 const root = tree.getRoot().toString('hex');
 return root;
}
// -----------------------------------------------------------------------------
const transactions = [
 {
 from: "Иван", to: "Петко", amount: 50
 },
 {
 from: "Иван", to: "Коста", amount: 5
 },
 {
 from: "Иван", to: "Коста", amount: 500
 }
];
// -----------------------------------------------------------------------------
addHashToTransactions(transactions);
let transactionsAsString =
transactions.map(transaction => JSON.stringify(transaction));
console.log(transactions);
const origTree = calculateMarkleTree(transactionsAsString);
const origRoot = calculateMarkleRoot(origTree);
console.log(`Merkle tree:\n${origTree}`);
console.log(`Merkle root:\n${origRoot}`);

let transactionIndex = 1;
transactions[transactionIndex].amount = 0;
console.log(transactions);
// Ckeck transaction validity ...
transactionsAsString = transactions.map(transaction =>
JSON.stringify(transaction));
const leaves = transactionsAsString.map(x => sha256(x));
const tree = new MerkleTree(leaves, sha256);
const leaf = sha256(transactionsAsString[transactionIndex]);
const proof = tree.getProof(leaf);
const validity = tree.verify(proof, leaf, origRoot);
console.log(`Validity check: ${validity}`);