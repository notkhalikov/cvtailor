"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ResumeData } from "@/lib/resume-schema";

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
  height = 640,
  defaultOpen = false,
}: {
  data: ResumeData;
  height?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Debounce so live edits don't regenerate the PDF on every keystroke.
  const [debounced, setDebounced] = useState(data);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(data), 500);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-50">
          Предпросмотр PDF
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:text-emerald-400"
        >
          {open ? "скрыть" : "показать"}
        </button>
      </div>
      {open && (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <Inner data={debounced} height={height} />
        </div>
      )}
    </div>
  );
}
