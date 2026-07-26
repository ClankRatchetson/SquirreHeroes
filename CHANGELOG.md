# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnement [SemVer](https://semver.org/lang/fr/) (`0.x.y` jusqu'à la v1.0.0).

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
