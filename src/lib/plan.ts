import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const FREE_MONTHLY_LIMIT = 3;

// Clerk Billing plan slug (configured in the Clerk Dashboard).
export const PRO_PLAN = "pro";

/**
 * Current user's plan, derived from their Clerk Billing subscription.
 * Returns "free" when there is no active Pro subscription (or billing is off).
 */
export async function getPlan(): Promise<"free" | "pro"> {
  try {
    const { has } = await auth();
    return has({ plan: PRO_PLAN }) ? "pro" : "free";
  } catch {
    return "free";
  }
}

export function startOfMonthUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export type Usage = {
  plan: string;
  used: number;
  limit: number | null; // null = unlimited (pro)
  remaining: number | null;
};

// Adaptations created by the user in the current calendar month (UTC).
export async function getUsage(userId: string, plan: string): Promise<Usage> {
  const used = await prisma.adaptation.count({
    where: { userId, createdAt: { gte: startOfMonthUTC() } },
  });
  const limit = plan === "pro" ? null : FREE_MONTHLY_LIMIT;
  return {
    plan,
    used,
    limit,
    remaining: limit === null ? null : Math.max(0, limit - used),
  };
}
