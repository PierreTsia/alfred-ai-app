import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import PDFParser from "pdf2json";
import { AppError, retryOperation } from "../core/errors";
import { AppLogger, createLogger } from "../core/logger";

// Types for PDF2JSON output structure
interface PDFTextRun {
  T: string; // The actual text content
  S?: number; // Style index
  TS?: [number, number, number, number]; // Text state
}

interface PDFTextItem {
  R: PDFTextRun[];
  x?: number;
  y?: number;
  w?: number;
  sw?: number; // Space width
  A?: string; // Alignment
  oc?: string; // Original content
}

interface PDFLine {
  x: number;
  y: number;
  w: number; // width for horizontal, height for vertical
  l: number; // length
  clr?: number; // color
  sw?: number; // stroke width
  dsh?: boolean; // dashed
}

interface PDFLink {
  x: number;
  y: number;
  w: number;
  h: number;
  url?: string;
  page?: number; // for internal links
}

interface PDFFill {
  x: number;
  y: number;
  w: number;
  h: number;
  clr?: number; // color
  oc?: string; // original content
}

interface PDFFont {
  BaseFont: string;
  Type?: string;
  Subtype?: string;
  FirstChar?: number;
  LastChar?: number;
  Widths?: number[];
  FontDescriptor?: {
    FontName: string;
    Flags: number;
    FontBBox: [number, number, number, number];
    ItalicAngle: number;
    Ascent: number;
    Descent: number;
    CapHeight: number;
    StemV: number;
  };
}

interface PDFPage {
  Texts?: PDFTextItem[];
  Width?: number;
  Height?: number;
  HLines?: PDFLine[]; // Horizontal lines
  VLines?: PDFLine[]; // Vertical lines
  Fills?: PDFFill[]; // Fill areas
  Links?: PDFLink[]; // Hyperlinks
  Fonts?: Record<string, PDFFont>;
}

interface PDFData {
  Pages: PDFPage[];
  Meta: {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  };
  Agency?: string; // Custom metadata
  Id?: string; // Custom identifier
}

// Parser error types
interface PDFParserError {
  parserError: Error;
  source?: string;
}

export interface PDFChunk {
  text: string;
  metadata: {
    page: number;
    position: number;
  };
}

// PDF specific error codes
export const PDF_ERROR_CODES = {
  PARSE_ERROR: "PDF_PARSE_ERROR",
  INVALID_FORMAT: "PDF_INVALID_FORMAT",
  EMPTY_BUFFER: "PDF_EMPTY_BUFFER",
  UNKNOWN_ERROR: "PDF_UNKNOWN_ERROR",
  RETRY_EXHAUSTED: "PDF_RETRY_EXHAUSTED",
  INVALID_PAGE: "PDF_INVALID_PAGE",
} as const;

export type PDFErrorCode =
  (typeof PDF_ERROR_CODES)[keyof typeof PDF_ERROR_CODES];

// PDF specific error class
export class PDFProcessingError extends AppError {
  constructor(message: string, code: PDFErrorCode, details?: string) {
    super(message, code, details, "PDF");
  }
}

export interface ProcessorOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  maxRetries?: number;
  retryDelay?: number;
  logger?: AppLogger;
}

const DEFAULT_OPTIONS: Required<Omit<ProcessorOptions, "logger">> = {
  chunkSize: 1000,
  chunkOverlap: 200,
  maxRetries: 3,
  retryDelay: 1000,
};

// Default logger for PDF processing
const defaultLogger = createLogger({ module: "PDF" });

/**
 * Helper to decode PDF text from pdf2json format
 * @param text - Encoded PDF text
 * @returns Decoded text with proper characters
 */
