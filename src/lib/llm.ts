import { GoogleGenAI } from "@google/genai";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
} from "@/lib/resume-schema";
import type { JobData } from "@/lib/job-schema";

// Google Gemini — free tier. Reads GEMINI_API_KEY from the environment.
const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `Ты — парсер резюме для сервиса CV Tailor. На вход тебе дают сырой текст резюме, извлечённый из PDF (возможны артефакты вёрстки, переносы строк, склеенные слова).

Верни СТРОГО один JSON-объект без markdown-обёртки, по схеме:
{
  "fullName": string,            // имя и фамилия
  "title": string,              // текущая должность / заголовок
  "summary": string,            // 1-3 предложения, "" если нет
  "contacts": string[],         // email, телефон, ссылки
  "experience": [               // опыт работы
    { "company": string, "role": string, "period": string, "location": string, "bullets": string[] }
  ],
  "skills": string[],
  "education": [
    { "institution": string, "degree": string, "period": string }
  ]
}

Правила:
- Сохраняй формулировки кандидата; не выдумывай факты.
- Если поля нет — пустая строка или пустой массив.
- bullets — отдельные достижения/обязанности по пунктам.
- Нормализуй артефакты PDF (лишние переносы, двойные пробелы), не меняя смысл.
- Язык значений сохраняй как в оригинале.`;

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter((s) => s.trim() !== "");
}

// Coerce arbitrary model JSON into a guaranteed-shaped ResumeData.
function normalize(raw: unknown): ResumeData {
  const o = (raw ?? {}) as Record<string, unknown>;
  const experience: ResumeExperience[] = Array.isArray(o.experience)
    ? (o.experience as unknown[]).map((e) => {
        const x = (e ?? {}) as Record<string, unknown>;
        return {
          company: str(x.company),
          role: str(x.role),
          period: str(x.period),
          location: str(x.location),
          bullets: strArray(x.bullets),
        };
      })
    : [];
  const education: ResumeEducation[] = Array.isArray(o.education)
    ? (o.education as unknown[]).map((e) => {
        const x = (e ?? {}) as Record<string, unknown>;
        return {
          institution: str(x.institution),
          degree: str(x.degree),
          period: str(x.period),
        };
      })
    : [];
  return {
    fullName: str(o.fullName),
    title: str(o.title),
    summary: str(o.summary),
    contacts: strArray(o.contacts),
    experience,
    skills: strArray(o.skills),
    education,
  };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fallback: strip ```json fences or grab the outermost { ... }.
    const fenced = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "");
    try {
      return JSON.parse(fenced.trim());
    } catch {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start !== -1 && end > start) {
        return JSON.parse(trimmed.slice(start, end + 1));
      }
      throw new Error("Модель вернула не-JSON ответ.");
    }
  }
}

/**
 * Parses raw resume text into the structured data layer via Gemini (JSON mode).
 * Throws on API/parse error.
 */
export async function parseResumeText(text: string): Promise<ResumeData> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: `Разбери это резюме:\n\n<resume>\n${text}\n</resume>`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0,
    },
  });

  const out = res.text;
  if (!out) throw new Error("Модель вернула пустой ответ.");
  return normalize(extractJson(out));
}

// ─── Job posting parsing ─────────────────────────────────────────

const JOB_SYSTEM_PROMPT = `Ты — парсер вакансий для сервиса CV Tailor. На вход дают сырой текст описания вакансии.

Верни СТРОГО один JSON-объект без markdown:
{
  "jobTitle": string,
  "company": string,
  "location": string,
  "summary": string,              // 1-2 предложения о роли
  "responsibilities": string[],   // обязанности
  "requirements": string[],       // обязательные требования (must-have)
  "niceToHave": string[],         // желательные требования
  "skills": string[]              // ключевые навыки/технологии/ключевые слова для матчинга
}

Правила:
- Не выдумывай; чего нет — пустая строка/массив.
- skills — короткие ключевые слова (навыки, технологии, инструменты), пригодные для сопоставления с резюме.
- Язык значений сохраняй как в оригинале вакансии.`;

function normalizeJob(raw: unknown): JobData {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    jobTitle: str(o.jobTitle),
    company: str(o.company),
    location: str(o.location),
    summary: str(o.summary),
    responsibilities: strArray(o.responsibilities),
    requirements: strArray(o.requirements),
    niceToHave: strArray(o.niceToHave),
    skills: strArray(o.skills),
  };
}

/**
 * Parses raw job-posting text into a structured JD via Gemini (JSON mode).
 */
export async function parseJobText(text: string): Promise<JobData> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: `Разбери эту вакансию:\n\n<job>\n${text}\n</job>`,
    config: {
      systemInstruction: JOB_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0,
    },
  });
  const out = res.text;
  if (!out) throw new Error("Модель вернула пустой ответ.");
  return normalizeJob(extractJson(out));
}

// ─── Block-level AI editing (streaming) ──────────────────────────

export type BlockKind = "summary" | "bullets";

export type BlockContext = {
  fullName?: string;
  title?: string;
  role?: string;
  company?: string;
  period?: string;
  skills?: string[];
  current: string; // current text (summary) or bullets joined by newlines
};

function buildBlockPrompt(
  kind: BlockKind,
  instruction: string,
  ctx: BlockContext,
): { system: string; user: string } {
  if (kind === "summary") {
    return {
      system:
        "Ты — редактор резюме. Улучшаешь блок summary. Пиши на языке оригинала, по делу, без воды и клише. Верни ТОЛЬКО новый текст summary — без пояснений, без markdown, без кавычек.",
      user: `Кандидат: ${ctx.fullName ?? ""}, ${ctx.title ?? ""}.
${ctx.skills?.length ? `Навыки: ${ctx.skills.join(", ")}.\n` : ""}Текущее summary:
"""
${ctx.current || "(пусто)"}
"""

Инструкция: ${instruction}`,
    };
  }
  return {
    system:
      "Ты — редактор резюме. Улучшаешь список достижений одной позиции опыта. Конкретика, глаголы действия, метрики где уместно. Пиши на языке оригинала. Верни ТОЛЬКО пункты — по одному на строку, без нумерации, без маркеров, без markdown.",
    user: `Позиция: ${ctx.role ?? ""} — ${ctx.company ?? ""} (${ctx.period ?? ""}).
Текущие пункты:
"""
${ctx.current || "(пусто)"}
"""

Инструкция: ${instruction}`,
  };
}

/**
 * Streams an AI rewrite of a single resume block. Yields text chunks.
 */
export async function* streamBlock(
  kind: BlockKind,
  instruction: string,
  ctx: BlockContext,
): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const { system, user } = buildBlockPrompt(kind, instruction, ctx);

  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: user,
    config: { systemInstruction: system, temperature: 0.4 },
  });

  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) yield t;
  }
}
