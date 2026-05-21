import { NextResponse } from "next/server";
import { getResend, AUDIENCE_ID } from "@/lib/resend";

// Simple, pragmatic email check — good enough for a waitlist form.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
  }

  const resend = getResend();
  if (!resend || !AUDIENCE_ID) {
    // Keys not configured yet — log so nothing is silently lost in dev.
    console.warn("[subscribe] RESEND_API_KEY/RESEND_AUDIENCE_ID not set; email not stored:", email);
    return NextResponse.json(
      { error: "Подписка временно недоступна. Попробуйте позже." },
      { status: 503 },
    );
  }

  const { error } = await resend.contacts.create({
    email: email.trim().toLowerCase(),
    audienceId: AUDIENCE_ID,
    unsubscribed: false,
  });

  if (error) {
    console.error("[subscribe] Resend error:", error);
    return NextResponse.json({ error: "Не удалось подписаться. Попробуйте позже." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
