"use client";

import { useState } from "react";

// Pro checkout entry point. Wired to a payment provider in a later task;
// for now it surfaces a "coming soon" state instead of a dead button.
export default function UpgradeButton({
  label = "Оформить Pro",
  full = false,
}: {
  label?: string;
  full?: boolean;
}) {
  const [soon, setSoon] = useState(false);

  return (
    <div className={full ? "flex flex-col gap-2" : "flex flex-col items-start gap-2"}>
      <button
        onClick={() => setSoon(true)}
        className={`rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] ${full ? "w-full" : "w-fit"}`}
      >
        {label}
      </button>
      {soon && (
        <p className="text-sm text-zinc-400">
          Онлайн-оплата подключается — скоро здесь появится оформление подписки.
        </p>
      )}
    </div>
  );
}
