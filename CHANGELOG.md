# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnement [SemVer](https://semver.org/lang/fr/) (`0.x.y` jusqu'à la v1.0.0).

## [0.12.0] — Phase 7 (lot 5) — Acte III « La Forêt »

### Ajouté
- **Acte III « La Forêt »** (§3.4) : 3 communs (**Le Renardeau
  Chapardeur**, **La Chouette Guetteuse**, **Le Putois Fourbe**), 1 élite
  (**Le Lynx Solitaire**) et 1 boss (**Le Grand Loup Hurleur**), un cran
  au-dessus du gabarit de l'Acte II (PV et dégâts en hausse d'environ
  10-15 %) — le boss reprend le même patron de move `conditional` que la
  Baronne Bec-de-Fer/le Baron Griffu (dégâts doublés si la cible est déjà
  Étourdie, sinon dégâts + Étourdi appliqué). Aucune primitive d'effet ni
  statut nouveau : les 13 primitives et 8 statuts existants suffisent.
- **Cible « 12 ennemis + 3 boss » de la v1.0 désormais atteinte** : 15
  ennemis au total (3 actes × (3 communs + 1 élite + 1 boss)).
- `content/acts.ts` : `ACT_III` + `RUN_ACTS` passe à 3 actes — pur ajout
  de contenu, la mécanique de transition multi-actes (lot 4) est déjà
  générique sur le nombre d'actes, aucun changement moteur requis.
- `RunMapScreen` affiche l'étiquette « Acte III — La Forêt » une fois la
  transition atteinte.
- Harnais de simulation : la colonne « atteint Acte II » du tableau
  récapitulatif est complétée d'une colonne « atteint Acte III »
  (généralisation de `reachedAct2Rate` en `reachedActRate(byActReached,
  minActIndex)`).
- 407 tests unitaires, 15 tests e2e, tous verts. Couverture maintenue à
  96.82 % sur `/src/engine`.

### Constaté (à surveiller)
- `npm run sim -- --runs=2000` : le taux « atteint Acte III » est à 0.0 %
  sur les 12 combinaisons — attendu, pas un signal de déséquilibre du
  contenu de l'Acte III : le bot de simulation glouton à choix aléatoire
  atteignait déjà rarement l'Acte II (0.4 % à 6.5 % selon la combinaison,
  cf. « Constaté » v0.11.0) et ne le termine quasiment jamais sous cette
  politique. Rien à corriger côté contenu (calé sur le même gabarit que
  les 2 actes précédents) ; le plafond +20 % du Canal B reste respecté
  sur toutes les combinaisons.

## [0.11.0] — Phase 7 (lot 4) — Acte II « Le Parc » + transition multi-actes

