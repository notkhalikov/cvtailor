import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import type { JobData, MatchAnalysis } from "@/lib/job-schema";
import type { ResumeData } from "@/lib/resume-schema";
import AdaptPanel from "@/components/dashboard/AdaptPanel";
import MatchPanel from "@/components/dashboard/MatchPanel";
import VersionsPanel from "@/components/dashboard/VersionsPanel";
import PdfPreview from "@/components/dashboard/PdfPreview";

export const dynamic = "force-dynamic";

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h2 className="border-b border-zinc-800 pb-2 text-sm font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdaptationPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getOrCreateUser();
  const adaptation = user
    ? await prisma.adaptation.findFirst({
        where: { id: params.id, userId: user.id },
        select: {
          id: true,
          title: true,
          jobData: true,
          adaptedData: true,
          matchScore: true,
          gaps: true,
          updatedAt: true,
          resume: { select: { data: true, photo: true } },
          versions: {
            orderBy: { createdAt: "desc" },
            select: { id: true, matchScore: true, createdAt: true },
          },
        },
      })
    : null;

  if (!adaptation) notFound();

  const job = (adaptation.jobData as JobData | null) ?? null;
  const adapted = (adaptation.adaptedData as ResumeData | null) ?? null;
  const analysis = (adaptation.gaps as MatchAnalysis | null) ?? null;
  const resumeReady = !!adaptation.resume.data;

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/dashboard/tailored"
        className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        ← адаптации
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tighter md:text-3xl">
        {adaptation.title}
      </h1>

      {job && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] text-zinc-400">
          {job.location && (
            <span className="rounded-md border border-zinc-800 px-2 py-1">
              {job.location}
            </span>
          )}
          <span className="rounded-md border border-zinc-800 px-2 py-1">
            требований: {job.requirements.length}
          </span>
          <span className="rounded-md border border-zinc-800 px-2 py-1">
            навыков: {job.skills.length}
          </span>
        </div>
      )}

      {job?.summary && (
        <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-zinc-400">
          {job.summary}
        </p>
      )}

      {adapted && (
        <div className="mt-8">
          <PdfPreview
            data={adapted}
            fileBase="Адаптированное резюме"
            photo={adaptation.resume.photo}
          />
        </div>
      )}

      {job && (
        <div className="mt-8 flex flex-col gap-8">
          <List title="Обязательные требования" items={job.requirements} />
          <List title="Желательно" items={job.niceToHave} />
          <List title="Обязанности" items={job.responsibilities} />
          {job.skills.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="border-b border-zinc-800 pb-2 text-sm font-semibold tracking-tight text-zinc-50">
                Ключевые навыки
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <MatchPanel
        key={adaptation.updatedAt.toISOString()}
        id={adaptation.id}
        initialScore={adaptation.matchScore}
        initialAnalysis={analysis}
        resumeReady={resumeReady}
      />

      <AdaptPanel
        key={adaptation.updatedAt.toISOString()}
        id={adaptation.id}
        initialAdapted={adapted}
        resumeReady={resumeReady}
      />

      <VersionsPanel
        id={adaptation.id}
        versions={adaptation.versions.map((v) => ({
          id: v.id,
          matchScore: v.matchScore,
          createdAt: v.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
