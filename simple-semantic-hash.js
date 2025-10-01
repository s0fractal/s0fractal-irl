#!/usr/bin/env node

// Simple Semantic Hash - Actually Works™
// Distinguishes operations, handles commutative properties, normalizes variables

import crypto from 'crypto';
import * as acorn from 'acorn';

class SimpleSemanticHasher {
  constructor(options = {}) {
    this.debug = options.debug || false;
  }

  // Main hash function
  hash(code) {
    try {
      // Parse to AST
      const ast = acorn.parse(code, {
        ecmaVersion: 2020,
        sourceType: 'module'
      });

      // Extract function body (handle different formats)
      const funcBody = this.extractFunctionBody(ast);
      if (!funcBody) {
        throw new Error('No function found in code');
      }

      // Normalize variables to positional ($1, $2, etc)
      const normalized = this.normalizeVariables(funcBody);

      // Extract semantic signature
      const signature = this.extractSignature(normalized);

      // Sort commutative operations
      if (signature.operations.length > 0) {
        signature.operations = this.sortCommutative(signature.operations);
      }

      // Create deterministic hash
      const hashInput = JSON.stringify(signature, null, 0);
      const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

      if (this.debug) {
        console.log('Signature:', signature);
        console.log('Hash input:', hashInput);
      }

      return {
        hash: hash.substring(0, 16),
        fullHash: hash,
        signature,
        normalized
      };
    } catch (e) {
      console.error('Hash failed:', e.message);
      // Fallback to simple text hash
      return {
        hash: crypto.createHash('sha256').update(code).digest('hex').substring(0, 16),
        error: e.message
      };
    }
  }

  // Extract function body from various formats
  extractFunctionBody(ast) {
    // Arrow function: () => ...
    if (ast.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      return ast.body[0].expression;
    }

    // Function declaration: function f() { ... }
    if (ast.body[0]?.type === 'FunctionDeclaration') {
      return ast.body[0];
    }

    // Variable with arrow function: const f = () => ...
    if (ast.body[0]?.type === 'VariableDeclaration') {
      const init = ast.body[0].declarations[0]?.init;
      if (init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression') {
        return init;
      }
    }

    // Expression statement with arrow function
    if (ast.body[0]?.type === 'ExpressionStatement' &&
        ast.body[0].expression?.type === 'ArrowFunctionExpression') {
      return ast.body[0].expression;
    }

    return null;
  }

  // Normalize variables to positional markers
  normalizeVariables(node) {
    const varMap = new Map();
    let varCounter = 1;

    // Collect parameter names
    if (node.params) {
      node.params.forEach(param => {
        if (param.type === 'Identifier') {
          varMap.set(param.name, `$${varCounter++}`);
        }
      });
    }

    // Deep clone and replace
    const normalized = JSON.parse(JSON.stringify(node));
    this.replaceVariables(normalized, varMap);

    return normalized;
  }

