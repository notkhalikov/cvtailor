import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { parseJobText } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
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

  let body: { resumeId?: string; jobText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const jobText = body.jobText?.trim() ?? "";
  if (jobText.length < 40) {
    return NextResponse.json(
      { error: "Вставьте текст вакансии (минимум несколько строк)." },
      { status: 400 },
    );
  }

  // Pick the target resume — explicit, or the user's most recent one.
  const resume = body.resumeId
    ? await prisma.resume.findFirst({
        where: { id: body.resumeId, userId: user.id },
        select: { id: true },
      })
    : await prisma.resume.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
  if (!resume) {
    return NextResponse.json(
      { error: "Сначала загрузите резюме." },
      { status: 400 },
    );
  }

  let jobData;
  try {
    jobData = await parseJobText(jobText);
  } catch (err) {
    console.error("[adaptations] JD parse failed:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/429|quota|rate/i.test(msg)) {
      return NextResponse.json(
        { error: "Лимит бесплатного тира исчерпан. Попробуйте через минуту." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error: "Не удалось разобрать вакансию. Попробуйте ещё раз.",
        detail: msg.slice(0, 200),
      },
      { status: 502 },
    );
  }

  const title =
    [jobData.jobTitle, jobData.company].filter(Boolean).join(" · ") ||
    "Адаптация";

  const adaptation = await prisma.adaptation.create({
    data: {
      userId: user.id,
      resumeId: resume.id,
      title: title.slice(0, 120),
      jobText,
      jobData,
    },
    select: { id: true, title: true, createdAt: true },
  });

  return NextResponse.json({ adaptation }, { status: 201 });
}
