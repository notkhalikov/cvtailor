// Structured representation of a parsed resume (the "data-слой").
// Kept in sync with RESUME_JSON_SCHEMA below, which constrains Claude's output.

export type ResumeExperience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
};

export type ResumeEducation = {
  institution: string;
  degree: string;
  period: string;
};

export type ResumeData = {
  fullName: string;
  title: string;
  summary: string;
  contacts: string[];
  experience: ResumeExperience[];
  skills: string[];
  education: ResumeEducation[];
};

// JSON Schema for structured outputs. Constraints follow the structured-output
// limitations: every object sets additionalProperties:false; no min/max/length.
export const RESUME_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    fullName: { type: "string", description: "Имя и фамилия кандидата" },
    title: {
      type: "string",
      description: "Текущая должность / профессиональный заголовок",
    },
    summary: {
      type: "string",
      description: "Краткое summary 1-3 предложения. Пустая строка, если нет.",
    },
    contacts: {
      type: "array",
      description: "Email, телефон, ссылки (LinkedIn, GitHub, сайт)",
      items: { type: "string" },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          period: {
            type: "string",
            description: "Например '2021 — наст. время'",
          },
          location: { type: "string", description: "Город/страна или пусто" },
          bullets: {
            type: "array",
            description: "Достижения и обязанности, по пунктам",
            items: { type: "string" },
          },
        },
        required: ["company", "role", "period", "location", "bullets"],
      },
    },
    skills: {
      type: "array",
      description: "Навыки и технологии",
      items: { type: "string" },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          period: { type: "string" },
        },
        required: ["institution", "degree", "period"],
      },
    },
  },
  required: [
    "fullName",
    "title",
    "summary",
    "contacts",
    "experience",
    "skills",
    "education",
  ],
} as const;
