import { FileIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type FileItem = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
};

const DEMO_FILES: FileItem[] = [
  {
    id: "1",
    name: "document.pdf",
    size: "2.4 MB",
    uploadedAt: "2024-03-20",
  },
  {
    id: "2",
    name: "image.jpg",
    size: "1.8 MB",
    uploadedAt: "2024-03-19",
  },
  {
    id: "3",
    name: "presentation.pptx",
    size: "5.2 MB",
    uploadedAt: "2024-03-18",
  },
];

export default function FilesList() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4">
        {DEMO_FILES.map((file) => (
          <div
            key={file.id}
            className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-muted/50"
          >
            <FileIcon className="mt-1 h-5 w-5 text-blue-500" />
            <div className="flex-1 space-y-1">
              <p className="font-medium leading-none">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(file.uploadedAt).toLocaleDateString()} · {file.size}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button variant="outline" className="w-full" size="lg">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add File
        </Button>
      </div>
    </div>
  );
}
