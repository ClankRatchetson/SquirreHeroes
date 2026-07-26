# Squirrel Heroes — Spécifications & Planning de développement

> **Version du document : v0.3 — finalisée.**
> Titre boutique : **Squirrel Heroes : les Justiciers de la Forêt**
> Dépôt : `squirrel-heroes` · Package Android : `fr.<domaine>.squirrelheroes` (à finaliser)
> Auteur : Ludo. Cahier des charges de référence pour Claude Code.

---

## 1. Pitch

Deck builder **solo, 100 % hors-ligne, Android**, mêlant runs roguelite (façon Slay the Spire) et méta-progression persistante.

**Univers :** des écureuils enfilent des costumes de super-héros pour défendre leur territoire contre leurs prédateurs naturels — pies, chats, fouines, rapaces, serpents — eux-mêmes costumés en super-vilains. Pastiche comics familial, humour de jeux de mots assumé, univers 100 % original.

**Philosophie :** gratuit, sans monétisation, sans compte, sans réseau. Développé en solo à rythme loisir (~4 h/semaine) avec une rigueur professionnelle : moteur testé, features livrées une par une, versioning strict.

**Note de positionnement :** le créneau « écureuil héroïque » est encombré sur les boutiques (un *Squirrel Hero* arcade largement diffusé, plusieurs titres Play Store). Aucun obstacle juridique, mais la découvrabilité organique sera faible — d'où le sous-titre distinctif. Le jeu étant gratuit et sans ambition commerciale, ce point n'est pas bloquant.

---

## 2. Principes directeurs (non négociables)

Ces règles arbitrent tous les choix ultérieurs. Claude Code doit les respecter sans exception.

1. **TypeScript strict partout** (`strict: true`, pas de `any` implicite).
2. **Le moteur de jeu est du TypeScript pur, sans aucune dépendance à React.** Signature : `(état, action) => nouvel état`. Immuable, déterministe, testable en isolation.
3. **Aucun aléatoire non seedé.** Toute randomisation passe par un PRNG seedé porté par l'état. Aucun `Math.random()` dans le moteur.
4. **Les cartes, ennemis et familiers sont des données, pas du code.** JSON validés par schéma, composés depuis un vocabulaire d'effets fermé.
5. **Zéro appel réseau à l'exécution.** Pas d'analytics, pas de CDN, pas de police distante.
6. **Aucune chaîne de texte en dur dans le code.** Tout passe par le dictionnaire i18n (cf. §6.2).
7. **Toute donnée persistée est versionnée** avec sa migration dès le premier jour.
8. **Aucune feature terminée sans tests** (cf. Definition of Done, §9).

---

## 3. Univers, personnages & nommage

### 3.1 Ton et contrainte juridique
Familial, second degré, jeux de mots potager/noisette assumés. **Aucun visuel ne doit citer un costume ou un logo existant** : pas de toile rouge et bleue, pas de chauve-souris jaune, pas de bouclier étoilé. Les prompts visent des archétypes génériques — cape, masque loup, plastron, symbole en gland ou en feuille.

### 3.2 Héros (3 en v1.0)
Chaque héros est une identité complète : archétype mécanique, deck de départ, pool de cartes signature.

| Héros | Archétype | Mécanique signature | Silhouette |
|---|---|---|---|
| **Casse-Noix** | Force brute | Gros dégâts, blocage lourd, cartes coûteuses à fort impact | Plastron, gros gants matelassés |
| **Captain Cabriole** | Agilité / combo | Cartes à coût faible, chaînes, gain d'énergie, esquive | Cape courte, masque loup, bottes |
| **Docteur Bogue** | Ruse / poison | Sève empoisonnée, altérations d'état, dégâts différés | Blouse, lunettes, bogues de châtaigne en bandoulière |

### 3.3 Familiers (4 en v1.0)
Un héros + **un familier passif** par run. Le familier n'est **pas une unité ciblable** : choix délibéré pour éviter toute mécanique d'aggro ou de protection et garder le moteur simple. Il apporte un passif permanent et une carte signature ajoutée au deck de départ.

Le couple héros × familier est le second axe de rejouabilité : 12 combinaisons en v1.0 pour un coût d'implémentation minime.

