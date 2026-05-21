import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  const name =
    user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "пользователь";

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-zinc-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-zinc-800 px-6 py-4">
        <span className="text-[15px] font-semibold tracking-tight">
          CV<span className="text-emerald-400">·</span>Tailor
        </span>
        <UserButton afterSignOutUrl="/" />
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          личный кабинет
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tighter md:text-4xl">
          Привет, {name}
        </h1>
        <p className="mt-3 max-w-[60ch] text-zinc-400">
          Скоро здесь появятся ваши резюме и адаптации под вакансии.
        </p>

        {/* Empty state (taste-skill: beautifully composed, shows how to populate) */}
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-zinc-800 p-10">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
            нет резюме
          </span>
          <p className="max-w-[48ch] text-zinc-400">
            Загрузите мастер-резюме — дальше CV Tailor будет собирать из него
            версии под конкретные вакансии.
          </p>
          <button
            disabled
            className="rounded-xl bg-emerald-500/40 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all active:scale-[0.98]"
          >
            Загрузить резюме · скоро
          </button>
        </div>
      </section>
    </main>
  );
}
