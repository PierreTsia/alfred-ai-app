import { TaskProposal, ActionableResponse } from "./types";

export const parseTaskProposal = (message: string): TaskProposal | null => {
  try {
    // More robust regex to handle nested objects
    const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
    const matches = message.match(jsonRegex);
    if (!matches) return null;

    // Try each matched JSON object
    for (const jsonString of matches) {
      try {
        // Clean up the JSON string
        const cleanJson = jsonString
          .replace(/\/\/.*$/gm, "") // Remove single line comments
          .replace(/\/\*[\s\S]*?\*\//gm, "") // Remove multi-line comments
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .trim();

        const parsed = JSON.parse(cleanJson);

        if (parsed.actionable?.taskProposal) {
          return parsed.actionable.taskProposal;
        }
        if (parsed.taskProposal?.text) {
          return parsed.taskProposal;
        }
        if (
          parsed.text &&
          (parsed.priority || parsed.dueDate || parsed.description)
        ) {
          return parsed as TaskProposal;
        }
      } catch (innerError) {
        console.log("Failed to parse this match, trying next one:", innerError);
        continue;
      }
    }

    return null;
  } catch (e) {
    console.log("Parse error:", e);
    return null;
  }
};