| Familier | Passif | Carte signature |
|---|---|---|
| **Mésange Radar** | +1 carte piochée au premier tour de chaque combat | *Coup d'œil* |
| **Hérisson Kevlar** | +3 blocage au premier tour de chaque combat | *Boule défensive* |
| **Bourdon Bourru** | 2 dégâts à un ennemi aléatoire en fin de tour | *Piqué furieux* |
| **Taupe Secrète** | +1 énergie tous les 3 tours | *Galerie souterraine* |

### 3.4 Actes, ennemis et boss
Trois actes. *Note de cohérence : l'acte III était initialement « Les Toits » (urbain) ; il devient « La Forêt » pour s'aligner sur le sous-titre du jeu.*

| Acte | Biome | Ennemis communs | Élite | Boss |
|---|---|---|---|---|
| I | **Le Potager** | Le Mulot Masqué, Le Campagnol Cagoulé, La Pie Kleptomane | Le Merle Mercenaire | **Baronne Bec-de-Fer** (pie) |
| II | **Le Parc** | Le Griffeur de Gouttière, La Fouine Fatale, Le Corvidé Masqué | La Belette Braqueuse | **Le Baron Griffu** (chat) |
| III | **La Forêt** | Le Lérot Lugubre, Le Grand Corbaque, Le Vipérin | La Martre Masquée | **Le Faucheur des Airs** (épervier) |

Cible v1.0 : **12 ennemis communs et élites + 3 boss**.

### 3.5 Monnaies

| Monnaie | Gagnée | Dépensée | Portée |
|---|---|---|---|
| **Noisettes** | Pendant la run | Boutique intra-run : cartes, améliorations, suppression de carte | Perdue en fin de run |
| **Glands d'Or** | En fin de run | Arbre d'améliorations permanentes | Persistante |

> Tous les noms ci-dessus ne sont que des clés i18n pointant vers `fr.ts`. En changer un coûte une ligne, jamais une refonte.

---

## 4. Game design

### 4.1 Structure de combat
- Tour par tour, 1 héros contre 1 à 3 ennemis.
- **Intentions ennemies visibles** avant de jouer : jeu tactique, pas de loterie.
- Ressource : **énergie** (3 de base). Main de 5 cartes par tour, défausse complète en fin de tour.
- **Blocage** remis à zéro en début de tour du héros, sauf effet contraire.

### 4.2 Types de cartes
`attaque` · `defense` · `competence` · `pouvoir` (persistant sur le combat) · `malediction` (carte parasite non jouable, infligée par certains ennemis ou événements).

Raretés : `commune` · `rare` · `legendaire`. Toute carte est **améliorable une fois** (boutique, feu de camp, événements).

### 4.3 Vocabulaire d'effets (fermé)
Les cartes ne contiennent **jamais** de logique impérative. Elles composent environ 25 primitives :

`damage` · `damageAll` · `multiHit` · `block` · `heal` · `draw` · `gainEnergy` · `discard` · `exhaust` · `addCardToHand` · `addCardToDeck` · `applyStatus` · `removeStatus` · `doubleStatus` · `conditional` · `repeat` · `sacrifice` · `scry`

**Altérations d'état.** Nommage thématique retenu, avec une règle stricte : l'icône affiche toujours la valeur chiffrée, et un appui long ouvre une infobulle donnant l'effet mécanique exact. Le jeu étant solo et hors-ligne, aucun wiki ne rattrapera une ambiguïté — l'infobulle est obligatoire.

| Nom affiché | Effet mécanique |
|---|---|
| À découvert | +50 % dégâts subis |
| Étourdi | −25 % dégâts infligés |
| Coquille fêlée | −25 % blocage obtenu |
| Force | +X dégâts par attaque |
| Leste | +X blocage par carte de défense |
| Sève empoisonnée | X dégâts en fin de tour, décrémente |
| Repousse | X soins en fin de tour, décrémente |
| Piquants | Renvoie X dégâts à l'attaquant |

**Règle d'or :** ajouter une carte ne doit jamais nécessiter de toucher au moteur. Si une carte réclame une primitive absente, on ajoute la primitive avec ses tests — jamais un cas particulier.

### 4.4 Schéma d'une carte

