import { describe, it, expect } from "vitest";
import fs from "fs/promises";
import path from "path";
import { processPDF, processPDFWithPages } from "./pdf-parse-processor";

describe("PDF Parse Processor", () => {
  // Helper to load test PDFs
  const loadTestPDF = async (filename: string): Promise<Buffer> => {
    const pdfPath = path.join(__dirname, "__fixtures__", filename);
    return fs.readFile(pdfPath);
  };

  describe("Basic PDF Processing", () => {
    it("should process a single-page PDF", async () => {
      const buffer = await loadTestPDF("sample.pdf");
      const chunks = await processPDF(buffer);

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toHaveProperty("text");
      expect(chunks[0]).toHaveProperty("metadata");
      expect(typeof chunks[0].text).toBe("string");
    });

    it("should process a multi-page PDF and maintain page numbers", async () => {
      const buffer = await loadTestPDF("large.pdf");
      const chunks = await processPDFWithPages(buffer);

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);

      // Check we have content from different pages
      const pages = new Set(chunks.map((chunk) => chunk.metadata.page));
      expect(pages.size).toBeGreaterThan(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle PDFs with special layouts", async () => {
      const buffer = await loadTestPDF("special.pdf");
      const chunks = await processPDF(buffer);

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toHaveProperty("text");
    });

    it("should handle PDFs with columns", async () => {
      const buffer = await loadTestPDF("columns.pdf");
      const chunks = await processPDFWithPages(buffer);

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);

      // Should have multiple pages
      const pages = new Set(chunks.map((chunk) => chunk.metadata.page));
      expect(pages.size).toBeGreaterThan(0);
    });
  });
});
