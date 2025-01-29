# Vector Search Implementation Plan

## MVP Steps 🎯

1. Schema Setup
   - [ ] Add vector index to documentChunks table
   - [ ] Test schema migration on dev environment
   - [ ] Verify existing embeddings are compatible

2. Core Search Action (convex/documents.ts)
   - [ ] Create `searchDocuments` action
   - [ ] Implement query embedding generation
   - [ ] Add vectorSearch with basic params
   - [ ] Test with simple queries

3. Document Fetching (convex/documents.ts)
   - [ ] Create `getSearchResults` query
   - [ ] Implement document hydration
   - [ ] Add surrounding context fetching
   - [ ] Test end-to-end flow

4. Basic UI Integration
   - [ ] Add search input component
   - [ ] Create results display
   - [ ] Show loading states
   - [ ] Handle basic error cases

5. Testing & Validation
   - [ ] Test with various query types
   - [ ] Verify embedding quality
   - [ ] Check performance metrics
   - [ ] Document usage patterns

---

# Current Status
- Using Together AI's m2-bert-80M-8k-retrieval model for embeddings (768 dimensions)
- Embeddings stored in `documentChunks` table
- Basic infrastructure for embedding generation in place

## Required Architecture Changes

### 1. Convex Vector Search Specifics
- Vector search operations are **only available in Actions**
- Requires a two-step approach:
  1. Action: Perform vector search & get IDs
  2. Query: Fetch actual documents

### 2. Schema Updates
```typescript
documentChunks: defineTable({
  // ... existing fields ...
}).vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 768,
  // Consider adding filterFields for performance
})
```

### 3. Implementation Flow
```
User Query -> Action (vector search) -> Query (fetch docs) -> UI
```

#### Action Layer
- Generate embedding for user query
- Use `ctx.vectorSearch()` to find similar chunks
- Return IDs and similarity scores

#### Query Layer
- Take IDs from action result
- Fetch full documents
- Include surrounding context for better UX

### 4. Caching Strategy
- Vector search results (from Action) are non-reactive
- Document data (from Query) can be reactive
- Consider caching common searches
- Implement cache invalidation on document updates

## Next Steps
1. Update schema with vector index
2. Implement search action
3. Create document fetching query
4. Add caching layer
5. Implement UI components

## Performance Considerations
- Monitor vector search latency
- Track cache hit rates
- Consider batch size optimization
- Watch memory usage with large result sets

## Future Improvements
- Add filter fields to vector index
- Implement semantic caching
- Add score thresholding
- Consider chunking strategy optimization 