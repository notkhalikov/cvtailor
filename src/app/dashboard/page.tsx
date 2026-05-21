import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "пользователь";

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <span className="font-bold tracking-tight">CV Tailor</span>
        <UserButton afterSignOutUrl="/" />
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Привет, {name} 👋
        </h1>
        <p className="mt-3 text-white/60">
          Это личный кабинет. Скоро здесь появятся ваши резюме и адаптации под вакансии.
        </p>
      </section>
    </main>
  );
}
