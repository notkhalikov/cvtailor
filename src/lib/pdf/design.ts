// Design choices for PDF export. No react-pdf import here, so client pickers
// can use these types/constants without pulling the renderer into the bundle.

export type TemplateId =
  | "classic"
  | "sidebar"
  | "modern"
  | "compact"
  | "creative";

export type Design = {
  template: TemplateId;
  accent: string; // hex
  photo?: string | null; // data URL, shown in 2-column templates
  atsMode?: boolean; // force plain ATS-safe (single column, neutral, no photo)
  onePage?: boolean; // denser layout to help fit one page
};

export const TEMPLATES: { id: TemplateId; name: string; hint: string }[] = [
  { id: "classic", name: "Classic", hint: "1 колонка · ATS-safe" },
  { id: "sidebar", name: "Sidebar", hint: "2 колонки" },
  { id: "modern", name: "Modern", hint: "акцентная шапка" },
  { id: "compact", name: "Compact", hint: "плотный" },
  { id: "creative", name: "Creative", hint: "цветная колонка" },
];

export const ACCENTS: { name: string; hex: string }[] = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Fuchsia", hex: "#c026d3" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Red", hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Amber", hex: "#d97706" },
  { name: "Lime", hex: "#65a30d" },
  { name: "Green", hex: "#16a34a" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Sky", hex: "#0284c7" },
  { name: "Slate", hex: "#334155" },
  { name: "Zinc", hex: "#3f3f46" },
  { name: "Stone", hex: "#57534e" },
  { name: "Brown", hex: "#78350f" },
];

export const DEFAULT_DESIGN: Design = {
  template: "classic",
  accent: "#10b981",
  photo: null,
  atsMode: false,
  onePage: false,
};
