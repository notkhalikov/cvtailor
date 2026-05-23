import { prisma } from "@/lib/prisma";

export const FREE_MONTHLY_LIMIT = 3;

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
