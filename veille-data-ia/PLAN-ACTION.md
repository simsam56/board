# Plan d'action — Offre Accompagnement / Formation Data & IA (Lorient)

> Deux systèmes + prompts sous-agents prêts à lancer pour produire les plans d'action détaillés.
> Contexte figé au fil des échanges (juillet 2026).

## Profil & offre figés

- **Positionnement** : « je rends vos équipes autonomes » — accompagnement + formation + intégration des données + gouvernance/droit des données. Les outils sont secondaires, on vend le résultat.
- **Méthode** : audit-first → définition des usages + chartes + volet réglementaire → choix des bons outils → mise en place multi-RDV, petit groupe voire individuel → prise en main & pérennité.
- **Outils** : Copilot en tête (cible Microsoft 365), mais agnostique — Claude, open source / LLM local (données sensibles), RAG, n8n pour les cas avancés. Quick wins bureautique/tableurs.
- **Offre en escalier** :
  1. **Diag** (porte d'entrée) — audit court, 2-3 quick wins détectés. Gratuit (produit d'appel) ou financé (Diag Bpifrance / Pass Conseil Région).
  2. **Intervention Express** — 1 formation simple, 1-2 outils/cas d'usage. Petit engagement, rassure, prouve la valeur.
  3. **Parcours Autonomie** — le complet, ~5 étapes sur plusieurs semaines. Finançable OPCO / FNE-Formation.
- **Prix** : journée formation ~800-1000 € · journée analyse ~500 € · Parcours complet 7-10 k€.
- **Structure** : micro-entreprise, temps plein. ⚠️ Plafond micro ~77 700 €/an → prévoir bascule société si volume.
- **Zone** : présentiel autour de Lorient (Morbihan), remote au-delà.
- **1ʳᵉ référence** : Compositic (CRT composite, secteur Lorient) — vente de formation en cours = réf + cas d'usage + convention déclenchant le NDA.

## Économie cible (repère)
- Vivre du métier ≈ 60-70 k€ CA → **~7-9 Parcours/an** OU mix Parcours + Express + journées. Objectif atteignable avec peu de clients → miser sur la **qualité de ciblage** plus que le volume.

---

## SYSTÈME A — « Se rendre finançable & industrialiser l'offre »
Objectif : pouvoir vendre du financé, avec une offre packagée et des supports pro.
Briques : structure/NDA → Qualiopi (ou portage) → Activateur France Num → catalogue + programmes + supports + module gouvernance données.

## SYSTÈME B — « Machine de prospection & delivery »
Objectif : générer des RDV qualifiés et délivrer un accompagnement standardisé et prouvable.
Briques : ICP + comptes cibles → bibliothèque cas d'usage × secteur → séquences multicanal personnalisées → CRM/automatisation (dogfood) → process delivery + mesure des acquis.

---

# PROMPTS SOUS-AGENTS (à lancer)

> Chaque prompt est autonome. Règle commune : **ne rien inventer**, vérifier procédures/montants/URL par recherche web réelle, marquer la confiance [vérifié]/[à confirmer], signaler l'introuvable. Nous sommes en juillet 2026.

## A1 — Plan « Devenir organisme de formation finançable »
```
Tu es consultant en création d'organisme de formation. Contexte : micro-entrepreneur à Lorient (Morbihan), temps plein, vend de l'accompagnement/formation IA & data aux PME, 1re convention en cours (Compositic). Objectif : plan d'action daté et chiffré pour devenir formateur FINANÇABLE le plus vite possible.
Vérifie tout par recherche web (ne rien inventer ; marque [vérifié]/[à confirmer]).
Produis, étape par étape avec délais, coûts et URL officielles :
1) NDA (numéro de déclaration d'activité) auprès de la DREETS Bretagne : procédure exacte, pièces (dont convention Compositic), délai, BPF annuel, obligations comptables micro-OF.
2) Qualiopi : référentiel RNQ, choix certificateur accrédité COFRAC, coût/délai réels 2026, préparation des 32 indicateurs pour un OF solo débutant, pièges.
3) Alternative PORTAGE par un OF déjà Qualiopi (comment ça marche, com', pour vendre du financé tout de suite) — comparer avec Qualiopi direct.
4) Activateur France Num : conditions réelles, procédure d'inscription, engagements, bénéfices (leads, crédibilité) — à faire sans attendre Qualiopi.
5) Séquencement optimal des 4 briques sur 6 mois + alerte plafond micro-entreprise et seuil de bascule en société.
Livrable : rétroplanning actionnable + checklist + liens.
```

