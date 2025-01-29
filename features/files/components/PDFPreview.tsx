import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { X, FileText } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { toast } from "sonner";
import { processPDF } from "@/lib/pdf/processor";
import { Button } from "@/components/ui/button";
import { PDF_CONFIG } from "@/lib/config/pdf";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Ensure we're using the correct version
if (pdfjs.version !== PDF_CONFIG.version) {
  console.warn(
    `PDF.js version mismatch. Expected: ${PDF_CONFIG.version}, Found: ${pdfjs.version}`,
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
      setDebug((prev) => [
        ...prev,
        `Stored ${chunkIds.length} chunks. Processing started...`,
      ]);

      toast.success("PDF processing started!");
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
        <div className="rpv-toolbar__left flex items-center gap-4">
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            size="sm"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Process PDF"}
          </Button>
          <Toolbar />
        </div>
        {onClose && (
          <div className="rpv-toolbar__right">
            <Button variant="ghost" size="icon" onClick={onClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    ),
  });

  return (
    <div className="relative h-full w-full">
      {url ? (
        <div className="h-full">
          <Worker workerUrl={PDF_CONFIG.workerUrl}>
            <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
          {debug.length > 0 && (
            <div className="absolute bottom-4 left-4 rounded bg-black/80 p-2 text-sm text-white">
              {debug.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
