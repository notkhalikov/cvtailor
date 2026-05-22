import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import type { ResumeData } from "@/lib/resume-schema";
import ResumeEditor from "@/components/dashboard/ResumeEditor";

export const dynamic = "force-dynamic";

export default async function ResumeEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getOrCreateUser();
  const resume = user
    ? await prisma.resume.findFirst({
        where: { id: params.id, userId: user.id },
        select: {
          id: true,
          title: true,
          data: true,
          originalData: true,
          photo: true,
        },
      })
    : null;

  if (!resume) notFound();

  const data = (resume.data as ResumeData | null) ?? null;
  const originalData = (resume.originalData as ResumeData | null) ?? null;

  if (!data) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← резюме
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {resume.title}
        </h1>
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 px-6 py-10 text-sm text-zinc-400">
          Резюме ещё не разобрано. Вернитесь в список и нажмите «Разобрать» —
          после этого появится редактор блоков.
        </div>
      </section>
    );
  }

  return (
    <ResumeEditor
      id={resume.id}
      title={resume.title}
      initialData={data}
      originalData={originalData}
      initialPhoto={resume.photo}
    />
  );
}
