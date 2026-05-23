import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { isStage } from "@/lib/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  let body: {
    stage?: string;
    company?: string;
    role?: string;
    link?: string | null;
    notes?: string | null;
    contactName?: string | null;
    contactInfo?: string | null;
    adaptationId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  // Only allow linking an adaptation the user owns; otherwise clear it.
  let adaptationId: string | null | undefined = undefined;
  if (body.adaptationId !== undefined) {
    if (!body.adaptationId) {
      adaptationId = null;
    } else {
      const owned = await prisma.adaptation.findFirst({
        where: { id: body.adaptationId, userId: user.id },
        select: { id: true },
      });
      adaptationId = owned ? owned.id : null;
    }
  }

  const result = await prisma.application.updateMany({
    where: { id: params.id, userId: user.id },
    data: {
      ...(isStage(body.stage) ? { stage: body.stage } : {}),
      ...(typeof body.company === "string"
        ? { company: body.company.trim().slice(0, 120) }
        : {}),
      ...(typeof body.role === "string"
        ? { role: body.role.trim().slice(0, 120) }
        : {}),
      ...(body.link !== undefined ? { link: body.link?.trim() || null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.contactName !== undefined
        ? { contactName: body.contactName }
        : {}),
      ...(body.contactInfo !== undefined
        ? { contactInfo: body.contactInfo }
        : {}),
      ...(adaptationId !== undefined ? { adaptationId } : {}),
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Отклик не найден." }, { status: 404 });
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
  const result = await prisma.application.deleteMany({
    where: { id: params.id, userId: user.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Отклик не найден." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
