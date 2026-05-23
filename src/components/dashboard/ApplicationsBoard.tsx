"use client";

import { useState } from "react";
import { STAGES, type StageId } from "@/lib/applications";

export type AppItem = {
  id: string;
  company: string;
  role: string;
  link: string | null;
  stage: string;
  notes: string | null;
  contactName: string | null;
  contactInfo: string | null;
  adaptationId: string | null;
  adaptationTitle: string | null;
  createdAt: string;
};

type AdaptationRef = { id: string; title: string };

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20h4l10-10-4-4L4 16v4Z M14 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ApplicationsBoard({
  initial,
  adaptations,
}: {
  initial: AppItem[];
  adaptations: AdaptationRef[];
}) {
  const [items, setItems] = useState<AppItem[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<StageId | null>(null);
  const [adding, setAdding] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AppItem | null>(null);

  async function addCard() {
    if (!company.trim() && !role.trim()) return;
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, stage: "wishlist" }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "Не удалось добавить.");
        return;
      }
      setItems((p) => [
        {
          ...body.application,
          link: body.application.link ?? null,
          notes: null,
          contactName: null,
          contactInfo: null,
          adaptationId: null,
          adaptationTitle: null,
        },
        ...p,
      ]);
      setCompany("");
      setRole("");
      setAdding(false);
    } catch {
      setError("Сеть недоступна.");
    }
  }

  async function move(id: string, stage: StageId) {
    const prev = items;
    setItems((p) => p.map((it) => (it.id === id ? { ...it, stage } : it)));
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    }
  }

  async function saveEdit(patch: AppItem) {
    const prev = items;
    const adaptationTitle =
      adaptations.find((a) => a.id === patch.adaptationId)?.title ?? null;
    const next = { ...patch, adaptationTitle };
    setItems((p) => p.map((it) => (it.id === patch.id ? next : it)));
    setEditing(null);
    try {
      const res = await fetch(`/api/applications/${patch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: patch.company,
          role: patch.role,
          link: patch.link,
          notes: patch.notes,
          contactName: patch.contactName,
          contactInfo: patch.contactInfo,
          adaptationId: patch.adaptationId,
        }),
      });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    }
  }

  async function remove(id: string) {
    const prev = items;
    setItems((p) => p.filter((it) => it.id !== id));
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) setItems(prev);
    } catch {
      setItems(prev);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add */}
      {adding ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 p-3">
          <input
            autoFocus
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Компания"
            className="w-44 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-emerald-500"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Должность"
            onKeyDown={(e) => e.key === "Enter" && addCard()}
            className="w-48 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-emerald-500"
          />
          <button
            onClick={addCard}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
          >
            Добавить
          </button>
          <button
            onClick={() => setAdding(false)}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Отмена
          </button>
          {error && <span className="text-sm text-rose-400">{error}</span>}
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-fit rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]"
        >
          + Добавить отклик
        </button>
      )}

      {/* Board */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STAGES.map((stage) => {
          const cards = items.filter((it) => it.stage === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setOverStage(stage.id);
                }
              }}
              onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
              onDrop={() => {
                if (dragId) move(dragId, stage.id);
                setDragId(null);
                setOverStage(null);
              }}
              className={`flex min-h-[140px] flex-col gap-2 rounded-xl border p-2 transition-colors ${
                overStage === stage.id
                  ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-semibold text-zinc-300">
                  {stage.name}
                </span>
                <span className="font-mono text-[10px] text-zinc-600">
                  {cards.length}
                </span>
              </div>
              {cards.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverStage(null);
                  }}
                  className="group cursor-grab rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {c.role && (
                        <p className="truncate text-sm font-medium text-zinc-50">
                          {c.role}
                        </p>
                      )}
                      {c.company && (
                        <p className="truncate text-xs text-zinc-400">
                          {c.company}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setEditing(c)}
                        aria-label="Редактировать"
                        className="rounded p-0.5 text-zinc-500 hover:text-emerald-400"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        aria-label="Удалить"
                        className="rounded p-0.5 text-zinc-600 hover:text-rose-400"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {c.link && (
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[10px] text-emerald-400 hover:underline"
                      >
                        ссылка
                      </a>
                    )}
                    {c.adaptationTitle && (
                      <span className="truncate rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-300">
                        {c.adaptationTitle}
                      </span>
                    )}
                    {(c.notes || c.contactName || c.contactInfo) && (
                      <span className="font-mono text-[9px] text-zinc-600">
                        заметки
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {editing && (
        <CardEditor
          item={editing}
          adaptations={adaptations}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}

function CardEditor({
  item,
  adaptations,
  onClose,
  onSave,
}: {
  item: AppItem;
  adaptations: AdaptationRef[];
  onClose: () => void;
  onSave: (patch: AppItem) => void;
}) {
  const [draft, setDraft] = useState<AppItem>(item);
  const field =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
  const label = "font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-zinc-50">Отклик</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className={label}>Компания</span>
            <input className={field} value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <span className={label}>Должность</span>
            <input className={field} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className={label}>Ссылка на вакансию</span>
          <input className={field} value={draft.link ?? ""} placeholder="https://…" onChange={(e) => setDraft({ ...draft, link: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <span className={label}>Привязать адаптацию</span>
          <select
            className={field}
            value={draft.adaptationId ?? ""}
            onChange={(e) => setDraft({ ...draft, adaptationId: e.target.value || null })}
          >
            <option value="">— не выбрано —</option>
            {adaptations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className={label}>Контакт</span>
            <input className={field} value={draft.contactName ?? ""} placeholder="Имя рекрутера" onChange={(e) => setDraft({ ...draft, contactName: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <span className={label}>Связь</span>
            <input className={field} value={draft.contactInfo ?? ""} placeholder="email / telegram" onChange={(e) => setDraft({ ...draft, contactInfo: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className={label}>Заметки</span>
          <textarea className={`${field} min-h-[90px] resize-y leading-relaxed`} value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-50">
            Отмена
          </button>
          <button onClick={() => onSave(draft)} className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98]">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
