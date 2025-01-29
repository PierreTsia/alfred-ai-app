import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export interface DocumentChunk {
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

export interface SearchResult {
  _id: Id<"documentChunks">;
  _score: number;
}

export const storeDocumentChunks = mutation({
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
      internal.documents_internal.generateChunkEmbeddings,
      {
        fileId: args.fileId,
      },
    );

    return chunkIds;
  },
});

export const search = action({
  args: {
    query: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
    includeContext: v.optional(v.boolean()),
    documentId: v.optional(v.string()),
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
    const searchResults = await ctx.runAction(
      internal.documents_internal.searchDocuments,
      {
        query: args.query,
        userId: args.userId,
        limit: args.limit,
        documentId: args.documentId
          ? (args.documentId as Id<"files">)
          : undefined,
      },
    );

    return ctx.runQuery(internal.documents_internal.getSearchResults, {
      chunkIds: searchResults.map((r) => r._id),
      scores: searchResults.map((r) => r._score),
      includeContext: args.includeContext,
    });
  },
});

export const getDocument = query({
  args: { documentId: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.documentId as Id<"files">);
    if (!file) return null;
    return {
      name: file.name,
      size: file.size,
      uploadedAt: file.uploadedAt,
      chunkIds: file.chunkIds,
    };
  },
});
