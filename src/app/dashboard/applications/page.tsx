import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import ApplicationsBoard from "@/components/dashboard/ApplicationsBoard";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getOrCreateUser();
  const [apps, adaptations] = user
    ? await Promise.all([
        prisma.application.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            company: true,
            role: true,
            link: true,
            stage: true,
            notes: true,
            contactName: true,
            contactInfo: true,
            adaptationId: true,
            adaptation: { select: { title: true } },
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.adaptation.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true },
        }),
      ])
    : [[], []];

  const initial = apps.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    link: a.link,
    stage: a.stage,
    notes: a.notes,
    contactName: a.contactName,
    contactInfo: a.contactInfo,
    adaptationId: a.adaptationId,
    adaptationTitle: a.adaptation?.title ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
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
        <ApplicationsBoard initial={initial} adaptations={adaptations} />
      </div>
    </section>
  );
}
