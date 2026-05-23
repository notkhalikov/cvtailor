import { FREE_MONTHLY_LIMIT } from "@/lib/plan";

export const PRO_PRICE_RUB = 490;

export const PLAN_FEATURES = {
  free: [
    `${FREE_MONTHLY_LIMIT} адаптации под вакансию в месяц`,
    "Разбор резюме и вакансий ИИ",
    "Редактор блоков + AI-правки",
    "Все PDF-шаблоны и цвета",
    "Match score и gap-анализ",
  ],
  pro: [
    "Безлимит адаптаций под вакансии",
    "История версий без ограничений",
    "Приоритетная обработка ИИ",
    "Всё из бесплатного тарифа",
  ],
};
