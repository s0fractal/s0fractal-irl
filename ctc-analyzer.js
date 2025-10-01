#!/usr/bin/env node

// CTC Analyzer - Closed Timelike Curve Detection
// Hard budget: 1ms max, 5 iterations max

import crypto from 'crypto';
import { performance } from 'perf_hooks';

const CTC_BUDGET_MS = 1;
const CTC_MAX_ITERATIONS = 5;

class CTCAnalyzer {
  constructor() {
    this.cache = new Map(); // Cache analysis results
    this.stats = {
      analyzed: 0,
      timeouts: 0,
      loops: 0,
      fixed: 0,
      bounded: 0,
      totalTime: 0
    };
  }

  analyze(funcHash, func = null) {
    const start = performance.now();
    this.stats.analyzed++;

    // Check cache first
    if (this.cache.has(funcHash)) {
      return this.cache.get(funcHash);
    }

    const deadline = performance.now() + CTC_BUDGET_MS;
    let state = 0;
    const seen = new Map(); // Map state hash to iteration number

    for (let i = 0; i < CTC_MAX_ITERATIONS; i++) {
      // Hard timeout check
      if (performance.now() > deadline) {
        this.stats.timeouts++;
        const result = {
          type: 'timeout',
          iterations: i,
          timeUsed: performance.now() - start
        };
        this.cache.set(funcHash, result);
        this.stats.totalTime += performance.now() - start;
        return result;
      }

      // Generate state hash (must be FAST)
      const stateHash = this.hashState(state);

      // Check for loops
      if (seen.has(stateHash)) {
        this.stats.loops++;
        const loopStart = seen.get(stateHash);
        const result = {
          type: 'loop',
          period: i - loopStart,
          iterations: i,
          loopStart,
          timeUsed: performance.now() - start
        };
        this.cache.set(funcHash, result);
        this.stats.totalTime += performance.now() - start;
        return result;
      }

      seen.set(stateHash, i);

      // Check for fixed point (state doesn't change)
      const nextState = this.step(state, funcHash);
      if (nextState === state) {
        this.stats.fixed++;
        const result = {
          type: 'fixed',
          iterations: i + 1,
          fixedValue: state,
          timeUsed: performance.now() - start
        };
        this.cache.set(funcHash, result);
        this.stats.totalTime += performance.now() - start;
        return result;
      }

      state = nextState;
    }

    // Completed all iterations without finding pattern
    this.stats.bounded++;
    const result = {
      type: 'bounded',
      iterations: CTC_MAX_ITERATIONS,
      timeUsed: performance.now() - start
    };
    this.cache.set(funcHash, result);
    this.stats.totalTime += performance.now() - start;
    return result;
  }

  // Fast state hashing using only first 8 chars
  hashState(state) {
    // Convert state to string and hash
    const str = typeof state === 'object' ? JSON.stringify(state) : String(state);
    const hash = crypto.createHash('sha256').update(str).digest('hex');
    return hash.slice(0, 8);
  }

  // Simulate one execution step (must be FAST)
  step(state, funcHash) {
    // Mock computation - in reality would execute the function
    // Using simple deterministic transform based on hash
    const hashNum = parseInt(funcHash.slice(0, 4), 16) || 1;
    return (state * 31 + hashNum) % 1000;
  }

  // Analyze self-referential behavior
  analyzeSelfReference(funcHash, depth = 3) {
    const start = performance.now();
    const results = [];

    // Apply function to itself repeatedly
    let current = funcHash;
    for (let i = 0; i < depth; i++) {
      if (performance.now() - start > CTC_BUDGET_MS) {
        return {
          type: 'timeout',
          depth: i,
          results
        };
      }

      const analysis = this.analyze(current);
      results.push(analysis);

      // Generate next hash by applying to self
      current = this.hashState(current + i);
    }

    // Check for patterns in the results
    const types = results.map(r => r.type);
    const allSame = types.every(t => t === types[0]);

    return {
      type: 'self-reference',
      depth,
      pattern: allSame ? 'stable' : 'evolving',
      results,
      timeUsed: performance.now() - start
    };
  }

