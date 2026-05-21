"use client";

import { useRef, useState } from "react";
import type { BlockKind, BlockContext } from "@/lib/llm";

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export default function AIBlockPanel({
  kind,
  quickPrompts,
  buildContext,
  onApply,
}: {
  kind: BlockKind;
  quickPrompts?: string[];
  buildContext: () => BlockContext;
  onApply: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function run(promptText: string) {
    const text = promptText.trim();
    if (!text || running) return;
    setError("");
    setOutput("");
    setRunning(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/ai/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, instruction: text, context: buildContext() }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const b = await res.json().catch(() => null);
        setError(b?.error ?? `Ошибка ИИ (${res.status}).`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError("Сеть недоступна или ИИ недоступен.");
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  function close() {
    abortRef.current?.abort();
    setOpen(false);
    setOutput("");
    setError("");
    setInstruction("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-zinc-800 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
      >
        <SparkIcon className="h-3.5 w-3.5" />
        ИИ
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-400">
          <SparkIcon className="h-3.5 w-3.5" />
          ИИ-правка
        </span>
        <button
          onClick={close}
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          закрыть
        </button>
      </div>

      {quickPrompts && quickPrompts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInstruction(q);
                run(q);
              }}
              disabled={running}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <input
          className={inputCls}
          placeholder="Что сделать? Напр. «усилить, добавить метрики»"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              run(instruction);
            }
          }}
        />
        {running ? (
          <button
            onClick={() => abortRef.current?.abort()}
            className="shrink-0 rounded-lg border border-zinc-800 px-3 text-sm text-zinc-300 transition-colors hover:text-zinc-50"
          >
            Стоп
          </button>
        ) : (
          <button
            onClick={() => run(instruction)}
            className="shrink-0 rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
          >
            Сгенерировать
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

      {(output || running) && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm leading-relaxed text-zinc-200">
            {output}
            {running && <span className="ml-0.5 animate-pulse">▍</span>}
          </div>
          {!running && output && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onApply(output.trim());
                  close();
                }}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
              >
                Применить
              </button>
              <button
                onClick={() => setOutput("")}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
