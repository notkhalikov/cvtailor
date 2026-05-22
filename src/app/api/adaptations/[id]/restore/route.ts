import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  let body: { versionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }
  if (!body.versionId) {
    return NextResponse.json({ error: "Не указана версия." }, { status: 400 });
  }

  // Ensure both the adaptation and the version belong to the user.
  const adaptation = await prisma.adaptation.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!adaptation) {
    return NextResponse.json({ error: "Адаптация не найдена." }, { status: 404 });
  }

  const version = await prisma.adaptationVersion.findFirst({
    where: { id: body.versionId, adaptationId: adaptation.id },
    select: { data: true },
  });
  if (!version) {
    return NextResponse.json({ error: "Версия не найдена." }, { status: 404 });
  }

  await prisma.adaptation.update({
    where: { id: adaptation.id },
    data: { adaptedData: version.data as Prisma.InputJsonValue },
  });

  return NextResponse.json({ ok: true });
}
