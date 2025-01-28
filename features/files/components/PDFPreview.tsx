import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { X } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { toast } from "sonner";
import { processPDF } from "@/lib/pdf/processor";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Ensure we're using the correct version
if (pdfjs.version !== "3.4.120") {
  console.warn(
    `PDF.js version mismatch. Expected: 3.4.120, Found: ${pdfjs.version}`,
  );
}

interface Props {
  fileId: Id<"files">;
  onClose?: () => void;
}

export function PDFPreview({ fileId, onClose }: Props) {
  const url = useQuery(api.files.getUrl, { id: fileId });
  const [debug, setDebug] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const storeChunks = useMutation(api.documents.storeDocumentChunks);
  const processEmbeddings = useAction(api.documents.processChunkEmbeddings);

  const handleProcess = async () => {
    if (!url) return;

    setIsProcessing(true);
    setDebug([]);

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const chunks = await processPDF(buffer);
      setDebug((prev) => [...prev, `Processed ${chunks.length} chunks`]);

      const chunkIds = await storeChunks({ fileId, chunks });
      setDebug((prev) => [...prev, `Stored ${chunkIds.length} chunks`]);

      const processedCount = await processEmbeddings({ fileId });
      setDebug((prev) => [
        ...prev,
        `Generated embeddings for ${processedCount} chunks`,
      ]);

      toast.success("PDF processed successfully!");
    } catch (error: unknown) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF");
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setDebug((prev) => [...prev, `Error: ${errorMessage}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create plugin instance with close button in toolbar - no memoization needed!
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <div className="rpv-toolbar">
        <div className="rpv-toolbar__left">
          <Toolbar />
        </div>
        {onClose && (
          <div className="rpv-toolbar__right">
            <button
              className="rpv-core__minimal-button"
              onClick={onClose}
              title="Close"
            >
              <X className="rpv-core__minimal-button-icon" />
            </button>
          </div>
        )}
      </div>
    ),
  });

  return (
    <div className="relative h-full w-full">
      {url ? (
        <div className="h-full">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      ) : null}

      <div className="absolute bottom-4 left-4 z-50 flex flex-col gap-2">
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="disabled:bg-gray-400 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {isProcessing ? "Processing..." : "Process PDF"}
        </button>
        {debug.length > 0 && (
          <div className="text-gray-600 rounded bg-white p-2 text-sm shadow">
            {debug.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
