"use client";

import { useState } from "react";
import type { ResumeData } from "@/lib/resume-schema";
import { downloadClassicPdf } from "@/lib/pdf/download";

export default function PdfDownloadButton({
  data,
  fileBase,
  variant = "solid",
}: {
  data: ResumeData;
  fileBase: string;
  variant?: "solid" | "outline";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    try {
      await downloadClassicPdf(data, fileBase);
    } catch {
      setError("Не удалось собрать PDF.");
    } finally {
      setBusy(false);
    }
  }

  const cls =
    variant === "solid"
      ? "rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
      : "rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-60";

  return (
    <div className="flex items-center gap-3">
      <button onClick={download} disabled={busy} className={cls}>
        {busy ? "Готовим PDF…" : "Скачать PDF"}
      </button>
      {error && <span className="text-sm text-rose-400">{error}</span>}
    </div>
  );
}
