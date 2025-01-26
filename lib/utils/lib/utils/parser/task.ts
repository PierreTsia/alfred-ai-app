import { z } from "zod";
import { TaskProposal } from "@/types";

export const parseTaskProposal = (text: string): TaskProposal | null => {
  try {
    const jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1];
    if (!jsonText) return null;

    const data = JSON.parse(jsonText);
    
    const taskSchema = z.object({
      text: z.string(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueDate: z.string().optional(),
    });

    const result = taskSchema.safeParse(data);
    return result.success ? result.data : null;
  } catch (error) {
    return null;
  }
}; 