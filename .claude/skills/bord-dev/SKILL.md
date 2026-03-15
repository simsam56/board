---
name: bord-dev
description: >
  Development skill for Bord, a personal life dashboard (Next.js 16 + Tailwind 4 + TypeScript).
  Encodes the design system, component patterns, API conventions, and domain model so Claude
  can build features without re-learning the project each session. Use this skill whenever
  working on the Bord frontend: creating or modifying pages, components, hooks, API calls,
  or anything in the frontend/ directory. Also trigger on "ajoute un widget", "crée un composant",
  "nouvelle page", "onglet Pilotage", "refonte dashboard", "travaille sur Bord", or any UI
  development task on Bord/PerformOS. Even if the user just says "travaille sur le dashboard",
  "améliore l'onglet Santé", "ajoute une feature au tableau de bord", or mentions "Bord",
  this skill applies.
---

# Bord Dev

You are developing on **Bord**, a personal life dashboard covering health, work, social, and ideas.
The project is also known as "PerformOS" internally (pyproject.toml name). This skill gives you
everything to build features that feel native — design tokens, component patterns, API conventions,
domain types, and launch commands.

**Project root:** `board/` — the frontend lives in `frontend/`.

## Stack (verified from package.json + pyproject.toml)

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.9
- **Styling:** Tailwind CSS 4 via @tailwindcss/postcss, custom @theme tokens in globals.css
- **Data fetching:** @tanstack/react-query 5 (hooks in lib/queries/)
- **Drag & drop:** @dnd-kit/core + @dnd-kit/sortable
- **Charts:** Recharts 3
- **Animations:** Framer Motion 12
- **Icons:** lucide-react
- **Validation:** Zod 4
- **Toasts:** Sonner
- **Utils:** clsx
- **Backend:** Python 3.11+ FastAPI (pyproject.toml name: "performos"), port 8765
- **Proxy:** Next.js rewrites `/api/python/:path*` → `http://127.0.0.1:8765/api/:path*`
- **Linting (Python):** Ruff, line-length 100

## Commands

```bash
# Frontend
cd frontend && npm run dev      # Next.js dev server (port 3001)
cd frontend && npm run build    # Production build
cd frontend && npm run start    # Start production server

# Backend (FastAPI — the canonical server)
cd board && python -m uvicorn api.main:app --host 127.0.0.1 --port 8765
```

**Note:** Use `./start-board.command` to launch both backend and frontend in one click.

## Project structure

```
board/
├── api/
│   ├── main.py                # FastAPI app entry
│   ├── deps.py                # Shared dependencies
│   └── routes/
│       ├── activities.py      # /api/activities/*
│       ├── calendar.py        # /api/planner/calendar/*
│       ├── health.py          # /api/health/* + /api/dashboard
│       ├── muscles.py         # /api/muscles/*
│       ├── planner.py         # /api/planner/* (events, tasks, board)
│       └── training.py        # /api/training/* (ACWR, PMC)
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout: Inter font, NavTabs, max-w-7xl
│   │   ├── page.tsx           # Redirects to /semaine
│   │   ├── globals.css        # @theme tokens, glass effects
│   │   ├── providers.tsx      # QueryClientProvider
│   │   ├── semaine/page.tsx   # Vue semaine (accueil): MetricPills, events, backlog
│   │   ├── sante/page.tsx     # Onglet Santé: ThreeRings, 6 MetricCards, running, activities
│   │   ├── travail/page.tsx   # Onglet Travail: heures KPI, tâches, backlog
│   │   ├── social/page.tsx    # Onglet Social: heures KPI, événements, placeholder contacts
│   │   └── idees/page.tsx     # Onglet Idées: capture form + liste (uses useBoardTasks)
│   ├── components/
│   │   ├── ui/nav-tabs.tsx    # Navigation par onglets (5 tabs, lucide icons)
│   │   └── health/
│   │       ├── metric-card.tsx  # MetricCard: icon, label, value, freshness bar, optional badge
│   │       └── three-rings.tsx  # ThreeRings: SVG animated rings (recovery/activity/sleep)
│   ├── lib/
│   │   ├── api.ts             # fetchAPI / mutateAPI (proxy vers Python)
│   │   ├── types.ts           # Types miroir des modèles Pydantic
│   │   ├── constants.ts       # CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS, TRIAGE_*
│   │   └── queries/
│   │       ├── use-dashboard.ts    # useDashboard() — staleTime 5min, refetch 60s
│   │       └── use-planner.ts      # usePlannerEvents, useBoardTasks, useCreateTask, useUpdateTask, useDeleteTask, useSyncCalendar
│   └── next.config.ts         # Proxy rewrite config
├── athlete.db                 # SQLite database
├── pyproject.toml             # Python config (Ruff, metadata)
└── requirements.txt           # Python dependencies
```

