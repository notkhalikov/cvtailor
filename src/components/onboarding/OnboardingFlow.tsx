"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 4 * 1024 * 1024;

function LogoMark() {
  return (
    <span className="text-[15px] font-semibold tracking-tight">
      CV<span className="text-emerald-400">·</span>Tailor
    </span>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OnboardingFlow({
  firstName,
}: {
  firstName: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 welcome · 1 upload · 2 done
  const [uploading, setUploading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function complete() {
    setFinishing(true);
    try {
      await fetch("/api/onboarding/complete", { method: "POST" });
    } catch {
      // Non-fatal: the dashboard re-checks and will redirect back if needed.
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function upload(file: File) {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Поддерживается только PDF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Файл больше 4 МБ. Сожмите PDF и попробуйте снова.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/resumes", { method: "POST", body });
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
      // Parsing kicks off in the dashboard; here we just advance.
      setStep(2);
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center justify-between">
        <LogoMark />
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-emerald-400"
                  : i < step
                    ? "w-1.5 bg-emerald-400"
                    : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="reveal flex flex-col gap-5">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-emerald-400">
            добро пожаловать
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tighter">
            Привет{firstName ? `, ${firstName}` : ""} — соберём резюме под
            каждую вакансию
          </h1>
          <p className="text-zinc-400">
            Загрузите одно мастер-резюме. Дальше CV Tailor разберёт его на блоки
            и будет собирать версии под конкретные вакансии: match score,
            разбор пробелов и чистый PDF.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {[
              "Загрузка и автоматический разбор PDF",
              "Адаптация под вакансию (скоро)",
              "Экспорт в ATS-совместимый PDF (скоро)",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                {t}
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-3 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
          >
            Начать
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="reveal flex flex-col gap-5">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-emerald-400">
            шаг 1 из 1
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tighter">
            Загрузите мастер-резюме
          </h1>
          <p className="text-zinc-400">
            PDF до 4 МБ. Текст разберём автоматически — редактировать можно
            будет потом.
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) upload(f);
            }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800 px-6 py-10 text-center transition-colors hover:border-zinc-700"
          >
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
            <p className="text-sm text-zinc-400">
              Перетащите PDF сюда или выберите файл
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Загружаем…" : "Выбрать PDF"}
            </button>
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </div>

          <button
            onClick={complete}
            disabled={finishing || uploading}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-60"
          >
            Сделаю позже →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="reveal flex flex-col items-start gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <CheckIcon className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tighter">
            Резюме загружено
          </h1>
          <p className="text-zinc-400">
            Мы уже разбираем его на блоки. В кабинете увидите структуру —
            опыт, навыки и summary.
          </p>
          <button
            onClick={complete}
            disabled={finishing}
            className="mt-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
          >
            {finishing ? "Открываем…" : "Перейти в кабинет"}
          </button>
        </div>
      )}
    </div>
  );
}
