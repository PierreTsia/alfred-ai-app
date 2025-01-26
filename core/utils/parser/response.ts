import { ActionableResponse } from "@/core/types";

const highlightCommands = (text: string): string => {
  // Task creation commands
  text = text.replace(/(\/task|\/new|\/create)\s+([^\n]+)/g, "**$1** 🎯 $2");
  // List/all tasks commands
  text = text.replace(/(\/list|\/all)\s*([^\n]*)/g, "**$1** 📋 $2");
  return text;
};

export const extractJsonFromResponseText = (message: string) => {
  try {
    const parsed = JSON.parse(message) as ActionableResponse;
    if (parsed.content) {
      return parsed.content;
    }
  } catch (e) {
    const jsonStart = message.indexOf("{");
    if (jsonStart > 0) {
      return message.substring(0, jsonStart).trim();
    }
    return message;
  }
  return message;
};

export const formatUserInput = (message: string): string => {
  return highlightCommands(message);
}; 