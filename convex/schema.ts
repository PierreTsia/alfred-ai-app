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
    storageId: v.string(),
    name: v.string(),
    size: v.number(),
    userId: v.string(),
    uploadedAt: v.number(),
  }),
});
