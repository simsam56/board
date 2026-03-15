---
name: fix-bug
description: Diagnostiquer et corriger un bug dans Bord avec reproduction, fix et vérification
autoTrigger: false
---

# Fix Bug — Bord

## Quand utiliser

Utilise ce skill quand l'utilisateur :
- Signale un bug, une erreur, ou un comportement inattendu
- Voit une erreur dans la console, un crash, ou des données incorrectes
- Dit que "quelque chose ne marche pas" ou "c'est cassé"

Ce skill a des effets de bord (modification de fichiers, exécution de tests). Il ne se déclenche jamais automatiquement.

## Architecture du projet (rappel)

- **Backend** : FastAPI dans `api/`, analytics dans `analytics/`, pipeline dans `pipeline/`, DB SQLite
- **Frontend** : Next.js 16 dans `frontend/`, composants dans `frontend/components/`, hooks dans `frontend/lib/queries/`
- **Tests** : `tests/` (pytest). Pas de tests frontend pour l'instant.
- **API proxy** : Next.js `/api/python/` redirige vers backend `:8765/api/`

## Processus

### 1. Reproduire le problème
- Identifier la page/route/action concernée
- Vérifier les logs backend (terminal FastAPI) et frontend (console navigateur)
- Si erreur API : tester le endpoint directement avec `curl http://localhost:8765/api/...`
- Si erreur UI : identifier le composant en cause dans `frontend/components/` ou `frontend/app/`
- Formuler clairement le symptôme observé vs le comportement attendu

### 2. Diagnostiquer la cause racine
- **Erreur backend** : tracer depuis la route (`api/routes/`) vers la logique analytics (`analytics/`) et les requêtes DB (`pipeline/`)
- **Erreur frontend** : vérifier le hook React Query (`frontend/lib/queries/`), les types (`frontend/lib/types.ts`), le composant, et la shape des données API
- **Erreur d'intégration** : vérifier la correspondance entre le modèle Pydantic backend et le type TypeScript frontend
- Ne pas deviner : lire le code, ajouter des logs temporaires si nécessaire

### 3. Implémenter le fix
- Corriger au niveau le plus bas possible (la cause, pas le symptôme)
- Si le fix touche un type Pydantic, mettre à jour le miroir TypeScript dans `frontend/lib/types.ts`
- Respecter les conventions existantes (glassmorphism, nommage français, etc.)
- Un fix = un changement minimal et ciblé

### 4. Vérifier le fix
- Relancer la reproduction du step 1 et confirmer que le bug est corrigé
- **Backend** : `cd /home/user/board && python -m pytest tests/ -x -q`
- **Frontend** : `cd /home/user/board/frontend && npx next build` (vérifier qu'il compile)
- Tester manuellement dans le navigateur si pertinent

### 5. Vérifier les régressions
- Lancer la suite de tests complète : `python -m pytest tests/ -q`
- Vérifier que les pages adjacentes ne sont pas cassées (les hooks React Query partagent souvent le même endpoint `/dashboard`)
- Si le fix modifie un calcul dans `analytics/`, vérifier les autres routes qui appellent la même fonction

### 6. Résumer
Produire un résumé court :
```
**Bug** : [description du symptôme]
**Cause** : [explication de la cause racine]
**Fix** : [fichiers modifiés et nature du changement]
**Vérification** : [tests passés, reproduction confirmée]
```
