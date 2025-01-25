import { internalMutation } from "../_generated/server";

export const backfillTimestamps = internalMutation({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    let updateCount = 0;

    for (const task of tasks) {
      const now = Date.now();
      const updates: any = {};

      if (!task.createdAt) {
        updates.createdAt = now;
      }

      if (!task.updatedAt) {
        updates.updatedAt = task.createdAt || now;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(task._id, updates);
        updateCount++;
      }
    }

    return {
      message: `Updated ${updateCount} tasks with timestamp values`,
      tasksProcessed: tasks.length,
    };
  },
});
