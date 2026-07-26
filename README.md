# Squirrel Heroes : les Justiciers de la Forêt

Deck builder solo, 100 % hors-ligne, Android. Cahier des charges complet dans
[`specs-squirrel-heroes.md`](./specs-squirrel-heroes.md), rappel opérationnel
dans [`CLAUDE.md`](./CLAUDE.md).

## Développement

```bash
npm install
npm run dev          # serveur de dev
npm run build        # build de production + PWA
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # tests unitaires (Vitest)
npm run test:coverage # tests unitaires + couverture
npm run test:e2e      # tests e2e (Playwright)
```

## Android (Capacitor)

```bash
npm run build
npm run cap:sync   # copie le build web dans le projet Android
npm run cap:open   # ouvre le projet dans Android Studio
```

## Structure

```
/src
  /engine        TS pur, zéro dépendance React (moteur de jeu)
  /content       données JSON (cartes/ennemis/familiers/événements) + i18n
  /ui            React
  /persistence   Dexie, schéma de sauvegarde, migrations
  /sim           harnais de simulation headless
/tests
/assets-pipeline manifeste de prompts + script de génération d'illustrations
```
