import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  ActionCtx,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { Together } from "together-ai";
import { DocumentChunk } from "./documents";
import { internal } from "./_generated/api";

interface SearchResult {
  _id: Id<"documentChunks">;
  _score: number;
}

export const generateChunkEmbeddings = internalAction({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx: ActionCtx, args): Promise<{ processed: number }> {
    const chunks: DocumentChunk[] = await ctx.runQuery(
      internal.documents_internal.getUnprocessedChunks,
      {
        fileId: args.fileId,
      },
    );

    if (chunks.length === 0) {
      await ctx.runMutation(internal.documents_internal.updateFileStatus, {
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

        await ctx.runMutation(
          internal.documents_internal.updateChunkEmbeddings,
          {
            chunkId: chunk._id,
            embedding: embedding.data[0].embedding,
          },
        );
        processedCount++;
      } catch (error) {
        console.error(`Error processing chunk ${chunk._id}:`, error);
      }
    }

    if (processedCount === chunks.length) {
      await ctx.runMutation(internal.documents_internal.updateFileStatus, {
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

export const searchDocuments = internalAction({
  args: {
    query: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
    documentId: v.optional(v.id("files")),
  },
  async handler(ctx, args): Promise<SearchResult[]> {
    const client = new Together({ apiKey: process.env.TOGETHER_AI_KEY! });
    const embedding = await client.embeddings.create({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: args.query,
    });

    const results = await ctx.vectorSearch("documentChunks", "by_embedding", {
      vector: embedding.data[0].embedding,
      limit: args.limit ?? 5,
      filter: (q) => q.eq("userId", args.userId),
    });

    if (!args.documentId) {
      return results;
    }

    const documentChunks: DocumentChunk[] = await ctx.runQuery(
      internal.documents_internal.getDocumentChunks,
      {
        documentId: args.documentId,
      },
    );

    const documentChunkIds = new Set(
      documentChunks.map((chunk) => chunk._id.toString()),
    );
    return results.filter((result) =>
      documentChunkIds.has(result._id.toString()),
    );
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

    const fileIds = chunks
      .map((chunk) => chunk?.fileId)
      .filter((id): id is Id<"files"> => id !== undefined);

    const files = await Promise.all(fileIds.map((id) => ctx.db.get(id)));
    const fileMap = new Map(
      files
        .filter((file): file is NonNullable<typeof file> => file !== null)
        .map((file) => [file._id, file]),
    );

    if (!args.includeContext) {
      return chunks.map((chunk, i) => ({
        chunk,
        file: chunk ? fileMap.get(chunk.fileId) : null,
        context: [],
        score: args.scores?.[i] ?? null,
      }));
    }

    const contextChunks = await Promise.all(
      chunks.map(async (chunk) => {
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
      }),
    );

    return chunks.map((chunk, i) => ({
      chunk,
      file: chunk ? fileMap.get(chunk.fileId) : null,
      context: contextChunks[i] ?? [],
      score: args.scores?.[i] ?? null,
    }));
  },
});

export const getDocumentChunks = internalQuery({
  args: {
    documentId: v.id("files"),
  },
  async handler(ctx, args): Promise<DocumentChunk[]> {
    return await ctx.db
      .query("documentChunks")
      .filter((q) => q.eq(q.field("fileId"), args.documentId))
      .collect();
  },
});
