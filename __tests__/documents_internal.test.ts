import { describe, it, expect, beforeEach, vi } from "vitest";
import { TestCtx } from "convex-test";
import {
  generateChunkEmbeddings,
  searchDocuments,
} from "../convex/documents_internal";
import { Together } from "together-ai";
import type { Id } from "../convex/_generated/dataModel";
import { api } from "../convex/_generated/api";

vi.mock("together-ai");

describe("Document Internal Service", () => {
  let ctx: TestCtx;

  beforeEach(() => {
    ctx = new TestCtx();
  });

  describe("generateChunkEmbeddings", () => {
    it("should handle empty chunk list", async () => {
      await ctx.db.insert("files", {
        _id: "test_file" as Id<"files">,
        status: "pending",
        userId: "test-user",
      });

      const result = await ctx.runAction(
        api.documents_internal.generateChunkEmbeddings,
        {
          fileId: "test_file" as Id<"files">,
        },
      );

      expect(result).toEqual({ success: true, processedCount: 0 });
    });

    it("should process chunks and generate embeddings", async () => {
      const mockChunks = [
        { _id: "1", text: "test chunk 1", status: "pending" },
        { _id: "2", text: "test chunk 2", status: "pending" },
      ];
      ctx.db.query.mockResolvedValue(mockChunks);
      ctx.db.patch.mockResolvedValue(undefined);

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

      const result = await generateChunkEmbeddings(ctx, {
        fileId: "test_file" as Id<"files">,
      });

      expect(result).toEqual({ success: true, processedCount: 2 });
      expect(ctx.db.query).toHaveBeenCalled();
      expect(ctx.db.patch).toHaveBeenCalledTimes(2);
    });

    it("should handle API errors gracefully", async () => {
      const mockChunks = [{ _id: "1", text: "test chunk", status: "pending" }];
      ctx.db.query.mockResolvedValue(mockChunks);

      (Together as any).mockImplementation(() => ({
        embeddings: {
          create: vi.fn().mockRejectedValue(new Error("API Error")),
        },
      }));

      const result = await generateChunkEmbeddings(ctx, {
        fileId: "test_file" as Id<"files">,
      });

      expect(result).toEqual({
        success: false,
        error: "Failed to generate embeddings: Error: API Error",
      });
      expect(ctx.db.patch).not.toHaveBeenCalled();
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

      ctx.db.vectorSearch.mockResolvedValue(mockSearchResults);

      const result = await searchDocuments(ctx, {
        query: "test query",
        userId: "test-user",
      });

      expect(result).toEqual(mockSearchResults);
      expect(ctx.db.vectorSearch).toHaveBeenCalledWith(
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

      ctx.db.vectorSearch.mockResolvedValue(mockSearchResults);

      const result = await searchDocuments(ctx, {
        query: "test query",
        userId: "test-user",
        documentId: "doc1" as Id<"files">,
      });

      expect(result).toEqual([mockSearchResults[0]]);
      expect(ctx.db.vectorSearch).toHaveBeenCalledWith(
        "documents.chunks",
        "embedding",
        mockEmbedding,
        expect.any(Object),
      );
    });
  });
});
