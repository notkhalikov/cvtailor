import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import ResumeManager from "@/components/dashboard/ResumeManager";

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const user = await getOrCreateUser();
  const resumes = user
    ? await prisma.resume.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      })
    : [];

  const initial = resumes.map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          мастер-резюме
        </span>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Резюме
        </h1>
        <p className="mt-1 max-w-[60ch] text-sm text-zinc-400">
          Загрузите PDF — из него CV Tailor будет собирать версии под конкретные
          вакансии.
        </p>
      </div>

      <ResumeManager initial={initial} />
    </section>
  );
}
