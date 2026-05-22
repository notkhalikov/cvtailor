import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import TailoredManager from "@/components/dashboard/TailoredManager";

export const dynamic = "force-dynamic";

export default async function TailoredPage() {
  const user = await getOrCreateUser();

  const [resumeCount, adaptations] = user
    ? await Promise.all([
        prisma.resume.count({ where: { userId: user.id } }),
        prisma.adaptation.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            matchScore: true,
            createdAt: true,
            _count: { select: { versions: true } },
          },
        }),
      ])
    : [0, []];

  const initial = adaptations.map((a) => ({
    id: a.id,
    title: a.title,
    matchScore: a.matchScore,
    createdAt: a.createdAt.toISOString(),
    adapted: a._count.versions > 0,
  }));

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          версии под вакансии
        </span>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Адаптации
        </h1>
        <p className="mt-1 max-w-[60ch] text-sm text-zinc-400">
          Вставьте описание вакансии — разберём требования, дальше адаптируем
          резюме под них.
        </p>
      </div>

      <TailoredManager hasResume={resumeCount > 0} initial={initial} />
    </section>
  );
}
