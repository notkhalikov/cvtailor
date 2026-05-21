"use client";

import { useRef, useState } from "react";
import type { ResumeData } from "@/lib/resume-schema";

export type ResumeItem = {
  id: string;
  title: string;
  createdAt: string;
  data: ResumeData | null;
};

// Effective ceiling: Vercel serverless body limit (~4.5 MB), kept at 4 MB.
const MAX_BYTES = 4 * 1024 * 1024;

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 15V4m0 0L8 8m4-4 4 4M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7m2 0v11.5A1.5 1.5 0 0 1 14.5 20h-5A1.5 1.5 0 0 1 8 18.5V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ResumeManager({
  initial,
}: {
  initial: ResumeItem[];
}) {
  const [resumes, setResumes] = useState<ResumeItem[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [parseError, setParseError] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  async function parse(id: string) {
    setParsingId(id);
    setParseError((p) => ({ ...p, [id]: "" }));
    try {
      const res = await fetch(`/api/resumes/${id}/parse`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setParseError((p) => ({
          ...p,
          [id]: body?.error ?? `Не удалось разобрать (ошибка ${res.status}).`,
        }));
        return;
      }
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, data: body.data } : r)),
      );
    } catch {
      setParseError((p) => ({ ...p, [id]: "Сеть недоступна." }));
    } finally {
      setParsingId(null);
    }
  }

  async function upload(file: File) {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Поддерживается только PDF.");
      return;
    }
    // Vercel serverless functions reject request bodies larger than ~4.5 MB
    // at the platform edge, so guard client-side before the upload.
    if (file.size > MAX_BYTES) {
      setError("Файл больше 4 МБ. Сожмите PDF и попробуйте снова.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/resumes", { method: "POST", body });

      // The platform may return a non-JSON error (e.g. 413) before our handler.
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error ??
            (res.status === 413
              ? "Файл слишком большой (лимит ~4 МБ)."
              : `Не удалось загрузить файл (ошибка ${res.status}).`),
        );
        return;
      }
      const item: ResumeItem = { ...data.resume, data: null };
      setResumes((prev) => [item, ...prev]);
      // Kick off structured parsing right away.
      parse(item.id);
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Не удалось удалить.");
        return;
      }
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center transition-colors hover:border-zinc-700"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
          <UploadIcon className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-50">
            {resumes.length ? "Загрузить ещё резюме" : "Загрузите резюме"}
          </h2>
          <p className="max-w-[44ch] text-sm text-zinc-400">
            Перетащите PDF сюда или выберите файл. Текст разберём автоматически.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Загружаем…" : "Выбрать PDF"}
        </button>
        <p className="font-mono text-xs text-zinc-500">PDF, до 4 МБ</p>
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>

      {/* List */}
      {resumes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {resumes.map((r) => {
            const parsing = parsingId === r.id;
            return (
              <li
                key={r.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-50">
                      {r.title}
                    </p>
                    <p className="font-mono text-xs text-zinc-500">
                      загружено {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {r.data ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">
                        разобрано
                      </span>
                    ) : (
                      <button
                        onClick={() => parse(r.id)}
                        disabled={parsing}
                        className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-60"
                      >
                        {parsing ? "Разбираем…" : "Разобрать"}
                      </button>
                    )}
                    {r.data && (
                      <button
                        onClick={() => parse(r.id)}
                        disabled={parsing}
                        className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-50 disabled:opacity-60"
                      >
                        {parsing ? "…" : "Заново"}
                      </button>
                    )}
                    <button
                      onClick={() => remove(r.id)}
                      disabled={deletingId === r.id}
                      aria-label="Удалить резюме"
                      className="rounded-lg border border-zinc-800 p-2 text-zinc-500 transition-colors hover:border-rose-500/40 hover:text-rose-400 disabled:opacity-50"
                    >
                      <TrashIcon className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>

                {parseError[r.id] && (
                  <p className="border-t border-zinc-800 px-5 py-3 text-sm text-rose-400">
                    {parseError[r.id]}
                  </p>
                )}

                {r.data && <ParsedPreview data={r.data} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ParsedPreview({ data }: { data: ResumeData }) {
  return (
    <div className="border-t border-zinc-800 px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {data.fullName && (
          <span className="text-sm font-medium text-zinc-50">
            {data.fullName}
          </span>
        )}
        {data.title && (
          <span className="text-sm text-zinc-400">{data.title}</span>
        )}
      </div>

      {data.summary && (
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-zinc-400">
          {data.summary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] text-zinc-400">
        <span className="rounded-md border border-zinc-800 px-2 py-1">
          опыт: {data.experience.length}
        </span>
        <span className="rounded-md border border-zinc-800 px-2 py-1">
          навыки: {data.skills.length}
        </span>
        <span className="rounded-md border border-zinc-800 px-2 py-1">
          образование: {data.education.length}
        </span>
      </div>

      {data.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.skills.slice(0, 12).map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            >
              {s}
            </span>
          ))}
          {data.skills.length > 12 && (
            <span className="px-2 py-1 text-xs text-zinc-500">
              +{data.skills.length - 12}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
