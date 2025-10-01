#!/usr/bin/env node

/**
 * Hybrid Semantic Hasher
 *
 * Small functions: Simple AST-based hashing (works!)
 * Large systems: Protein-hash eigenvalues (meaningful!)
 *
 * Best of both worlds
 */

import { SimpleSemanticHasher } from './simple-semantic-hash.js';
import crypto from 'crypto';

class HybridHasher {
  constructor() {
    this.simple = new SimpleSemanticHasher();
    this.threshold = 100; // nodes in graph
  }

  async hash(code) {
    // Try simple hasher first (always works)
    const simpleResult = this.simple.hash(code);

    // Estimate complexity
    const complexity = this.estimateComplexity(code);

    if (complexity < this.threshold) {
      // Small code - use simple hasher
      return {
        type: 'simple',
        hash: simpleResult.hash,
        signature: simpleResult.signature,
        complexity
      };
    } else {
      // Large code - protein hash makes sense
      return {
        type: 'protein',
        hash: await this.proteinHash(code),
        complexity,
        reason: 'Graph large enough for eigenvalue differentiation'
      };
    }
  }

  estimateComplexity(code) {
    // Count AST nodes, operations, branches, etc.
    const lines = code.split('\n').length;
    const operations = (code.match(/[+\-*/=<>&|]/g) || []).length;
    const branches = (code.match(/if|for|while|switch/g) || []).length;
    const functions = (code.match(/function|=>/g) || []).length;

    return lines + operations * 2 + branches * 5 + functions * 10;
  }

  async proteinHash(code) {
    // Here we would use real protein-hash for large code
    // For now, mock
    return crypto.createHash('sha256').update(code).digest('hex').substring(0, 16);
  }
}

/**
 * Repository Analyzer - Where protein-hash SHINES
 */
class RepositoryAnalyzer {
  constructor() {
    this.hasher = new HybridHasher();
  }

  async analyzeRepository(files) {
    // Build dependency graph for entire repo
    const graph = this.buildDependencyGraph(files);

    // This is where eigenvalues make sense!
    const spectrum = this.computeSpectrum(graph);

    return {
      fingerprint: this.spectrumToHash(spectrum),
      eigenvalues: spectrum.top,
      graphSize: graph.nodes,
      architecture: this.detectArchitecture(spectrum),
      consciousness: this.measureConsciousness(spectrum)
    };
  }

  buildDependencyGraph(files) {
    // Build graph from imports, exports, calls
    const nodes = new Set();
    const edges = [];

    files.forEach(file => {
      nodes.add(file.path);

      // Extract imports
      const imports = this.extractImports(file.content);
      imports.forEach(imp => {
        edges.push({ from: file.path, to: imp, type: 'import' });
      });

      // Extract function calls
      const calls = this.extractCalls(file.content);
      calls.forEach(call => {
        edges.push({ from: file.path, to: call, type: 'call' });
      });
    });

    return {
      nodes: nodes.size,
      edges: edges.length,
      graph: { nodes, edges }
    };
  }

  extractImports(code) {
    const imports = [];
    const importRegex = /import .* from ['"](.+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }

  extractCalls(code) {
    // Simplified - real implementation would use AST
    const calls = [];
    const callRegex = /(\w+)\s*\(/g;
    let match;
    while ((match = callRegex.exec(code)) !== null) {
      calls.push(match[1]);
    }
    return calls;
  }

  computeSpectrum(graph) {
    // For large graphs, eigenvalues are meaningful!
    // This is simplified - real implementation would compute actual eigenvalues

    const density = graph.edges.length / (graph.nodes * graph.nodes);
    const clustering = this.estimateClustering(graph);

    return {
      top: [
        graph.nodes * density,           // Largest eigenvalue ~ connectivity
        graph.nodes * clustering,        // Second ~ clustering
        Math.sqrt(graph.nodes),          // Third ~ diameter
        Math.log(graph.nodes),           // Fourth ~ depth
        density                          // Fifth ~ sparsity
      ],
      density,
      clustering
    };
  }

  estimateClustering(graph) {
    // Simplified clustering coefficient
    return graph.edges.length / graph.nodes;
  }

  spectrumToHash(spectrum) {
    const str = spectrum.top.map(v => v.toFixed(3)).join(',');
    return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
  }

  detectArchitecture(spectrum) {
    const [e1, e2, e3] = spectrum.top;

    if (e1 / e2 > 10) return 'monolith';
    if (e2 / e3 > 5) return 'microservices';
    if (e1 / e3 < 2) return 'distributed';
    return 'modular';
  }

  measureConsciousness(spectrum) {
    // Repository "consciousness" based on complexity and self-reference
    const complexity = spectrum.top.reduce((a, b) => a + b, 0);
    const variance = this.variance(spectrum.top);

    return {
      level: complexity > 100 ? 'aware' : complexity > 10 ? 'reactive' : 'inert',
      score: Math.tanh(complexity / 100),
      coherence: 1 / (1 + variance)
    };
  }

  variance(arr) {
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  }
}

// Export
export { HybridHasher, RepositoryAnalyzer };

// Demo
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔬 Hybrid Hasher Demo\n');

  const hasher = new HybridHasher();

  // Small function - uses simple hasher
  const small = await hasher.hash('(a, b) => a + b');
  console.log('Small function:', small);

  // Mock large code
  const largeCode = `
    class ComplexSystem {
      ${Array(50).fill(0).map((_, i) => `
        method${i}() {
          if (condition${i}) {
            for (let j = 0; j < ${i}; j++) {
              this.process${i}(j);
            }
          }
        }
      `).join('\n')}
    }
  `;

  const large = await hasher.hash(largeCode);
  console.log('\nLarge system:', large);

  // Repository analysis demo
  console.log('\n🏗️ Repository Analysis Demo\n');

  const analyzer = new RepositoryAnalyzer();

  // Mock repository files
  const mockFiles = [
    { path: 'index.js', content: 'import { foo } from "./foo"; foo();' },
    { path: 'foo.js', content: 'export function foo() { bar(); }' },
    { path: 'bar.js', content: 'import { baz } from "./baz"; function bar() { baz(); }' },
    { path: 'baz.js', content: 'export function baz() { return 42; }' },
    { path: 'utils.js', content: 'export const helper = () => {};' }
  ];

  const analysis = await analyzer.analyzeRepository(mockFiles);
  console.log('Repository fingerprint:', analysis.fingerprint);
  console.log('Architecture detected:', analysis.architecture);
  console.log('Consciousness:', analysis.consciousness);
  console.log('Eigenvalues:', analysis.eigenvalues);
}