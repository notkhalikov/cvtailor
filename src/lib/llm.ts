import { GoogleGenAI } from "@google/genai";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
} from "@/lib/resume-schema";

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
