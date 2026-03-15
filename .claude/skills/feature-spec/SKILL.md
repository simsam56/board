---
name: feature-spec
description: Transformer une idée de feature en spec structurée avec plan d'implémentation pour Bord
---

# Feature Spec — Bord

## Quand utiliser

Utilise ce skill quand l'utilisateur :
- A une idée de feature et veut la spécifier avant de coder
- Veut comprendre l'impact d'un changement sur le backend et le frontend
- Demande un "plan", "spec", ou "comment on ferait pour..."

## Processus

### 1. Comprendre l'idée
Poser des questions ciblées si nécessaire : quel problème ça résout, pour qui, quelle page/section est concernée.

### 2. Analyser le code existant
- **Données** : vérifier `analytics/` (training_load.py, muscle_groups.py, planner.py) pour les calculs existants
- **API** : parcourir `api/routes/` (health.py, training.py, muscles.py, planner.py, activities.py, calendar.py) pour les endpoints proches
- **Types** : consulter `frontend/lib/types.ts` pour les structures de données actuelles
- **UI** : regarder `frontend/components/health/` et les pages dans `frontend/app/` pour les patterns visuels
- **DB** : vérifier le schéma dans `pipeline/schema.py` si des nouvelles tables sont nécessaires

### 3. Rédiger la spec
Produire un document structuré avec le format ci-dessous.

### 4. Estimer la complexité
Évaluer en T-shirt size (S/M/L/XL) et lister les risques ou points d'attention.

### 5. Valider avec l'utilisateur
Présenter la spec et demander confirmation avant toute implémentation.

## Format de sortie

```
## Feature : [Nom]

### Contexte
[Quel problème ça résout, pourquoi maintenant]

### User Story
En tant que [utilisateur], je veux [action] afin de [bénéfice].

### Modèle de données
- Tables impactées : [tables SQLite existantes ou nouvelles]
- Nouveaux champs / nouvelles tables : [détail]
- Migration nécessaire : oui/non

### API (backend)
- [ ] `GET/POST /api/...` — [description]
- [ ] Fonction analytics : `analytics/[fichier].py` — [description]
- [ ] Route FastAPI : `api/routes/[fichier].py` — [description]

### UI (frontend)
- Page cible : `frontend/app/[page]/page.tsx`
- Composants à créer : `frontend/components/[dossier]/[nom].tsx`
- Composants réutilisés : [FadeInSection, SectionSkeleton, MetricCard, ...]
- Hook React Query : `frontend/lib/queries/use-[nom].ts`
- Types à ajouter : `frontend/lib/types.ts`

### Description visuelle
[Description du rendu : layout en grille, type de carte glass, graphiques Recharts, interactions]

### Plan d'implémentation
1. [ ] Backend : ...
2. [ ] Types : ...
3. [ ] Hook React Query : ...
4. [ ] Composant(s) : ...
5. [ ] Intégration page : ...
6. [ ] Tests : pytest pour analytics (`tests/test_[nom].py`)

### Complexité : [S/M/L/XL]

### Risques
- [risque 1]
- [risque 2]
```
