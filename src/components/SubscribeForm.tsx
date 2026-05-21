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
      <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center text-emerald-300">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={status === "loading"}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-base text-white placeholder:text-white/40 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-violet-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Отправляем…" : "Получить ранний доступ"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-3 text-sm text-rose-400">{message}</p>
      )}
      <p className="mt-3 text-sm text-white/40">
        Без спама. Одно письмо — когда откроем доступ.
      </p>
    </form>
  );
}
