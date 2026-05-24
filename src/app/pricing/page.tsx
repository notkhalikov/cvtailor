import Link from "next/link";
import type { Metadata } from "next";
import { PricingTable } from "@clerk/nextjs";
import { FREE_MONTHLY_LIMIT } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Тарифы — CV Tailor",
  description: "Бесплатный тариф и Pro: безлимит адаптаций резюме под вакансии.",
};

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

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-12">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-emerald-400">
          тарифы
        </span>
        <h1 className="mt-4 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
          Начните бесплатно, переходите на Pro при активном поиске
        </h1>
        <p className="mt-4 max-w-[60ch] text-sm text-zinc-400">
          На бесплатном тарифе — {FREE_MONTHLY_LIMIT} адаптации в месяц. Pro
          снимает лимит. Оплата и управление подпиской — через Clerk.
        </p>

        <div className="mt-10">
          <PricingTable />
        </div>
      </section>
    </main>
  );
}
