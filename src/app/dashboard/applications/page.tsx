import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import ApplicationsBoard from "@/components/dashboard/ApplicationsBoard";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getOrCreateUser();
  const apps = user
    ? await prisma.application.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          company: true,
          role: true,
          link: true,
          stage: true,
          createdAt: true,
        },
      })
    : [];

  const initial = apps.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    link: a.link,
    stage: a.stage,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          трекер откликов
        </span>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Отклики
        </h1>
        <p className="mt-1 max-w-[60ch] text-sm text-zinc-400">
          Ведите вакансии по этапам — от «Хочу» до «Оффер». Перетаскивайте
          карточки между колонками.
        </p>
      </div>

      <div className="mt-8">
        <ApplicationsBoard initial={initial} />
      </div>
    </section>
  );
}
