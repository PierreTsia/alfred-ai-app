import FilesList from "./FilesList";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { PDFPreview } from "./PDFPreview";

type FileWithId = {
  _id: Id<"files">;
  name: string;
  size: number;
  uploadedAt: number;
};

export const PDFViewer = () => {
  const [selectedFile, setSelectedFile] = useState<Id<"files"> | null>(null);

  const handleViewPDF = (fileId: Id<"files">) => {
    setSelectedFile(fileId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Document Library</h2>
      </div>

      <FilesList
        acceptedTypes={{
          "application/pdf": [".pdf"],
        }}
        renderActions={(file: FileWithId) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPDF(file._id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View PDF
          </Button>
        )}
      />

      {selectedFile && (
        <PDFPreview
          fileId={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};
