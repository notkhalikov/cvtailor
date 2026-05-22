"use client";

import { useRef } from "react";
import { TEMPLATES, ACCENTS, type Design } from "@/lib/pdf/design";

function Toggle({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint: string;
  on: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!on)}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${on ? "bg-emerald-500" : "bg-zinc-700"}`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-zinc-50 transition-transform ${on ? "translate-x-4" : ""}`}
        />
      </span>
      <span className="flex flex-col">
        <span className="text-sm text-zinc-200">{label}</span>
        <span className="font-mono text-[10px] text-zinc-500">{hint}</span>
      </span>
    </button>
  );
}

export default function DesignPicker({
  design,
  onChange,
}: {
  design: Design;
  onChange: (d: Design) => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const ats = !!design.atsMode;

  function onPhotoFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB guard
    const reader = new FileReader();
    reader.onload = () => onChange({ ...design, photo: String(reader.result) });
    reader.readAsDataURL(file);
  }

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

      {/* Photo */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          фото · для 2-колоночных шаблонов
        </span>
        <div className="flex items-center gap-3">
          {design.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={design.photo}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-zinc-800 text-zinc-600">
              <span className="text-lg">+</span>
            </div>
          )}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPhotoFile(f);
              if (photoRef.current) photoRef.current.value = "";
            }}
          />
          <button
            onClick={() => photoRef.current?.click()}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
          >
            {design.photo ? "Заменить" : "Загрузить фото"}
          </button>
          {design.photo && (
            <button
              onClick={() => onChange({ ...design, photo: null })}
              className="text-xs text-zinc-500 transition-colors hover:text-rose-400"
            >
              Убрать
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
        <Toggle
          label="ATS-режим"
          hint="простой 1-колоночный вид без цвета и фото"
          on={ats}
          onToggle={(v) => onChange({ ...design, atsMode: v })}
        />
        <Toggle
          label="Уместить плотнее"
          hint="меньше шрифт и отступы — помогает влезть на 1 страницу"
          on={!!design.onePage}
          onToggle={(v) => onChange({ ...design, onePage: v })}
        />
        {ats && (
          <p className="font-mono text-[10px] text-zinc-500">
            в ATS-режиме шаблон и цвет игнорируются для совместимости с роботами-скринерами
          </p>
        )}
      </div>
    </div>
  );
}
