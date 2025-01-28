import { Together } from "together-ai";
import { DatabaseReader, DatabaseWriter } from "./_generated/server";
import { Id } from "./_generated/dataModel";

let together: Together | null = null;

function getClient(): Together {
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

export const generateEmbeddings = async (
  ctx: { db: DatabaseReader & DatabaseWriter },
  chunkIds: Id<"documentChunks">[],
): Promise<number[]> => {
  const client = getClient();

  // For now, we only process the first chunk
  const chunkId = chunkIds[0];
  const chunk = await ctx.db.get(chunkId);
  if (!chunk) throw new Error("Chunk not found");

  const embedding = await client.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: chunk.content,
  });

  return embedding.data[0].embedding;
};
