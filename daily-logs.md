## Latest Updates

### Vector Search Implementation (January 29, 2025 - Night)

🎉 Major discovery and planning:
- Found Convex's built-in vector search capabilities
- Created detailed implementation plan: [Vector Search Plan](docs/vector-search.md)
- Key architectural decisions:
  - Two-step approach required (Action + Query)
  - Vector search operations only available in Actions
  - Document fetching will be reactive via Query
  - Caching strategy needed for common searches

Next Steps:
1. Update schema with vector index (768 dimensions)
2. Implement search action with Together AI
3. Create document fetching query
4. Add caching layer
5. Build UI components

### Document Processing Pipeline Overhaul (January 29, 2025 - Evening)

🎉 Major improvements to the document processing pipeline:

1. Fixed Embedding Generation
   - [x] Resolved `setTimeout` issues by moving to proper Convex action
   - [x] Implemented proper batch processing for all chunks
   - [x] Added robust error handling for Together AI calls
   - [x] Improved status tracking (processing → processed)

2. Resource Management
   - [x] Implemented cascade delete for documents
   - [x] Proper cleanup of:
     - Document records
     - Associated chunks
     - Generated embeddings
     - Storage files
   - [x] Added proper TypeScript types throughout

3. Architecture Improvements
   - [x] Separated concerns between storage, chunks, and embeddings
   - [x] Proper async handling with `ctx.scheduler`
   - [x] Added internal mutations for better code organization
   - [x] Improved error boundaries and recovery
   - [x] Centralized PDF.js version management in config

4. Technical Solutions
   - PDF.js Version Management:
     - Kept version lock at 3.4.120 for stability
     - Moved all version references to central config
     - Single source of truth for worker URL
     - Easier future version updates

### Next Steps & Priorities

1. UI/UX Improvements (Backlog)
   - [ ] PDF Viewer Redesign:
     - Show PDF snapshot/thumbnail in main grid
     - Full viewer in modal/dedicated view
     - Keep processing UI simple for now (current vertical layout)
   - [ ] Add progress UI feedback during processing
   - [ ] Set up proper error states in UI

2. Embedding Pipeline
   - [ ] Implement retry mechanism for failed chunks
   - [ ] Add monitoring for embedding quality
   - [ ] Consider caching strategy for frequent searches
   - [ ] Implement similarity search endpoint

3. Testing & Validation
   - [ ] Test with various PDF sizes
   - [ ] Add performance benchmarks
   - [ ] Add error case coverage
   - [ ] Document the complete flow

4. Technical Debt
   - [ ] Improve auth flow: migrate to Clerk-Convex integrated auth
   - [ ] Make PDF.js version management more robust:
     - Consider separating viewing and parsing concerns
     - Evaluate specialized parsing libraries
     - Keep PDF.js for viewing only
   - [ ] Add proper JSDoc documentation
   - [ ] Consider chunking strategy optimization

### PDF.js Resolution (January 28, 2025 - Evening)

🎉 Successfully resolved PDF.js fragility:
- Decided against pdf-parse migration
- Kept PDF.js but improved implementation
- Strategy from pdf-js.md remains valid for future optimizations
- Technical debt reduced significantly

### Next Session Priority Tasks 

🎯 Focus Areas:
1. Complete Embeddings Pipeline
   - [x] Fix batch processing in `generateEmbeddings` (currently only processes first chunk)
   - [ ] Add proper error handling and retries for Together AI calls
   - [ ] Implement progress tracking for embedding generation
   - [ ] Add UI feedback during processing

2. Document Processing Flow
   - [ ] Connect PDF viewer to document processing
   - [ ] Implement proper chunking with metadata (page numbers)
   - [ ] Add validation for processed chunks
   - [ ] Set up proper error states in UI

3. Testing & Validation
   - [ ] Test with various PDF sizes
   - [ ] Validate embedding quality
   - [ ] Add proper error logging
   - [ ] Document the complete flow

Expected Outcome: Complete end-to-end flow from PDF upload to searchable embeddings.

### Code Review Tasks (January 29, 2025)

1. Type Safety:
   - [x] Replace `any` types with proper interfaces
   - [x] Add type guards for PDF data structure
   - [ ] Consider zod schema for validation
   - [x] Document type structure

2. Error Handling:
   - [x] Add specific error types for different failure modes
   - [x] Improve error messages for debugging
   - [x] Consider retry mechanism for transient failures
   - [ ] Add logging strategy

3. Performance & Memory:
   - [x] Evaluate memory usage for large PDFs
   - [x] Consider streaming for large files
   - [ ] Add performance benchmarks
   - [ ] Compare with previous implementation

