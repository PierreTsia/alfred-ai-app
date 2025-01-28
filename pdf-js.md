# PDF.js Integration Documentation

_Last updated: January 28, 2025_

## Current Setup

### Dependencies

```json
{
  "dependencies": {
    "@react-pdf-viewer/core": "^3.12.0",
    "@react-pdf-viewer/default-layout": "^3.12.0",
    "pdfjs-dist": "^3.4.120"
  }
}
```

### Implementation Details

PDF.js is currently used for two main purposes:

1. Text extraction (processing pipeline)
2. Visual rendering (preview component)

### Current Architecture

#### Worker Configuration

- Currently using CDN-hosted worker:
  ```javascript
  workerUrl = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";
  ```
- Version hardcoded in multiple locations:
  - `lib/pdf/processor.ts`
  - `features/files/components/PDFPreview.tsx`

## Known Issues

### 1. Version Management Fragility

- Version number (3.4.120) is hardcoded in multiple places
- Manual version checking that only warns:
  ```typescript
  if (pdfjs.version !== "3.4.120") {
    console.warn(
      `PDF.js version mismatch. Expected: 3.4.120, Found: ${pdfjs.version}`,
    );
  }
  ```

### 2. Infrastructure Risks

- CDN dependency for critical functionality
- No graceful fallback if CDN fails
- Potential version conflicts between package and worker

## Strategic Decision

After analyzing the current implementation and project requirements, we're adopting a pragmatic split approach:

### Phase 1: Separate Text Processing (Priority)

- Keep PDF.js viewer temporarily (it works fine for now)
- Migrate text extraction to `pdf-parse`:
  - Simpler API
  - No worker/version management needed
  - Node.js native
  - Better suited for RAG pipeline

### Phase 2: Viewer Migration (Optional)

- Only if/when viewer issues arise
- Potential migration to `react-pdf`
- No immediate action needed

### Rationale

- Maintains development velocity
- Reduces complexity where it matters most (text processing)
- Avoids unnecessary refactoring
- Keeps the project fun and agile

## Implementation Plan

### Phase 1 Tasks

1. [ ] Add pdf-parse dependency
2. [ ] Create new text extraction service
3. [ ] Migrate processor.ts to new solution
4. [ ] Update RAG pipeline to use new extractor
5. [ ] Remove PDF.js from text processing

### Phase 2 Tasks (Future/Optional)

1. [ ] Evaluate react-pdf if viewer issues arise
2. [ ] Plan viewer migration if needed

## Resources & References

1. [PDF.js Official Documentation](https://mozilla.github.io/pdf.js/)
2. [PDF.js NPM Package](https://www.npmjs.com/package/pdfjs-dist)
3. [React PDF Viewer Documentation](https://react-pdf-viewer.dev/)
4. [pdf-parse Documentation](https://www.npmjs.com/package/pdf-parse)

## Migration Notes

- Keep viewer functionality untouched during Phase 1
- Text extraction migration can be done incrementally
- No need to remove PDF.js entirely until Phase 2 (if ever)
- Focus on improving the critical path first (RAG pipeline)
