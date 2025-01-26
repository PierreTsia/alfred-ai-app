import { FileIcon, PlusCircle, Upload, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { formatFileSize } from "@/core/utils/files"
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatDisplayDate } from "@/core/utils/date";

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

// Type for UI representation
type FileItem = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  file?: File;
  status: "uploaded" | "draft";
};

const FilesList = () => {
  const { user } = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);
  const removeFile = useMutation(api.files.removeFile);
  const storedFiles = useQuery(api.files.listFiles, {
    userId: user?.id ?? "",
  });

  // Only keep draft files in local state
  const [draftFiles, setDraftFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("HomePage");

  // Add loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Split file handling functions
  const uploadToStorage = async (file: File): Promise<string> => {
    const url = await generateUploadUrl();
    const storageId = url.split("?")[0];
    await uploadSingleFile(file, url);
    return storageId;
  };

  const saveFileToDb = async (
    file: File,
    storageId: string,
    userId: string,
  ): Promise<void> => {
    await saveFile({
      storageId,
      name: file.name,
      size: file.size,
      userId,
    });
  };

  const removeDraftFile = (draftId: string) => {
    setDraftFiles((prev) => prev.filter((f) => f.id !== draftId));
  };

  const handleUploadFiles = async () => {
    if (!user) return;
    setIsUploading(true);

    try {
      for (const draftFile of draftFiles) {
        if (!draftFile.file) continue;

        const storageId = await uploadToStorage(draftFile.file);
        await saveFileToDb(draftFile.file, storageId, user.id);
        removeDraftFile(draftFile.id);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Update file list mapping
  const allFiles: FileItem[] = [
    ...(storedFiles?.map((file) => ({
      id: file._id.toString(),
      name: file.name,
      size: formatFileSize(file.size),
      uploadedAt: formatDate(file.uploadedAt),
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

  // Split handleUploadFiles into smaller functions
  const uploadSingleFile = async (file: File, url: string) => {
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      if (result.status === 429) {
        throw new Error(t("storage.files.rateLimitError"));
      }
      throw new Error(
        `${t("storage.files.uploadError")}: ${result.statusText}`,
      );
    }
  };

  const handleRemoveFile = async (fileId: Id<"files">) => {
    if (!user) return;
    setIsDeleting(fileId);

    try {
      await removeFile({ id: fileId, userId: user.id });
    } catch (error) {
      console.error("Delete error:", error);
      // TODO: Add toast notification
    } finally {
      setIsDeleting(null);
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
                  : formatDisplayDate(file.uploadedAt)}{" "}
                · {file.size}
              </p>
            </div>
            {file.status === "draft" ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 h-8 w-8 flex-shrink-0 hover:text-red-500"
                onClick={() => handleRemoveDraft(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 h-8 w-8 flex-shrink-0 hover:text-red-500"
                onClick={() => handleRemoveFile(file.id as Id<"files">)}
                disabled={isDeleting === file.id}
              >
                <Trash2
                  className={`h-4 w-4 ${isDeleting === file.id ? "animate-spin" : ""}`}
                />
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
