export type StageId =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export const STAGES: { id: StageId; name: string }[] = [
  { id: "wishlist", name: "Хочу" },
  { id: "applied", name: "Откликнулся" },
  { id: "interview", name: "Интервью" },
  { id: "offer", name: "Оффер" },
  { id: "rejected", name: "Отказ" },
];

export const STAGE_IDS = STAGES.map((s) => s.id);

export function isStage(v: unknown): v is StageId {
  return typeof v === "string" && (STAGE_IDS as string[]).includes(v);
}
