import { PDFParse } from "pdf-parse";

/**
 * Extracts plain text from a PDF buffer using pdf-parse v2.
 * Returns the concatenated text and the page count.
 */
export async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; pages: number }> {
  const parser = new PDFParse({ data: buffer });
  try {
    // Default pageJoiner injects a "-- N of M --" footer between pages; use a
    // plain blank-line separator and collapse runs of 3+ newlines.
    const result = await parser.getText({ pageJoiner: "\n\n" });
    const text = result.text.replace(/\n{3,}/g, "\n\n").trim();
    return { text, pages: result.pages.length };
  } finally {
    await parser.destroy();
  }
}