## Design system tokens

All colors are defined as Tailwind @theme tokens in globals.css. Use them via Tailwind classes.

### Surfaces (dark layered)
- `bg-bg` (#0a0e1a) — page background
- `bg-surface-0` — rgba(255,255,255,0.03) — list items, nav background
- `bg-surface-1` — rgba(255,255,255,0.06) — card background (via .glass)
- `bg-surface-2` — rgba(255,255,255,0.10) — emphasized card (via .glass-strong), progress bar tracks
- `bg-surface-3` — rgba(255,255,255,0.14) — extra emphasis (available but rarely used)

### Text
- `text-text-primary` (#f1f5f9) — headings, main text, values
- `text-text-secondary` (#94a3b8) — secondary content
- `text-text-muted` (#64748b) — labels, timestamps, placeholders

### Accent colors
- `accent-blue` (#3b82f6) — primary action, Travail domain
- `accent-green` (#22c55e) — Sport, health positive, freshness good
- `accent-yellow` (#ff9f0a) — Warning, Idées, freshness medium
- `accent-red` (#ff3b30) — Danger, alert, freshness stale
- `accent-pink` (#ec4899) — Social domain
- `accent-purple` (#a855f7) — Yoga, sleep ring

### Domain colors (CSS custom properties)
Defined as `--color-xxx` in globals.css. Tailwind generates classes like `text-sport`, `bg-travail`, etc.
**Caveat:** `text-formation` may not resolve correctly in all contexts — prefer `style={{ color: "var(--color-formation)" }}` for non-accent domain colors.
- `sport` → #22c55e (= accent-green)
- `yoga` → #a855f7 (= accent-purple)
- `travail` → #3b82f6 (= accent-blue)
- `formation` → #06b6d4 (no accent alias — use CSS var)
- `social` → #ec4899 (= accent-pink)
- `lecon` → #f59e0b (no accent alias — use CSS var)
- `autre` → #64748b (= text-muted)

Use `CATEGORY_COLORS` from `lib/constants.ts` for `style={{ color }}` — it returns CSS var() references.
**Known issue:** `semaine/page.tsx` still has a local `getCategoryColor()` with hardcoded hex values instead of using CATEGORY_COLORS from constants. Prefer the constants version for new code.

### Glass effects (CSS classes, not Tailwind)
- `.glass` — surface-1 + blur(12px) + subtle border. Standard cards.
- `.glass-strong` — surface-2 + blur(20px). Hero/featured sections (e.g., Readiness rings on /sante).

## Existing components

### MetricCard (components/health/metric-card.tsx)
Health metric display with freshness indicator. Props:
```tsx
interface MetricCardProps {
  icon: LucideIcon;       // From lucide-react
  label: string;          // e.g., "HRV", "FC Repos"
  value: number | null | undefined;  // null/undefined renders "—"
  unit: string;           // e.g., "ms", "bpm", "h"
  daysOld?: number | null; // Shows "Auj.", "Hier", "J-N"
  freshness: number;      // 0-1, drives color bar (≥0.8 green, ≥0.5 yellow, <0.5 red)
  badge?: string;         // Optional status badge (e.g., ACWR zone)
}
```

### ThreeRings (components/health/three-rings.tsx)
Animated SVG ring chart (recovery, activity, sleep). Each ring 0-100. Uses framer-motion for entry animation. Props: `{ recovery: number; activity: number; sleep: number }`.
Ring colors are hardcoded in the component: recovery=#30d158, activity=#3b82f6, sleep=#a855f7.

### NavTabs (components/ui/nav-tabs.tsx)
Top navigation with 5 tabs: Semaine, Santé, Travail, Social, Idées. Uses `usePathname()` + `clsx` for active state. Active tab gets `bg-accent-blue/20 text-accent-blue`.

## Component patterns

### Animations & loading
- Wrap each section in `<FadeInSection delay={n}>` (increments of 0.08s). Component in `components/health/fade-in-section.tsx`.
- Use `<SectionSkeleton variant="pills|chart|map" />` as loading fallback. Component in `components/health/section-skeleton.tsx`.
- Charts: `recharts` with `<ResponsiveContainer>` (no fixed dimensions).

### Responsive layout
- `space-y-6` between sections, `grid gap-3 sm:grid-cols-N lg:grid-cols-N` for responsive grids.
- Grids go from 1 column (mobile) to N columns (desktop). No fixed widths — use `w-full` and `flex-1`.

### Page structure
Each page follows this skeleton:
```tsx
"use client";
import { useDashboard } from "@/lib/queries/use-dashboard";
import { FadeInSection } from "@/components/health/fade-in-section";
import { SectionSkeleton } from "@/components/health/section-skeleton";

export default function XxxPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <SectionSkeleton variant="pills" />;
  if (error) return <ErrorCard />;

  return (
    <div className="space-y-6">
      <FadeInSection delay={0.08}>
        {/* KPI pills or metrics at top */}
      </FadeInSection>
      <FadeInSection delay={0.16}>
        {/* Main content cards */}
      </FadeInSection>
    </div>
  );
}
```

### Card anatomy
```tsx
<div className="glass rounded-2xl p-5">
  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
    <Icon className="h-4 w-4 text-accent-xxx" />
    Title
  </h3>
  {/* Content */}
</div>
```

### KPI pill (inline metric at top of page)
```tsx
<div className="glass rounded-xl px-4 py-3">
  <div className="text-xs font-medium text-text-muted">{label}</div>
  <div className="mt-1 flex items-baseline gap-1">
    <span className="text-2xl font-bold" style={{ color }}>{value}</span>
    <span className="text-sm text-text-muted">{unit}</span>
  </div>
</div>
```

### List item
```tsx
<div className="flex items-center gap-3 rounded-lg bg-surface-0 px-3 py-2">
  <div className="h-2 w-2 rounded-full" style={{ background: categoryColor }} />
  <span className="flex-1 text-sm">{title}</span>
  <span className="text-xs text-text-muted">{meta}</span>
</div>
```

### Loading spinner
```tsx
<div className="flex h-64 items-center justify-center">
  <div className="h-8 w-8 animate-spin rounded-full border-2 border-{domain-color} border-t-transparent" />
</div>
```

### Progress bar
```tsx
<div className="mt-2 h-1.5 w-full rounded-full bg-surface-2">
  <div className="h-full rounded-full bg-accent-xxx transition-all"
       style={{ width: `${percent}%` }} />
</div>
```

### Empty state
```tsx
<p className="text-text-muted text-sm">Message descriptif ici.</p>
```

### Category pill (tag badge)
```tsx
<span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
      style={{ background: `${color}20`, color }}>
  {category}
</span>
```

## API conventions

### Reading data
All read operations primarily go through `useDashboard()` — a single endpoint that returns everything. The `/api/dashboard` response maps to `DashboardData` (lib/types.ts):

```tsx
const { data } = useDashboard();
data?.health          // HealthMetrics — flat fields, NOT nested objects
data?.readiness       // ReadinessData — score, label, color (hex), components, confidence
data?.acwr            // ACWRData — acwr, acwr_roll, acwr_ewma, acute, chronic, zone
data?.pmc             // PMCData — current {ctl, atl, tsb} + series (PMCPoint[])
data?.running         // RunningData — sessions, total_km, km_per_week, predictions
data?.muscles         // { zones, weekly_volume, alerts (MuscleAlert[]) }
data?.week.summary    // WeekSummary — sante_h, travail_h, relationnel_h, apprentissage_h, etc.
data?.week.events     // PlannerEvent[]
data?.week.board      // BoardTask[]
data?.activities.recent       // Activity[]
data?.activities.hours_series // { week: string, hours: number }[]
```

### Separate query hooks (for targeted fetching)
```tsx
import { usePlannerEvents, useBoardTasks } from "@/lib/queries/use-planner";

const { data } = usePlannerEvents(startDate, endDate); // → { ok, events: PlannerEvent[] }
const { data } = useBoardTasks();                       // → { ok, tasks: BoardTask[] }
```
The /idees page uses `useBoardTasks()` instead of `useDashboard()` — follow this pattern when a page only needs planner data.

### Mutations
Use the hooks in lib/queries/use-planner.ts:
- `useCreateTask()` — POST /planner/tasks
- `useUpdateTask()` — PATCH /planner/tasks/:id (pass `{ id, ...fields }`)
- `useDeleteTask()` — DELETE /planner/tasks/:id
- `useSyncCalendar()` — POST /planner/calendar/sync

All mutations auto-invalidate `["planner-events"]`, `["board-tasks"]`, and `["dashboard"]`.

### Adding a new API endpoint
1. Add the route in Python: `api/routes/xxx.py`, register in `api/main.py`
2. Add the TypeScript type in `lib/types.ts` (mirror Pydantic model)
3. Create a query hook in `lib/queries/use-xxx.ts`
4. Or if the data fits, extend the DashboardData type and backend `/api/dashboard` endpoint

## Domain model (key types from lib/types.ts)

### Core enums
- **Category:** `"sport" | "yoga" | "travail" | "formation" | "social" | "lecon" | "autre"`
- **TriageStatus:** `"a_determiner" | "urgent" | "a_planifier" | "non_urgent" | "termine"`

### HealthMetrics (flat — NOT nested objects)
```tsx
health?.hrv           // number | null — value in ms
health?.hrv_date      // string | null — ISO date
health?.hrv_days_old  // number | null — 0 = today, 1 = yesterday
health?.hrv_baseline  // number | null — baseline comparison
health?.hrv_freshness // number 0-1 — 1.0 = fresh, 0.0 = stale
// Same pattern for: rhr, sleep_h, vo2max, body_battery, weight_kg
// Each has: value, _date, _days_old, _freshness
// rhr and hrv also have _baseline
```
**Never** write `health.hrv.value` — it's `health.hrv` directly.

### ReadinessData
`{ score: number, label: string, color: string (hex), components: Record<string, number>, confidence: number, freshness: Record<string, number> }`
The `color` field is a hex string (e.g., `"#22c55e"`). Use via `style={{ color }}`, not Tailwind class.

### ACWRData
`{ acwr: number, acwr_roll: number, acwr_ewma: number, acute: number, chronic: number, zone: string }`
Zone values: `"optimal"`, `"surcharge"`, etc.

### PMCData
`{ current: { ctl, atl, tsb }, series: PMCPoint[] }` where PMCPoint = `{ date, ctl, atl, tsb, tss? }`

### RunningData
`{ sessions, total_km, km_per_week, avg_pace, avg_pace_str, predictions: Record<string, string>, pred_10k_confidence }`

### Muscles
`{ zones: Record<string, number>, weekly_volume: Record<string, Record<string, unknown>>, alerts: MuscleAlert[] }`
MuscleAlert = `{ level, type, muscle, message, current, target, icon? }`

### PlannerEvent
```tsx
{ id, task_id, title, category, start_at, end_at, notes, source: "local" | "apple_calendar",
  calendar_uid, calendar_name, editable, triage_status, scheduled }
```

### BoardTask
`{ id, title, category, triage_status, notes, created_at }`

### Activity
`{ id, source, type, name, started_at, duration_s, duration_str, distance_m, distance_km, calories, avg_hr, tss }`

### WeekSummary
`{ sante_h, travail_h, relationnel_h, apprentissage_h, autre_h, total_h }`

## Coding rules

- TypeScript strict. No `any`. Use types from lib/types.ts.
- Components are "use client" by default (data fetching via react-query).
- Keep components small (<100 lines). Extract logic into hooks (lib/queries/), helpers (lib/), or sub-components (components/{domain}/).
- Use `clsx` for conditional classes, never string concatenation.
- Use `lucide-react` for all icons. Check existing usage before adding new ones.
- French for user-facing text (labels, messages, headings).
- English for code (variable names, types, comments if needed).
- Use `CATEGORY_COLORS` / `CATEGORY_LABELS` / `CATEGORY_ICONS` from `lib/constants.ts` — don't duplicate color maps.
- Use `TRIAGE_LABELS` and `TRIAGE_ORDER` from `lib/constants.ts` for triage status display.
- Handle null data gracefully: show `"—"` for missing values, empty state messages for empty lists.
- Commit messages in French: `"feat: ajoute widget HRV"`, `"fix: corrige affichage readiness"`.

## How to add a new widget or card

1. Check if the data exists in DashboardData (lib/types.ts)
2. If not, extend the backend endpoint and add the type
3. Create the component in `components/{domain}/` following the Card anatomy pattern
4. Use it in the page with `.glass` card wrapper
5. Use domain accent color for the icon and highlights
6. Handle loading (spinner) and null data (fallback `"—"`)
7. Keep the component under 100 lines. If larger, split.

## Existing pages status

| Page | Status | What's there | Notable |
|------|--------|-------------|---------|
| /semaine | MVP | MetricPills (readiness, sport, travail, social), event list, backlog list | Local getCategoryColor — should migrate to constants |
| /sante | Good | ThreeRings, 6 MetricCards (HRV, RHR, sommeil, VO2max, body battery, ACWR), running card, recent activities | Most complete page |
| /travail | MVP | Hours KPI with progress bar, formation KPI, task list, backlog | Filters events by category="travail" |
| /social | Minimal | Hours KPI, event list, placeholder for contact tracker | Contact alerts (>30j) planned |
| /idees | Good | Capture form with category select, idea list | Uses useBoardTasks() not useDashboard() |

## Inline helpers in pages (not yet extracted)

Several pages define local helper functions that are candidates for extraction:
- `semaine/page.tsx`: `getCategoryColor()` (hardcoded hex → use CATEGORY_COLORS), `MetricPill` component, `formatTime()`
- `sante/page.tsx`: `getActivityIcon()` (emoji map by activity type), `formatDate()`
- `travail/page.tsx`: uses `text-formation` Tailwind class which may not resolve (use style= instead)

When building new features, prefer shared utilities over local helpers.

## Known technical debt

1. `semaine/page.tsx` defines local `getCategoryColor()` and `MetricPill` — extract to shared components/constants
2. `travail/page.tsx` uses `text-formation` class directly — should use `style={{ color: "var(--color-formation)" }}`
3. `components/charts/` and `components/planner/` directories exist but are empty — ready for future components
4. `@dnd-kit` is in dependencies but not yet used in any component
5. No tests yet
6. Legacy servers (`cockpit_server.py`, `server_simple.py`) have been removed in the board/ migration
