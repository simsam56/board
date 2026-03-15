---
name: dashboard-ui
description: Concevoir et implémenter des écrans dashboard pour Bord (glassmorphism, React 19, TailwindCSS 4, Recharts)
---

# Dashboard UI — Bord

## Quand utiliser

Utilise ce skill quand l'utilisateur veut :
- Créer une nouvelle page ou section de dashboard
- Ajouter un nouveau composant UI (carte, graphique, widget)
- Refactorer ou améliorer un écran existant
- Corriger un problème de layout ou de responsive

## Conventions du projet

- **Design** : dark mode glassmorphism. Classe `glass` (surface-1 + blur 12px) ou `glass-strong` (surface-2 + blur 20px) sur les conteneurs. Coins `rounded-xl` (cartes) ou `rounded-2xl` (sections).
- **Couleurs** : utiliser les tokens CSS — `text-primary`, `text-secondary`, `text-muted`, `accent-blue`, `accent-green`, `accent-yellow`, `accent-red`, `sport`, `yoga`, `travail`, `formation`, `social`, `lecon`, `autre`. Définis dans `frontend/app/globals.css`.
- **Animations** : wrapper chaque section dans `<FadeInSection delay={n}>` (incréments de 0.08s). Composant dans `frontend/components/health/fade-in-section.tsx`.
- **Loading** : utiliser `<SectionSkeleton variant="pills|chart|map" />` pendant le chargement. Composant dans `frontend/components/health/section-skeleton.tsx`.
- **Data fetching** : hooks React Query dans `frontend/lib/queries/`. Pattern : `useQuery<Type>({ queryKey, queryFn: () => fetchAPI<Type>(path), staleTime, refetchInterval })`.
- **Types** : tous les types dans `frontend/lib/types.ts`, miroir des modèles Pydantic backend.
- **API client** : `fetchAPI<T>(path)` et `mutateAPI<T>(path, method, body)` dans `frontend/lib/api.ts`. Proxy Next.js `/api/python/` vers le backend `:8765/api/`.
- **Langue** : labels et textes en français.
- **Layout** : `space-y-6` entre sections, `grid gap-3 sm:grid-cols-N lg:grid-cols-N` pour les grilles responsives.
- **Icônes** : `lucide-react`.
- **Graphiques** : `recharts` (ResponsiveContainer, pas de dimensions fixes).

## Processus

### 1. Comprendre le besoin
Clarifier ce que l'utilisateur veut afficher : quelles données, quel type de visualisation, quelle page cible.

### 2. Vérifier les composants existants
Parcourir `frontend/components/health/` et `frontend/components/ui/` pour identifier les composants réutilisables. Vérifier si un composant similaire existe déjà (MetricCard, TrendPill, ACWRGauge, etc.).

### 3. Vérifier le modèle de données
- Regarder `frontend/lib/types.ts` pour les types existants
- Regarder `api/routes/` pour les endpoints disponibles
- Si de nouvelles données sont nécessaires, planifier le endpoint backend d'abord

### 4. Implémenter le composant
- Fichier dans `frontend/components/health/` (santé/sport) ou `frontend/components/ui/` (générique)
- `"use client"` en haut du fichier
- Props typées avec interface explicite
- Classe `glass rounded-xl p-3` pour les cartes, `glass rounded-2xl p-5` pour les sections
- Texte : `text-xs text-text-muted` pour labels, `text-xl font-bold text-text-primary` pour valeurs

### 5. Intégrer dans la page
- Ajouter le composant dans la page cible (`frontend/app/{page}/page.tsx`)
- Wrapper dans `<FadeInSection>` avec delay séquentiel
- Ajouter `<SectionSkeleton>` comme fallback de chargement
- Si nouvelles données : créer/enrichir le hook React Query dans `frontend/lib/queries/`

### 6. Vérifier le responsive
- Tester visuellement les breakpoints : mobile (default), `sm:` (640px), `lg:` (1024px)
- Les grilles doivent passer de 1 colonne (mobile) à N colonnes (desktop)
- Pas de largeur fixe, utiliser `w-full` et `flex-1`

## Référence rapide — Pattern type

```tsx
"use client";
import { FadeInSection } from "@/components/health/fade-in-section";
import { SectionSkeleton } from "@/components/health/section-skeleton";

// Dans la page :
<FadeInSection delay={0.08}>
  {isLoading ? (
    <SectionSkeleton variant="chart" />
  ) : (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-4 text-lg font-semibold">Titre</h2>
      {/* contenu */}
    </div>
  )}
</FadeInSection>
```
