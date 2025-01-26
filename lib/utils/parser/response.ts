import { z } from "zod";

export const extractJsonFromResponseText = (text: string): string => {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    return jsonMatch ? jsonMatch[1] : text;
  } catch (error) {
    console.error("Error extracting JSON:", error);
    return text;
  }
};

export const extractTaskListFromText = (text: string) => {
  try {
    const jsonText = extractJsonFromResponseText(text);
    const data = JSON.parse(jsonText);
    return data.actionable?.taskList || null;
  } catch (error) {
    return null;
  }
}; 