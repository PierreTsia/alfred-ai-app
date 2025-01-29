import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getUrl = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) {
      return null;
    }

    // Get the URL for this file
    const url = await ctx.storage.getUrl(file.storageId);
    return url;
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    size: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Debug the incoming URL
    console.log("Original storageId URL:", args.storageId);

    // The URL from generateUploadUrl looks like:
    // https://...convex.cloud/api/storage/upload/UUID
    const parts = args.storageId.split("/");
    console.log("URL parts:", parts);

    // Get the actual storage ID (UUID)
    const storageId = parts[parts.length - 1];
    console.log("Extracted storageId:", storageId);

    if (!storageId || storageId === "upload") {
      throw new Error("Invalid storage ID format: " + args.storageId);
    }

    await ctx.db.insert("files", {
      storageId,
      name: args.name,
      size: args.size,
      userId: args.userId,
      fileId: storageId, // Using storageId as fileId for now
      uploadedAt: Date.now(),
    });
  },
});

export const listFiles = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const removeFile = mutation({
  args: {
    id: v.id("files"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== args.userId) {
      throw new Error("Not authorized to delete this file");
    }

    // Call internal mutation to handle cascade delete
    await ctx.db.delete(args.id);
    await ctx.storage.delete(file.storageId);

    // Delete all associated chunks and their embeddings
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_file", (q) => q.eq("fileId", args.id))
      .collect();

    // Delete all chunks
    await Promise.all(chunks.map((chunk) => ctx.db.delete(chunk._id)));
  },
});
