export const PDF_CONFIG = {
  version: "3.4.120",
  get workerUrl() {
    return `https://unpkg.com/pdfjs-dist@${this.version}/build/pdf.worker.min.js`;
  },
} as const;
