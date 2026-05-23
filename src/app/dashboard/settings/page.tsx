import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user";
import { getUsage } from "@/lib/plan";
import PlanControl from "@/components/dashboard/PlanControl";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [clerk, dbUser] = await Promise.all([currentUser(), getOrCreateUser()]);
  const email = clerk?.emailAddresses[0]?.emailAddress ?? "—";
  const name =
    [clerk?.firstName, clerk?.lastName].filter(Boolean).join(" ") || "—";
  const plan = dbUser?.plan ?? "free";
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
          <dd>
            <PlanControl plan={plan} />
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-zinc-500">
        Управление профилем и выход — через меню аватара в правом верхнем углу.
      </p>
    </section>
  );
}
