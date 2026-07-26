# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnement [SemVer](https://semver.org/lang/fr/) (`0.x.y` jusqu'à la v1.0.0).

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
