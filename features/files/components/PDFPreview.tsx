import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { processPDF } from "@/lib/pdf/processor";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import * as pdfjs from "pdfjs-dist";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Ensure we're using the correct version
const pdfjsVersion = "3.4.120";
if (pdfjs.version !== pdfjsVersion) {
  console.warn(
    `PDF.js version mismatch! Expected ${pdfjsVersion} but got ${pdfjs.version}`,
  );
}

interface PDFChunk {
  text: string;
  metadata: {
    page: number;
    position: number;
  };
}

interface Props {
  fileId: Doc<"files">["_id"];
}

export function PDFPreview({ fileId }: Props) {
  const url = useQuery(api.files.getUrl, { id: fileId });
  const [debug, setDebug] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const storeChunks = useMutation(api.documents.storeDocumentChunks);
  const processEmbeddings = useAction(api.documents.processChunkEmbeddings);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  console.log("PDFPreview component rendered with:", {
    fileId,
    url,
  });

  const addDebugMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMsg = `[${timestamp}] ${msg}`;
    console.log(formattedMsg);
    setDebug((prev) => [...prev, formattedMsg]);
  };

  const processPdfContent = async () => {
    if (isProcessing || !url) return;
    setIsProcessing(true);

    try {
      addDebugMessage("Starting manual PDF processing...");
      addDebugMessage(`Fetching PDF from URL: ${url}`);
      const response = await fetch(url);
      addDebugMessage("PDF fetched, converting to buffer...");
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      addDebugMessage("Processing PDF content...");
      const chunks = await processPDF(buffer);
      addDebugMessage(`PDF processed into ${chunks.length} chunks`);
      await handleChunks(chunks);
    } catch (error) {
      const errorMsg = `Error processing PDF: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      addDebugMessage(`❌ ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChunks = async (chunks: PDFChunk[]) => {
    try {
      addDebugMessage("Starting chunk processing...");
      addDebugMessage(`Found ${chunks.length} chunks to process`);
      if (chunks.length > 0) {
        addDebugMessage(
          `First chunk preview: ${chunks[0].text.slice(0, 50)}...`,
        );
      }

      addDebugMessage("Calling storeDocumentChunks mutation...");
      const chunkIds = await storeChunks({ fileId, chunks });
      addDebugMessage(`✓ Mutation returned ${chunkIds.length} chunk IDs`);

      addDebugMessage("Calling processChunkEmbeddings mutation...");
      const result = await processEmbeddings({ fileId });
      if (result.debug) {
        result.debug.forEach((msg) => addDebugMessage(`[Server] ${msg}`));
      }
      addDebugMessage(
        `✓ Processing complete - ${result.processed} chunks processed`,
      );
    } catch (error) {
      const errorMsg = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      addDebugMessage(`❌ ${errorMsg}`);
    }
  };

  // Show loading state while URL is being fetched
  if (!url) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <div className="absolute right-4 top-4 z-50">
        <button
          onClick={processPdfContent}
          disabled={isProcessing}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Process PDF"}
        </button>
      </div>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[defaultLayoutPluginInstance]}
          onDocumentLoad={() => {
            addDebugMessage("PDF viewer loaded document");
          }}
        />
      </Worker>

      {/* Debug panel */}
      <div className="bg-gray-800 fixed bottom-4 right-4 z-50 max-h-60 max-w-md overflow-auto rounded-lg p-4 text-white">
        <h3 className="mb-2 font-bold">Debug Log:</h3>
        {debug.map((msg, i) => (
          <div key={i} className="mb-1 text-sm">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
