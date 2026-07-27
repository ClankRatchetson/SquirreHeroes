# Issues — revue Phase 4 (persistance)

Trouvés lors de la revue de code de `89a3705` (feat: persistance de la run —
Phase 4 — v0.5.0). Non bloquants pour l'instant, à corriger dans une prochaine
itération.

## 1. Validation trop permissive de `pendingCombat`/`pendingReward`/`pendingShop`

**Fichier** : `src/persistence/validate.ts:34`

`persistedRunShapeSchema` valide ces trois champs avec `z.unknown().nullable()`
— n'importe quelle valeur non nulle passe, sans vérifier la forme réelle.

**Scénario de plantage** : une corruption IndexedDB (écriture partielle,
payload altéré) laisse `pendingCombat` non nul mais mal formé (`enemies` ou
`hand` manquants). `looksLikePersistedRunState` retourne quand même `true`,
donc `loadSaveFile` renvoie ça comme une sauvegarde valide au lieu du repli
documenté sur « aucune sauvegarde ». Au clic sur « Reprendre la run »,
`hydrateRunState` → `hydrateCombatState` propage l'objet corrompu tel quel, et
`CombatBattlefield`/`EnemyRow` plante sur `enemies.map(...)` — contredisant la
promesse du CHANGELOG (« une donnée corrompue... retombent proprement sur
aucune sauvegarde plutôt que de faire planter l'app »).

**Piste de correction** : valider au moins la présence des champs requis de
`PersistedCombatState`/`RunRewardOffer`/`ShopOffer`, ou envelopper l'hydratation
dans un `try/catch` qui replie sur `EMPTY_SAVE` en cas d'échec.

## 2. `phase`/`outcome` validés comme `string` libre, pas comme les unions réelles

**Fichier** : `src/persistence/validate.ts:32`

`phase` et `outcome` sont validés avec `z.string()` au lieu des unions
littérales `RunPhase`/`RunOutcome` réellement attendues par le moteur.

**Scénario de plantage** : une sauvegarde corrompue a un `phase` hors de
l'union réelle. Le `switch (phase)` de `RunScreen.tsx` n'a pas de `default` et
retourne `undefined` (écran blanc) ; si `outcome` est aussi invalide,
`RunOutcomeOverlay` (dont la garde attend `"victoire"`/`"defaite"`) retourne
`null` et cache le seul bouton « Nouvelle run ». La run reprise se retrouve
bloquée sur un écran vide, sans retour possible au menu autrement qu'en vidant
IndexedDB manuellement.

**Piste de correction** : remplacer par `z.enum([...])` sur les valeurs
réelles de `RunPhase`/`RunOutcome`.

## 3. Écran de chargement sans timeout ni repli

**Fichier** : `src/App.tsx:17`

Le nouvel écran « Chargement… » attend indéfiniment la promesse de
`loadSaveFile` sans timeout ni gestion d'erreur au-delà du `try/catch` déjà
présent dans `loadSaveFile` (qui ne gère que rejet/throw, pas une promesse qui
ne se résout jamais).

**Scénario de plantage** : `adapter.load()` (`db.saveSlot.get`, qui attend
implicitement `db.open()`) peut rester bloqué sans jamais résoudre ni rejeter
dans certains cas documentés d'IndexedDB (connexion `blocked` par un autre
onglet, certains cas de navigation privée). L'utilisateur reste bloqué sur
« Chargement… » indéfiniment — régression par rapport au menu qui s'affichait
auparavant instantanément sans dépendance au stockage.

**Piste de correction** : ajouter un timeout (`Promise.race`) qui bascule sur
le menu avec `savedRun = null` si `loadSaveFile` ne répond pas assez vite.

---

## Cleanup (non bloquant, priorité basse)

### 4. Style d'overlay dupliqué

**Fichier** : `src/ui/components/feedback/ConfirmOverwriteDialog.tsx:16`

Reprend telle quelle la classe CSS du conteneur plein écran déjà utilisée dans
`OutcomeOverlay.tsx` et `RunOutcomeOverlay.tsx`, au lieu d'un composant
wrapper partagé. Un futur ajustement visuel (opacité, animation, z-index)
demandera d'éditer les trois fichiers en parallèle.

### 5. `clearSaveFile` jamais branché à l'UI

**Fichier** : `src/persistence/save-game.ts:47`

Exporté depuis `/src/persistence` mais aucun appelant dans `App.tsx`,
`MenuScreen.tsx` ou `run-store.ts` — seulement utilisé par son propre test
unitaire. Aucun moyen actuel dans l'UI d'effacer explicitement une run
sauvegardée.
