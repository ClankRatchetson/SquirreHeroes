# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnement [SemVer](https://semver.org/lang/fr/) (`0.x.y` jusqu'à la v1.0.0).

## [0.7.0] — Phase 6 — Harnais de simulation & équilibrage

### Ajouté
- Harnais de simulation headless (`/src/sim`) : un bot joue des milliers de
  runs et produit un rapport d'équilibrage exploitable via
  `npm run sim -- --runs=10000` (10 000 runs simulées en ~4 s). `/src/sim`
  importe librement `/src/engine` et `/src/content` (comme `/src/ui`) — il
  n'est ni soumis au seuil de couverture 90 % (`vitest.config.ts` inchangé)
  ni à l'interdiction de dépendre du contenu, mais respecte l'esprit du
  PRNG seedé : le bot utilise son propre flux `createRng`/`nextInt`
  (distinct du `RunState.rng` interne au moteur), jamais `Math.random()`.
- Politique du bot : combat inchangé (heuristique gloutonne déjà établie,
  extraite dans `src/sim/policy/combat-policy.ts` et réutilisée par
  `scripts/play-combat.ts`/`play-run.ts` — refactor pur, sortie strictement
  identique avant/après, vérifié par diff). Nœud/récompense/boutique/feu de
  camp/événement : choix **aléatoire uniforme** (jamais pondéré par
  rareté/type) — laisser les données révéler la qualité d'une carte via sa
  corrélation au taux de victoire exige un échantillonnage non biaisé.
