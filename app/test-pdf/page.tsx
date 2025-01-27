"use client";

import { useState } from "react";
import { processPDF } from "@/lib/pdf/processor";

interface ChunkDisplay {
  text: string;
  metadata: {
    page: number;
    position: number;
  };
}

export default function TestPDF() {
  const [chunks, setChunks] = useState<ChunkDisplay[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const chunks = await processPDF(Buffer.from(buffer));
      setChunks(chunks);
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">PDF Processing Test</h1>

      <div className="mb-8">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {loading && <div className="mb-4 text-blue-600">Processing PDF...</div>}

      {chunks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chunks ({chunks.length})</h2>

          {chunks.map((chunk, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 transition-colors hover:border-blue-500"
            >
              <div className="text-gray-500 mb-2 text-sm">
                Page {chunk.metadata.page}, Position {chunk.metadata.position}
              </div>
              <div className="whitespace-pre-wrap">{chunk.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
