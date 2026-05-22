"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
} from "@/lib/resume-schema";
import AIBlockPanel from "@/components/dashboard/AIBlockPanel";

// Splits AI bullet output (one per line) into clean bullet strings.
function splitBullets(text: string): string[] {
  return text
    .split("\n")
    .map((b) => b.replace(/^[\s•\-*\d.)]+/, "").trim())
    .filter((b) => b !== "");
}

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

function GripIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
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
  originalData,
}: {
  id: string;
  title: string;
  initialData: ResumeData;
  originalData: ResumeData | null;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<ResumeData>(initialData);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [skillDraft, setSkillDraft] = useState("");
  const [confirmRevert, setConfirmRevert] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function reorderExperience(from: number, to: number) {
    if (from === to) return;
    setData((d) => {
      const ex = [...d.experience];
      const [moved] = ex.splice(from, 1);
      ex.splice(to, 0, moved);
      return { ...d, experience: ex };
    });
    setDirty(true);
  }

  const canRevert =
    !!originalData &&
    JSON.stringify(originalData) !== JSON.stringify(data);

  function revert() {
    if (!originalData) return;
    setData(originalData);
    setDirty(true);
    setConfirmRevert(false);
  }

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
          {confirmRevert ? (
            <span className="flex items-center gap-2 text-xs text-zinc-400">
              Откатить к исходному разбору?
              <button
                onClick={revert}
                className="rounded-md border border-rose-500/40 px-2 py-1 font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
              >
                Откатить
              </button>
              <button
                onClick={() => setConfirmRevert(false)}
                className="rounded-md border border-zinc-800 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-50"
              >
                Отмена
              </button>
            </span>
          ) : (
            <>
              {canRevert && (
                <button
                  onClick={() => setConfirmRevert(true)}
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  ↺ к исходнику
                </button>
              )}
              {dirty ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                  есть несохранённые правки
                </span>
              ) : savedAt ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-400">
                  сохранено
                </span>
              ) : null}
            </>
          )}
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
          <div className="flex flex-col gap-2">
            <textarea
              className={`${inputCls} min-h-[96px] resize-y leading-relaxed`}
              value={data.summary}
              placeholder="Краткое описание профиля"
              onChange={(e) => patch({ summary: e.target.value })}
            />
            <AIBlockPanel
              kind="summary"
              quickPrompts={[
                "Усилить",
                "Сократить до 2 предложений",
                "Сделать конкретнее",
              ]}
              buildContext={() => ({
                fullName: data.fullName,
                title: data.title,
                skills: data.skills,
                current: data.summary,
              })}
              onApply={(t) => patch({ summary: t })}
            />
          </div>
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
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  if (dragIndex !== i) {
                    reorderExperience(dragIndex, i);
                    setDragIndex(i);
                  }
                }}
                className={`rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-opacity ${
                  dragIndex === i ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragEnd={() => setDragIndex(null)}
                    aria-label="Перетащить позицию"
                    className="mt-1.5 shrink-0 cursor-grab rounded-md p-1 text-zinc-600 transition-colors hover:text-zinc-300 active:cursor-grabbing"
                  >
                    <GripIcon className="h-[18px] w-[18px]" />
                  </button>
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
                <div className="mt-3 flex flex-col gap-2">
                  <Label>Достижения</Label>
                  <BulletList
                    bullets={exp.bullets}
                    onChange={(bullets) => patchExperience(i, { bullets })}
                  />
                  <AIBlockPanel
                    kind="bullets"
                    quickPrompts={[
                      "Усилить",
                      "Добавить метрики",
                      "Короче",
                      "Начать с глаголов действия",
                    ]}
                    buildContext={() => ({
                      role: exp.role,
                      company: exp.company,
                      period: exp.period,
                      current: exp.bullets.join("\n"),
                    })}
                    onApply={(t) =>
                      patchExperience(i, { bullets: splitBullets(t) })
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

function BulletList({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  useEffect(() => {
    if (focusIdx === null) return;
    const el = refs.current[focusIdx];
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
    setFocusIdx(null);
  }, [focusIdx, bullets.length]);

  function setAt(i: number, value: string) {
    onChange(bullets.map((b, j) => (j === i ? value : b)));
  }
  function insertAfter(i: number) {
    const next = [...bullets];
    next.splice(i + 1, 0, "");
    onChange(next);
    setFocusIdx(i + 1);
  }
  function removeAt(i: number) {
    onChange(bullets.filter((_, j) => j !== i));
    setFocusIdx(Math.max(0, i - 1));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="group flex items-start gap-2">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
          <AutoTextarea
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={b}
            placeholder="Достижение или обязанность"
            onChange={(v) => setAt(i, v)}
            onEnter={() => insertAfter(i)}
            onBackspaceEmpty={() => {
              if (bullets.length > 1 || b !== "") removeAt(i);
            }}
          />
          <button
            onClick={() => removeAt(i)}
            aria-label="Удалить пункт"
            className="mt-1 shrink-0 rounded-md p-1 text-zinc-600 opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          onChange([...bullets, ""]);
          setFocusIdx(bullets.length);
        }}
        className="mt-1 inline-flex w-fit items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-emerald-400"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Добавить пункт
      </button>
    </div>
  );
}

const AutoTextarea = forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
    onEnter: () => void;
    onBackspaceEmpty: () => void;
  }
>(function AutoTextarea(
  { value, placeholder, onChange, onEnter, onBackspaceEmpty },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={(el) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onEnter();
        } else if (
          e.key === "Backspace" &&
          e.currentTarget.selectionStart === 0 &&
          e.currentTarget.selectionEnd === 0
        ) {
          e.preventDefault();
          onBackspaceEmpty();
        }
      }}
      className={`${inputCls} resize-none overflow-hidden py-1.5 leading-relaxed`}
    />
  );
});

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
