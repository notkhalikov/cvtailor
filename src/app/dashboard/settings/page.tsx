import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "—";
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";

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
        <div className="flex items-center justify-between py-4">
          <dt className="text-sm text-zinc-400">Тариф</dt>
          <dd className="flex items-center gap-2 text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">
              Free
            </span>
            <span className="text-zinc-500">3 адаптации / мес</span>
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-zinc-500">
        Управление профилем и выход — через меню аватара в правом верхнем углу.
      </p>
    </section>
  );
}
