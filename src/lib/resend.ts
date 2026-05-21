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
