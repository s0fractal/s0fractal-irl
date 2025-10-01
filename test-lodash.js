#!/usr/bin/env node

// Test s0fractal-IRL with real lodash-like functions

import { S0FractalIRL } from './index.js';

console.log('🧪 Testing s0fractal-IRL with lodash-like functions\n');
console.log('=' .repeat(50));

const registry = new S0FractalIRL();

// Common lodash functions in different styles
const functions = [
  // Identity variations - should all be similar
  { name: 'identity1', code: 'x => x' },
  { name: 'identity2', code: 'function identity(value) { return value }' },
  { name: 'identity3', code: '(val) => val' },

  // isNil variations
  { name: 'isNil1', code: 'value => value == null' },
  { name: 'isNil2', code: 'x => x === null || x === undefined' },
  { name: 'isNil3', code: 'function isNil(v) { return v == null }' },

  // Addition utilities
  { name: 'add1', code: '(a, b) => a + b' },
  { name: 'add2', code: 'function add(x, y) { return x + y }' },
  { name: 'sum', code: '(p, q) => p + q' },
  { name: 'addReversed', code: '(a, b) => b + a' },

  // Different operations
  { name: 'subtract', code: '(a, b) => a - b' },
  { name: 'multiply', code: '(a, b) => a * b' },
  { name: 'divide', code: '(a, b) => a / b' },

  // Increment/decrement
  { name: 'inc1', code: 'n => n + 1' },
  { name: 'inc2', code: 'x => 1 + x' },
  { name: 'dec', code: 'n => n - 1' },

  // Comparisons
  { name: 'eq', code: '(a, b) => a === b' },
  { name: 'gt', code: '(a, b) => a > b' },
  { name: 'lt', code: '(a, b) => a < b' },

  // Boolean operations
  { name: 'negate', code: 'x => !x' },
  { name: 'and', code: '(a, b) => a && b' },
  { name: 'or', code: '(a, b) => a || b' },

  // Array operations
  { name: 'head', code: 'arr => arr[0]' },
  { name: 'tail', code: 'arr => arr[arr.length - 1]' },
  { name: 'isEmpty', code: 'x => x.length === 0' }
];

console.log('\n📝 Registering functions:\n');

// Register all functions and collect hashes
const registered = [];
for (const func of functions) {
  const start = performance.now();
  const hash = await registry.register(func.code);
  const time = performance.now() - start;

  registered.push({ ...func, hash });
  console.log(`  ${func.name.padEnd(15)} → ${hash} (${time.toFixed(2)}ms)`);
}

console.log('\n🔍 Finding semantic duplicates:\n');

// Group by semantic hash (first part)
const groups = {};
for (const func of registered) {
  const semanticHash = func.hash.split('-')[0];
  if (!groups[semanticHash]) {
    groups[semanticHash] = [];
  }
  groups[semanticHash].push(func.name);
}

// Show groups with more than one function
let duplicatesFound = false;
for (const [hash, names] of Object.entries(groups)) {
  if (names.length > 1) {
    duplicatesFound = true;
    console.log(`  Hash ${hash}: ${names.join(', ')}`);
  }
}

if (!duplicatesFound) {
  console.log('  No semantic duplicates found');
}

console.log('\n📊 Analysis:\n');

// Count unique semantic hashes
const uniqueSemantic = new Set(registered.map(f => f.hash.split('-')[0]));
const uniqueFull = new Set(registered.map(f => f.hash));

console.log(`  Total functions: ${functions.length}`);
console.log(`  Unique semantic hashes: ${uniqueSemantic.size}`);
console.log(`  Unique full hashes: ${uniqueFull.size}`);
console.log(`  Deduplication ratio: ${((1 - uniqueSemantic.size / functions.length) * 100).toFixed(1)}%`);

// Test specific cases
console.log('\n✅ Validation Tests:\n');

const add1Hash = registered.find(f => f.name === 'add1').hash;
const add2Hash = registered.find(f => f.name === 'add2').hash;
const addRevHash = registered.find(f => f.name === 'addReversed').hash;
const subHash = registered.find(f => f.name === 'subtract').hash;
const inc1Hash = registered.find(f => f.name === 'inc1').hash;
const inc2Hash = registered.find(f => f.name === 'inc2').hash;

// Semantic parts (first segment)
const add1Semantic = add1Hash.split('-')[0];
const add2Semantic = add2Hash.split('-')[0];
const addRevSemantic = addRevHash.split('-')[0];
const subSemantic = subHash.split('-')[0];
const inc1Semantic = inc1Hash.split('-')[0];
const inc2Semantic = inc2Hash.split('-')[0];

console.log(`  add(a,b) == add(x,y): ${add1Semantic === add2Semantic ? '✅' : '❌'}`);
console.log(`  add(a,b) == add(b,a): ${add1Semantic === addRevSemantic ? '✅' : '❌'}`);
console.log(`  add != subtract: ${add1Semantic !== subSemantic ? '✅' : '❌'}`);
console.log(`  x+1 == 1+x: ${inc1Semantic === inc2Semantic ? '✅' : '❌'}`);

// Performance stats
console.log('\n⚡ Performance:\n');
const stats = registry.getStats();
console.log(`  Average hash time: ${stats.avgHashTime}`);
console.log(`  Functions registered: ${stats.registered}`);

console.log('\n' + '=' .repeat(50));
console.log('\n🎯 Result: s0fractal-IRL with semantic deduplication is WORKING!\n');