function decodePDFText(text: string): string {
  return decodeURIComponent(
    text
      .replace(/\\\//g, "/")
      .replace(/\\/g, "")
      .replace(/\&\#x([0-9A-F]{2});/gi, "%$1"),
  );
}

/**
 * Type guard for PDFData
 */
function isPDFData(data: unknown): data is PDFData {
  if (!data || typeof data !== "object") return false;

  const pdfData = data as Partial<PDFData>;
  return (
    Array.isArray(pdfData.Pages) &&
    typeof pdfData.Meta === "object" &&
    pdfData.Meta !== null
  );
}

/**
 * Process a PDF buffer into text chunks with metadata
 * @param pdfBuffer - Buffer containing PDF data
 * @param options - Processing options
 * @returns Array of text chunks with metadata
 * @throws PDFProcessingError
 */
export async function processPDF(
  pdfBuffer: Buffer,
  options: ProcessorOptions = {},
): Promise<PDFChunk[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const logger = options.logger ?? defaultLogger;
  const pdfParser = new PDFParser();

  logger.debug("Starting PDF processing", { bufferSize: pdfBuffer.length });

  // Validate input
  if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    logger.error("Invalid buffer provided", undefined, {
      bufferSize: pdfBuffer?.length,
    });
    throw new PDFProcessingError(
      "Invalid PDF buffer provided",
      PDF_ERROR_CODES.EMPTY_BUFFER,
      "Buffer is empty or invalid",
    );
  }

  try {
    // Parse PDF with retries
    logger.debug("Parsing PDF buffer");
    const pdfData = await retryOperation(
      () =>
        new Promise<unknown>((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", (error: PDFParserError) => {
            logger.error("Parser error", error.parserError);
            reject(
              new PDFProcessingError(
                "PDF parsing failed",
                PDF_ERROR_CODES.PARSE_ERROR,
                error.parserError.message,
              ),
            );
          });
          pdfParser.on("pdfParser_dataReady", resolve);
          pdfParser.parseBuffer(pdfBuffer);
        }),
      opts.maxRetries,
      opts.retryDelay,
    ).catch((error) => {
      logger.error(
        "Retry exhausted",
        error instanceof Error ? error : new Error(String(error)),
      );
      if (error instanceof PDFProcessingError) {
        throw error;
      }
      throw new PDFProcessingError(
        "PDF parsing failed after retries",
        PDF_ERROR_CODES.RETRY_EXHAUSTED,
        error instanceof Error ? error.message : "Unknown error",
      );
    });

    // Validate PDF data structure
    if (!isPDFData(pdfData)) {
      logger.error("Invalid PDF structure", undefined, {
        data: typeof pdfData,
      });
      throw new PDFProcessingError(
        "Invalid PDF data structure",
        PDF_ERROR_CODES.INVALID_FORMAT,
        "Parsed data does not match expected format",
      );
    }

    logger.debug("PDF parsed successfully", {
      pageCount: pdfData.Pages.length,
      version: pdfData.Meta.PDFFormatVersion,
    });

    // Extract text from pages with proper typing
    const pageTexts = pdfData.Pages.map((page, index) => {
      const texts = page.Texts ?? [];
      if (texts.length === 0) {
        logger.warn(`Page ${index + 1} contains no text elements`);
      }
      return texts
        .map((text) => text.R.map((r) => r.T).join(" "))
        .join(" ")
        .trim();
    });

    // Configure text splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: opts.chunkSize,
      chunkOverlap: opts.chunkOverlap,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });

    // Process each page
    const chunks: PDFChunk[] = [];
    let position = 0;

    for (let pageNum = 0; pageNum < pageTexts.length; pageNum++) {
      const pageText = decodePDFText(pageTexts[pageNum]);
      if (pageText.trim()) {
        const pageChunks = await splitter.createDocuments([pageText]);
        chunks.push(
          ...pageChunks.map((chunk) => ({
            text: chunk.pageContent,
            metadata: {
              page: pageNum + 1,
              position: position++,
            },
          })),
        );
      } else {
        logger.warn(`Page ${pageNum + 1} produced no text after decoding`);
      }
    }

    if (chunks.length === 0) {
      logger.error("No chunks extracted", undefined, {
        pageCount: pageTexts.length,
      });
      throw new PDFProcessingError(
        "No text content extracted",
        PDF_ERROR_CODES.INVALID_FORMAT,
        "PDF appears to be empty or contains no extractable text",
      );
    }

    logger.debug("PDF processing completed", {
      pageCount: pageTexts.length,
      chunkCount: chunks.length,
    });

    return chunks;
  } catch (error) {
    if (error instanceof PDFProcessingError) {
      throw error;
    }
    logger.error(
      "Unexpected error",
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new PDFProcessingError(
      "Failed to process PDF",
      PDF_ERROR_CODES.UNKNOWN_ERROR,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

// Enhanced version with proper page tracking (same implementation since pdf2json already provides page info)
export const processPDFWithPages = processPDF;
