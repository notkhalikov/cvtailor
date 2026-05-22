"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type VersionItem = {
  id: string;
  matchScore: number | null;
  createdAt: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VersionsPanel({
  id,
  versions,
}: {
  id: string;
  versions: VersionItem[];
}) {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (versions.length === 0) return null;

  async function restore(versionId: string) {
    setRestoringId(versionId);
    setError("");
    try {
      const res = await fetch(`/api/adaptations/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        setError(b?.error ?? `Не удалось восстановить (ошибка ${res.status}).`);
        return;
      }
      router.refresh();
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <h2 className="border-b border-zinc-800 pb-2 text-sm font-semibold tracking-tight text-zinc-50">
        История версий
      </h2>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <ul className="flex flex-col gap-2">
        {versions.map((v, i) => (
          <li
            key={v.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                {i === 0 ? "последняя" : `версия ${versions.length - i}`}
              </span>
              <span className="text-sm text-zinc-300">
                {formatDateTime(v.createdAt)}
              </span>
              {typeof v.matchScore === "number" && (
                <span className="font-mono text-xs text-emerald-400">
                  {v.matchScore}%
                </span>
              )}
            </div>
            <button
              onClick={() => restore(v.id)}
              disabled={restoringId === v.id}
              className="shrink-0 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-60"
            >
              {restoringId === v.id ? "…" : "Восстановить"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