### Ajouté
- **La mécanique de transition multi-actes** : jusqu'ici, vaincre LE boss
  terminait toujours la run en victoire. `RunState` gagne `acts` (liste
  ordonnée et figée d'`RunActConfig` à la création de la run),
  `actIndex`, `bossesDefeatedThisRun` (accumulé à chaque boss vaincu,
  jamais dérivé rétroactivement de la carte courante — corrige un bug
  latent où un boss d'un acte antérieur, une fois la carte remplacée,
  n'aurait jamais été comptabilisé) et `pendingActTransition`. Vaincre le
  boss d'un acte non final génère désormais une récompense de type
  `"boss"` (le `REWARD_TABLE.boss = 60` existait depuis la Phase 3 mais
  n'était jusqu'ici jamais atteint) ; la résoudre (carte choisie ou
  passée) génère la carte de l'acte suivant et avance `actIndex`. Seul le
  dernier acte termine encore la run en victoire.
- **Acte II « Le Parc »** (§3.4) : 3 communs (**Le Griffeur de Gouttière**,
  **La Fouine Fatale**, **Le Corvidé Masqué**), 1 élite (**La Belette
  Braqueuse**) et 1 boss (**Le Baron Griffu**), calqués sur le gabarit de
  puissance de l'Acte I — aucune primitive d'effet ni statut nouveau.
- `RunMapScreen` affiche désormais l'étiquette de l'acte en cours
  ("Acte I — Le Potager" / "Acte II — Le Parc"), seul signal visuel
  qu'une transition a eu lieu.
- `applyRunCompletion` (méta) corrigé en profondeur : `bossesDefeated`
  (déblocage des familiers) n'est plus gated sur une victoire totale — un
  boss vaincu puis suivi d'une défaite plus loin dans la run compte quand
  même. `actICompleted` (déblocage des héros 2 et 3) se dérive
  spécifiquement du boss de l'Acte I (`acts[0]`), pas de l'issue globale
  de la run — sans quoi, dès qu'un 2ᵉ acte existe, `actICompleted` aurait
  silencieusement fini par signifier "a terminé toute la run".
- Migration `schemaVersion` v3 → v4 : toute sauvegarde antérieure (une
  seule run en cours possible, forcément mono-Acte-I) reçoit
  `acts: [ACT_I]`, `actIndex: 0`, `bossesDefeatedThisRun: []`,
  `pendingActTransition: false`, avec un vrai test de migration.
- Harnais de simulation : chaque run traverse désormais potentiellement
  les 2 actes ; `finalActIndex` par run permet de distinguer "n'a jamais
  atteint l'Acte II" de "a échoué dans l'Acte II" (colonne dédiée dans le
  tableau récapitulatif de `npm run sim`).
- Nouveau `tests/e2e/act-transition.spec.ts` : preuve directe de la
  transition (récompense de boss non final, carte choisie ou passée,
  bascule vers l'Acte II). 406 tests unitaires, 15 tests e2e, tous verts.
  Couverture maintenue à 96.82 % sur `/src/engine`.

### Constaté (à surveiller)
- `npm run sim -- --runs=2000` : le taux de victoire global s'effondre à
  ~0 % sur les 12 combinaisons (contre 0.3-2.7 % avant ce lot, cf.
  « Constaté » v0.8.0-v0.9.0) — attendu : le bot de simulation, déjà très
  faible sur un Acte I seul (choix de nœud/récompense/boutique uniformes,
  aucune anticipation stratégique), voit son parcours doubler avec
  l'Acte II. Le taux "atteint l'Acte II" (0.4 % à 6.5% selon la
  combinaison) confirme que la quasi-totalité des runs simulées échouent
  déjà dans l'Acte I — ce n'est pas un signal de déséquilibre du contenu
  de l'Acte II lui-même (dont le gabarit est calqué à l'identique sur
  l'Acte I), mais une limite connue et déjà documentée du bot glouton à
  choix aléatoire. Le plafond +20 % du Canal B reste respecté sur toutes
  les combinaisons.

## [0.10.0] — Phase 7 (lot 3) — Les 4 familiers

### Ajouté
- Les **4 familiers de la v1.0** (§3.3 des specs) : **Mésange Radar** (+1
  carte piochée au 1er tour de chaque combat, familier de départ toujours
  débloqué), **Hérisson Kevlar** (+3 blocage au 1er tour), **Bourdon
  Bourru** (2 dégâts à un ennemi aléatoire en fin de chaque tour), **Taupe
  Secrète** (+1 énergie tous les 3 tours). Chacun apporte 1 carte signature
  ajoutée au deck de départ. 12 combinaisons héros×familier désormais
  jouables — complète le 2ᵉ axe de rejouabilité de la v1.0.
- Nouveau vocabulaire fermé `FamiliarPassive` (4 membres, un par familier
  réel) et 3 points d'accroche moteur dédiés
  (`src/engine/effects/familiar-passive.ts`) : bonus de 1er tour (appliqué
  en fin de `createCombat`, le tour 1 ne passant jamais par
  `startHeroTurn`), bonus d'énergie périodique (`startHeroTurn`), dégâts de
  fin de tour à un ennemi aléatoire (`resolveEndTurn`, dégâts plats sans
  bonus d'attaquant ni riposte Piquants — le familier n'est pas une unité
  ciblable). `CardOwner` élargi aux 4 identifiants de familier (même
  mécanisme que l'élargissement de `HeroId` aux lots 1/2) : la carte
  signature d'un familier n'est éligible en récompense/boutique que quand
  ce familier est actif.
- `RunState` gagne `familiarId`/`familiarPassive` (figés à la création de
  la run, comme `heroId`/`heroMaxHp`) ; migration `schemaVersion` v2 → v3
  (`familiarId`/`familiarPassive: null` pour toute sauvegarde antérieure,
  y compris un combat en cours), avec un vrai test de migration.
- `HeroSelectScreen` gagne une 2ᵉ section de sélection (familier), même
  patron que la sélection de héros — bouton global "Commencer" inchangé,
  préservant tous les parcours e2e existants. Déblocage des 3 familiers
  autres que Mésange Radar via `meta.bossesDefeated.length > 0` ("vaincre
  un boss débloque un familier", §3.5), distinct de `actICompleted`
  (héros) bien que synchronisé tant qu'un seul boss existe.
- Harnais de simulation : `BalanceReport.byFamiliar` enfin peuplé (stub vide
  depuis la Phase 6, prêt de longue date). `npm run sim` simule désormais
  les 12 combinaisons héros×familier et imprime un tableau récapitulatif.
- Tests unitaires étendus/ajoutés (dont un fichier dédié
  `familiar-passive.test.ts`) + 4 nouveaux tests e2e. 390 tests unitaires,
  13 tests e2e, tous verts. Couverture maintenue ≥96 % sur `/src/engine`.

### Constaté (à surveiller)
- Sous le bot de simulation, **Mésange Radar est systématiquement le
  familier le moins performant pour les 3 héros** (ex. Casse-Noix : 1.7 %
  sans bonus contre 6.2-6.5 % pour Bourdon Bourru/Taupe Secrète). Diagnostic
  posé : la politique de combat gloutonne épuise déjà toute son énergie
  chaque tour — une carte piochée en plus ne lui sert donc à rien tant
  qu'elle n'est pas gratuite, alors que Taupe Secrète (énergie
  supplémentaire, la vraie contrainte du bot) et Bourdon Bourru (dégâts
  garantis, indépendants de tout choix de carte) restent pleinement
  efficaces sous n'importe quelle politique. Contrairement aux cartes des
  héros (Lots 1-2), **les valeurs des passifs de familier sont fixées par
  le cahier des charges** (§3.3) et n'ont donc PAS été ajustées ici pour
  compenser ce biais — un joueur humain, qui ne joue pas toute son énergie
  mécaniquement chaque tour, bénéficie réellement du choix supplémentaire
  qu'apporte une carte de plus en main. À revalider si un lot futur fait
  évoluer la politique de combat du harnais.
- Vérifié manuellement (build de production servi localement) : les 4
  familiers s'affichent en sélection, Mésange Radar toujours débloquée,
  les 3 autres verrouillées avant tout boss vaincu ; une run avec Mésange
  Radar affiche bien 6 cartes en main dès le 1er combat (5 + son bonus).

## [0.9.0] — Phase 7 (lot 2) — Docteur Bogue, 3ᵉ héros jouable

### Ajouté
- 3ᵉ héros jouable : **Docteur Bogue** (archétype ruse/poison — Sève
  empoisonnée cumulative, altérations d'état, dégâts différés), 16 cartes
  signature + deck de départ de 10 cartes (`maxHp: 78`). Complète le
  roster des 3 héros de la v1.0 — familiers, Actes II/III et cartes
  neutres restantes demeurent des lots futurs distincts.
- Kit conçu délibérément autour de l'empilement de poison (`doubleStatus`
  comme payoff signature, ex. `poison_concentre`/`overdose`) plutôt que de
  combos `conditional` intra-tour, pour tirer la leçon du lot 1
  (cf. « Constaté » v0.8.0) : le poison persiste et s'accumule entre les
  tours, donc contrairement à Étourdi il n'exige pas que le bot du harnais
  séquence correctement une carte de mise en place avant sa carte de
  paiement dans le même tour.
- `HeroId`/`CardOwner` élargis à 3 membres (`docteur_bogue` ajouté).
  `HeroSelectScreen`/`scripts/sim.ts` étaient déjà génériques depuis le
  lot 1 — seule `HERO_DISPLAY_ORDER` a dû être étendue. Déblocage via le
  même jalon Canal A que Captain Cabriole (`meta.actICompleted`) : aucun
  autre jalon de contenu réel n'existe aujourd'hui pour distinguer un 3ᵉ
  héros.
- ~50 nouvelles clés i18n (héros + 16 cartes). 6 nouveaux/étendus tests
  unitaires (catalogues héros/cartes, `run-store`) + 2 nouveaux tests e2e
  (`hero-select.spec.ts`). Couverture maintenue à 96.74 % sur `/src/engine`
  (356 tests unitaires, 11 tests e2e, tous verts).

### Constaté (à surveiller)
- Sous le bot de simulation actuel, le taux de victoire de Docteur Bogue
  (1.2 % sans bonus, n=1500) reste en-dessous de celui de Casse-Noix
  (2.7 %) mais nettement au-dessus de celui de Captain Cabriole (0.3 %) —
  corrobore l'hypothèse de conception : un kit centré sur l'accumulation
  de poison, insensible à l'ordre de jeu intra-tour, est significativement
  plus robuste face aux limites de séquencement du bot qu'un kit à combos
  `conditional`. Un ajustement mesuré a été appliqué (`maxHp` 74→78,
  `blouse_renforcee` alignée sur `mur_de_ronces`/`esquive_feline` à 8→11),
  faisant passer le taux sans-bonus de 0.7 % à 1.2 % — l'écart résiduel
  avec Casse-Noix reste probablement une limite du bot (choix de
  récompense/boutique aléatoire uniforme, non synergique) plutôt qu'un
  défaut du kit, à revalider si un lot futur fait évoluer la politique de
  combat du harnais.
- Vérifié manuellement (build de production servi localement) : les 3
  héros s'affichent en sélection, Docteur Bogue verrouillé/déverrouillé
  selon `meta.actICompleted`, une run Bogue affiche bien ses PV (78/78).

## [0.8.0] — Phase 7 (lot 1) — Captain Cabriole, 2ᵉ héros jouable

### Ajouté
- 2ᵉ héros jouable : **Captain Cabriole** (archétype agilité/combo — cartes
  à coût faible, chaînes de statuts, esquive, gain d'énergie), 16 cartes
  signature + deck de départ de 10 cartes (`maxHp: 76`). Jouable dès
  aujourd'hui à travers le contenu Acte I existant — aucun nouvel ennemi,
  aucune génération multi-actes, aucun familier (hors périmètre de ce lot,
  cf. décision actée avec l'utilisateur : Phase 7 traitée « par lots testés
  et équilibrés », jamais en un seul commit).
- `HeroId`/`CardOwner` élargis à 2 membres (`captain_cabriole` ajouté,
  Docteur Bogue reste hors périmètre). `HeroSelectScreen` boucle désormais
  sur `HERO_CATALOG` au lieu d'un 2ᵉ emplacement figé — déblocage de
  Captain Cabriole toujours piloté par `meta.actICompleted` (design Canal A
  inchangé depuis la Phase 5, câblé sur du contenu réel). Un seul bouton
  « Commencer » global (pas un par héros) préserve tous les tests e2e
  existants sans modification.
- Harnais de simulation (Phase 6) étendu : `npm run sim` simule les 2
  héros séparément (un rapport JSON par héros), en filtrant le pool de
  cartes éligibles par héros pour éviter un bruit de « cartes jamais
  offertes » entre héros.
- ~50 nouvelles clés i18n (héros + 16 cartes). 6 nouveaux tests unitaires +
  2 nouveaux tests e2e (`hero-select.spec.ts`). Couverture maintenue à
  96.74 % sur `/src/engine`.

### Corrigé
- `HeroPanel` affichait toujours le nom de Casse-Noix en combat, y compris
  pendant une run jouée avec un autre héros — désormais dérivé du héros
  réel de la run (`CombatController.heroNameKey`).

### Constaté (à surveiller)
- Le harnais de simulation mesure un taux de victoire nettement plus bas
  pour Captain Cabriole que pour Casse-Noix sous le bot actuel. Diagnostic
  posé : la politique de combat gloutonne (coût décroissant, attaque
  départagée en priorité) ne raisonne pas sur l'enchaînement
  statut-déclencheur → carte de paiement propre à l'archétype combo de
  Cabriole (ex. `corde_a_linge`/`diversion` puis `feinte_basse`), et le
  choix de cartes en récompense/boutique reste aléatoire uniforme (non
  synergique). Un ajustement mesuré a été appliqué (`maxHp` 68→76,
  `esquive_feline` alignée sur `mur_de_ronces`), mais l'écart residuel est
  probablement une limite du bot plutôt qu'un défaut du kit — à revalider
  si un lot futur fait évoluer la politique de combat du harnais.
- Vérifié manuellement (build de production servi localement) : les 2
  héros s'affichent en sélection, Cabriole verrouillé/déverrouillé selon
  `meta.actICompleted`, une run Cabriole affiche bien ses PV (76/76).

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
