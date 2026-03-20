---
name: frontend-dashboard
description: >
  Skill frontend pour Bord (Next.js 16 + Tailwind 4 + TypeScript).
  Design system, component patterns, hooks React Query, page structure.
  Trigger: travail dans frontend/, "ajoute un widget", "crée un composant",
  "nouvelle page", "refonte dashboard", "onglet Santé", ou toute tâche UI sur Bord.
---

# Frontend Dashboard — Bord

Skill centré **frontend uniquement**. Pour le backend planner → `/planner-backend`.
Pour la pipeline santé → `/health-pipeline`. Pour la sync types → `/api-contract-sync`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript 5.9 strict
- Tailwind CSS 4 (@theme tokens dans `globals.css`)
- @tanstack/react-query 5 (hooks dans `lib/queries/`)
- Recharts 3 · Framer Motion 12 · lucide-react · Sonner · clsx · Zod 4
- @dnd-kit/core + @dnd-kit/sortable (drag & drop semaine)
- Proxy : `/api/python/:path*` → `http://127.0.0.1:8765/api/:path*`

## Design tokens (globals.css)

### Surfaces (dark layered)
| Token | Usage |
|-------|-------|
| `bg-bg` | Page background (#0a0e1a) |
| `bg-surface-0` | List items, nav |
| `bg-surface-1` | Cards (`.glass`) |
| `bg-surface-2` | Hero sections (`.glass-strong`), progress tracks |

### Text
`text-text-primary` · `text-text-secondary` · `text-text-muted`

### Accents
`accent-blue` (travail) · `accent-green` (sport) · `accent-yellow` (idées, warning) · `accent-red` (danger) · `accent-pink` (social) · `accent-purple` (yoga, sleep)

### Domain colors (CSS vars)
Utilise `CATEGORY_COLORS` de `lib/constants.ts` via `style={{ color }}`.
**Ne pas** utiliser `text-formation` (peut ne pas résoudre) — préférer `style={{ color: "var(--color-formation)" }}`.

## Component patterns

### Page skeleton
```tsx
"use client";
const { data, isLoading, error } = useDashboard();
if (isLoading) return <SectionSkeleton variant="pills" />;
if (error) return <ErrorCard />;
return (
  <div className="space-y-6">
    <FadeInSection delay={0.08}>{/* section */}</FadeInSection>
  </div>
);
```

### Card anatomy
```tsx
<div className="glass rounded-2xl p-5">
  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
    <Icon className="h-4 w-4 text-accent-xxx" />
    Titre
  </h3>
</div>
```

### Animations & loading
- `<FadeInSection delay={n}>` (incréments de 0.08s)
- `<SectionSkeleton variant="pills|chart|map" />` en fallback
- Charts : `recharts` + `<ResponsiveContainer>`

## Data fetching

### Lecture principale
```tsx
const { data } = useDashboard(); // GET /api/dashboard, staleTime 5min
data?.health        // HealthMetrics (champs plats : hrv, hrv_date, hrv_freshness…)
data?.readiness     // { score, label, color (hex), components, confidence }
data?.acwr          // { acwr, zone, acute, chronic, low_data }
data?.pmc           // { current: {ctl,atl,tsb}, series }
data?.running       // { predictions, km_per_week, pred_10k_confidence }
data?.muscles       // { zones, weekly_volume, alerts }
data?.week          // { summary, events, board }
data?.activities    // { recent, hours_series }
```

### Hooks ciblés
```tsx
usePlannerEvents(start?, end?)  // staleTime 10s
useBoardTasks()                 // staleTime 10s
useCreateTask() / useUpdateTask() / useDeleteTask()
// Auto-invalidate: ["planner-events"], ["board-tasks"], ["dashboard"]
```

### Health-specific
`useHealthHighlights()` · `useWeeklyTrends(weeks)` · `useWeeklyLoad()` · `usePredictionHistory()`

## Types clés (lib/types.ts)

- **Category** : `"sport" | "yoga" | "travail" | "formation" | "social" | "lecon" | "autre"`
- **TriageStatus** : `"a_determiner" | "urgent" | "a_planifier" | "non_urgent" | "termine"`
- **HealthMetrics** : champs plats (`health.hrv`, pas `health.hrv.value`)
- **ReadinessData** : `color` est un hex string → `style={{ color }}`, pas Tailwind
- **PlannerEvent** : `{ id, task_id, title, category, start_at, end_at, source, calendar_uid, editable }`
- **BoardTask** : `{ id, title, category, triage_status, notes, created_at }`

## Règles

- TypeScript strict, pas de `any` — types depuis `lib/types.ts`
- Composants < 100 lignes, extraire en sub-components si plus
- `lucide-react` exclusivement pour les icônes
- `CATEGORY_COLORS` / `CATEGORY_LABELS` / `TRIAGE_LABELS` de `lib/constants.ts` — ne pas dupliquer
- Texte UI en français, code en anglais
- Null data → `"—"` pour valeurs, message vide pour listes
- Commits en français : `"feat: ajoute widget HRV"`
