import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user";
import { getUsage, getPlan } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [clerk, dbUser, plan] = await Promise.all([
    currentUser(),
    getOrCreateUser(),
    getPlan(),
  ]);
  const email = clerk?.emailAddresses[0]?.emailAddress ?? "—";
  const name =
    [clerk?.firstName, clerk?.lastName].filter(Boolean).join(" ") || "—";
  const usage = dbUser ? await getUsage(dbUser.id, plan) : null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          аккаунт
        </span>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Настройки
        </h1>
      </div>

      <dl className="mt-8 divide-y divide-zinc-800 border-y border-zinc-800">
        <div className="flex items-center justify-between py-4">
          <dt className="text-sm text-zinc-400">Имя</dt>
          <dd className="text-sm text-zinc-50">{name}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-sm text-zinc-400">Email</dt>
          <dd className="text-sm text-zinc-50">{email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <dt className="text-sm text-zinc-400">
            Тариф
            {usage && (
              <span className="ml-2 font-mono text-xs text-zinc-600">
                {usage.limit === null
                  ? "безлимит"
                  : `${usage.used} из ${usage.limit} в этом месяце`}
              </span>
            )}
          </dt>
          <dd className="flex items-center gap-3">
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.12em] ${plan === "pro" ? "text-emerald-400" : "text-zinc-400"}`}
            >
              {plan === "pro" ? "Pro" : "Free"}
            </span>
            <Link
              href="/pricing"
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
            >
              {plan === "pro" ? "Управление" : "Перейти на Pro"}
            </Link>
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-zinc-500">
        Управление профилем и выход — через меню аватара в правом верхнем углу.
      </p>
    </section>
  );
}
