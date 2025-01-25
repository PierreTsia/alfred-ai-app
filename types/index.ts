export type TaskProposal = {
  text: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
};

export type ActionableResponse = {
  content: string;
  actionable: {
    taskProposal?: TaskProposal;
  };
};

export const SystemPromptType = ["TASK_ASSISTANT", "TUTOR"] as const;
export type SystemPromptType = (typeof SystemPromptType)[number];

export type SystemPromptParams = {
  userName?: string;
  tasksContext?: string;
  ageGroup?: string;
  teachingContent?: { fullContent: string }[];
};
