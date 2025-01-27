import { Together } from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY!,
  baseURL: "https://together.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

export interface EmbeddingPayload {
  input: string | string[];
  model?: string;
}

export async function generateEmbeddings(payload: EmbeddingPayload) {
  const model = payload.model ?? "togethercomputer/m2-bert-80M-8k-retrieval";

  try {
    const response = await together.embeddings.create({
      model,
      input: payload.input,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw error;
  }
}
