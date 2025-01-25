import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: args.isCompleted,
      userId: args.userId,
      description: args.description,
      priority: args.priority,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    });
    return taskId;
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== args.userId) {
      throw new Error("Not authorized to delete this task");
    }
    await ctx.db.delete(args.id);
  },
});

export const complete = mutation({
  args: {
    id: v.id("tasks"),
    isCompleted: v.boolean(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== args.userId) {
      throw new Error("Not authorized to update this task");
    }
    await ctx.db.patch(args.id, {
      isCompleted: args.isCompleted,
      updatedAt: Date.now(),
    });
  },
});
