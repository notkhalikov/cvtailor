import { extractText, getDocumentProxy } from "unpdf";

/**
 * Extracts plain text from a PDF buffer using unpdf (a serverless-friendly
 * pdf.js build — no native canvas dependency). Returns the concatenated text
 * and the page count.
 */
export async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; pages: number }> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: true });
  return {
    text: text.replace(/\n{3,}/g, "\n\n").trim(),
    pages: totalPages,
  };
}
