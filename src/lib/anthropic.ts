import Anthropic from "@anthropic-ai/sdk";
import { RESUME_JSON_SCHEMA, type ResumeData } from "@/lib/resume-schema";

export const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY

// Stable, cacheable instruction prefix. Kept frozen so prompt caching can reuse
// it across every resume parse (cache_control on the system block below).
const SYSTEM_PROMPT = `Ты — парсер резюме для сервиса CV Tailor. На вход тебе дают сырой текст резюме, извлечённый из PDF (возможны артефакты вёрстки, переносы строк, склеенные слова).

Твоя задача — превратить его в строго структурированный объект по заданной схеме (summary, опыт, навыки, образование и т.д.).

Правила:
- Сохраняй формулировки кандидата; не выдумывай факты, которых нет в тексте.
- Если поле отсутствует в резюме — верни пустую строку или пустой массив, не придумывай.
- Буллеты опыта разбивай по отдельным достижениям/обязанностям.
- Нормализуй очевидные артефакты PDF (лишние переносы, двойные пробелы), но не меняй смысл.
- Язык значений сохраняй как в оригинале резюме.`;

/**
 * Parses raw resume text into the structured data layer using Claude with
 * structured outputs. Throws on API error or unparseable output.
 */
export async function parseResumeText(text: string): Promise<ResumeData> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8000,
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: RESUME_JSON_SCHEMA,
      },
    },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Разбери это резюме:\n\n<resume>\n${text}\n</resume>`,
      },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude вернул пустой ответ при разборе резюме.");
  }
  return JSON.parse(block.text) as ResumeData;
}
