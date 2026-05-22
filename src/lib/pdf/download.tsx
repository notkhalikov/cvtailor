import type { ResumeData } from "@/lib/resume-schema";

export function sanitizeFileBase(name: string) {
  return (name.trim() || "resume")
    .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
    .slice(0, 60);
}

/**
 * Builds a Classic-template PDF from resume data and triggers a download.
 * react-pdf and the template are imported lazily so they stay out of the
 * initial bundle.
 */
export async function downloadClassicPdf(data: ResumeData, fileBase: string) {
  const [{ pdf }, { ClassicResume }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/ClassicResume"),
  ]);
  const blob = await pdf(<ClassicResume data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFileBase(fileBase)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
