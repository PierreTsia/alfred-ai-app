import { v } from "convex/values";
import {
  mutation,
  action,
  internalQuery,
  internalMutation,
  internalAction,
  ActionCtx,
  DatabaseReader,
  DatabaseWriter,
  query,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { generateEmbeddings } from "./together_ai_embeddings";
import { internal } from "./_generated/api";
import { Together } from "together-ai";

interface DocumentChunk {
  _id: Id<"documentChunks">;
  content: string;
  metadata: {
    page: number;
    position: number;
  };
  fileId: Id<"files">;
  userId: string;
  embedding?: number[];
  processedAt?: number;
}

interface SearchResult {
  _id: Id<"documentChunks">;
  _score: number;
}

export const storeDocumentChunks = internalMutation({
  args: {
    fileId: v.id("files"),
    chunks: v.array(
      v.object({
        text: v.string(),
        metadata: v.object({
          page: v.number(),
          position: v.number(),
        }),
      }),
    ),
  },
  async handler(ctx, args) {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error(`File not found: ${args.fileId}`);
    }

    const chunkIds = await Promise.all(
      args.chunks.map((chunk) =>
        ctx.db.insert("documentChunks", {
          fileId: args.fileId,
          content: chunk.text,
          metadata: chunk.metadata,
          userId: file.userId,
        }),
      ),
    );

    await ctx.db.patch(args.fileId, {
      status: "processing",
      chunkIds,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.documents.generateChunkEmbeddings,
      {
        fileId: args.fileId,
      },
    );

    return chunkIds;
  },
});

export const generateChunkEmbeddings = internalAction({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx: ActionCtx, args): Promise<{ processed: number }> {
    const chunks: DocumentChunk[] = await ctx.runQuery(
      internal.documents.getUnprocessedChunks,
      {
        fileId: args.fileId,
      },
    );

    if (chunks.length === 0) {
      await ctx.runMutation(internal.documents.updateFileStatus, {
        fileId: args.fileId,
        status: "processed",
      });
      return { processed: 0 };
    }

    let processedCount = 0;
    for (const chunk of chunks) {
      try {
        const client = new Together({ apiKey: process.env.TOGETHER_API_KEY! });
        const embedding = await client.embeddings.create({
          model: "togethercomputer/m2-bert-80M-8k-retrieval",
          input: chunk.content,
        });

        await ctx.runMutation(internal.documents.updateChunkEmbeddings, {
          chunkId: chunk._id,
          embedding: embedding.data[0].embedding,
        });
        processedCount++;
      } catch (error) {
        console.error(`Error processing chunk ${chunk._id}:`, error);
      }
    }

    if (processedCount === chunks.length) {
      await ctx.runMutation(internal.documents.updateFileStatus, {
        fileId: args.fileId,
        status: "processed",
      });
    }

    return { processed: processedCount };
  },
});

export const updateFileStatus = internalMutation({
  args: {
    fileId: v.id("files"),
    status: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.fileId, {
      status: args.status,
    });
  },
});

