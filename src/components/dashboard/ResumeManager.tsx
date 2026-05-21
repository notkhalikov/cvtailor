"use client";

import { useRef, useState } from "react";

export type ResumeItem = {
  id: string;
  title: string;
  createdAt: string;
};

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
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Поддерживается только PDF.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/resumes", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось загрузить файл.");
        return;
      }
      setResumes((prev) => [data.resume, ...prev]);
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
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>

      {/* List */}
      {resumes.length > 0 && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
          {resumes.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-4 bg-zinc-950 px-5 py-4 transition-colors hover:bg-zinc-900/40"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-50">
                  {r.title}
                </p>
                <p className="font-mono text-xs text-zinc-500">
                  загружено {formatDate(r.createdAt)}
                </p>
              </div>
              <button
                onClick={() => remove(r.id)}
                disabled={deletingId === r.id}
                aria-label="Удалить резюме"
                className="shrink-0 rounded-lg border border-zinc-800 p-2 text-zinc-500 transition-colors hover:border-rose-500/40 hover:text-rose-400 disabled:opacity-50"
              >
                <TrashIcon className="h-[18px] w-[18px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