4. Code Structure:
   - [x] Extract PDF parsing logic to separate module
   - [x] Add configuration options (chunk size, etc.)
   - [ ] Consider builder pattern for flexibility
   - [ ] Add proper JSDoc documentation

5. Testing:
   - [x] Add unit tests for utilities
   - [ ] Add error case coverage
   - [x] Test with real-world PDF samples
   - [ ] Add performance tests

### Migration Success (January 29, 2025)

- Initial pdf2json implementation:
  - Basic PDF parsing with page tracking
  - Text decoding for special characters
  - Maintained consistent chunking interface
  - Tests passing with new implementation
- Status: ⚠️ Needs Review
  - Code structure needs refinement
  - Type safety improvements needed
  - Error handling could be enhanced
  - Performance implications unknown

### Technical Decision (January 29, 2025)

- Issue: pdf-parse throwing "bad XRef entry" errors even on simple PDFs
- Options Considered:
  1. Switch to pdf2json (more complex but battle-tested)
  2. Try patching pdf-parse with documented fix
  3. Revert to PDF.js
- Decision: Try Option 2 first (time-boxed to 10 mins), fallback to pdf2json if unsuccessful
- Rationale:
  - Simple documented fix available
  - Maintains current implementation if successful
  - Clear fallback plan with pdf2json
  - Pragmatic approach for non-core functionality

### Implementation Update (January 29, 2025)

- Attempted pdf-parse patch:
  - Applied isDebugMode fix from Stack Overflow
  - Still encountering XRef errors on simple PDFs
  - Additional "Invalid number" errors appeared
- Next Steps:
  - Removed pdf-parse and patch-package dependencies
  - Proceeding with pdf2json implementation
  - Will maintain same interface for minimal impact on existing code

### Today's Accomplishments (January 28, 2025)

1. Implemented complete PDF processing pipeline:
   - Text extraction with PDF.js
   - Chunking with metadata (page numbers, positions)
   - Storage in Convex
   - Embedding generation with Together.ai

2. Technical Decisions & Learnings:
   - PDF.js version locked to 3.4.120 for stability
   - Together.ai model: m2-bert-80M-8k-retrieval
   - Vector size: 768 dimensions
   - Average vector magnitude: ~4.1
   - Optimal similarity threshold: 4.0
   - Convex actions for long-running tasks

3. Known Fragilities:
   - PDF.js version sensitivity
   - Together.ai API key management between environments
   - Processing timeouts for large PDFs

## Next Steps & Future Plans

### Phase 3.2: RAG Implementation

1. [ ] Process remaining chunks in batches
2. [ ] Add progress tracking for embedding generation
3. [ ] Implement similarity search endpoint
4. [ ] Create search UI component
5. [ ] Add error recovery for failed embeddings

### Technical Debt

- [ ] Cascade deletes for documents, chunks, and embeddings
- [ ] improve auth flow: migrate from explicit userId passing to Clerk-Convex integrated auth
  - Replace manual userId passing with ctx.auth.getUserIdentity()
  - Test integration in non-critical feature first
  - Update all affected mutations and queries
- [ ] Make PDF.js version management more robust
- [ ] Add retry mechanism for Together.ai API calls
- [ ] Implement proper error handling for timeouts
- [ ] Add monitoring for embedding quality
- [ ] Consider chunking strategy optimization

### Future Optimizations

1. [ ] Batch processing for large PDFs
2. [ ] Caching strategy for frequent searches
3. [ ] Parallel processing of chunks
4. [ ] Evaluate alternative embedding models
5. [ ] Add support for more document types

## Technical Debt & Improvements

- Implement cascading deletes: When a document is deleted, ensure all related chunks and embeddings are also deleted from their respective tables

### Code Review Tasks (January 29, 2025)

1. Review Core Processing:

   - [ ] Chunk processing strategy in documents.ts
   - [ ] Error boundaries in PDFPreview.tsx
   - [ ] Vector search indexing strategy
   - [ ] Memory usage optimization for large PDFs

2. Error Handling & Resilience:

   - [ ] Implement local worker file fallback
   - [ ] Add error classification system
   - [ ] Review error recovery strategies
   - [ ] Add system-wide error boundaries

3. Monitoring & Performance:

   - [ ] Define monitoring strategy
   - [ ] Add performance tracking
   - [ ] Implement caching strategy
   - [ ] Add observability metrics

4. Testing Strategy:
   - [ ] Unit tests for core functions
   - [ ] Integration tests for PDF processing
   - [ ] E2E tests for critical paths
   - [ ] Performance benchmarks