export const processChunkEmbeddings = action({
  args: {
    fileId: v.id("files"),
  },
  handler: async (
    ctx: ActionCtx,
    args,
  ): Promise<{ processed: number; debug: string[] }> => {
    const debug: string[] = [];
    debug.push(`Starting processChunkEmbeddings for fileId: ${args.fileId}`);

    const chunks = await ctx.runQuery(internal.documents.getUnprocessedChunks, {
      fileId: args.fileId,
    });
    debug.push(`Found ${chunks.length} unprocessed chunks`);

    if (chunks.length === 0) {
      return { processed: 0, debug };
    }

    const chunk = chunks[0];
    debug.push(
      `Processing chunk ${chunk._id} (content length: ${chunk.content.length})`,
    );

    try {
      // Get the chunk content
      const chunkData = await ctx.runQuery(internal.documents.getChunk, {
        id: chunk._id,
      });
      if (!chunkData) {
        throw new Error("Chunk not found");
      }

      // Generate embedding using the content
      const client = new Together({ apiKey: process.env.TOGETHER_API_KEY! });
      const embedding = await client.embeddings.create({
        model: "togethercomputer/m2-bert-80M-8k-retrieval",
        input: chunkData.content,
      });

      // Store the embedding
      await ctx.runMutation(internal.documents.updateChunkEmbeddings, {
        chunkId: chunk._id,
        embedding: embedding.data[0].embedding,
      });
      debug.push(`Generated embeddings`);

      return { processed: 1, debug };
    } catch (error) {
      debug.push(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  },
});

export const getUnprocessedChunks = internalQuery({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args): Promise<DocumentChunk[]> => {
    return await ctx.db
      .query("documentChunks")
      .filter((q) =>
        q.and(
          q.eq(q.field("fileId"), args.fileId),
          q.eq(q.field("processedAt"), undefined),
        ),
      )
      .collect();
  },
});

// Helper mutation to update chunk embeddings
export const updateChunkEmbeddings = internalMutation({
  args: {
    chunkId: v.id("documentChunks"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chunkId, {
      embedding: args.embedding,
      processedAt: Date.now(),
    });
  },
});

export const getChunk = internalQuery({
  args: { id: v.id("documentChunks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateChunk = internalMutation({
  args: {
    id: v.id("documentChunks"),
    update: v.object({
      embedding: v.optional(v.array(v.float64())),
      processedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.update);
  },
});

export const searchDocuments = internalAction({
  args: {
    query: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    // Generate embedding for the search query
    const client = new Together({ apiKey: process.env.TOGETHER_AI_KEY! });
    const embedding = await client.embeddings.create({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: args.query,
    });

    // Perform vector search
    const results = await ctx.vectorSearch("documentChunks", "by_embedding", {
      vector: embedding.data[0].embedding,
      limit: args.limit ?? 5,
      filter: (q) => q.eq("userId", args.userId),
    });

    return results;
  },
});

export const getSearchResults = internalQuery({
  args: {
    chunkIds: v.array(v.id("documentChunks")),
    scores: v.optional(v.array(v.number())),
    includeContext: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const chunks = await Promise.all(args.chunkIds.map((id) => ctx.db.get(id)));

    // Get file info for each chunk
    const fileIds = chunks
      .map((chunk) => chunk?.fileId)
      .filter((id): id is Id<"files"> => id !== undefined);

    const files = await Promise.all(fileIds.map((id) => ctx.db.get(id)));
    const fileMap = new Map(
      files
        .filter((file): file is NonNullable<typeof file> => file !== null)
        .map((file) => [file._id, file]),
    );

    // If includeContext is true, fetch surrounding chunks
    let contextChunks: DocumentChunk[] = [];
    if (args.includeContext) {
      const contextPromises = chunks.map(async (chunk) => {
        if (!chunk) return [];
        return ctx.db
          .query("documentChunks")
          .filter((q) =>
            q.and(
              q.eq(q.field("fileId"), chunk.fileId),
              q.gte(q.field("metadata.page"), chunk.metadata.page - 1),
              q.lte(q.field("metadata.page"), chunk.metadata.page + 1),
            ),
          )
          .collect();
      });
      contextChunks = (await Promise.all(contextPromises)).flat();
    }

    // Return chunks with their file metadata and context
    return chunks
      .map((chunk, i) => ({
        chunk,
        file: chunk ? fileMap.get(chunk.fileId) : null,
        context: args.includeContext
          ? contextChunks.filter((c) => c.fileId === chunk?.fileId)
          : [],
        score: args.scores?.[i] ?? null,
      }))
      .filter((result) => result.chunk && result.file);
  },
});

export const testVectorSearch = action({
  args: {
    userId: v.string(),
  },
  async handler(
    ctx,
    args,
  ): Promise<{
    message: string;
    results: Array<{
      chunk: DocumentChunk | null;
      file: any;
      context: DocumentChunk[];
      score: number | null;
    }>;
    debug: {
      fileId: Id<"files">;
      searchResults: SearchResult[];
    };
  }> {
    // 1. Create test file
    const fileId = await ctx.runMutation(internal.documents.createTestFile, {
      userId: args.userId,
    });

    // 2. Create test chunks with different content
    const chunks = [
      {
        text: "The quick brown fox jumps over the lazy dog",
        page: 1,
        position: 1,
      },
      {
        text: "Machine learning and artificial intelligence are transforming technology",
        page: 1,
        position: 2,
      },
      {
        text: "Neural networks can learn complex patterns in data",
        page: 2,
        position: 1,
      },
      {
        text: "Vector embeddings help find semantic similarities",
        page: 2,
        position: 2,
      },
    ];

    // 3. Store chunks and generate embeddings
    await ctx.runMutation(internal.documents.storeDocumentChunks, {
      fileId,
      chunks: chunks.map((c) => ({
        text: c.text,
        metadata: { page: c.page, position: c.position },
      })),
    });

    // 4. Wait a bit for embeddings to be generated
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 5. Try searching
    const searchResults: SearchResult[] = await ctx.runAction(
      internal.documents.searchDocuments,
      {
        query: "Tell me about AI and machine learning",
        userId: args.userId,
        limit: 3,
      },
    );

    // 6. Get full results
    const fullResults = await ctx.runQuery(
      internal.documents.getSearchResults,
      {
        chunkIds: searchResults.map((r: SearchResult) => r._id),
        scores: searchResults.map((r: SearchResult) => r._score),
        includeContext: true,
      },
    );

    return {
      message: "Test completed successfully!",
      results: fullResults,
      debug: {
        fileId,
        searchResults,
      },
    };
  },
});

export const createTestFile = internalMutation({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("files", {
      name: "test-document.pdf",
      storageId: "test-storage-id",
      fileId: "test-file-id",
      size: 1024,
      uploadedAt: Date.now(),
      userId: args.userId,
      status: "processing",
    });
  },
});

// Public search interface
export const search = action({
  args: {
    query: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
    includeContext: v.optional(v.boolean()),
  },
  async handler(
    ctx,
    args,
  ): Promise<
    Array<{
      chunk: DocumentChunk | null;
      file: any;
      context: DocumentChunk[];
      score: number | null;
    }>
  > {
    const searchResults: SearchResult[] = await ctx.runAction(
      internal.documents.searchDocuments,
      {
        query: args.query,
        userId: args.userId,
        limit: args.limit,
      },
    );

    return ctx.runQuery(internal.documents.getSearchResults, {
      chunkIds: searchResults.map((r: SearchResult) => r._id),
      scores: searchResults.map((r: SearchResult) => r._score),
      includeContext: args.includeContext,
    });
  },
});