  // Recursively replace variable names
  replaceVariables(node, varMap) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'Identifier' && varMap.has(node.name)) {
      node.name = varMap.get(node.name);
    }

    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => this.replaceVariables(child, varMap));
        } else {
          this.replaceVariables(node[key], varMap);
        }
      }
    }
  }

  // Extract semantic signature
  extractSignature(node) {
    const signature = {
      type: 'function',
      arity: node.params ? node.params.length : 0,
      operations: [],
      literals: [],
      structure: []
    };

    // Extract operations recursively
    this.extractOperations(node.body || node, signature);

    return signature;
  }

  // Extract operations from AST
  extractOperations(node, signature) {
    if (!node || typeof node !== 'object') return;

    // Binary operations
    if (node.type === 'BinaryExpression') {
      signature.operations.push({
        type: 'binary',
        op: node.operator,
        // For commutative ops, sort operands
        left: this.getOperandSignature(node.left),
        right: this.getOperandSignature(node.right)
      });
      this.extractOperations(node.left, signature);
      this.extractOperations(node.right, signature);
    }

    // Unary operations
    else if (node.type === 'UnaryExpression') {
      signature.operations.push({
        type: 'unary',
        op: node.operator
      });
      this.extractOperations(node.argument, signature);
    }

    // Return statement
    else if (node.type === 'ReturnStatement') {
      signature.structure.push('return');
      this.extractOperations(node.argument, signature);
    }

    // Literals
    else if (node.type === 'Literal') {
      signature.literals.push(node.value);
    }

    // Recursively process all children
    else {
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(child => this.extractOperations(child, signature));
          } else {
            this.extractOperations(node[key], signature);
          }
        }
      }
    }
  }

  // Get operand signature for sorting
  getOperandSignature(node) {
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'Literal') return `lit:${node.value}`;
    if (node.type === 'BinaryExpression') return `op:${node.operator}`;
    return node.type;
  }

  // Sort commutative operations
  sortCommutative(operations) {
    return operations.map(op => {
      if (op.type === 'binary' && this.isCommutative(op.op)) {
        // Sort operands for commutative operations
        const sorted = [op.left, op.right].sort();
        return {
          ...op,
          left: sorted[0],
          right: sorted[1]
        };
      }
      return op;
    });
  }

  // Check if operation is commutative
  isCommutative(op) {
    return ['+', '*', '==', '!=', '===', '!==', '&', '|', '^'].includes(op);
  }

  // Compare two hashes for similarity
  compare(hash1, hash2) {
    if (hash1.hash === hash2.hash) return 1.0;

    // Compare signatures
    const sig1 = hash1.signature;
    const sig2 = hash2.signature;

    if (!sig1 || !sig2) return 0;

    let score = 0;
    let factors = 0;

    // Same arity?
    if (sig1.arity === sig2.arity) {
      score += 0.3;
    }
    factors += 0.3;

    // Same operations?
    const ops1 = JSON.stringify(sig1.operations);
    const ops2 = JSON.stringify(sig2.operations);
    if (ops1 === ops2) {
      score += 0.7;
    }
    factors += 0.7;

    return factors > 0 ? score / factors : 0;
  }
}

// Export for use
export { SimpleSemanticHasher };

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔨 Simple Semantic Hash Test\n');

  const hasher = new SimpleSemanticHasher({ debug: false });

  // Test cases
  const tests = [
    { name: 'Addition 1', code: '(a, b) => a + b' },
    { name: 'Addition 2', code: '(x, y) => x + y' },
    { name: 'Addition reversed', code: '(a, b) => b + a' },
    { name: 'Subtraction', code: '(a, b) => a - b' },
    { name: 'Multiplication', code: '(a, b) => a * b' },
    { name: 'Division', code: '(a, b) => a / b' },
    { name: 'Complex', code: 'function add(x, y) { return x + y }' },
    { name: 'Increment', code: 'x => x + 1' },
    { name: 'Increment reversed', code: 'y => 1 + y' },
    { name: 'Decrement', code: 'x => x - 1' }
  ];

  const results = tests.map(test => {
    const result = hasher.hash(test.code);
    console.log(`${test.name}:`);
    console.log(`  Code: ${test.code}`);
    console.log(`  Hash: ${result.hash}`);
    console.log(`  Ops: ${JSON.stringify(result.signature?.operations)}`);
    console.log();
    return { ...test, result };
  });

  // Compare additions
  console.log('Comparisons:');
  const add1 = results[0].result;
  const add2 = results[1].result;
  const addRev = results[2].result;
  const sub = results[3].result;

  console.log(`  Addition 1 vs 2: ${add1.hash === add2.hash ? '✅ SAME' : '❌ DIFFERENT'}`);
  console.log(`  Addition vs reversed: ${add1.hash === addRev.hash ? '✅ SAME' : '❌ DIFFERENT'}`);
  console.log(`  Addition vs subtraction: ${add1.hash === sub.hash ? '❌ SAME (BAD!)' : '✅ DIFFERENT'}`);

  // Check increment commutativity
  const inc1 = results[7].result;
  const inc2 = results[8].result;
  console.log(`  x+1 vs 1+x: ${inc1.hash === inc2.hash ? '✅ SAME' : '❌ DIFFERENT'}`);
}