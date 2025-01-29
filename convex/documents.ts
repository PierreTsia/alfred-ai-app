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
  embedding?: number[];
  processedAt?: number;
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
