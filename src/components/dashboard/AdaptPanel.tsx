"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ResumeData } from "@/lib/resume-schema";
import PdfDownloadButton from "@/components/dashboard/PdfDownloadButton";
import PdfPreview from "@/components/dashboard/PdfPreview";

export default function AdaptPanel({
  id,
  initialAdapted,
  resumeReady,
}: {
  id: string;
  initialAdapted: ResumeData | null;
  resumeReady: boolean;
}) {
  const router = useRouter();
  const [adapted, setAdapted] = useState<ResumeData | null>(initialAdapted);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setRunning(true);
    setError("");
    try {
      const res = await fetch(`/api/adaptations/${id}/adapt`, {
        method: "POST",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? `Не удалось адаптировать (ошибка ${res.status}).`);
        return;
      }
      setAdapted(body.adaptedData);
      // Refresh server data so the match score / versions reflect the rewrite.
      router.refresh();
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setRunning(false);
    }
  }

  if (!resumeReady) {
    return (
      <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-zinc-800 px-5 py-6">
        <p className="text-sm text-zinc-400">
          Резюме ещё не разобрано. Разберите его в разделе «Резюме», затем
          вернитесь и адаптируйте под вакансию.
        </p>
        <Link
          href="/dashboard"
          className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
        >
          К резюме
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-50">
          Адаптированное резюме
        </h2>
        <div className="flex items-center gap-2">
          {adapted && (
            <PdfDownloadButton
              data={adapted}
              fileBase="Адаптированное резюме"
              variant="outline"
            />
          )}
          <button
            onClick={run}
            disabled={running}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running
              ? "Адаптируем…"
              : adapted
                ? "Адаптировать заново"
                : "Адаптировать под вакансию"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {!adapted && !running && (
        <p className="text-sm text-zinc-500">
          ИИ перепишет summary и достижения под требования этой вакансии, не
          выдумывая фактов.
        </p>
      )}

      {adapted && <AdaptedView data={adapted} />}

      {adapted && <PdfPreview data={adapted} />}
    </div>
  );
}

function AdaptedView({ data }: { data: ResumeData }) {
  return (
    <div className="flex flex-col gap-6">
      {data.summary && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            summary
          </span>
          <p className="max-w-[70ch] text-sm leading-relaxed text-zinc-300">
            {data.summary}
          </p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            опыт
          </span>
          {data.experience.map((exp, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-medium text-zinc-50">{exp.role}</span>
                <span className="text-zinc-400">{exp.company}</span>
                {exp.period && (
                  <span className="font-mono text-xs text-zinc-600">
                    {exp.period}
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {exp.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            навыки
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