## A2 — Packaging de l'offre & programmes pédagogiques
```
Tu es ingénieur pédagogique. Contexte : offre en escalier (Diag / Intervention Express / Parcours Autonomie ~5 étapes) d'accompagnement IA & data pour PME, outils agnostiques (Copilot en tête, Claude, n8n, tableurs), audit-first, présentiel petit groupe + individuel.
Produis :
1) Fiche de chaque niveau d'offre : promesse, cible, durée, format, livrables, prix (repères : journée 800-1000€, analyse 500€, Parcours 7-10k€), et rail de financement associé (Diag→Bpifrance/Région conseil ; Express/Parcours→OPCO 2i/FNE).
2) Le PROGRAMME détaillé du Parcours Autonomie en ~5 étapes (audit → usages+chartes → réglementation/gouvernance données → choix outils+mise en place → prise en main individuelle+pérennité) : objectifs pédagogiques mesurables, contenu, durée par étape, modalités d'évaluation des acquis (exigé pour Qualiopi).
3) Trame des supports (déroulé animateur, support stagiaire, grille d'audit, questionnaires satisfaction/positionnement/évaluation) — conformes aux indicateurs Qualiopi.
4) Argumentaire de vente par niveau (l'Express fait entrer, le Parcours fait monter ; lever la peur de l'engagement).
Ne rien inventer sur les exigences Qualiopi : vérifie par recherche web et marque la confiance.
```

## A3 — Module « Gouvernance & droit des données » (différenciateur)
```
Tu es consultant RGPD/gouvernance des données pour PME. Contexte : l'offre inclut un volet différenciant « droit d'utiliser vos données », clé quand on branche Copilot/IA sur les données de l'entreprise (Copilot M365 expose ce à quoi l'utilisateur a déjà accès → risque si permissions mal rangées).
Produis un MODULE packagé et vendable :
1) Argumentaire : pourquoi sécuriser les droits d'accès AVANT de brancher l'IA (cas Copilot + SharePoint/permissions), + urgence AI Act (échéance 2 août 2026, obligations « déployeur » des PME).
2) Livrables concrets que je produis chez le client : registre des traitements (art.30), charte d'usage de l'IA, cartographie des permissions/données sensibles, base légale (dont intérêt légitime pour scraping/collecte), checklist conformité CNIL.
3) Sourcing des ressources officielles à réutiliser (CNIL guides TPE-PME, fiches IA, focus scraping/intérêt légitime ; entreprises.gouv.fr AI Act) — URL vérifiées.
4) Comment l'intégrer dans le Parcours (étape « réglementation/gouvernance ») et le vendre aussi en brique autonome.
Vérifie chaque obligation/URL par recherche web ; ne rien inventer.
```

