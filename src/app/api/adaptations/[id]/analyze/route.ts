import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { analyzeMatch } from "@/lib/llm";
import type { ResumeData } from "@/lib/resume-schema";
import type { JobData } from "@/lib/job-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "ИИ-сервис не настроен (нет ключа GEMINI_API_KEY)." },
      { status: 503 },
    );
  }

  const adaptation = await prisma.adaptation.findFirst({
    where: { id: params.id, userId: user.id },
    select: {
      id: true,
      jobData: true,
      adaptedData: true,
      resume: { select: { data: true } },
    },
  });
  if (!adaptation) {
    return NextResponse.json({ error: "Адаптация не найдена." }, { status: 404 });
  }

  const jobData = adaptation.jobData as JobData | null;
  // Score the adapted version when available, otherwise the master resume.
  const resumeData =
    (adaptation.adaptedData as ResumeData | null) ??
    (adaptation.resume.data as ResumeData | null);

  if (!resumeData) {
    return NextResponse.json(
      { error: "Резюме ещё не разобрано." },
      { status: 422 },
    );
  }
  if (!jobData) {
    return NextResponse.json({ error: "Вакансия не разобрана." }, { status: 422 });
  }

  try {
    const { score, analysis } = await analyzeMatch(resumeData, jobData);
    await prisma.adaptation.update({
      where: { id: adaptation.id },
      data: { matchScore: score, gaps: analysis },
    });
    return NextResponse.json({ matchScore: score, analysis });
  } catch (err) {
    console.error("[adaptations/analyze] failed:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/429|quota|rate/i.test(msg)) {
      return NextResponse.json(
        { error: "Лимит бесплатного тира исчерпан. Попробуйте через минуту." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "Не удалось оценить соответствие. Попробуйте ещё раз." },
      { status: 502 },
    );
  }
}
