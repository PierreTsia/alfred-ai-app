# Testing Strategy

## Important Update: Migration to Vitest + convex-test

After careful consideration and initial implementation attempts, we've decided to migrate our testing infrastructure to Vitest with `convex-test`. Here's why:

1. **Official Convex Support**
   - `convex-test` is the officially supported testing library for Convex
   - Provides a proper mock implementation of the Convex backend
   - Handles ESM modules natively, which is crucial for our Convex functions

2. **Key Benefits**
   - Built-in mocking for Convex's database, actions, and auth system
   - Better handling of ESM imports without configuration headaches
   - Edge runtime environment that closely matches Convex's production environment
   - Simplified test setup with `convexTest()` utility

3. **Migration Impact**
   - Requires updating test infrastructure
   - Will simplify our mocking strategy (removing manual mocks)
   - Better alignment with Convex's development practices

This decision replaces our previous plan to use Jest, as it would require significant workarounds for ESM compatibility and Convex-specific mocking.

## Core Services Testing Priority

Our testing strategy focuses on the foundation services that power our RAG implementation. These services must be rock-solid as they form the backbone of our application.

### 1. Document Processing Core 🎯

**Target Files:**
- `documents_internal.ts`: Core processing logic
- `documents.ts`: Public API layer

**Critical Test Cases:**
```typescript
// documents_internal.test.ts
describe('Document Processing', () => {
  describe('generateChunkEmbeddings()', () => {
    - Successfully processes chunks
    - Handles empty chunk lists
    - Handles API errors
    - Updates file status correctly
  });

  describe('searchDocuments()', () => {
    - Returns relevant results
    - Handles empty queries
    - Respects user scoping
    - Handles pagination
  });
});
```

### 2. AI/Embedding Services 🧠

**Target File:**
- `together_ai_embeddings.ts`

**Critical Test Cases:**
```typescript
// together_ai_embeddings.test.ts
describe('Embedding Generation', () => {
  - Generates correct vector dimensionality (768)
  - Handles API errors gracefully
  - Validates input length constraints
  - Implements retry logic
  - Maintains consistency across similar inputs
});
```

### 3. File Management 📁

**Target File:**
- `files.ts`

**Critical Test Cases:**
```typescript
// files.test.ts
describe('File Management', () => {
  describe('Lifecycle', () => {
    - Successful upload and storage
    - Proper cascade deletion
    - Status updates throughout processing
    - Error handling during upload/processing
  });

  describe('Security', () => {
    - User access controls
    - File ownership validation
  });
});
```

### 4. Schema Validation 📐

**Target File:**
- `schema.ts`

**Critical Test Cases:**
```typescript
// schema.test.ts
describe('Schema Validation', () => {
  - Required fields validation
  - Type checking for all fields
  - Foreign key constraints
  - Index validation
});
```

## Testing Approach

1. **Backend (Convex) Testing**
   - Use Vitest + `convex-test` for all Convex functions
   - Unit tests for business logic
   - Integration tests for service interactions
   - Coverage tracking and reporting

2. **Frontend Testing Strategy**
   - Minimize unit testing of UI components
   - Focus on E2E testing with Playwright for critical user flows:
     ```typescript
     // Example critical flows to test
     - Document upload and processing flow
     - Search and retrieval flow
     - User authentication flow
     - Document management operations
     ```
   - This approach gives us:
     - Real browser testing
     - Actual user flow validation
     - Cross-browser compatibility
     - Visual regression testing if needed
     - More confidence than component unit tests

3. **Why This Approach?**
   - Avoids the complexity of maintaining two test runners
   - Frontend is primarily UI-focused, better suited for E2E
   - Most business logic lives in Convex layer
   - E2E tests provide better confidence for user-facing features

## Testing Principles

1. **Focus Areas**
   - Core business logic that can't fail
   - Edge cases and error handling
   - Data integrity and validation
   - Integration points between services

2. **Test Types**
   - Unit tests for isolated functions
   - Integration tests for service interactions
   - E2E tests for critical user flows
   - Schema validation tests