## B1 — Bibliothèque de cas d'usage × secteur
```
Tu es consultant en productivité IA pour PME industrielles. Contexte : cible = PME autour de Lorient (naval, composite, métal, plasturgie, agro, BTP, bureaux d'études). Outils : Copilot/IA bureautique, tableurs, Claude, n8n (avancé). Objectif : une bibliothèque de CAS D'USAGE « quick win » par secteur, qui servira à personnaliser la prospection.
Pour CHAQUE secteur ci-dessus, produis 4-6 cas d'usage concrets et réalistes :
- Douleur métier typique → solution (outil + ce qu'on automatise) → gain estimé (temps/erreurs) → niveau de difficulté → donnée/permission concernée (lien volet RGPD).
Priorise les quick wins universels (édition/nettoyage de tableurs, comptes rendus de réunion, devis, reporting auto, tri/réponses mails, recherche documentaire) puis les cas spécifiques secteur.
Termine par un tableau « cas d'usage → accroche de prospection » (1 phrase d'accroche par cas). Reste concret et crédible ; n'invente pas de chiffres de gain précis sans les marquer comme estimations.
```

## B2 — Machine de prospection multicanal
```
Tu es growth/SDR B2B. Contexte : micro-entrepreneur à Lorient, temps plein, vend accompagnement/formation IA & data aux PME du bassin de Lorient (voir CSV entreprises : CDK, Avel Robotics, Polyform, Lorima, Cité Marine, etc.), positionnement autonomie + gouvernance données, 1re réf Compositic. Prospection = messages personnalisés par cas d'usage et par société.
Produis un plan de prospection actionnable :
1) Définition de l'ICP (taille, secteur, signaux d'achat) et priorisation des comptes du CSV + méthode pour en trouver d'autres (annuaires BPN/Pôle Mer, France Num, CCI).
2) Séquence multicanal 4 semaines : LinkedIn (connexion + contenu), email à froid (RGPD-compliant B2B), réseau/prescripteurs (clusters, CCI Formation Morbihan, ADN Ouest, Activateur France Num), présentiel/événements locaux.
3) Modèles de messages PERSONNALISÉS par cas d'usage/secteur (3-4 exemples rédigés, s'appuyant sur B1 et sur la réf Compositic).
4) Le CRM/automatisation à mettre en place pour piloter tout ça (option no-code Airtable/Notion + n8n) — à « dogfooder » comme démo vivante du savoir-faire.
5) Routine hebdo réaliste (temps plein) : combien de touches/jour, objectifs de RDV, KPIs.
Vérifie les règles de prospection email B2B (RGPD/opposition) par recherche ; ne rien inventer.
```

## B3 — Process de delivery standardisé & preuve de valeur
```
Tu es consultant en delivery de prestations de formation/accompagnement. Contexte : méthode audit-first → usages+chartes → réglementation → outils+mise en place → prise en main individuelle+pérennité, en présentiel petit groupe/individuel.
Produis :
1) Le déroulé standardisé du delivery en phases, avec pour chaque phase : objectif, livrables, durée, qui est impliqué côté client.
2) Les templates réutilisables : grille d'audit initial, plan de mise en compétence individuel, fiche cas d'usage, guide de prise en main, plan de pérennité (référent interne, documentation).
3) Le système de MESURE : évaluation des acquis (avant/après), mesure du ROI/gain de temps chez le client, recueil de témoignage (capitaliser Compositic), NPS — utile pour Qualiopi ET pour la prospection (preuve sociale).
4) Comment garantir la « pérennité/autonomie » (anti-dépendance) : ce qu'on laisse au client pour qu'il continue seul.
Reste concret et directement applicable ; pas de blabla théorique.
```

---

## Ordre de lancement recommandé
1. **A1** (finançable vite) + **B1** (cas d'usage) en parallèle — ce sont les 2 débloquants immédiats.
2. **A2** + **A3** (offre packagée + différenciateur) — pour avoir quoi vendre proprement.
3. **B2** + **B3** (prospection + delivery) — pour remplir et livrer.

## À confirmer / enrichir plus tard
- Montant & contenu exacts de la vente Compositic (réf pièce maîtresse).
- Confirmation NDA en cours ou non.
- Procédures exactes NDA DREETS + coûts Qualiopi 2026 (verrouillées par A1).
- Bascule micro → société : seuil et timing (dans A1).
