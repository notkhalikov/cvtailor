"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
} from "@/lib/resume-schema";

const inputCls =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

const labelCls =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500";

function Label({ children }: { children: React.ReactNode }) {
  return <span className={labelCls}>{children}</span>;
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const emptyExperience = (): ResumeExperience => ({
  company: "",
  role: "",
  period: "",
  location: "",
  bullets: [],
});

const emptyEducation = (): ResumeEducation => ({
  institution: "",
  degree: "",
  period: "",
});

export default function ResumeEditor({
  id,
  title: initialTitle,
  initialData,
}: {
  id: string;
  title: string;
  initialData: ResumeData;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<ResumeData>(initialData);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [skillDraft, setSkillDraft] = useState("");

  function patch(p: Partial<ResumeData>) {
    setData((d) => ({ ...d, ...p }));
    setDirty(true);
  }

  function patchExperience(i: number, p: Partial<ResumeExperience>) {
    setData((d) => ({
      ...d,
      experience: d.experience.map((e, j) => (j === i ? { ...e, ...p } : e)),
    }));
    setDirty(true);
  }

  function patchEducation(i: number, p: Partial<ResumeEducation>) {
    setData((d) => ({
      ...d,
      education: d.education.map((e, j) => (j === i ? { ...e, ...p } : e)),
    }));
    setDirty(true);
  }

  function addSkill() {
    const s = skillDraft.trim();
    if (!s) return;
    if (!data.skills.includes(s)) patch({ skills: [...data.skills, s] });
    setSkillDraft("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, data }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        setError(b?.error ?? `Не удалось сохранить (ошибка ${res.status}).`);
        return;
      }
      setDirty(false);
      setSavedAt(Date.now());
    } catch {
      setError("Сеть недоступна. Попробуйте позже.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← резюме
        </Link>
        <div className="flex items-center gap-3">
          {dirty ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              есть несохранённые правки
            </span>
          ) : savedAt ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">
              сохранено
            </span>
          ) : null}
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setDirty(true);
        }}
        className="mt-5 w-full bg-transparent text-2xl font-semibold tracking-tight text-zinc-50 outline-none md:text-3xl"
        placeholder="Название резюме"
      />

      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

      <div className="mt-8 flex flex-col gap-8">
        {/* Identity */}
        <Block title="Шапка">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Имя</Label>
              <input
                className={inputCls}
                value={data.fullName}
                onChange={(e) => patch({ fullName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Должность</Label>
              <input
                className={inputCls}
                value={data.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </div>
          </div>
        </Block>

        {/* Summary */}
        <Block title="Summary">
          <textarea
            className={`${inputCls} min-h-[96px] resize-y leading-relaxed`}
            value={data.summary}
            placeholder="Краткое описание профиля"
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </Block>

        {/* Experience */}
        <Block
          title="Опыт"
          action={
            <AddButton
              label="Добавить позицию"
              onClick={() =>
                patch({ experience: [...data.experience, emptyExperience()] })
              }
            />
          }
        >
          <div className="flex flex-col gap-4">
            {data.experience.map((exp, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      className={inputCls}
                      placeholder="Должность"
                      value={exp.role}
                      onChange={(e) => patchExperience(i, { role: e.target.value })}
                    />
                    <input
                      className={inputCls}
                      placeholder="Компания"
                      value={exp.company}
                      onChange={(e) =>
                        patchExperience(i, { company: e.target.value })
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="Период (напр. 2021 — наст. время)"
                      value={exp.period}
                      onChange={(e) =>
                        patchExperience(i, { period: e.target.value })
                      }
                    />
                    <input
                      className={inputCls}
                      placeholder="Локация"
                      value={exp.location}
                      onChange={(e) =>
                        patchExperience(i, { location: e.target.value })
                      }
                    />
                  </div>
                  <RemoveButton
                    onClick={() =>
                      patch({
                        experience: data.experience.filter((_, j) => j !== i),
                      })
                    }
                  />
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <Label>Достижения (по одному на строку)</Label>
                  <textarea
                    className={`${inputCls} min-h-[88px] resize-y leading-relaxed`}
                    value={exp.bullets.join("\n")}
                    placeholder="• Запустил…&#10;• Сократил…"
                    onChange={(e) =>
                      patchExperience(i, {
                        bullets: e.target.value
                          .split("\n")
                          .map((b) => b.replace(/^[•\-\s]+/, "").trimEnd())
                          .filter((b, idx, arr) =>
                            // keep non-empty, but allow a trailing blank line while typing
                            b !== "" || idx === arr.length - 1,
                          ),
                      })
                    }
                  />
                </div>
              </div>
            ))}
            {data.experience.length === 0 && <Empty>Опыт не добавлен.</Empty>}
          </div>
        </Block>

        {/* Skills */}
        <Block title="Навыки">
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
              >
                {s}
                <button
                  onClick={() =>
                    patch({ skills: data.skills.filter((_, j) => j !== i) })
                  }
                  className="text-zinc-500 transition-colors hover:text-rose-400"
                  aria-label={`Убрать ${s}`}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className={inputCls}
              placeholder="Добавить навык и Enter"
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              onClick={addSkill}
              className="shrink-0 rounded-lg border border-zinc-800 px-3 text-sm text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
            >
              Добавить
            </button>
          </div>
        </Block>

        {/* Education */}
        <Block
          title="Образование"
          action={
            <AddButton
              label="Добавить"
              onClick={() =>
                patch({ education: [...data.education, emptyEducation()] })
              }
            />
          }
        >
          <div className="flex flex-col gap-4">
            {data.education.map((ed, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    className={inputCls}
                    placeholder="Учебное заведение"
                    value={ed.institution}
                    onChange={(e) =>
                      patchEducation(i, { institution: e.target.value })
                    }
                  />
                  <input
                    className={inputCls}
                    placeholder="Степень / специальность"
                    value={ed.degree}
                    onChange={(e) => patchEducation(i, { degree: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="Период"
                    value={ed.period}
                    onChange={(e) => patchEducation(i, { period: e.target.value })}
                  />
                </div>
                <RemoveButton
                  onClick={() =>
                    patch({
                      education: data.education.filter((_, j) => j !== i),
                    })
                  }
                />
              </div>
            ))}
            {data.education.length === 0 && (
              <Empty>Образование не добавлено.</Empty>
            )}
          </div>
        </Block>
      </div>
    </section>
  );
}

function Block({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-50">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:text-emerald-400"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Удалить"
      className="shrink-0 rounded-lg border border-zinc-800 p-2 text-zinc-500 transition-colors hover:border-rose-500/40 hover:text-rose-400"
    >
      <XIcon className="h-[18px] w-[18px]" />
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
      {children}
    </p>
  );
}
