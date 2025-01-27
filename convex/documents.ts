import { v } from "convex/values";
import {
  mutation,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { generateEmbeddings } from "./together_ai_embeddings";
import { internal } from "./_generated/api";

interface DocumentChunk {
  _id: Id<"documentChunks">;
  text: string;
  metadata: {
    page: number;
    position: number;
  };
  fileId: Id<"files">;
  vector?: number[];
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
  handler: async (ctx, args) => {
    console.log("🔍 storeDocumentChunks called with:", {
      fileId: args.fileId,
      numChunks: args.chunks.length,
    });

    // Verify the file exists
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      console.error("❌ File not found:", args.fileId);
      throw new Error("File not found");
    }
    console.log("✓ File found:", file);

    // Store all chunks
    console.log("📝 Storing chunks...");
    const chunkIds = await Promise.all(
      args.chunks.map((chunk) =>
        ctx.db.insert("documentChunks", {
          fileId: args.fileId,
          text: chunk.text,
          metadata: chunk.metadata,
        }),
      ),
    );
    console.log(`✓ Stored ${chunkIds.length} chunks`);

    return chunkIds;
  },
});

export const processChunkEmbeddings = action({
  args: {
    fileId: v.id("files"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ processed: number; debug: string[] }> => {
    const debug: string[] = [];
    debug.push(`Starting processChunkEmbeddings for fileId: ${args.fileId}`);

    // Get unprocessed chunks for this file
    const chunks: DocumentChunk[] = await ctx.runQuery(
      internal.documents.getUnprocessedChunks,
      { fileId: args.fileId },
    );
    debug.push(`Found ${chunks.length} unprocessed chunks`);

    if (chunks.length === 0) {
      return { processed: 0, debug };
    }

    // Process first chunk as a test
    const chunk = chunks[0];
    debug.push(
      `Processing chunk ${chunk._id} (text length: ${chunk.text.length})`,
    );

    try {
      const embeddings = await generateEmbeddings({
        input: chunk.text,
        model: "togethercomputer/m2-bert-80M-8k-retrieval",
      });
      debug.push(
        `Generated embeddings (vector length: ${embeddings[0].length})`,
      );

      // Update the chunk with its embedding
      await ctx.runMutation(internal.documents.updateChunkEmbeddings, {
        chunkId: chunk._id,
        vector: embeddings[0],
      });
      debug.push("Successfully updated chunk with embeddings");

      return { processed: 1, debug };
    } catch (error) {
      debug.push(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  },
});

// Helper query to get unprocessed chunks
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
    vector: v.array(v.float64()),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.chunkId, {
      vector: args.vector,
      processedAt: Date.now(),
    });
  },
});
