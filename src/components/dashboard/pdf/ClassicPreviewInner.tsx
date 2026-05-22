import { PDFViewer } from "@react-pdf/renderer";
import { ClassicResume } from "@/lib/pdf/ClassicResume";
import type { ResumeData } from "@/lib/resume-schema";

// Bundled together so react-pdf lives in a single lazily-loaded chunk.
export default function ClassicPreviewInner({
  data,
  height,
}: {
  data: ResumeData;
  height: number;
}) {
  return (
    <PDFViewer
      showToolbar={false}
      style={{ width: "100%", height, border: "none", borderRadius: 12 }}
    >
      <ClassicResume data={data} />
    </PDFViewer>
  );
}