```jsonc
{
  "id": "noisette_explosive",
  "nameKey": "cards.noisette_explosive.name",
  "hero": "casse_noix",          // ou "neutre"
  "type": "attaque",
  "rarity": "commune",
  "cost": 1,
  "effects": [
    { "kind": "damage", "target": "enemy", "amount": 8 },
    { "kind": "applyStatus", "target": "enemy", "status": "a_decouvert", "stacks": 1 }
  ],
  "upgraded": {
    "nameKey": "cards.noisette_explosive.nameUpgraded",
    "effects": [
      { "kind": "damage", "target": "enemy", "amount": 11 },
      { "kind": "applyStatus", "target": "enemy", "status": "a_decouvert", "stacks": 2 }
    ]
  },
  "art": "cards/noisette_explosive.webp",
  "flavorKey": "cards.noisette_explosive.flavor"
}
```

Validation **Zod** au chargement, plus un test parcourant l'intégralité du catalogue qui échoue si une seule carte est malformée ou référence une clé i18n inexistante.

### 4.5 Structure de run
Carte à embranchements sur 3 actes. Nœuds : `combat` · `elite` · `evenement` · `boutique` · `feu_de_camp` (soigner ou améliorer une carte) · `boss`.

Récompenses de combat : choix parmi 3 cartes, plus des Noisettes.

### 4.6 Méta-progression — deux canaux distincts

**Canal A — Contenu (jalons).** Débloqué par accomplissement, jamais acheté : terminer l'acte I débloque le 2ᵉ héros, vaincre un boss débloque un familier, jouer N runs élargit le pool de récompenses. Ce canal ajoute de la **variété**, pas de la puissance.

