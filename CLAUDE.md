# CLAUDE.md — Squirrel Heroes

Rappel opérationnel lu à chaque session. Le cahier des charges complet est dans
`specs-squirrel-heroes.md` — s'y référer pour tout ce qui n'est pas couvert ici.

## Règles non négociables

1. **TypeScript strict partout.** `strict: true`. Jamais de `any` implicite.
   Si un type est difficile à exprimer, c'est un signal pour revoir la
   conception, pas pour échapper au typage.
2. **`/src/engine` ne dépend jamais de React.** Zéro `import` React, zustand,
   ou tout ce qui touche à l'UI dans ce dossier. Le moteur est une fonction
   pure `(état, action) => nouvel état`. Si un test du moteur nécessite de
   monter un composant, quelque chose ne va pas.
3. **Aucun `Math.random()` dans le moteur.** Tout aléatoire passe par le PRNG
   seedé porté dans l'état (`/src/engine/rng`). Une run doit être rejouable à
   l'identique à partir de sa seed.
4. **Cartes, ennemis, familiers, événements = données JSON, jamais de code.**
   Une carte ne doit jamais nécessiter une branche `if` dédiée dans le moteur.
   Si une carte a besoin d'un comportement absent du vocabulaire d'effets
   (`/src/engine/effects`), on ajoute la primitive — avec ses tests — on ne
   contourne pas.
5. **Aucune chaîne de texte en dur.** Tout texte visible passe par `t(key)`
   et une clé dans `/src/content/i18n/fr.ts`. Pas de librairie i18n, le
   dictionnaire est typé maison.
6. **Zéro appel réseau à l'exécution.** Pas d'analytics, pas de CDN, pas de
   police distante. Le jeu doit tourner en mode avion du premier au dernier
   écran.
7. **Toute donnée persistée est versionnée.** Un changement du modèle
   `SaveFile` (`/src/persistence`) s'accompagne, dans la même PR, d'une
   migration ET d'un test qui charge une sauvegarde de l'ancienne version.

## Definition of Done — une feature n'est terminée que si

- [ ] Code TypeScript strict, sans `any`.
- [ ] Tests unitaires sur toute logique de moteur. Couverture ≥ 90 % sur
      `/src/engine`.
- [ ] Le catalogue de contenu (cartes/ennemis/familiers/événements) passe la
      validation Zod, et toutes ses clés i18n résolvent.
- [ ] Migration + test de migration si `SaveFile` a changé.
- [ ] CI verte : lint, typecheck, tests.
- [ ] `CHANGELOG.md` mis à jour, tag SemVer posé.

Ne pas commencer une feature tant que la précédente ne coche pas toutes ces
cases.

## Conventions

- Une feature = une branche `feat/xxx` = une PR = un merge. Pas de travail
  directement sur `main`.
- Conventional Commits : `feat:`, `fix:`, `test:`, `refactor:`, `chore:`.
- SemVer `0.x.y` jusqu'à la v1.0.0. Incrément mineur à chaque phase du
  planning livrée.

## Arborescence de référence

```
/src
  /engine        TS pur. Aucun import React, jamais.
    /core        état, réducteur, résolution de tour
    /effects     primitives d'effets (~25, vocabulaire fermé)
    /rng         PRNG seedé
    /types
  /content       données JSON + schémas Zod
    cards/ enemies/ familiars/ events/ heroes/
    /i18n        fr.ts
  /ui            React
  /persistence   Dexie, schéma SaveFile, migrations
  /sim           harnais de simulation headless (bot, milliers de runs)
/tests
/assets-pipeline manifeste de prompts + script de génération d'images
```

## Ordre de développement (voir planning complet dans les specs)

Ne pas paralléliser les phases. Chaque phase produit un livrable testé avant
la suivante :

`Phase 0` fondations → `Phase 1` moteur + tranche verticale (1 héros, 15
cartes, 3 ennemis) → `Phase 2` UI de combat → `Phase 3` structure de run →
`Phase 4` persistance → `Phase 5` méta-progression → `Phase 6` harnais de
simulation (à ne pas sauter — c'est l'outil d'équilibrage) → `Phase 7`
montée en contenu par lots → `Phase 8` polish & v1.0.0.

## Repères de contenu v1.0

- 3 héros : Casse-Noix, Captain Cabriole, Docteur Bogue.
- 4 familiers : Mésange Radar, Hérisson Kevlar, Bourdon Bourru, Taupe Secrète.
- 3 actes : Le Potager, Le Parc, La Forêt. 12 ennemis/élites + 3 boss.
- 70 cartes cible (48 signature + 18 neutres + 4 familier). Pas plus sans
  revalider le rythme de développement.
- Français uniquement en v1.0, mais aucune chaîne en dur — l'anglais est un
  ajout de dictionnaire, jamais un refactor.

## Garde-fous d'équilibrage

- Le canal de puissance (Glands d'Or) ne doit jamais dépasser +20 % de
  puissance effective de départ. Vérifier par simulation (`/src/sim`) avant
  d'ajouter un nœud à l'arbre.
- Aucune illustration ne doit reproduire un costume ou logo de super-héros
  existant. Revue visuelle systématique avant intégration d'un asset généré.

## Cibles techniques

Android 8+, portrait verrouillé, 60 fps sur mobile milieu de gamme, APK final
< 60 Mo. Illustrations : WebP, 512×512, < 150 Ko/fichier.
