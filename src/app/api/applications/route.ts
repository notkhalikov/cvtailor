import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { isStage } from "@/lib/applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  let body: { company?: string; role?: string; link?: string; stage?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const company = (body.company ?? "").trim().slice(0, 120);
  const role = (body.role ?? "").trim().slice(0, 120);
  if (!company && !role) {
    return NextResponse.json(
      { error: "Укажите компанию или должность." },
      { status: 400 },
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      company,
      role,
      link: body.link?.trim() || null,
      stage: isStage(body.stage) ? body.stage : "wishlist",
    },
    select: {
      id: true,
      company: true,
      role: true,
      link: true,
      stage: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
