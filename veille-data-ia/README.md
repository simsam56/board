# Veille cartographie — Transition Data / IA / Automatisation (Lorient · Morbihan · Bretagne · Remote)

> Passe 1 — matière brute exploitable pour tri/enrichissement commercial en passe 2.
> Date de collecte : **2 juillet 2026**. Méthode : recherches web réelles (WebSearch/WebFetch) via 4 agents thématiques.
> **Anti-invention** : chaque item porte un niveau de confiance. Rien n'a été inventé ; ce qui n'a pas pu être vérifié est marqué `[à confirmer]` / `[introuvable]`.

## Fichiers du dossier

| Fichier | Contenu |
|---|---|
| `entreprises.csv` | 22 entreprises/leviers cibles (nom, zone, secteur, site, signal, intérêt data/IA, adéquation junior, confiance, à enrichir) |
| `offres.csv` | Offres d'emploi/alternance concrètes repérées + adéquation |
| `canaux-offres-emploi.csv` | Job boards & canaux fiables pour ce profil (avec filtre géo réel) |
| `freelance-plateformes.csv` | Plateformes & communautés freelance auto/IA |
| `sources-veille.csv` | Sources d'actu & signaux faibles (presse, CCI, BDI, BPI, clusters) |
| `financement-dispositifs.csv` | **[MAJ]** Rails de financement formation & conseil (Qualiopi, OPCO, FNE, France Num, Région, Bpifrance) |
| `concurrents.csv` | **[MAJ]** Paysage concurrentiel formation/accompagnement no-code/IA + différenciation |
| `ressources-rgpd-gouvernance.csv` | **[MAJ]** Ressources CNIL/AI Act pour le volet « droit d'utiliser les données » |

---

## 1. Résumé exécutif — ce qui est le plus actionnable

**Le meilleur angle n'est pas l'emploi salarié junior local : le vivier data/IA salarié se concentre sur Rennes et sur des profils Bac+5/senior.** Autour de Lorient/Morbihan, l'opportunité forte est **le tissu industriel PME en modernisation** (naval, composite, métal, agro) qui a des besoins concrets d'automatisation/data mais peu de compétences internes → cible idéale pour une **offre de services / missions**.

**Top 5 pistes concrètes à travailler en priorité :**

1. **Avel Robotics (Lorient)** — déjà en "digitalisation complète du process", 2ᵉ robot. Cible la plus mûre pour de la data industrielle. `[vérifié]`
2. **Polyform Concept Métal (Lorient)** — "investit et recrute" via Rebond Industriel : PME métal en phase d'investissement = fenêtre de tir pour GPAO/devis/suivi atelier. `[vérifié signal]`
3. **CDK Technologies (Lorient)** — 8,5 M€, capacité doublée : montée en cadence = besoin planification/MES/traçabilité. `[vérifié, montant à redater]`
4. **Malt + Slack No-Code France** — les 2 canaux freelance vérifiés directement exploitables dès maintenant (remote + clients IdF/grands comptes). `[vérifié]`
5. **AudéLor (revue de presse/Barographe)** — LE flux de signaux faibles n°1 pour ta zone (implantations, investissements, recrutements Lorient/Quimperlé). À mettre en veille active. `[vérifié]`

**Signaux macro confirmés :** 900 M€+ de levées de fonds en Bretagne en 2025 (dont Socomore 100 M€ industriel, Cailabs 57 M€ deeptech). Dispositif "Rebond Industriel" actif autour de Lorient. `[vérifié]`

---

## 1bis. REPOSITIONNEMENT — Accompagnement + Formation (mise à jour)

> Pivot décidé : on ne vend plus l'outil sur-mesure (livrable one-shot), on vend **« je rends vos équipes autonomes »** = accompagnement + montée en compétence + intégration des données + volet **droit/gouvernance des données** (RGPD). Le système posé devient le support pédagogique.

### La clé stratégique : deux rails de financement empilables
| | Rail **FORMATION** | Rail **CONSEIL / ACCOMPAGNEMENT** |
|---|---|---|
| Finance | actions de formation | prestation de conseil/diagnostic |
| Via | OPCO 2i, FNE-Formation, CPF | France Num, Bpifrance Diag, Pass Transitions (Région) |
| **Qualiopi requis ?** | ✅ Oui | ❌ **Non** |

→ **Tu peux facturer et être financé AVANT d'avoir Qualiopi**, via le rail conseil. Il finance le lancement pendant que Qualiopi + OPCO ouvrent le volume formation ensuite.

### Parcours « devenir finançable » (ordre)
1. **Immédiat (sans Qualiopi)** : devenir **Activateur France Num** (crédibilité État + leads Morbihan) ; positionner le conseil sur **Pass Transitions / Inno Conseil** (Région) ; prescripteur **Bpifrance Diag Data IA**.
2. **NDA** : déclaration d'activité d'organisme de formation auprès de la **DREETS Bretagne** (déclenchée par la 1ʳᵉ convention — Compositic).
3. **Qualiopi** : lancer la certif, ou démarrer en **portage** par un OF déjà certifié pour vendre tout de suite.
4. **OPCO 2i** (naval/composite/métal) + **FNE-Formation « transition numérique »** = meilleur rail pour financer du no-code/IA.