3. **Coverage Goals**
   - 100% coverage for core document processing
   - 100% coverage for embedding generation
   - 90%+ coverage for file management
   - 90%+ coverage for schema validation

## Implementation Plan

### Phase 1: Foundation
1. Set up Vitest with `convex-test`
   - Install required dependencies (`convex-test`, `vitest`, `@edge-runtime/vm`)
   - Configure Vitest for edge-runtime environment
   - Set up proper ESM module handling
2. Create test helpers using `convexTest()` utility
3. Implement basic test suite structure

### Phase 2: Core Services
1. Document processing tests using `convex-test` mocking
2. Embedding service tests with Together AI mocking
3. File management tests with storage mocking

### Phase 3: Integration
1. Cross-service integration tests using `convex-test`
2. End-to-end flow validation
3. Performance testing setup

## Best Practices

1. **Test Organization**
   - Group tests by feature/function
   - Clear, descriptive test names
   - Proper setup and teardown using `convexTest()`
   - Reuse test context with `t.withIdentity()` for auth testing

2. **Mocking Strategy**
   - Use `convex-test` for database and system mocking
   - Mock external services (Together AI) using Vitest's mocking utilities
   - Use consistent mock data
   - Leverage `t.run()` for direct database manipulation in tests

3. **CI Integration**
   - Run tests on every PR using Vitest
   - Use Vitest's coverage reporting
   - Block merges on test failures
   - Track coverage trends
   - Execute via npm/pnpm scripts:
     ```json
     {
       "scripts": {
         "test": "vitest",
         "test:ci": "vitest run --coverage",
         "test:watch": "vitest watch"
       }
     }
     ```
   - CI should use `pnpm test:ci` for one-off test execution with coverage
   - Local development can use `pnpm test:watch` for development

## Next Steps

1. [x] Set up Vitest with edge-runtime environment
   - ✅ Install required dependencies
   - ✅ Configure vitest.config.mts
   - ✅ Set up proper ESM handling
   - ✅ Update package.json scripts

2. [x] Install and configure `convex-test`
   - ✅ Add convex-test library
   - ✅ Set up test environment
   - ✅ Configure test helpers
   - ✅ Verify script execution locally

3. [ ] Migrate and validate existing tests
   - [x] Port PDF processor tests to Vitest syntax
   - [-] Fix skipped embeddings test (currently skipped)
   - [ ] Port remaining test files to Vitest syntax
   - [ ] Update mocking strategy to use convex-test
   - [ ] Ensure all existing tests pass
   - [ ] Document any breaking changes or gotchas
   - [x] Verify CI script execution

4. [x] Configure CI pipeline with Vitest coverage reporting
   - ✅ Set up GitHub Actions for Vitest
   - ✅ Add coverage dependency installation
   - ✅ Add coverage reporting to PR process
   - ✅ Use `pnpm test:ci` command
   - ✅ Set up coverage artifacts

5. [ ] Create first test suite for document processing using `convexTest()`
   - [ ] Implement core document processing tests
   - [ ] Set up proper mocking with convex-test
   - [ ] Validate against existing functionality
   - [ ] Run through CI pipeline to verify

6. [ ] Set up Together AI mocking with Vitest
   - [ ] Implement mock factory for Together AI
   - [ ] Add test helpers for AI-related testing
   - [ ] Document mocking patterns
   - [ ] Verify in CI environment

7. [ ] Set up Playwright for E2E testing
   - [ ] Install Playwright
   - [ ] Configure for Next.js environment
   - [ ] Set up first critical user flow test
   - [ ] Add to CI pipeline
   - [ ] Configure test recording for debugging

8. [ ] Environment-specific Testing Improvements
   - [x] Document environment setup (node vs edge-runtime)
   - [ ] Create environment-specific test helpers
   - [ ] Add environment validation in CI
   - [ ] Update documentation with environment guidelines

9. [ ] Test Coverage Strategy
   - [ ] Define coverage targets per environment
   - [x] Set up coverage reporting in CI
   - [ ] Create coverage improvement plan
   - [ ] Document coverage expectations