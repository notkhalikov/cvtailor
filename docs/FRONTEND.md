# CV Tailor — Frontend Rules

Дизайн-система проекта. Производная от **taste-skill** (`design-taste-frontend`,
https://github.com/Leonxlnx/taste-skill), адаптированная под CV Tailor.
Действует на **лендинг** и **личный кабинет (ЛК)**. Любой новый UI обязан
проходить эти правила.

## 0. Baseline (дайлы taste-skill)

- `DESIGN_VARIANCE: 7` — асимметрия, split-screen, никаких центрированных hero.
- `MOTION_INTENSITY: 5` — плавный CSS (`transition`, keyframe-reveal). Без
  Framer Motion / GSAP, пока их нет в `package.json`.
- `VISUAL_DENSITY: 4` (лендинг) / `6` (ЛК) — кабинет плотнее, данные дышат
  через `border`/`divide`, а не через коробки-карточки.

## 1. Палитра (1 акцент, saturation-controlled)

| Токен        | Значение            | Применение                          |
|--------------|---------------------|-------------------------------------|
| `bg`         | `#09090b` zinc-950  | фон страницы (НИКОГДА не `#000000`)  |
| `surface`    | `zinc-900/50`       | приподнятые поверхности              |
| `border`     | `zinc-800`          | разделители, 1px рамки               |
| `text`       | `zinc-50`           | основной текст                       |
| `muted`      | `zinc-400`          | вторичный текст, max-w-[65ch]        |
| **`accent`** | `emerald-400 #34d399` / `emerald-500` (action) | **единственный** акцент |

**Запрещено (THE LILA BAN):** фиолетовый/AI-purple, неоновые градиенты,
свечения `box-shadow`, градиентный текст в заголовках, oversaturated-акценты.
Тени — только тонкие, тонированные в фон. Один палитра-набор на весь проект,
без смешения тёплых/холодных серых.

## 2. Типографика

- **Display/Headline:** `Outfit` — `text-4xl md:text-6xl tracking-tighter
  leading-none`. Иерархия — весом и цветом, не гигантским размером.
- **Body:** `Outfit` — `text-base text-zinc-400 leading-relaxed max-w-[65ch]`.
- **Числа / eyebrow-метки / код:** `JetBrains Mono` (`font-mono`),
  `text-xs tracking-[0.14em] uppercase` для меток.
- **Запрещено:** `Inter`, `Arial`, serif в любом UI (особенно в ЛК),
  text-fill градиенты на крупных заголовках.

## 3. Layout

- Контейнер: `max-w-7xl mx-auto px-6` (узкие зоны — `max-w-3xl`).
- Full-height: **только** `min-h-[100dvh]`, никогда `h-screen`.
- Структуры: CSS Grid (`grid grid-cols-1 md:grid-cols-12 gap-6`), не
  flex-проценты.
- **Anti-center:** hero — split / left-aligned / асимметрия. Центрированный
  H1 запрещён.
- **Mobile override:** на `< md` любая асимметрия схлопывается в один столбец
  (`w-full px-4`).

## 4. Компоненты

- **Карточки — по необходимости.** Когда elevation не несёт смысла —
  группируй через `border-t` / `divide-y` / негативное пространство.
  **Ряд из 3 одинаковых карточек запрещён** → 2-колоночный zig-zag, bento
  или асимметричная сетка. Подписи к bento-тайлам — *под* тайлом.
- **Формы:** label НАД полем, helper-текст в разметке, ошибка ПОД полем,
  блок `gap-2`. Поля: `rounded-xl border border-zinc-800 bg-zinc-900/50`,
  focus → `border-emerald-500 ring-2 ring-emerald-500/20`.
- **Состояния обязательны:** loading (скелетоны под размер контента, не
  спиннеры), empty (красиво оформленный, объясняет как заполнить), error
  (инлайн под полем).
- **Tactile feedback:** на `:active` — `scale-[0.98]` или
  `-translate-y-[1px]`.

## 5. Иконки

- Только чистые SVG-примитивы (или `@phosphor-icons/react` /
  `@radix-ui/react-icons`, если установим). Единый `strokeWidth` = `1.5`.
- **ANTI-EMOJI:** эмодзи в коде/разметке/alt запрещены.

## 6. Motion (CSS-only пока)

- `transition: all .3s cubic-bezier(0.16,1,0.3,1)`.
- Анимируем **только** `transform` и `opacity` (HW-acceleration). Никогда
  `top/left/width/height`.
- Load-in — каскад через `animation-delay`. Без `z-50`-спама.

## 7. Контент (anti-slop)

- Без «Elevate / Seamless / Unleash / Next-Gen». Конкретные глаголы.
- Имена/числа — органичные (`Алина Ковалёва`, `87%`, `+1 (312) 847-1928`),
  не `John Doe` / `99.99%`.
- Картинки-плейсхолдеры: `https://picsum.photos/seed/{slug}/800/600`, не
  Unsplash.

## 8. Pre-flight перед коммитом

- [ ] Нет фиолетового / неоновых свечений / градиентного текста.
- [ ] `min-h-[100dvh]`, не `h-screen`.
- [ ] Нет ряда из 3 равных карточек.
- [ ] Mobile схлопывается в один столбец.
- [ ] Есть empty / loading / error состояния.
- [ ] Анимации — `transform`/`opacity`, с cleanup в `useEffect`.
- [ ] Шрифт — Outfit/JetBrains Mono, не Inter/Arial/serif.