### Différenciation (marché déjà occupé)
- **Concurrent le plus direct : Breizh e-nov** (Finistère) — même offre no-code + IA + formation + « sécurité des données ». À dépasser par : (1) volet données traité en **juridique** (RGPD/base légale/registre/**AI Act — échéance 2 août 2026**), pas juste « sécurité » ; (2) posture **autonomie / anti-agence** ; (3) territoire **Sud-Bretagne (Lorient/Vannes)** + remote.
- Prescripteurs à nouer (pas concurrents) : **ADN Ouest**, **CCI Formation Morbihan**.

### Première référence
- **Compositic** (CRT composite, secteur Lorient) — vente de formation en cours = 1ʳᵉ réf + cas d'usage + convention déclenchant le NDA. À capitaliser (témoignage, effet réseau composite).

---

## 2. Idées d'angles commerciaux (offre de services)

Classés par facilité d'entrée pour un profil junior data/IA :

### Quick wins administratifs (barrière basse, valeur immédiate, tout secteur)
- **Automatisation des devis** : génération devis PDF depuis un formulaire/Excel → envoi → relance auto (Make/n8n). Cible : PME composite/métal/nautisme sur-mesure (Lorima, Polyform, Marsaudon, Grand Large).
- **Comptes rendus & gestion documentaire** : transcription + résumé IA de réunions/rapports techniques ; classement automatique de documents (chantiers navals = gros volume doc technique — Kership, Piriou).
- **Reporting automatisé** : consolidation multi-fichiers → dashboard hebdo (Looker Studio / Power BI) envoyé par mail. Remplace le reporting Excel manuel.
- **CRM & relances** : mise en place/automatisation d'un CRM léger (Airtable/Notion/HubSpot) + relances prospects/factures.

### Data industrielle (plus de valeur, cible PME industrielles en croissance)
- **Suivi de production / OEE** : tableaux de bord temps de cycle, rebuts, qualité (Avel, CDK, Laudren, Cité Marine).
- **Traçabilité** : cuissons/moules composite, cartes électroniques, lots agro/pharma.
- **Extraction & structuration de données** : récupérer des données piégées dans des PDF/Excel/ERP legacy → base exploitable.

### IA / agents (différenciant, à réserver aux prospects mûrs)
- **Agents IA métier** : assistant de recherche documentaire technique, chatbot support interne, pré-qualification de leads.
- **Vision par ordinateur qualité** : contrôle visuel de pièces (cible naturelle pour Avel/Coriolis déjà robotisés — mais techniquement exigeant).

---

## 3. Informations manquantes / à enrichir en passe 2

**Sur ton profil (bloquant pour scorer finement l'adéquation) :**
- Compétences réelles livrables aujourd'hui (n8n/Make ? SQL/Python ? Power BI ? LLM/agents ?), niveau, portfolio de projets.
- Objectif : **emploi salarié** vs **freelance/services** vs les deux ? Alternance envisageable ?
- Disponibilité, mobilité (Rennes/Vannes acceptables ou Lorient strict ?), prétentions/TJM cible.

**Sur les entreprises :**
- Sites web officiels des `[à confirmer]` (Lorima, Polyform, Cité Marine, Marsaudon, Grand Large, Kerpont Rotomoulage, Laudren, Eolfi, Guerbet, Naval Group Lorient).
- Effectifs & CA récents (societe.com / Industrie Explorer / Kompass).
- Contact décideur (DG/DSI/resp. industriel) via LinkedIn + existence d'une fonction data/SI interne.
- Maturité data/SI (ERP/MES/GPAO en place ?).
- **Statut judiciaire de Fonderie de Bretagne** (redressement vs liquidation) avant tout démarchage.
- Les 3 industriels non nommés des "7 portes ouvertes du pays de Lorient" (fév. 2026) — via AudéLor.
- **Extraire les annuaires membres** de Bretagne Pôle Naval (~50 PME réparation navale) et Pôle Mer (PME innovantes) = vivier de dizaines de cibles supplémentaires.

**Sur les offres/plateformes :**
- Offres non ouvertes (auth/agrégateur bloqué) : LinkedIn Jobs, APEC full remote, Meteojob, RemoteFR — à consulter connecté.
- Deux offres à **ne pas citer comme certaines** tant que non revérifiées : *Actiale* (alternance Power BI) et *Stockly* (no-code n8n) — issues de résumés de recherche, pages non ouvertes.
- Filtre géographique réel sur Malt/Comet/Free-Work (page Malt en 403 cette fois).
- TJM 2026 auto/IA : la fourchette **350–650 €/j** repose sur une source unique (tjmetre.fr) → croiser 2-3 baromètres.
- **Programme n8n Experts : pas encore ouvert à la France** — re-checker l'ouverture.

**Dates à revalider :** plusieurs montants d'investissement (CDK 8,5 M€, Cité Marine 32 M€) et l'échéance FDB proviennent d'articles possiblement antérieurs à 2026.

---

## 4. Limites de fiabilité de cette passe (à assumer)

- **Offres d'emploi = photo instantanée périssable.** Les listes HelloWork/Indeed portent des dates de rafraîchissement variables ; certaines offres citées peuvent être expirées. Statut "ouverte" à revalider offre par offre.
- **LinkedIn non exploitable via outil** (auth) : les gros volumes annoncés (data scientist Rennes, n8n France) sont invérifiables ici → à consulter manuellement connecté.
- **Pas de contacts nominatifs collectés** (ni emails ni téléphones) — hors périmètre de cette passe et à sourcer proprement (RGPD) en passe 2.
- Aucune donnée personnelle scrapée ; sources publiques uniquement.