- `BalanceReport` : taux de victoire global et par héros (`byFamiliar`
  vide, prêt pour la Phase 7 — aucun familier n'existe encore), par carte
  (`pickRate`, `winRateWhenPresent`), détection des cartes sous-choisies
  (< 5 %), sur-choisies (> 90 %) et dominantes (écart de taux de victoire
  > 15 points sur un échantillon ≥ 30 runs) — seuils en constantes nommées,
  documentés comme réglables.
- Validation du plafond de +20 % du Canal B (garde-fou d'équilibrage,
  CLAUDE.md) : chaque invocation lance 2 lots à seeds appariées (sans bonus
  / arbre de Glands d'Or complet — même carte/ennemis/événements générés
  dans les 2 lots, seule la puissance de départ diffère). Le verdict porte
  sur le bonus de PV max (`hpBonusPercent = totalBonusMaxHp / heroMaxHp`,
  seule composante directement mesurable comme "puissance de départ") ;
  l'écart de taux de victoire empirique entre les 2 lots corrobore l'impact
  des bonus non-PV (carte améliorée, Noisette bonus) sans formule de
  conversion arbitraire. Chiffres actuels (arbre à 5 nœuds) : +7.5 % de PV
  max, bien sous le plafond.
- **Correction d'un bug latent du moteur** découvert par le nouveau graphe
  d'imports du harnais : `src/engine/effects/dispatch.ts` et
  `conditional.ts` ont un import circulaire nécessaire (une carte peut
  résoudre un effet `conditional` dont les branches contiennent n'importe
  quelle primitive). Le registre de handlers était construit en constante
  de module évaluée immédiatement, ce qui pouvait capturer
  `applyConditionalEffect` à `undefined` selon l'ordre d'évaluation du
  graphe de modules (jamais déclenché par les points d'entrée précédents,
  mais réel — reproductible hors test). Corrigé en registre construit
  paresseusement (mémoïsé au premier appel réel, après que tout le graphe
  de modules a fini de s'évaluer) ; nouveau test de non-régression dans
  `dispatch.test.ts` exerçant `conditional` via `resolveEffect` (jamais
  testé par ce chemin auparavant, seulement par appel direct).
- 32 nouveaux tests (`tests/sim/*` : policy/run-one/aggregate/cli, +1 dans
  `dispatch.test.ts`). Couverture maintenue à 96.74 % sur `/src/engine`.
- Vérifié manuellement : `npm run sim -- --runs=200` et
  `--runs=10000` (livrable littéral du planning) se terminent sans crash
  avec un rapport JSON plausible ; `npm run cli:combat`/`cli:run`
  toujours identiques après le refactor de la politique de combat.

## [0.6.0] — Phase 5 — Méta-progression

### Ajouté
- Deux canaux de progression persistante entre runs (`/src/engine/meta`,
  pur, zéro dépendance UI) : Canal A (jalons — victoires/défaites, Acte I
  terminé, boss vaincus dédupliqués — mis à jour après chaque run via
  `applyRunCompletion`) et Canal B (arbre de Glands d'Or, 5 nœuds
  provisoires : +6 PV max cumulés, une amélioration de carte de départ
  ciblée, +2 Noisettes/combat cumulées — délibérément bien en-deçà du
  plafond de +20 % de puissance de départ en attendant la simulation de la
  Phase 6). `purchaseTreeNode`/`isNodePurchasable` suivent le même patron
  défensif (no-op par égalité de référence) que le reste du moteur.
- `createRun` gagne 3 paramètres additifs optionnels et rétro-compatibles
  (`bonusMaxHp`, `upgradedStartingCardIds`, `noisettesBonusPerCombat`) ;
  `RunState` gagne `noisettesBonusPerCombat` (seul champ nécessitant une
  vraie migration, cf. ci-dessous — les deux autres bonus sont absorbés une
  fois à la création de la run).
- Première vraie migration de sauvegarde du projet : `SaveFile` v1 → v2
  (ajout de `meta`, `noisettesBonusPerCombat: 0` sur une run en cours),
  avec un test chargeant une enveloppe v1 authentique construite à la
  main. Corrige au passage un bug latent de `runMigrations` qui aurait
  silencieusement perdu tout champ ajouté par une migration autre que
  `schemaVersion`/`currentRun`.
- Nouveaux écrans « Sélection de héros » (Casse-Noix jouable, 2ᵉ
  emplacement visiblement verrouillé jusqu'à l'Acte I terminé — aucun
  contenu de héros/familier fabriqué, entièrement reporté à la Phase 7 par
  décision explicite) et « Collection » (solde de Glands d'Or, jalons du
  Canal A avec note « Phase 7 » pour ceux sans récompense encore existante,
  arbre du Canal B achetable). Le menu route désormais « Nouvelle run »
  (et l'écran de fin de run) via la sélection de héros, qui calcule les
  bonus courants (`aggregateTreeBonuses`) avant `startNewRun`.
- `useMetaStore` (Zustand) + `persistCurrentSaveFile`, point d'écriture
  partagé unique entre `useRunStore` et `useMetaStore` sans import
  croisé au niveau module ; la transition d'une run vers `run_over`
  délègue à `recordRunCompletion` (qui persiste run + méta ensemble) au
  lieu d'un `persist` séparé et redondant.
- ~20 nouvelles clés i18n (sélection de héros, collection, nœuds de
  l'arbre). 49 nouveaux tests unitaires (moteur, contenu, persistance, UI)
  et 2 nouveaux tests e2e `meta-progression.spec.ts` (solde de Glands d'Or
  persistant réellement en IndexedDB à travers un rechargement ; achat
  d'un nœud depuis la Collection reflété sur les PV max d'une run
  suivante). Couverture maintenue à 96.73 % sur `/src/engine`.
- Vérifié manuellement (build de production servi localement) : écran de
  sélection de héros et écran Collection s'affichent sans erreur avec
  l'état attendu avant tout achat/toute victoire d'Acte I.

## [0.5.0] — Phase 4 — Persistance

### Ajouté
- Persistance de la run via IndexedDB (Dexie.js) : `/src/persistence`
  expose un `SaveFile { schemaVersion, currentRun }` versionné, une
  machinerie de migrations ordonnées (`runMigrations`) prête à recevoir sa
  première entrée réelle en Phase 5, et un `StorageAdapter` injecté
  (jamais Dexie importé en dehors de `dexie-adapter.ts`) — même discipline
  « injecter, pas importer » que le moteur pour les catalogues de contenu.
- Sauvegarde automatique après chaque action de run effective (nœud
  choisi, carte jouée, fin de tour, boutique/feu de camp/récompense/
  événement résolus) et dès la création d'une run — aucun cas particulier
  par type d'action, un no-op ne déclenche jamais d'écriture.
- Reprise au redémarrage : bouton « Reprendre la run » sur le menu si une
  run en cours existe en base ; « Nouvelle run » demande confirmation
  avant d'écraser une run existante (`ConfirmOverwriteDialog`).
- Les catalogues de contenu (cartes/ennemis/événements) ne sont jamais
  sérialisés : dépouillés avant écriture (`stripRunState`), ré-injectés
  depuis `/src/content` au chargement (`hydrateRunState`, appelé depuis
  `run-store.ts`) — la sauvegarde ne fige jamais une version du contenu.
- Validation légère (Zod) de l'enveloppe et de la forme de premier niveau
  de la sauvegarde au chargement : une donnée corrompue, une version
  future inconnue ou un contenu inattendu retombent proprement sur
  « aucune sauvegarde » plutôt que de faire planter l'app.
- 6 nouvelles clés i18n (écran de chargement, reprise, confirmation).
- 29 nouveaux tests unitaires (`tests/persistence/*`, extension de
  `tests/ui/run-store.test.ts`) couvrant démarrage à froid, aller-retour,
  données corrompues, version future inconnue, autosave et réhydratation
  des catalogues ; nouveau test e2e `persistence.spec.ts` reproduisant le
  livrable littéral de la phase (fermer l'application en plein combat et
  retrouver l'état exact au relancement) et le flux de confirmation
  d'écrasement. Couverture maintenue à 96.51 % sur `/src/engine`.
- Vérifié manuellement : fermeture/relance en plein combat, corruption
  manuelle d'IndexedDB (payload remplacé) suivie d'un démarrage propre
  sans crash, mode combat de démonstration (`useCombatStore`) confirmé
  non affecté par la persistance.

## [0.4.0] — Phase 3 — Structure de run

### Ajouté
- Réducteur de run pur (`/src/engine/run`), miroir de `/src/engine/core` :
  génération déterministe de la carte à embranchements de l'Acte I (9
  étages, poids par type de nœud, connectivité garantie, feu de camp
  garanti avant le boss), récompenses/boutique/feu de camp/événements,
  composition avec `combatReducer` via `forwardToCombat` (`runReducer`
  orchestre la transition victoire-de-combat → récompense-de-run, jamais
  la UI). `createCombat` reçoit deux paramètres additifs et rétro-
  compatibles (`deckOverride`, `heroHpOverride`) pour reprendre le deck et
  les PV du run à chaque combat.
- Roster complet de l'Acte I : ajout de l'élite Le Merle Mercenaire (60 PV)
  et du boss La Baronne Bec-de-Fer (100 PV, synergie `a_decouvert` avec
  `coup_de_grace`) — l'acte est désormais jouable de bout en bout, victoire
  ou défaite.
- Nouveau vocabulaire d'effets de run, séparé et minimal (`RunEffectSpec`,
  5 primitives : `damage`, `heal`, `gainNoisettes`, `loseNoisettes`,
  `addCardToDeck`) et nouveau type de contenu événement (3 événements
  d'exemple : Le Noyer Ancestral, La Fontaine Moussue, Le Marchand Ambulant
  Mystérieux), validés par Zod, avec vérification croisée des `cardId`
  référencés faite en test plutôt que dans le schéma (évite un cycle
  d'import, même précédent que `HeroDefinition.startingDeck`).
- UI de run complète (`useRunStore`, `CombatController` — contexte React
  partagé entre le mode démo et le mode run pour réutiliser les composants
  de combat de la Phase 2 sans duplication — carte à embranchements,
  écrans de récompense/boutique/feu de camp/événement, écran de fin de
  run). Utilitaire `stagger-enemy-turn.ts` extrait de `combat-store.ts`
  pour être partagé sans duplication avec `run-store.ts`.
- Script CLI de démonstration `npm run cli:run`, miroir de `cli:combat` :
  joue une run entière headless jusqu'à victoire ou défaite, déterministe.
- ~45 nouvelles clés i18n (élite/boss, événements, écrans de run).
- 85 nouveaux tests unitaires (moteur de run, contenu, store) + nouveau
  test e2e `run-flow.spec.ts` prouvant le câblage carte → nœud → combat →
  retour à un écran hors combat. Couverture maintenue à 96.51% sur
  `/src/engine` (seuil 90%).
- Vérifié manuellement : chaque type de nœud (combat, boutique, feu de
  camp, événement, récompense) atteint et fonctionnel sur mobile ; un bug
  de mise en page a été détecté et corrigé (`justify-center` empêchait
  d'atteindre le premier nœud d'une carte défilante horizontalement).

## [0.3.0] — Phase 2 — UI de combat jouable au doigt

### Ajouté
- Interface React de combat (`/src/ui`) : main de cartes jouable au tap et
  au drag, PV/énergie/blocage, intentions ennemies visibles, infobulles de
  statuts à l'appui long (nom + effet mécanique exact), animations de base,
  écran de fin de combat avec relance.
- Store Zustand (`combat-store.ts`) en couche de liaison strictement mince :
  `engineState` comme unique source de vérité, aucune règle de jeu
  dupliquée, toute évolution passe par `combatReducer`.
- Stratégie d'animation par diff avant/après (`diffCombatStates`) : nombres
  flottants (dégât/bloc/soin) via Framer Motion, jamais d'interpolation des
  vraies valeurs ni de moteur de timeline générique. Tour ennemi présenté en
  séquence étalée sans second appel au réducteur.
- Détection de cible ennemie côté UI en réutilisant
  `needsSingleEnemyTarget` exporté du moteur (`resolve-play-card.ts`) —
  aucune logique de jeu dupliquée.
- 9 nouvelles clés i18n statiques (menu, combat, issue).
- 12 nouveaux tests Vitest (diff d'animation, store sans rendu React) et un
  nouveau test e2e Playwright couvrant un combat joué au tap sur mobile.
- Vérifié manuellement : tap, drag vers un ennemi, drag vers la zone de
  jeu, infobulle à l'appui long, victoire/défaite et relance.

## [0.2.0] — Phase 1 — Moteur de combat + tranche verticale

### Ajouté
- Moteur de combat pur (`/src/engine`) : types du domaine, réducteur
  `(état, action) => nouvel état`, résolution de tour complète (tour héros,
  tour ennemi, fin de combat), aucune dépendance React/Zustand.
- PRNG seedé (mulberry32) porté par l'état — mélange de deck et défausse
  aléatoire rejouables à l'identique depuis une seed.
- Vocabulaire d'effets fermé : 13 primitives implémentées (`damage`,
  `damageAll`, `multiHit`, `block`, `heal`, `draw`, `gainEnergy`, `discard`,
  `exhaust`, `applyStatus`, `removeStatus`, `doubleStatus`, `conditional`),
  dispatch via un registre exhaustif au typage (5 primitives restantes du
  §4.3 réservées à la Phase 7, sans contenu de test qui les justifie).
- 8 altérations d'état avec leurs formules exactes (Force, Leste, À
  découvert, Étourdi, Coquille fêlée, Sève empoisonnée, Repousse, Piquants).
- Intentions ennemies visibles, figées en début de tour héros, jamais
  recalculées entre affichage et résolution.
- Contenu de test validé par Zod au chargement : héros Casse-Noix, 15
  cartes (9 signature + 6 neutres), 3 ennemis communs de l'Acte I (Le
  Mulot Masqué, Le Campagnol Cagoulé, La Pie Kleptomane).
- ~75 nouvelles clés i18n (cartes, ennemis, héros, statuts avec nom et
  description mécanique pour l'infobulle à appui long).
- Script CLI de démonstration (`npm run cli:combat`) : combat complet
  jouable de bout en bout sans aucune UI.
- 132 tests unitaires, couverture 96.84 % sur `/src/engine` (seuil 90 %).

## [0.1.0] — Phase 0 — Fondations

### Ajouté
- Projet TypeScript strict (Vite + React 18 + Tailwind CSS).
- Arborescence de référence : `/src/engine`, `/src/content`, `/src/ui`,
  `/src/persistence`, `/src/sim`, `/tests`, `/assets-pipeline`.
- Dictionnaire i18n typé maison (`t(key)`, `fr.ts`), zéro chaîne en dur.
- Vitest configuré avec seuil de couverture 90 % sur `/src/engine`.
- Playwright configuré (viewport mobile) avec un test e2e de fumée.
- ESLint strict (TypeScript strict, interdiction de React/Zustand et de
  `Math.random()` dans `/src/engine`).
- PWA (`vite-plugin-pwa`) : precache intégral, manifeste, icônes.
- Capacitor + plateforme Android (`fr.rivet.squirrelheroes`), portrait
  verrouillé, aucune permission réseau.
- CI GitHub Actions : lint, typecheck, tests unitaires (couverture),
  build, tests e2e.
