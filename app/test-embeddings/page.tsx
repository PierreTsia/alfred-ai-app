"use client";

import { testEmbeddings } from "@/lib/api/together-ai-embeddings.test";

export default function TestEmbeddings() {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Embeddings Test Page</h1>

      <button
        onClick={testEmbeddings}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Run Embeddings Test
      </button>

      <div className="text-gray-600 mt-4 text-sm">
        Check the console for test results
      </div>
    </div>
  );
}
