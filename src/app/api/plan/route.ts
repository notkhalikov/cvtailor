import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { sendEmail, emails } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mock plan switch (no real payment yet). Replace with a payment webhook later.
export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const plan = body.plan === "pro" ? "pro" : "free";
  await prisma.user.update({ where: { id: user.id }, data: { plan } });

  // Notify on upgrade (best-effort).
  if (plan === "pro" && user.plan !== "pro") {
    const { subject, html } = emails.proActivated();
    await sendEmail({ to: user.email, subject, html });
  }

  return NextResponse.json({ plan });
}
