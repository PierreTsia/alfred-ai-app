import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    // Task content
    text: v.string(),
    isCompleted: v.boolean(),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    dueDate: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),

    // User info
    userId: v.string(),
  })
    .index("by_creation", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_completion", ["isCompleted", "createdAt"]),

  files: defineTable({
    name: v.string(),
    storageId: v.string(),
    fileId: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
    userId: v.string(),
    status: v.optional(v.string()),
    chunkIds: v.optional(v.array(v.id("documentChunks"))),
    // Track if the file has been processed
    processedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"]),

  documentChunks: defineTable({
    fileId: v.id("files"),
    content: v.string(),
    metadata: v.object({
      page: v.number(),
      position: v.number(),
    }),
    embedding: v.optional(v.array(v.float64())),
    processedAt: v.optional(v.number()),
    // Adding userId for filtering
    userId: v.string(),
  })
    .index("by_file", ["fileId"])
    .index("by_user", ["userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768, // m2-bert-80M-8k-retrieval model outputs 768-dimensional vectors
      filterFields: ["userId"], // Allow filtering by user for security
    }),
});
