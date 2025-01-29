import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateChunkEmbeddings,
  searchDocuments,
} from "../convex/documents_internal";
import { Together } from "together-ai";
import type { Id } from "../convex/_generated/dataModel";
import type {
  DatabaseReader,
  DatabaseWriter,
} from "../convex/_generated/server";

vi.mock("together-ai");
vi.mock("convex/_generated/server");
vi.mock("convex/_generated/api");

interface MockCtx {
  db: Partial<DatabaseReader & DatabaseWriter> & {
    query: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    vectorSearch: ReturnType<typeof vi.fn>;
  };
}

describe("Document Internal Service", () => {
  let mockCtx: MockCtx;

  beforeEach(() => {
    mockCtx = {
      db: {
        query: vi.fn(),
        patch: vi.fn(),
        get: vi.fn(),
        vectorSearch: vi.fn(),
      },
    };
  });

  describe("generateChunkEmbeddings", () => {
    it("should handle empty chunk list", async () => {
      mockCtx.db.query.mockResolvedValue([]);

      const result = await generateChunkEmbeddings(mockCtx as any, {
        fileId: "test_file" as Id<"files">,
      });

      expect(result).toEqual({ success: true, processedCount: 0 });
      expect(mockCtx.db.query).toHaveBeenCalled();
    });

    it("should process chunks and generate embeddings", async () => {
      const mockChunks = [
        { _id: "1", text: "test chunk 1", status: "pending" },
        { _id: "2", text: "test chunk 2", status: "pending" },
      ];
      mockCtx.db.query.mockResolvedValue(mockChunks);
      mockCtx.db.patch.mockResolvedValue(undefined);

      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockTogetherResponse = {
        data: [
          {
            embedding: mockEmbedding,
          },
        ],
      };
      (Together as any).mockImplementation(() => ({
        embeddings: {
          create: vi.fn().mockResolvedValue(mockTogetherResponse),
        },
      }));

      const result = await generateChunkEmbeddings(mockCtx as any, {
        fileId: "test_file" as Id<"files">,
      });

      expect(result).toEqual({ success: true, processedCount: 2 });
      expect(mockCtx.db.query).toHaveBeenCalled();
      expect(mockCtx.db.patch).toHaveBeenCalledTimes(2);
    });

    it("should handle API errors gracefully", async () => {
      const mockChunks = [{ _id: "1", text: "test chunk", status: "pending" }];
      mockCtx.db.query.mockResolvedValue(mockChunks);

      (Together as any).mockImplementation(() => ({
        embeddings: {
          create: vi.fn().mockRejectedValue(new Error("API Error")),
        },
      }));

      const result = await generateChunkEmbeddings(mockCtx as any, {
        fileId: "test_file" as Id<"files">,
      });

      expect(result).toEqual({
        success: false,
        error: "Failed to generate embeddings: Error: API Error",
      });
      expect(mockCtx.db.patch).not.toHaveBeenCalled();
    });
  });

  describe("searchDocuments", () => {
    it("should perform vector search with correct parameters", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        { _id: "1", text: "result 1", score: 0.9 },
        { _id: "2", text: "result 2", score: 0.8 },
      ];

      (Together as any).mockImplementation(() => ({
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [{ embedding: mockEmbedding }],
          }),
        },
      }));

      mockCtx.db.vectorSearch.mockResolvedValue(mockSearchResults);

      const result = await searchDocuments(mockCtx as any, {
        query: "test query",
        userId: "test-user",
      });

      expect(result).toEqual(mockSearchResults);
      expect(mockCtx.db.vectorSearch).toHaveBeenCalledWith(
        "documents.chunks",
        "embedding",
        mockEmbedding,
        expect.any(Object),
      );
    });

    it("should filter results by document when documentId is provided", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        { _id: "1", text: "result 1", score: 0.9, documentId: "doc1" },
        { _id: "2", text: "result 2", score: 0.8, documentId: "doc2" },
      ];

      (Together as any).mockImplementation(() => ({
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [{ embedding: mockEmbedding }],
          }),
        },
      }));

      mockCtx.db.vectorSearch.mockResolvedValue(mockSearchResults);

      const result = await searchDocuments(mockCtx as any, {
        query: "test query",
        userId: "test-user",
        documentId: "doc1" as Id<"files">,
      });

      expect(result).toEqual([mockSearchResults[0]]);
      expect(mockCtx.db.vectorSearch).toHaveBeenCalledWith(
        "documents.chunks",
        "embedding",
        mockEmbedding,
        expect.any(Object),
      );
    });
  });
});
