"use client";

import { useState } from "react";
import Link from "next/link";

export type AdaptationItem = {
  id: string;
  title: string;
  matchScore: number | null;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
        setError(body?.error ?? `Не удалось создать (ошибка ${res.status}).`);
        return;
      }
      setItems((prev) => [{ ...body.adaptation, matchScore: null }, ...prev]);
      setJobText("");
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setCreating(false);
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
          className="min-h-[160px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm leading-relaxed text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={create}
            disabled={creating}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Разбираем вакансию…" : "Разобрать вакансию"}
          </button>
          <span className="font-mono text-[11px] text-zinc-600">
            адаптация резюме под JD — на следующем шаге
          </span>
        </div>
      </div>

      {/* List */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/dashboard/tailored/${a.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-50">
                    {a.title}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    {formatDate(a.createdAt)}
                  </p>
                </div>
                {typeof a.matchScore === "number" ? (
                  <span className="shrink-0 font-mono text-sm text-emerald-400">
                    {a.matchScore}%
                  </span>
                ) : (
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-600">
                    открыть →
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
