import { generateEmbeddings } from "@/lib/api/together-ai-embeddings";

export async function POST(request: Request) {
  try {
    const { input, model } = await request.json();

    if (!input) {
      return new Response("Missing input text", { status: 400 });
    }

    const embeddings = await generateEmbeddings({ input, model });

    return new Response(JSON.stringify({ embeddings }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[embeddings] Error:", error);
    return new Response("Error generating embeddings", { status: 500 });
  }
}
