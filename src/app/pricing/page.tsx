import Link from "next/link";
import type { Metadata } from "next";
import { FREE_MONTHLY_LIMIT } from "@/lib/plan";
import { PRO_PRICE_RUB, PLAN_FEATURES } from "@/lib/pricing";
import UpgradeButton from "@/components/UpgradeButton";

export const metadata: Metadata = {
  title: "Тарифы — CV Tailor",
  description: "Бесплатный тариф и Pro: безлимит адаптаций резюме под вакансии.",
};

function Check({ className }: { className?: string }) {
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

export default function PricingPage() {
  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-zinc-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          CV<span className="text-emerald-400">·</span>Tailor
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-50"
        >
          В кабинет
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-emerald-400">
          тарифы
        </span>
        <h1 className="mt-4 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
          Начните бесплатно, переходите на Pro при активном поиске
        </h1>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col gap-5 bg-zinc-950 p-8">
            <div>
              <h2 className="text-lg font-semibold">Free</h2>
              <p className="mt-1 font-mono text-sm text-zinc-500">для старта</p>
            </div>
            <p className="text-3xl font-semibold tracking-tight">
              0 ₽<span className="text-base font-normal text-zinc-500"> / мес</span>
            </p>
            <ul className="flex flex-col gap-2">
              {PLAN_FEATURES.free.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-2 w-fit rounded-xl border border-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-50"
            >
              Начать бесплатно
            </Link>
          </div>

          {/* Pro */}
          <div className="flex flex-col gap-5 bg-zinc-950 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-emerald-400">Pro</h2>
                <p className="mt-1 font-mono text-sm text-zinc-500">
                  для активного поиска
                </p>
              </div>
              <span className="rounded-md border border-emerald-500/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">
                популярный
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-tight">
              {PRO_PRICE_RUB} ₽
              <span className="text-base font-normal text-zinc-500"> / мес</span>
            </p>
            <ul className="flex flex-col gap-2">
              {PLAN_FEATURES.pro.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <UpgradeButton />
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          На бесплатном тарифе — {FREE_MONTHLY_LIMIT} адаптации в месяц. Лимит
          обновляется первого числа.
        </p>
      </section>
    </main>
  );
}
