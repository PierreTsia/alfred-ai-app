import { useMemo } from "react";
import { Worker, Viewer, LoadError } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface PDFPreviewProps {
  fileId: Id<"files">;
  onClose: () => void;
}

export const PDFPreview = ({ fileId, onClose }: PDFPreviewProps) => {
  const getUrl = useQuery(api.files.getUrl, { id: fileId });
  const defaultLayoutPluginInstance = useMemo(() => defaultLayoutPlugin(), []);

  if (!getUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-8">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div className="relative h-[90vh] w-[90vw] rounded-lg bg-white p-4">
        <div className="sr-only" id="pdf-preview-title">
          PDF Preview
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
          aria-label="Close PDF preview"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="h-full w-full">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
            <Viewer
              fileUrl={getUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={1}
              theme={{
                theme: "light",
              }}
              renderError={(error: LoadError) => (
                <div className="flex h-full items-center justify-center text-red-500">
                  Failed to load PDF: {error.message || "Unknown error"}
                </div>
              )}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
};