  // Detect Y-combinator style recursion
  detectYCombinator(funcSource) {
    const patterns = [
      /\bY\s*\(/,                    // Direct Y combinator
      /function\s+\w+\([^)]*\)\s*{\s*return\s+\1/,  // Self-return
      /=>\s*\w+\s*\(/,              // Arrow function recursion
      /arguments\.callee/           // Old-style self-reference
    ];

    for (const pattern of patterns) {
      if (pattern.test(funcSource)) {
        return {
          type: 'y-combinator',
          pattern: pattern.source,
          detected: true
        };
      }
    }

    return {
      type: 'y-combinator',
      detected: false
    };
  }

  getStats() {
    const avgTime = this.stats.analyzed > 0
      ? this.stats.totalTime / this.stats.analyzed
      : 0;

    return {
      ...this.stats,
      avgAnalysisTime: avgTime.toFixed(3) + 'ms',
      timeoutRate: this.stats.analyzed > 0
        ? ((this.stats.timeouts / this.stats.analyzed) * 100).toFixed(1) + '%'
        : '0%',
      loopRate: this.stats.analyzed > 0
        ? ((this.stats.loops / this.stats.analyzed) * 100).toFixed(1) + '%'
        : '0%',
      cacheSize: this.cache.size
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

// Batch analyzer for multiple functions
class CTCBatchAnalyzer {
  constructor() {
    this.analyzer = new CTCAnalyzer();
  }

  async analyzeBatch(functions, options = {}) {
    const maxTime = options.maxTime || 1000; // 1 second default
    const start = performance.now();
    const results = [];

    for (const func of functions) {
      if (performance.now() - start > maxTime) {
        console.warn(`Batch timeout after ${results.length} functions`);
        break;
      }

      const result = this.analyzer.analyze(func.hash, func);
      results.push({
        hash: func.hash,
        ...result
      });
    }

    return {
      analyzed: results.length,
      results,
      stats: this.analyzer.getStats(),
      timeUsed: performance.now() - start
    };
  }
}

// Export for use
export { CTCAnalyzer, CTCBatchAnalyzer, CTC_BUDGET_MS, CTC_MAX_ITERATIONS };

// CLI demo
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    console.log('CTC Analyzer Performance Test\n');
    console.log(`Budget: ${CTC_BUDGET_MS}ms per function`);
    console.log(`Max iterations: ${CTC_MAX_ITERATIONS}\n`);

    const analyzer = new CTCAnalyzer();

    // Test different function types
    const testCases = [
      { hash: 'a1b2c3d4', name: 'Simple function' },
      { hash: '11111111', name: 'Fixed point function' },
      { hash: 'abababab', name: 'Periodic function' },
      { hash: 'ffffffff', name: 'Complex function' },
      { hash: '12345678', name: 'Bounded function' }
    ];

    console.log('Individual Analysis:\n');
    for (const test of testCases) {
      const result = analyzer.analyze(test.hash);
      console.log(`${test.name} (${test.hash}):`);
      console.log(`  Type: ${result.type}`);
      console.log(`  Iterations: ${result.iterations}`);
      if (result.period) console.log(`  Period: ${result.period}`);
      console.log(`  Time: ${result.timeUsed?.toFixed(3) || '?'}ms`);
      console.log();
    }

    // Test self-reference
    console.log('Self-Reference Analysis:\n');
    const selfRef = analyzer.analyzeSelfReference('recursive1');
    console.log(`Pattern: ${selfRef.pattern}`);
    console.log(`Depth reached: ${selfRef.depth}`);
    console.log(`Time used: ${selfRef.timeUsed?.toFixed(3)}ms\n`);

    // Test Y-combinator detection
    console.log('Y-Combinator Detection:\n');
    const ySources = [
      'const Y = f => (x => f(x(x)))(x => f(x(x)))',
      'function fact(n) { return n <= 1 ? 1 : n * fact(n-1) }',
      'const loop = () => loop()',
      'const normal = (x) => x + 1'
    ];

    for (const source of ySources) {
      const detection = analyzer.detectYCombinator(source);
      console.log(`"${source.slice(0, 40)}..."`);
      console.log(`  Y-combinator: ${detection.detected ? 'YES' : 'NO'}\n`);
    }

    // Overall stats
    console.log('Performance Stats:');
    const stats = analyzer.getStats();
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // Check performance
    const avgTime = parseFloat(stats.avgAnalysisTime);
    console.log(`\n✅ ${avgTime <= CTC_BUDGET_MS ? 'PASS' : 'FAIL'} - Target ≤${CTC_BUDGET_MS}ms average`);
  })();
}