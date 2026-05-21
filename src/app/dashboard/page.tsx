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

export default function ResumesPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          мастер-резюме
        </span>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Резюме
        </h1>
        <p className="mt-1 max-w-[60ch] text-sm text-zinc-400">
          Загрузите одно мастер-резюме — из него CV Tailor будет собирать версии
          под конкретные вакансии.
        </p>
      </div>

      {/* Empty state */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800 px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
          <UploadIcon className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-50">Пока нет резюме</h2>
          <p className="max-w-[42ch] text-sm text-zinc-400">
            Загрузите PDF — мы разберём его на блоки: опыт, навыки, summary.
          </p>
        </div>
        <button
          disabled
          className="mt-1 cursor-not-allowed rounded-xl bg-emerald-500/40 px-5 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Загрузить резюме · скоро
        </button>
      </div>
    </section>
  );
}
