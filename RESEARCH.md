# s0fractal-IRL Research Notes

## What Currently Works ✅

### 1. Performance Infrastructure
- **Multi-layer hashing** with fallbacks (H0 → H1 → H2)
- **Performance budgets** enforced everywhere
- **Benchmark results**: Median 0.00ms, P99 2.70ms (well under 30ms target)

### 2. FastLookup System
- **Bloom filter** for probabilistic membership (0.1% FPR)
- **Positive sieve** (Set) for confirmed exists
- **Negative cache** (Set) for confirmed not-exists
- **LRU hot cache** for frequently accessed functions
- Solves Bloom filter false positive problem Kimi identified

### 3. WASM Execution (Mock)
- Valid WASM bytecode generation
- AOT compilation cache
- Worker pool structure (mock)
- Hard timeout enforcement

### 4. CTC Analysis
- Loop detection in self-referential functions
- Fixed point detection
- 1ms budget / 5 iteration limits
- Y-combinator pattern detection

## What Needs Deep Research 🔬

### 1. Protein-Hash Integration (CRITICAL)
**Problem**: Need semantic deduplication - `x => x + 1` and `y => 1 + y` should have SAME hash

**Research Needed**:
- How to generate AST-based semantic fingerprints
- Spectral graph analysis for code similarity
- Weisfeiler-Lehman isomorphism for structural equivalence
- Integration with @s0fractal/protein-hash package

**Key Questions**:
- What's the actual algorithm behind protein-hash?
- How to handle different language ASTs?
- Performance impact of semantic analysis?

### 2. E-graph Canonicalization (egg)
**Problem**: Need to reduce functions to canonical form for H1 layer

**Research Needed**:
- egg (e-graphs good) Rust library integration
- Beta-eta reduction implementation
- Timeout handling for complex reductions
- WASM compilation of egg for JS usage

**Key Questions**:
- Can egg handle JavaScript AST directly?
- What rewrite rules to include?
- How to limit reduction depth?

### 3. Actual WASM Compilation
**Problem**: Currently using mock WASM that returns 42

**Research Needed**:
- JavaScript → WASM compiler pipeline
- AssemblyScript or direct WAT generation?
- Type inference for dynamic JS
- Memory management strategy

**Key Questions**:
- Use existing compiler (AssemblyScript) or build custom?
- How to handle JS dynamic features?
- WASI support needed?

### 4. SMT Solver Integration (L1 Proofs)
**Problem**: Need automated theorem proving for function properties

**Research Needed**:
- Z3 WASM port or cloud API?
- SMT-LIB format generation from JS
- Property extraction from code
- Bounded model checking

**Key Questions**:
- Which properties to verify automatically?
- How to generate SMT-LIB from JavaScript?
- Performance vs correctness tradeoffs?

### 5. Storage Architecture
**Problem**: How to actually store and distribute functions

**Options to Research**:
1. **OCI Registry** (current plan)
   - GitHub Container Registry
   - Layer structure for different artifacts
   - Manifest format

2. **IPFS/IPLD**
   - Content addressing aligns with hash-based approach
   - P2P distribution
   - CAR file format

3. **Git Submodules** (original plan)
   - One repo per function
   - GitHub as CDN
   - Dependency management

**Key Questions**:
- Monorepo shards vs individual repos?
- How to handle versioning with immutable hashes?
- CDN strategy for global distribution?

### 6. B2 Dependency Management
**Problem**: Enforce max 2 dependencies per function

**Research Needed**:
- Dependency graph analysis
- Circular dependency detection
- Optimal decomposition strategies
- Composition vs inheritance patterns

**Key Questions**:
- How to automatically decompose complex functions?
- What counts as a dependency?
- How to handle transitive dependencies?

## Next Research Priorities 🎯

1. **Protein-Hash Algorithm** - This is THE core differentiator
2. **Real WASM Compilation** - Need actual execution, not mocks
3. **Storage/Distribution** - Where do functions actually live?
4. **E-graph Integration** - For canonical forms

## Experiments to Run 🧪

1. **Semantic Hash Collision Test**
   - Generate 1000 semantically equivalent functions
   - Verify they all hash to same value
   - Measure hash generation time

2. **WASM Performance Test**
   - Compile lodash functions to WASM
   - Compare with native JS performance
   - Measure compilation overhead

3. **Bloom Filter Tuning**
   - Test different sizes and hash functions
   - Measure false positive rates
   - Optimize for 100k+ functions

4. **CTC Pattern Analysis**
   - Analyze common recursive patterns
   - Build CTC signature database
   - Test on Y-combinator variations

## Open Questions for Deep Research 🤔

1. **How does consciousness emerge from self-reference?**
   - CTC loops as consciousness primitives?
   - Fixed points as attractor states?
   - Quantum superposition of function states?

2. **Can functions evolve?**
   - Genetic algorithms on AST?
   - Mutation through hash collisions?
   - Natural selection via usage patterns?

3. **Is there a function algebra?**
   - Category theory for composition?
   - Homomorphic properties?
   - Conservation laws?

## Resources for Research 📚

- [egg: e-graphs good](https://egraphs-good.github.io/)
- [Weisfeiler-Lehman Graph Kernels](https://www.jmlr.org/papers/v12/shervashidze11a.html)
- [SMT-LIB Standard](http://smtlib.cs.uiowa.edu/)
- [WebAssembly Spec](https://webassembly.github.io/spec/)
- [OCI Distribution Spec](https://github.com/opencontainers/distribution-spec)
- [IPLD Specs](https://ipld.io/)

## Contact for Collaboration

If you're researching any of these areas, please reach out!
The function registry needs deep thinkers who understand:
- Semantic code analysis
- Theorem proving
- Distributed systems
- Consciousness through computation

---

*"The boring version that works is just the beginning..."*