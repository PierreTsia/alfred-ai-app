## PDF.js Migration Plan (January 28, 2025)

### Phase 1: Text Processing Migration

1. [x] Add pdf-parse dependency
2. [x] Create new text extraction service
   - [x] Implement clean interface
   - [x] Add proper error handling
   - [x] Include progress tracking
3. [ ] Migrate processor.ts incrementally
   - [x] Basic text extraction working
   - [x] Page tracking implemented
   - [ ] Fix PDF format compatibility issues
   - [ ] Add fallback mechanism during transition
4. [ ] Update RAG pipeline to use new extractor
5. [ ] Remove PDF.js from text processing

### Implementation Progress

1. Test Infrastructure Setup:

   - [x] Chose Jest over Vitest for better Node.js/Buffer support
   - [x] Added Jest + TypeScript testing infrastructure
   - [x] Created test structure with extensible patterns
   - [✓] ~Added PDF fixture generation with PDFKit~ Decided to use real PDF samples instead
   - [x] Implemented basic test suite:
     - Structure validation
     - Content verification
     - Page number handling
     - Position tracking

2. PDF Processing Implementation:

   - [x] Basic PDF text extraction
   - [x] Page number preservation
   - [x] Chunk position tracking
   - [x] Consistent interface with old processor
   - [✓] ~Fix PDF format compatibility~ Skipped PDFKit issues, using real samples
   - [ ] Add real PDF samples for testing

3. Next Steps:
   - [x] ~Fix PDF format issues~ SKIPPED: Decided to use real PDFs instead
     - PDFKit generation incompatible with pdf-parse
     - Not worth investigating for test fixtures
   - [ ] Add real PDF samples for testing:
     - Single page PDF
     - Multi-page document
     - PDF with images
     - Large document (50+ pages)
   - [ ] Start gradual migration of production code
   - [ ] Performance benchmarking vs old implementation

### Expected Benefits

- Simplified text extraction pipeline
- No more worker/version management headaches
- Better suited for RAG processing
- Reduced infrastructure dependencies

### Risks & Mitigations

- Text extraction differences: Need thorough testing
- Performance impact: Benchmark before full migration
- Transition period: Maintain fallback capability

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

### Code Review Tasks (January 29, 2025)

1. Type Safety:

   - [ ] Replace `any` types with proper interfaces
   - [ ] Add type guards for PDF data structure
   - [ ] Consider zod schema for validation
   - [ ] Document type structure

2. Error Handling:

   - [ ] Add specific error types for different failure modes
   - [ ] Improve error messages for debugging
   - [ ] Consider retry mechanism for transient failures
   - [ ] Add logging strategy

3. Performance & Memory:

   - [ ] Evaluate memory usage for large PDFs
   - [ ] Consider streaming for large files
   - [ ] Add performance benchmarks
   - [ ] Compare with previous implementation

4. Code Structure:

   - [ ] Extract PDF parsing logic to separate module
   - [ ] Add configuration options (chunk size, etc.)
   - [ ] Consider builder pattern for flexibility
   - [ ] Add proper JSDoc documentation

5. Testing:
   - [ ] Add unit tests for utilities
   - [ ] Add error case coverage
   - [ ] Test with real-world PDF samples
   - [ ] Add performance tests

## Today's Accomplishments (January 28, 2025)

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

## Next Steps

### Phase 3.2: RAG Implementation

1. [ ] Process remaining chunks in batches
2. [ ] Add progress tracking for embedding generation
3. [ ] Implement similarity search endpoint
4. [ ] Create search UI component
5. [ ] Add error recovery for failed embeddings

### Technical Debt

- [ ] Cascade deletes for documents, chunks, and embeddings
- [ ] improve auth flow: migrate from explicit userId passing to Clerk-Convex integrated auth - Replace manual userId passing with ctx.auth.getUserIdentity() - Test integration in non-critical feature first - Update all affected mutations and queries - [ ] Make PDF.js version management more robust
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
