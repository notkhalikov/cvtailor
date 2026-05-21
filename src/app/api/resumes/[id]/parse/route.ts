import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { parseResumeText } from "@/lib/anthropic";

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

  const resume = await prisma.resume.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true, originalText: true },
  });
  if (!resume) {
    return NextResponse.json({ error: "Резюме не найдено." }, { status: 404 });
  }
  if (!resume.originalText) {
    return NextResponse.json(
      { error: "У резюме нет текста для разбора." },
      { status: 422 },
    );
  }

  try {
    const data = await parseResumeText(resume.originalText);
    await prisma.resume.update({
      where: { id: resume.id },
      data: { data },
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[resumes/parse] failed:", err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "ИИ-сервис не настроен (нет ключа). Зайдите позже." },
        { status: 503 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Слишком много запросов к ИИ. Попробуйте через минуту." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "Не удалось разобрать резюме. Попробуйте ещё раз." },
      { status: 502 },
    );
  }
}
