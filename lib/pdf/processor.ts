import {
  RecursiveCharacterTextSplitter,
  Document,
} from "@langchain/text-splitter";
import * as pdfjs from "pdfjs-dist";

interface PDFChunk {
  text: string;
  metadata: {
    page: number;
    position: number;
  };
}

export async function processPDF(pdfBuffer: Buffer): Promise<PDFChunk[]> {
  try {
    // Load PDF document
    const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise;
    const numPages = pdf.numPages;

    // Extract text from each page
    const textContent: string[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(" ")
        .trim();
      textContent.push(text);
    }

    // Configure text splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });

    // Split text into chunks
    const chunks: PDFChunk[] = [];
    let position = 0;

    for (let pageNum = 0; pageNum < textContent.length; pageNum++) {
      const pageText = textContent[pageNum];
      const pageChunks = await splitter.createDocuments([pageText]);

      pageChunks.forEach((chunk: Document) => {
        chunks.push({
          text: chunk.pageContent,
          metadata: {
            page: pageNum + 1,
            position: position++,
          },
        });
      });
    }

    return chunks;
  } catch (error) {
    console.error("PDF processing error:", error);
    throw error;
  }
}
