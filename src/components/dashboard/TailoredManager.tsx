"use client";

import { useState } from "react";
import Link from "next/link";

export type AdaptationItem = {
  id: string;
  title: string;
  matchScore: number | null;
  createdAt: string;
  adapted: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ScoreRing({ score }: { score: number | null }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = score ?? 0;
  const offset = c - (pct / 100) * c;
  const color =
    score === null
      ? "#3f3f46"
      : score >= 75
        ? "#34d399"
        : score >= 50
          ? "#fbbf24"
          : "#fb7185";
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#27272a" strokeWidth="5" />
        {score !== null && (
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-mono text-xs font-medium"
        style={{ color: score === null ? "#52525b" : color }}
      >
        {score === null ? "—" : `${score}%`}
      </div>
    </div>
  );
}

export default function TailoredManager({
  hasResume,
  initial,
}: {
  hasResume: boolean;
  initial: AdaptationItem[];
}) {
  const [items, setItems] = useState<AdaptationItem[]>(initial);
  const [jobText, setJobText] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [adaptingId, setAdaptingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  async function create() {
    setError("");
    if (jobText.trim().length < 40) {
      setError("Вставьте текст вакансии (минимум несколько строк).");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/adaptations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          (body?.error ?? `Не удалось создать (ошибка ${res.status}).`) +
            (body?.detail ? ` (${body.detail})` : ""),
        );
        return;
      }
      setItems((prev) => [
        { ...body.adaptation, matchScore: null, adapted: false },
        ...prev,
      ]);
      setJobText("");
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setCreating(false);
    }
  }

  async function adapt(id: string) {
    setAdaptingId(id);
    setRowError((p) => ({ ...p, [id]: "" }));
    try {
      const res = await fetch(`/api/adaptations/${id}/adapt`, {
        method: "POST",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setRowError((p) => ({
          ...p,
          [id]:
            (body?.error ?? `Ошибка ${res.status}.`) +
            (body?.detail ? ` (${body.detail})` : ""),
        }));
        return;
      }
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, adapted: true } : it)),
      );
    } catch {
      setRowError((p) => ({ ...p, [id]: "Сеть недоступна." }));
    } finally {
      setAdaptingId(null);
    }
  }

  if (!hasResume) {
    return (
      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-zinc-800 px-6 py-10">
        <p className="text-sm text-zinc-400">
          Чтобы адаптировать резюме под вакансию, сначала загрузите мастер-резюме.
        </p>
        <Link
          href="/dashboard"
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
        >
          К резюме
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* New adaptation */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          новая адаптация
        </span>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Вставьте сюда описание вакансии целиком — требования, обязанности, стек…"
          className="min-h-[140px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm leading-relaxed text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          onClick={create}
          disabled={creating}
          className="w-fit rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Разбираем вакансию…" : "Разобрать вакансию"}
        </button>
      </div>

      {/* List of adaptation tiles */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <ScoreRing score={a.matchScore} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-50">
                      {a.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500">
                        {formatDate(a.createdAt)}
                      </span>
                      {a.adapted && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">
                          адаптировано
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => adapt(a.id)}
                    disabled={adaptingId === a.id}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {adaptingId === a.id
                      ? "Адаптируем…"
                      : a.adapted
                        ? "Заново"
                        : "Адаптировать"}
                  </button>
                  <Link
                    href={`/dashboard/tailored/${a.id}`}
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-50"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
              {rowError[a.id] && (
                <p className="mt-3 text-sm text-rose-400">{rowError[a.id]}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
