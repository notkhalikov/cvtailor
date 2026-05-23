import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import SubscribeForm from "@/components/SubscribeForm";

/* ── Inline SVG icons (strokeWidth 1.5, no emoji) ───────────────── */
type IconProps = { className?: string };

function LinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function FileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5L14 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 3.5V8h4.5M9 13h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    Icon: LinkIcon,
    title: "Вставляете вакансию",
    body: "Ссылка или текст — система разбирает требования, стек и формулировки рекрутера.",
  },
  {
    n: "02",
    Icon: TargetIcon,
    title: "Считаем match score",
    body: "Видите процент соответствия и конкретные пробелы ещё до того, как нажмёте «откликнуться».",
  },
  {
    n: "03",
    Icon: FileIcon,
    title: "Забираете PDF",
    body: "ИИ переписывает блоки под вакансию, сохраняя ваш опыт. ATS-совместимый файл в один клик.",
  },
];

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-zinc-50">
      {/* ── Header ── */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <span className="text-[15px] font-semibold tracking-tight">
          CV<span className="text-emerald-400">·</span>Tailor
        </span>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/pricing"
            className="rounded-lg px-4 py-2 text-zinc-400 transition-colors hover:text-zinc-50"
          >
            Тарифы
          </Link>
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Войти
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 font-medium text-zinc-50 transition-all hover:border-zinc-700 active:scale-[0.98]"
            >
              Регистрация
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-zinc-400 transition-colors hover:text-zinc-50"
            >
              Кабинет
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      {/* ── Hero (split / asymmetric) ── */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-16 md:grid-cols-12 md:gap-8 md:pt-24">
        {/* left — content */}
        <div className="md:col-span-7">
          <span
            className="reveal inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-emerald-400"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Скоро запуск · ранний доступ
          </span>

          <h1
            className="reveal mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl md:text-6xl"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Резюме, заточенное
            <br />
            под <span className="text-emerald-400">каждую вакансию</span>
          </h1>

          <p
            className="reveal mt-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-zinc-400"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            CV Tailor берёт ваше резюме и вакансию — и собирает версию, которая
            бьёт точно в требования. Match score, разбор пробелов и чистый PDF.
            Без ручного переписывания.
          </p>

          <div
            className="reveal mt-9 max-w-lg"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <SubscribeForm />
          </div>
        </div>

        {/* right — product visual: match-score preview */}
        <div
          className="reveal md:col-span-5"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <ScoreCard />
        </div>
      </section>

      {/* ── How it works (border-grouped grid, no glow) ── */}
      <section className="mx-auto max-w-7xl border-t border-zinc-800 px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Три шага до отклика
          </h2>
          <span className="hidden font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 sm:block">
            how it works
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {STEPS.map(({ n, Icon, title, body }) => (
            <div
              key={n}
              className="flex flex-col gap-4 bg-zinc-950 p-7 transition-colors hover:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-emerald-400" />
                <span className="font-mono text-xs text-zinc-600">{n}</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-50">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mx-auto max-w-7xl border-t border-zinc-800 px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CV Tailor</span>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-600">
            резюме · вакансия · match
          </span>
        </div>
      </footer>
    </main>
  );
}

/* ── Match-score preview card ───────────────────────────────────── */
function ScoreCard() {
  const score = 87;
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  const gaps = [
    { label: "Kubernetes", state: "add" },
    { label: "5+ лет в финтехе", state: "ok" },
    { label: "A/B-эксперименты", state: "add" },
  ] as const;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          match score
        </span>
        <span className="rounded-md border border-zinc-800 px-2 py-1 font-mono text-[11px] text-zinc-400">
          Senior Product Analyst
        </span>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="#27272a"
              strokeWidth="7"
            />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="#34d399"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-medium text-emerald-400">
            {score}%
          </div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">
          Резюме <span className="text-zinc-50">Алины Ковалёвой</span> почти
          закрывает вакансию. Осталось подтянуть 2 пункта.
        </p>
      </div>

      <div className="mt-5 divide-y divide-zinc-800 border-t border-zinc-800">
        {gaps.map((g) => (
          <div
            key={g.label}
            className="flex items-center justify-between py-2.5"
          >
            <span className="text-sm text-zinc-300">{g.label}</span>
            {g.state === "ok" ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-400">
                есть
              </span>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                добавить
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
