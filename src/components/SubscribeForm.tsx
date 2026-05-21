"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Готово! Мы напишем, как только запустимся.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Что-то пошло не так. Попробуйте позже.");
      }
    } catch {
      setStatus("error");
      setMessage("Сеть недоступна. Попробуйте позже.");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-300">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <label
        htmlFor="subscribe-email"
        className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500"
      >
        Ранний доступ
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={status === "loading"}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5 text-base text-zinc-50 placeholder:text-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Отправляем…" : "Получить доступ"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-rose-400">{message}</p>
      )}
      <p className="text-sm text-zinc-500">
        Без спама. Одно письмо — когда откроем доступ.
      </p>
    </form>
  );
}
