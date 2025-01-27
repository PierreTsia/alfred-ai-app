import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
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

    // Just remove from database for now
    await ctx.db.delete(args.id);
  },
});

export const getUrl = query({
  args: {
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    console.log("Retrieved file:", file);

    if (!file) {
      throw new Error("File not found");
    }

    // The storageId is already a clean UUID string
    console.log("Storage ID:", file.storageId);
    return await ctx.storage.getUrl(file.storageId as Id<"_storage">);
  },
});
