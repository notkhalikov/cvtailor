"use client";

import { TEMPLATES, ACCENTS, type Design } from "@/lib/pdf/design";

export default function DesignPicker({
  design,
  onChange,
}: {
  design: Design;
  onChange: (d: Design) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          шаблон
        </span>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => {
            const active = t.id === design.template;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ ...design, template: t.id })}
                className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span
                  className={`text-sm font-medium ${active ? "text-emerald-400" : "text-zinc-200"}`}
                >
                  {t.name}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          акцент
        </span>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => {
            const active = a.hex.toLowerCase() === design.accent.toLowerCase();
            return (
              <button
                key={a.hex}
                onClick={() => onChange({ ...design, accent: a.hex })}
                aria-label={a.name}
                title={a.name}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  active ? "border-zinc-50" : "border-transparent"
                }`}
                style={{ backgroundColor: a.hex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
