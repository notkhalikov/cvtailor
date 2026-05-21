import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Returns the local DB User for the currently signed-in Clerk account,
 * creating (or back-filling the email of) the row on first access.
 * Returns null when there is no authenticated session.
 */
export async function getOrCreateUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email },
    create: { clerkId: clerkUser.id, email },
  });
}
