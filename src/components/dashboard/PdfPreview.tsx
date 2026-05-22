"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ResumeData } from "@/lib/resume-schema";
import { type Design, DEFAULT_DESIGN } from "@/lib/pdf/design";
import { downloadResumePdf } from "@/lib/pdf/download";
import DesignPicker from "@/components/dashboard/DesignPicker";

const Inner = dynamic(
  () => import("@/components/dashboard/pdf/ClassicPreviewInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        Готовим предпросмотр…
      </div>
    ),
  },
);

export default function PdfPreview({
  data,
  fileBase,
  height = 640,
}: {
  data: ResumeData;
  fileBase: string;
  height?: number;
}) {
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Debounce so live edits don't regenerate the PDF on every keystroke.
  const [debounced, setDebounced] = useState(data);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(data), 500);
    return () => clearTimeout(t);
  }, [data]);

  async function download() {
    setBusy(true);
    try {
      await downloadResumePdf(data, fileBase, design);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-50">
          PDF
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-50"
          >
            {open ? "Скрыть превью" : "Превью"}
          </button>
          <button
            onClick={download}
            disabled={busy}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Готовим…" : "Скачать PDF"}
          </button>
        </div>
      </div>

      <DesignPicker design={design} onChange={setDesign} />

      {open && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <Inner data={debounced} design={design} height={height} />
        </div>
      )}
    </div>
  );
}
