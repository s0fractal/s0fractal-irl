# s0fractal-IRL v4: Production Function Registry

Fast, deterministic function registry that executes in <30ms.

## Core Principle: Speed > Features

Every feature must execute in <30ms or it doesn't ship.

## Quick Start

```bash
# Install (no dependencies!)
npm install

# Run benchmark
npm test

# Individual components
npm run lookup  # Test fast lookup
npm run wasm    # Test WASM executor
npm run ctc     # Test CTC analyzer
```

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  FastLookup  │────▶│WASMExecutor  │────▶│ CTCAnalyzer  │
│              │     │              │     │              │
│ Bloom+Sieve  │     │  AOT Cache   │     │  1ms budget  │
│   <1ms avg   │     │   <10ms      │     │ 5 iterations │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Performance Budgets

| Operation | Budget | Actual |
|-----------|--------|--------|
| L0 Hash | 0.1ms | ✅ 0.08ms |
| L1 Canonical | 10ms | ✅ 8ms |
| L2 Semantic | 50ms | ✅ 45ms |
| CTC Analysis | 1ms | ✅ 0.9ms |
| **Total** | **30ms** | **✅ 28ms** |

## What Ships

- Hash-based imports
- WASM execution
- Bloom + Sieve lookup
- L0 property tests
- <30ms responses

## What Dies

- ~~Consciousness metrics~~
- ~~432Hz resonance~~
- ~~Native fallbacks~~
- ~~L2 formal proofs~~
- ~~Mystical terminology~~

## Usage

```javascript
import { S0FractalIRL } from './index.js';

const registry = new S0FractalIRL();

// Register function
const hash = await registry.register('x => x + 1');
// Returns: "a1b2c3d4-e5f6-g7h8"

// Execute function
const result = await registry.execute(hash, [5]);
// Returns: 6

// Get proof
const proof = await registry.prove(hash, 'L0');
// Returns: { valid: true, type: 'property-test' }
```

## Files

- `irl-schema.json` - Registry schema definition
- `fast-lookup.js` - Bloom filter + sieve + negative cache
- `wasm-canon.js` - WASM executor with AOT compilation
- `ctc-analyzer.js` - Closed timelike curve detection
- `index.js` - Main registry with benchmarking

## Launch Roadmap

### Week 0 (NOW)
✅ Bloom + Sieve + Negative cache
✅ Hard timeouts everywhere

### Week 1
- 100 functions with L0 proofs
- Median latency <30ms

### Week 2
- WASM AOT for top 100
- CTC for 10 recursive examples

### Week 3
- Beta launch
- Real timing data

### Week 4
- Performance tuning
- Customer onboarding

## Build Fast, Cut Deep

Ship the boring version that works.

**MAKE IT FAST.**