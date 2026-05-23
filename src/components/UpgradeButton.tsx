"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Pro checkout entry point. Mock upgrade for now (no real payment); a payment
// provider replaces the POST /api/plan call later.
export default function UpgradeButton({
  label = "Оформить Pro",
  full = false,
}: {
  label?: string;
  full?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      if (!res.ok) {
        setError("Не удалось оформить. Попробуйте позже.");
        return;
      }
      router.push("/dashboard/tailored");
      router.refresh();
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={full ? "flex flex-col gap-2" : "flex flex-col items-start gap-2"}>
      <button
        onClick={upgrade}
        disabled={busy}
        className={`rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 ${full ? "w-full" : "w-fit"}`}
      >
        {busy ? "Оформляем…" : label}
      </button>
      <p className="text-xs text-zinc-500">
        Демо-режим: подписка активируется без оплаты (онлайн-оплата скоро).
      </p>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  );
}
