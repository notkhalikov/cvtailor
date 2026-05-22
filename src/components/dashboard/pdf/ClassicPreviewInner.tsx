import { PDFViewer } from "@react-pdf/renderer";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";
import type { ResumeData } from "@/lib/resume-schema";
import type { Design } from "@/lib/pdf/design";

// Bundled together so react-pdf lives in a single lazily-loaded chunk.
export default function ClassicPreviewInner({
  data,
  design,
  height,
}: {
  data: ResumeData;
  design: Design;
  height: number;
}) {
  return (
    <PDFViewer
      showToolbar={false}
      style={{ width: "100%", height, border: "none", borderRadius: 12 }}
    >
      <ResumeDocument data={data} design={design} />
    </PDFViewer>
  );
}
