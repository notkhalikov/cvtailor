"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UpgradeButton from "@/components/UpgradeButton";

export default function PlanControl({ plan }: { plan: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function downgrade() {
    setBusy(true);
    try {
      await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (plan === "pro") {
    return (
      <div className="flex flex-col items-start gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-400">
          Pro · безлимит
        </span>
        <button
          onClick={downgrade}
          disabled={busy}
          className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-50 disabled:opacity-60"
        >
          {busy ? "…" : "Вернуться на Free"}
        </button>
      </div>
    );
  }

  return <UpgradeButton />;
}
