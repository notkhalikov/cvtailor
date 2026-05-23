import { Resend } from "resend";

/**
 * Lazily-created Resend client. Returns null when RESEND_API_KEY is not set
 * so callers can degrade gracefully (e.g. local dev without keys).
 */
export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM || "CV Tailor <onboarding@resend.dev>";

/**
 * Best-effort transactional email. Never throws — a missing key or unverified
 * domain just skips the send (logged), so it can't break the request flow.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend || !opts.to) return;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) console.error("[email] send error:", error);
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

function shell(title: string, body: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#18181b">
    <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
    ${body}
    <p style="margin-top:24px;color:#71717a;font-size:13px">CV Tailor — резюме под каждую вакансию</p>
  </div>`;
}

export const emails = {
  welcome: (name: string) => ({
    subject: "Добро пожаловать в CV Tailor",
    html: shell(
      `Привет${name ? `, ${name}` : ""}!`,
      `<p>Вы в CV Tailor. Загрузите мастер-резюме, вставьте вакансию — и получите версию, заточенную под неё, с match score и чистым PDF.</p>
       <p><a href="https://cvtailor-iota.vercel.app/dashboard" style="color:#10b981">Открыть кабинет →</a></p>`,
    ),
  }),
  proActivated: () => ({
    subject: "Pro активирован",
    html: shell(
      "Pro активирован",
      `<p>Теперь у вас безлимит адаптаций под вакансии и история версий без ограничений. Удачного поиска!</p>
       <p><a href="https://cvtailor-iota.vercel.app/dashboard/tailored" style="color:#10b981">К адаптациям →</a></p>`,
    ),
  }),
};

// Cache the resolved audience id across invocations (per warm lambda).
let cachedAudienceId: string | null = null;

/**
 * Resolves the Resend Audience to add contacts to.
 *
 * Prefers RESEND_AUDIENCE_ID when set; otherwise falls back to the account's
 * first audience (Resend creates a default "General" audience on signup), so
 * the only secret you must configure is RESEND_API_KEY.
 *
 * Returns null if no audience can be determined.
 */
export async function resolveAudienceId(resend: Resend): Promise<string | null> {
  const fromEnv = process.env.RESEND_AUDIENCE_ID;
  if (fromEnv) return fromEnv;
  if (cachedAudienceId) return cachedAudienceId;

  const { data, error } = await resend.audiences.list();
  if (error || !data?.data?.length) return null;

  cachedAudienceId = data.data[0].id;
  return cachedAudienceId;
}
