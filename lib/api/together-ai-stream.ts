import { Together } from "together-ai";

export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface TogetherAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://together.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

export async function togetherAIStream(payload: TogetherAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let response;
  try {
    response = await together.chat.completions.create({
      messages: payload.messages,
      model: payload.model,
      stream: true,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.max_tokens ?? 1000,
    });
  } catch (error) {
    console.error("Together API Error:", error);
    throw error;
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            const payload = { text };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
            );
          }
        }
        controller.close();
      } catch (error) {
        console.error("Stream processing error:", error);
        controller.error(error);
      }
    },
  });

  return stream;
}
