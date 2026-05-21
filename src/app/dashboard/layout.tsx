import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user";
import DashboardNav from "@/components/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getOrCreateUser();
  if (dbUser && !dbUser.onboardedAt) {
    redirect("/onboarding");
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const name = user?.firstName ?? email.split("@")[0] ?? "пользователь";

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 md:grid md:grid-cols-[248px_1fr]">
      {/* ── Sidebar ── */}
      <aside className="flex flex-col border-b border-zinc-800 md:sticky md:top-0 md:h-[100dvh] md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-[15px] font-semibold tracking-tight">
            CV<span className="text-emerald-400">·</span>Tailor
          </Link>
        </div>

        <div className="px-3 pb-4 md:flex-1">
          <DashboardNav />
        </div>

        <div className="hidden border-t border-zinc-800 px-5 py-4 md:block">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">
              Free
            </span>
            <span className="text-xs text-zinc-500">3 адаптации / мес</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-3 backdrop-blur">
          <span className="truncate text-sm text-zinc-400">
            {name}
            {email && <span className="ml-2 hidden text-zinc-600 sm:inline">{email}</span>}
          </span>
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
