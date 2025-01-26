import {
  togetherAIStream,
  TogetherAIStreamPayload,
} from "@/utils/togetherAIStream";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getSystemPrompt } from "@/utils/prompts";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages, userName, userId } = await request.json();

  try {
    let tasksContext = `${userName} has no tasks yet.`;

    // Only fetch tasks if we have a userId
    if (userId) {
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

      const tasks = await convex.query(api.tasks.get, { userId });

      if (tasks.length) {
        tasksContext = `Here are ${userName}'s current tasks:\n${tasks
          .map(
            (task, i) =>
              `${i + 1}. ${task.text} (${task.isCompleted ? "completed" : "pending"})${task.priority ? ` - Priority: ${task.priority}` : ''}${task.dueDate ? `, Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}, Created: ${new Date(task._creationTime).toLocaleDateString()}`,
          )
          .join("\n")}`;
      }
    }

    console.log("tasksContext", tasksContext);

    const payload: TogetherAIStreamPayload = {
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: getSystemPrompt("TASK_ASSISTANT", {
            userName,
            tasksContext,
          }),
        },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    };

    const stream = await togetherAIStream(payload);

    return new Response(stream, {
      headers: new Headers({
        "Cache-Control": "no-cache",
      }),
    });
  } catch (e) {
    console.error("[getChat] Error:", e);
    return new Response("Error: Answer stream failed.", { status: 500 });
  }
}
