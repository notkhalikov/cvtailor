import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/user";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getOrCreateUser();
  if (user?.onboardedAt) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 px-6 py-12 text-zinc-50">
      <OnboardingFlow firstName={user?.email.split("@")[0] ?? null} />
    </main>
  );
}
