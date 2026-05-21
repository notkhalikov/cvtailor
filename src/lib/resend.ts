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

export const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
