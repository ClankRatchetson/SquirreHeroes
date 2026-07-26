# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnement [SemVer](https://semver.org/lang/fr/) (`0.x.y` jusqu'à la v1.0.0).

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
