"use client";

import { useState } from "react";
import type { MatchAnalysis, GapSeverity } from "@/lib/job-schema";

function ScoreRing({ score }: { score: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#27272a" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-mono text-xl font-medium"
        style={{ color }}
      >
        {score}%
      </div>
    </div>
  );
}

const sevMeta: Record<GapSeverity, { label: string; cls: string }> = {
  high: { label: "критично", cls: "border-rose-500/40 text-rose-400" },
  medium: { label: "важно", cls: "border-amber-500/40 text-amber-400" },
  low: { label: "желательно", cls: "border-zinc-700 text-zinc-400" },
};

export default function MatchPanel({
  id,
  initialScore,
  initialAnalysis,
  resumeReady,
}: {
  id: string;
  initialScore: number | null;
  initialAnalysis: MatchAnalysis | null;
  resumeReady: boolean;
}) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(
    initialAnalysis,
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setRunning(true);
    setError("");
    try {
      const res = await fetch(`/api/adaptations/${id}/analyze`, {
        method: "POST",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? `Не удалось оценить (ошибка ${res.status}).`);
        return;
      }
      setScore(body.matchScore);
      setAnalysis(body.analysis);
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-50">
          Соответствие вакансии
        </h2>
        <button
          onClick={run}
          disabled={running || !resumeReady}
          className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running
            ? "Оцениваем…"
            : score !== null
              ? "Пересчитать"
              : "Оценить соответствие"}
        </button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {!resumeReady && (
        <p className="text-sm text-zinc-500">
          Сначала разберите резюме в разделе «Резюме».
        </p>
      )}

      {score !== null && analysis && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <ScoreRing score={score} />
            {analysis.verdict && (
              <p className="text-sm leading-relaxed text-zinc-300">
                {analysis.verdict}
              </p>
            )}
          </div>

          {analysis.strengths.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                сильные стороны
              </span>
              <ul className="flex flex-col gap-1">
                {analysis.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.gaps.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                чего не хватает
              </span>
              <div className="flex flex-col gap-2">
                {analysis.gaps.map((g, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-50">
                        {g.title}
                      </span>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${sevMeta[g.severity].cls}`}
                      >
                        {sevMeta[g.severity].label}
                      </span>
                    </div>
                    {g.suggestion && (
                      <p className="mt-1.5 text-sm text-zinc-400">
                        {g.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
