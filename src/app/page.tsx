import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import SubscribeForm from "@/components/SubscribeForm";

const FEATURES = [
  {
    title: "Адаптация под вакансию",
    body: "Вставьте ссылку на вакансию — ИИ перепишет резюме под её требования, сохранив ваш опыт.",
  },
  {
    title: "Match score",
    body: "Видите процент соответствия вакансии и чего не хватает, ещё до отклика.",
  },
  {
    title: "Экспорт в PDF",
    body: "Готовые ATS-совместимые шаблоны. Выгрузка в один клик, без потери вёрстки.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]"
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-bold tracking-tight">CV Tailor</span>
        <nav className="flex items-center gap-3 text-sm">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-white/70 transition hover:text-white"
            >
              Войти
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
            >
              Регистрация
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-white/70 transition hover:text-white"
            >
              Кабинет
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-28 text-center">
        <span className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70">
          Скоро запуск · ранний доступ
        </span>

        <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          Резюме, которое{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            подстраивается
          </span>{" "}
          под каждую вакансию
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg text-white/60">
          CV&nbsp;Tailor берёт ваше резюме и вакансию — и за секунды собирает версию,
          которая бьёт точно в требования. Без переписывания вручную.
        </p>

        <div className="mt-10 w-full max-w-lg">
          <SubscribeForm />
        </div>

        <div className="mt-20 grid w-full gap-5 text-left sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative pb-10 text-center text-sm text-white/30">
        © {new Date().getFullYear()} CV Tailor
      </footer>
    </main>
  );
}