**Canal B — Puissance (Glands d'Or).** Arbre d'améliorations permanentes : +PV max de départ, amélioration d'une carte de départ, Noisette bonus par combat.

> ⚠️ **Principal risque d'équilibrage du projet.** Le canal B rend mécaniquement les runs tardives plus faciles que les premières. Garde-fou imposé : **l'arbre complet ne dépasse pas +20 % de puissance effective de départ**, chiffre à valider par simulation (Phase 6). Au-delà, il faudra des paliers de difficulté façon Ascension — post-v1.0, hors scope.

---

## 5. Portée de la v1.0

**Volume de cartes : 70.** Calibré sur ~4 h/semaine, en intégrant que chaque carte demande son JSON, son illustration, ses tests et plusieurs passes d'équilibrage. Mieux vaut 70 cartes équilibrées que 150 dont la moitié ne sera jamais jouée.

- **48 cartes signature** (3 héros × 16)
- **18 cartes neutres** (pool partagé)
- **4 cartes de familier**

Également dans la v1.0 : 3 héros, 4 familiers, 12 ennemis, 3 boss, 3 actes, ~15 événements narratifs, sauvegarde locale (run en cours + méta), tutoriel intégré au premier combat, bruitages, fonctionnement intégral hors-ligne.

**Hors scope v1.0 :** multijoueur (écarté définitivement), monétisation (aucune), iOS, anglais, paliers d'Ascension, succès, mode quotidien, musique.

---

## 6. Stack technique

| Composant | Choix | Justification |
|---|---|---|
| Langage | **TypeScript strict** | Garde-fou principal ; terrain familier pour un développeur Java |
| Frontend | React 18 + Vite | Écosystème riche pour l'animation de cartes |
| Styling | Tailwind CSS | Cohérence avec Terra Nova, itération rapide |
| Moteur | **TS pur, style réducteur, zéro dépendance React** | Testable, simulable en masse, indépendant de l'UI |
| Liaison UI | **Zustand** | XState écarté : le moteur *est* déjà une machine à états explicite, une seconde couche serait redondante |
| Validation | Zod | Catalogue validé au chargement |
| Animations | Framer Motion | Drag, flip, transitions |
| Persistance | IndexedDB via **Dexie.js**, schéma versionné | Au-delà de ce que gère `localStorage` |
| i18n | **Dictionnaire typé maison**, pas de librairie | Cf. §6.2 |
| PWA / offline | `vite-plugin-pwa` (Workbox), precache intégral | Exigence hors-ligne |
| Packaging | **Capacitor** | APK/AAB sans réécriture |
| Tests unitaires | Vitest | Natif Vite |
| Tests e2e | Playwright, viewport mobile | Parcours critiques |
| CI | GitHub Actions : lint + typecheck + tests | Filet de sécurité |
| Versioning | Git/GitHub, Conventional Commits, SemVer, branche par feature | Exigence de suivi |

**Cibles :** Android 8+, orientation **portrait verrouillée**, 60 fps sur mobile milieu de gamme, APK < 60 Mo.

### 6.1 Arborescence

```
/src
  /engine        ← TS pur. Aucun import React, jamais.
    /core        (état, réducteur, résolution de tour)
    /effects     (primitives)
    /rng         (PRNG seedé)
    /types
  /content       ← données JSON + schémas Zod
    cards/ enemies/ familiars/ events/ heroes/
    /i18n        fr.ts
  /ui            ← React
  /persistence   ← Dexie, schéma, migrations
  /sim           ← harnais de simulation headless
/tests
/assets-pipeline ← manifeste de prompts + script de génération
CLAUDE.md
```

### 6.2 Internationalisation
**v1.0 en français uniquement**, mais aucune chaîne en dur dès la première ligne de code. Implémentation volontairement minimaliste : un dictionnaire TypeScript typé (`fr.ts`) et une fonction `t(key)`, sans librairie. Le typage des clés fait échouer la compilation sur toute clé inexistante — plus sûr et plus léger qu'`i18next` pour une seule langue. Le passage à l'anglais consistera à ajouter `en.ts` et un sélecteur ; le coût est reporté, pas payé aujourd'hui.

### 6.3 Pipeline d'assets
**API hébergée (FLUX via Replicate ou fal.ai) pilotée par un script Node.** Une installation locale type ComfyUI serait plus contrôlable mais nettement plus fragile à maintenir : mises à jour de modèles, pilotes GPU, graphes qui cassent.

Fonctionnement :
- `assets-pipeline/manifest.json` : un prompt par carte, plus une référence de style et un seed figés pour garantir la cohérence des 70 illustrations.
- Script de post-traitement : recadrage, conversion WebP, **512 × 512 px, < 150 Ko par image**.
- **Les `.webp` générés sont commités dans le dépôt.** Le build ne dépend jamais du service de génération : si le fournisseur disparaît, le jeu compile toujours. Le script ne tourne que pour une nouvelle carte.
- Revue visuelle systématique au regard de la contrainte juridique du §3.1.
- Coût total estimé pour 70 illustrations : quelques euros.

### 6.4 Audio
**Bruitages uniquement en v1.0, musique repoussée en post-v1.0.** Un deck builder sans le « clac » de la carte jouée et l'impact du coup porté paraît mort : c'est le meilleur rapport ressenti/effort du projet. Une quinzaine de bruitages CC0 (Kenney, Freesound) intégrés en Phase 8, environ deux jours. La musique coûte cher en poids d'APK et en recherche de pistes libres cohérentes.

---

## 7. Persistance & migrations

Toute donnée sauvegardée porte un `schemaVersion`. Un tableau de migrations ordonnées fait passer une sauvegarde de la version N à la version courante au démarrage.

```ts
type SaveFile = {
  schemaVersion: number;
  meta: MetaProgression;   // Glands d'Or, déblocages
  currentRun: RunState | null;
  settings: Settings;
};
```

**Règle :** toute modification du modèle persisté s'accompagne, dans la même PR, d'une migration *et* d'un test chargeant une sauvegarde de l'ancienne version pour vérifier l'intégrité du résultat. Sans cela, chaque mise à jour détruira les parties en cours.

---

## 8. Risques identifiés

| Risque | Impact | Mitigation |
|---|---|---|
| Le canal B rend les runs tardives triviales | Élevé | Plafond +20 %, validé par simulation en Phase 6 |
| Essoufflement de motivation sur 12-14 mois | Élevé | Jouabilité réelle dès la Phase 2, vers le 3ᵉ mois |
| Incohérence de style entre 70 illustrations IA | Moyen | Référence de style et seed figés, génération par lots |
| Ressemblance involontaire avec une IP existante | Moyen | Revue visuelle systématique, archétypes génériques |
| Poids de l'APK | Faible | WebP 512 px, budget < 60 Mo, suivi à chaque build |

---

## 9. Qualité & méthode

### Definition of Done (par feature)
1. Code typé strict, sans `any`.
2. Tests unitaires sur toute logique de moteur — **couverture ≥ 90 % sur `/src/engine`**.
3. Catalogue de contenu validé par Zod, clés i18n résolues.
4. Migration + test de migration si le modèle persisté change.
5. CI verte (lint, typecheck, tests).
6. `CHANGELOG.md` à jour, tag SemVer posé.

### Conventions
- Une feature = une branche `feat/xxx` = une PR = un merge.
- Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`).
- SemVer : `0.x.y` jusqu'à la v1.0, incrément mineur à chaque phase livrée.

### CLAUDE.md
Un fichier `CLAUDE.md` à la racine reprend, en format court et impératif, les principes directeurs du §2, l'arborescence, les conventions de commit et la Definition of Done. Ce document-ci reste le cahier des charges ; `CLAUDE.md` est le rappel opérationnel lu à chaque session.

---

## 10. Planning de développement

Base : ~4 h/semaine. **Total réaliste jusqu'à la v1.0 : 12 à 14 mois.** Chaque phase se termine par un livrable testé et fonctionnel avant d'entamer la suivante.

### Phase 0 — Fondations (v0.1.0) · ~2 semaines
TS strict + Vite + React + Tailwind. Vitest, Playwright, GitHub Actions. PWA et Capacitor configurés. Dictionnaire i18n en place. `CLAUDE.md` et conventions rédigés.
**Livrable :** application vide installable en PWA et en APK, fonctionnant en mode avion sur un Android réel.

### Phase 1 — Moteur de combat + tranche verticale (v0.2.0) · ~7 semaines
Types du domaine, PRNG seedé, réducteur de combat, résolution de tour, primitives d'effets, altérations d'état. Contenu de test : **Casse-Noix, 15 cartes, 3 ennemis de l'acte I**.
*Un moteur ne se teste pas sans contenu : cette tranche verticale est indispensable.*
**Livrable :** combat complet jouable via les tests et un script CLI, sans aucune UI. Couverture ≥ 90 %.

### Phase 2 — UI de combat (v0.3.0) · ~6 semaines
Main de cartes, jeu au tap et au drag, PV/énergie/blocage, intentions ennemies, infobulles d'altérations, animations de base, écran de fin de combat.
**Livrable :** un combat entièrement jouable au doigt sur mobile.

### Phase 3 — Structure de run (v0.4.0) · ~5 semaines
Génération de la carte à embranchements, nœuds, enchaînement des combats, récompenses, Noisettes, boutique, feu de camp, amélioration de cartes.
**Livrable :** l'acte I jouable de bout en bout, victoire ou défaite.

### Phase 4 — Persistance (v0.5.0) · ~3 semaines
Dexie, schéma versionné, migrations, sauvegarde automatique à chaque nœud et à chaque fin de tour, reprise au redémarrage.
**Livrable :** fermer l'application en plein combat et retrouver l'état exact au relancement.

### Phase 5 — Méta-progression (v0.6.0) · ~4 semaines
Canal A (jalons de contenu) et canal B (arbre de Glands d'Or), écran de collection, écran de sélection héros + familier.
**Livrable :** progression persistante et visible sur plusieurs runs successives.

### Phase 6 — Harnais de simulation & équilibrage (v0.7.0) · ~3 semaines
*Phase à ne surtout pas sauter.* Bot headless jouant des milliers de runs, export des taux de victoire par héros, familier et carte, détection des cartes jamais choisies ou trop dominantes. Validation du plafond de +20 % du canal B.
**Livrable :** `npm run sim -- --runs=10000` produit un rapport d'équilibrage exploitable.

### Chantier transverse — Pipeline d'assets · en parallèle de la Phase 6
Mise en place du manifeste, de la référence de style et du script de génération, contrôle juridique.
**Livrable :** générer l'illustration d'une nouvelle carte tient en une commande.

### Phase 7 — Montée en contenu (v0.8.0 → v0.9.x) · ~14 semaines
Par lots testés et équilibrés : Captain Cabriole, Docteur Bogue, les 4 familiers, les 12 ennemis, les 3 boss, les événements, jusqu'aux 70 cartes cible. Chaque lot passe par le harnais de simulation avant validation.
**Livrable par lot :** contenu intégré, illustré, équilibré, éprouvé en run réelle.

### Phase 8 — Polish & v1.0.0 · ~6 semaines
Tutoriel, bruitages, animations finales, écrans de menu, équilibrage global, suite e2e complète, build Android signé, test en conditions hors-ligne strictes sur device réel.
**Livrable :** v1.0.0 installable, jouable intégralement sans connexion.

### Post-v1.0 (hors scope)
Paliers d'Ascension, 4ᵉ héros, traduction anglaise, musique, succès, mode quotidien seedé, iOS.
