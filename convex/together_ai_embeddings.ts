import { Together } from "together-ai";

let together: Together | null = null;

function getClient() {
  if (!together) {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "TOGETHER_API_KEY environment variable is not set in Convex",
      );
    }
    together = new Together({ apiKey });
  }
  return together;
}

export async function generateEmbeddings({
  input,
  model,
}: {
  input: string | string[];
  model?: string;
}) {
  console.log("🔄 Generating embeddings for:", {
    inputLength: Array.isArray(input)
      ? input.map((t) => t.length)
      : input.length,
    model,
  });

  const client = getClient();
  const response = await client.embeddings.create({
    model: model ?? "togethercomputer/m2-bert-80M-8k-retrieval",
    input,
  });

  console.log("✓ Generated embeddings:", {
    count: response.data.length,
    firstVectorLength: response.data[0].embedding.length,
  });

  return response.data.map((item) => item.embedding);
}
