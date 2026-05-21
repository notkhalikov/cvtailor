export default function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">
          {eyebrow}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-[60ch] text-sm text-zinc-400">{description}</p>
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-zinc-800 px-6 py-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">
          скоро
        </span>
        <span className="text-sm text-zinc-400">
          Раздел в разработке — появится в одном из ближайших спринтов.
        </span>
      </div>
    </section>
  );
}
