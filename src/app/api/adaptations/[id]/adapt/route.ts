import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { adaptResume } from "@/lib/llm";
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
      matchScore: true,
      resume: { select: { data: true } },
    },
  });
  if (!adaptation) {
    return NextResponse.json({ error: "Адаптация не найдена." }, { status: 404 });
  }

  const resumeData = adaptation.resume.data as ResumeData | null;
  const jobData = adaptation.jobData as JobData | null;
  if (!resumeData) {
    return NextResponse.json(
      { error: "Резюме ещё не разобрано — разберите его в разделе «Резюме»." },
      { status: 422 },
    );
  }
  if (!jobData) {
    return NextResponse.json(
      { error: "Вакансия не разобрана." },
      { status: 422 },
    );
  }

  try {
    const adaptedData = await adaptResume(resumeData, jobData);
    // Save the result as the current version and snapshot it into history.
    await prisma.$transaction([
      prisma.adaptation.update({
        where: { id: adaptation.id },
        data: { adaptedData },
      }),
      prisma.adaptationVersion.create({
        data: {
          adaptationId: adaptation.id,
          data: adaptedData,
          matchScore: adaptation.matchScore,
        },
      }),
    ]);
    return NextResponse.json({ adaptedData });
  } catch (err) {
    console.error("[adaptations/adapt] failed:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/429|quota|rate/i.test(msg)) {
      return NextResponse.json(
        { error: "Лимит бесплатного тира исчерпан. Попробуйте через минуту." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "Не удалось адаптировать резюме. Попробуйте ещё раз." },
      { status: 502 },
    );
  }
}
