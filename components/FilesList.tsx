import { FileIcon, PlusCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { formatFileSize } from "@/utils/fileUtils";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { log } from "console";

const ACCEPTED_FILE_TYPES = {
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
} as const;

const FileSchema = z.object({
  name: z.string(),
  type: z
    .string()
    .refine(
      (val) =>
        Object.keys(ACCEPTED_FILE_TYPES).some(
          (type) =>
            type === val || (type === "image/*" && val.startsWith("image/")),
        ),
      "File type not supported",
    ),
  size: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"),
});

// Type for files from Convex DB
type StoredFile = {
  storageId: string;
  name: string;
  size: number;
  userId: string;
  uploadedAt: number;
};

// Type for UI representation
type FileItem = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  file: File;
  status: "uploaded" | "draft";
};

const FilesList = () => {
  const { user } = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);
  const storedFiles = useQuery(api.files.listFiles, {
    userId: user?.id ?? "",
  });

  // Only keep draft files in local state
  const [draftFiles, setDraftFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("HomePage");

  // Combine stored files and draft files
  const allFiles: FileItem[] = [
    ...(storedFiles?.map((file) => ({
      id: file._id.toString(),
      name: file.name,
      size: formatFileSize(file.size),
      uploadedAt: new Date(file.uploadedAt).toISOString(),
      file: new File([], file.name), // Placeholder file object
      status: "uploaded" as const,
    })) ?? []),
    ...draftFiles,
  ];

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const validFiles = await Promise.all(
      Array.from(selectedFiles).map(async (file) => {
        const result = FileSchema.safeParse({
          name: file.name,
          type: file.type,
          size: file.size,
        });

        if (!result.success) {
          console.warn(`File "${file.name}" validation failed:`, result.error);
          return null;
        }

        return file;
      }),
    );

    const newFiles: FileItem[] = validFiles
      .filter((file): file is File => file !== null)
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        file,
        status: "draft",
      }));

    setDraftFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveDraft = (id: string) => {
    setDraftFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUploadFiles = async () => {
    if (!user) return;

    for (const file of draftFiles) {
      try {
        const url = await generateUploadUrl();

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.file.type },
          body: file.file,
        });

        if (!result.ok) {
          if (result.status === 429) {
            console.error(
              "Rate limit exceeded. Please wait a moment before retrying.",
            );
            return;
          }
          console.error(`Failed to upload ${file.name}: ${result.statusText}`);
          continue;
        }

        await saveFile({
          storageId: url,
          name: file.name,
          size: file.file.size,
          userId: user.id,
        });

        // Remove this file from drafts after successful upload
        setDraftFiles((prev) => prev.filter((f) => f.id !== file.id));
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  };

  const hasDraftFiles = draftFiles.length > 0;

  const byStatus = (a: FileItem, b: FileItem) => {
    return a.status === "draft" ? -1 : 1;
  };

  const byDate = (a: FileItem, b: FileItem) => {
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  };

  const sortedFiles = [...allFiles].sort((a, b) => {
    return a.status === b.status ? byDate(a, b) : byStatus(a, b);
  });

  return (
    <div className="flex h-[400px] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {sortedFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <FileIcon
              className={`mt-1 h-5 w-5 flex-shrink-0 ${
                file.status === "draft" ? "text-blue-500" : "text-gray-500"
              }`}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className="truncate font-medium leading-none"
                title={file.name}
              >
                {file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {file.status === "draft"
                  ? t("storage.files.pendingUpload")
                  : new Date(file.uploadedAt).toLocaleDateString()}{" "}
                · {file.size}
              </p>
            </div>
            {file.status === "draft" && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 h-8 w-8 flex-shrink-0 hover:text-red-500"
                onClick={() => handleRemoveDraft(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(",")}
      />

      <div className="mt-auto space-y-4 pt-6">
        {hasDraftFiles && (
          <Button className="w-full" onClick={handleUploadFiles}>
            <Upload className="mr-2 h-4 w-4" />
            {t("storage.files.uploadButton")}
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("storage.files.addButton")}
        </Button>
      </div>
    </div>
  );
};

export default FilesList;
