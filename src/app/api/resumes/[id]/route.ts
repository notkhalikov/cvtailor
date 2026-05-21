import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import type { ResumeData } from "@/lib/resume-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  let body: { title?: string; data?: ResumeData };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const result = await prisma.resume.updateMany({
    where: { id: params.id, userId: user.id },
    data: {
      ...(typeof body.title === "string" && body.title.trim()
        ? { title: body.title.trim().slice(0, 120) }
        : {}),
      ...(body.data ? { data: body.data } : {}),
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Резюме не найдено." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  // Scope the delete to the owner so one user can't remove another's resume.
  const result = await prisma.resume.deleteMany({
    where: { id: params.id, userId: user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Резюме не найдено." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
