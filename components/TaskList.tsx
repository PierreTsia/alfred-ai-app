"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trash2, CheckCircle2, Circle, Plus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function TaskList() {
  const [newTaskText, setNewTaskText] = useState("");
  const { user } = useUser();
  const tasks = useQuery(api.tasks.get, { userId: user?.id ?? "" });
  const addTask = useMutation(api.tasks.add);
  const removeTask = useMutation(api.tasks.remove);
  const completeTask = useMutation(api.tasks.complete);
  const t = useTranslations("TaskList");

  if (!user) return null;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      await addTask({
        text: newTaskText,
        isCompleted: false,
        userId: user.id,
      });
      setNewTaskText("");
    }
  };

  const handleRemoveTask = async (taskId: Id<"tasks">) => {
    await removeTask({ id: taskId, userId: user.id });
  };

  const handleToggleComplete = async (
    taskId: Id<"tasks">,
    isCompleted: boolean,
  ) => {
    await completeTask({
      id: taskId,
      isCompleted: !isCompleted,
      userId: user.id,
    });
  };

  return (
    <div className="flex h-[400px] flex-col">
      {/* Scrollable Tasks List */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <div className="space-y-2">
          {tasks?.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleToggleComplete(task._id, task.isCompleted)
                  }
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={t("markComplete")}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={`${
                    task.isCompleted ? "text-gray-500 line-through" : ""
                  }`}
                >
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => handleRemoveTask(task._id)}
                className="text-gray-500 hover:text-red-500"
                aria-label={t("removeTask")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Input Form at Bottom */}
      <div className="mt-auto space-y-4 pt-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={t("addPlaceholder")}
              className="w-full"
            />
          </div>
          <Button type="submit" className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}
