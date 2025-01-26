import { useTranslations } from "next-intl";
import { Calendar, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Task {
  text: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "in-progress" | "completed";
  dueDate?: string;
  isCompleted: boolean;
}

interface TaskListResponse {
  content: string;
  actionable: {
    taskList: Task[];
  };
}

interface TaskListHandlerProps {
  message: { role: string; content: string };
}

export const TaskListHandler = ({ message }: TaskListHandlerProps) => {
  const t = useTranslations("Chat");

  try {
    const parsed = JSON.parse(message.content) as TaskListResponse;

    if (!parsed?.actionable?.taskList) {
      return null;
    }

    const tasks = parsed.actionable.taskList;

    return (
      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {t("taskList.found", { count: tasks.length })}
          </span>
        </div>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="rounded-md border border-blue-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-gray-900 font-medium">{task.text}</p>
                  <Badge
                    variant={task.isCompleted ? "outline" : "secondary"}
                    className="text-xs"
                  >
                    {task.isCompleted ? "completed" : "pending"}
                  </Badge>
                  {task.priority && (
                    <span className="bg-gray-100 text-gray-700 ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                      {task.priority} <Flag className="ml-1 h-3 w-3" />
                    </span>
                  )}
                  {task.dueDate && (
                    <p className="text-gray-500 flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (e) {
    // If we can't parse the JSON or there's no task list, return nothing
    return null;
  }
};
