import type { ResumeData } from "@/lib/resume-schema";
import { type Design, DEFAULT_DESIGN } from "@/lib/pdf/design";

export function sanitizeFileBase(name: string) {
  return (name.trim() || "resume")
    .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
    .slice(0, 60);
}

/**
 * Builds a PDF (chosen template + accent) from resume data and triggers a
 * download. react-pdf and the templates load lazily.
 */
export async function downloadResumePdf(
  data: ResumeData,
  fileBase: string,
  design: Design = DEFAULT_DESIGN,
) {
  const [{ pdf }, { ResumeDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/ResumeDocument"),
  ]);
  const blob = await pdf(<ResumeDocument data={data} design={design} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFileBase(fileBase)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
