import { db } from '../server/db';

console.log('--- DATABASE QUERY BENCHMARK (BEFORE OPTIMIZATION) ---');

// Warm up
db.getProducts();
db.getOrders();
db.getDisputes();

// Benchmark getProducts
const prodRuns = 100;
const startProd = performance.now();
for (let i = 0; i < prodRuns; i++) {
  db.getProducts();
}
const endProd = performance.now();
const avgProdMs = (endProd - startProd) / prodRuns;
console.log(`db.getProducts(): ${avgProdMs.toFixed(3)} ms avg per call (${prodRuns} iterations)`);

// Benchmark getOrders
const orderRuns = 100;
const startOrders = performance.now();
for (let i = 0; i < orderRuns; i++) {
  db.getOrders();
}
const endOrders = performance.now();
const avgOrdersMs = (endOrders - startOrders) / orderRuns;
console.log(`db.getOrders(): ${avgOrdersMs.toFixed(3)} ms avg per call (${orderRuns} iterations)`);

// Benchmark getDisputes
const disputeRuns = 100;
const startDisputes = performance.now();
for (let i = 0; i < disputeRuns; i++) {
  db.getDisputes();
}
const endDisputes = performance.now();
const avgDisputesMs = (endDisputes - startDisputes) / disputeRuns;
console.log(`db.getDisputes(): ${avgDisputesMs.toFixed(3)} ms avg per call (${disputeRuns} iterations)`);

process.exit(0);
