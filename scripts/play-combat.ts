import { combatReducer, createCombat, getVisibleEnemyIntents } from "../src/engine/core";
import type { CombatState } from "../src/engine/types";
import { CARD_CATALOG } from "../src/content/cards";
import { CASSE_NOIX } from "../src/content/heroes";
import { CAMPAGNOL_CAGOULE, MULOT_MASQUE, PIE_KLEPTOMANE } from "../src/content/enemies";
import { tFromContent } from "../src/content/i18n/t";
import { chooseCombatAction } from "../src/sim/policy/combat-policy";

/**
 * Démo CLI déterministe (§ Phase 1 — "combat jouable via un script CLI,
 * sans aucune UI"). Politique gloutonne (`chooseCombatAction`, partagée
 * avec `play-run.ts` et le harnais de simulation de la Phase 6) : joue la
 * carte jouable la plus chère, cible le premier ennemi vivant. Pas
 * d'interactivité stdin — le vrai jouable au doigt arrive en Phase 2 (UI).
 */

const SEED = 42;
const SAFETY_CAP = 200;

function printState(state: CombatState): void {
  console.log(
    `--- Tour ${String(state.turnNumber)} | PV ${String(state.hero.hp)}/${String(state.hero.maxHp)} ` +
      `| Bloc ${String(state.hero.block)} | Énergie ${String(state.energy)}/${String(state.maxEnergy)} ---`,
  );
  for (const enemy of state.enemies) {
    const status = enemy.hp > 0 ? `${String(enemy.hp)}/${String(enemy.maxHp)} PV` : "vaincu";
    console.log(`  ${tFromContent(enemy.nameKey)} : ${status}, bloc ${String(enemy.block)}`);
  }
  for (const intent of getVisibleEnemyIntents(state)) {
    console.log(`  Intention ${tFromContent(intent.nameKey)} -> ${tFromContent(intent.move.nameKey)}`);
  }
}

let state = createCombat({
  hero: CASSE_NOIX,
  enemies: [MULOT_MASQUE, CAMPAGNOL_CAGOULE, PIE_KLEPTOMANE],
  cardCatalog: CARD_CATALOG,
  seed: SEED,
});

console.log(`Combat de démonstration — seed ${String(SEED)}`);
printState(state);

for (let i = 0; i < SAFETY_CAP && state.outcome === "en_cours"; i += 1) {
  state = combatReducer(state, chooseCombatAction(state, CARD_CATALOG));
  printState(state);
}

console.log(`Résultat : ${state.outcome}`);

if (state.outcome === "victoire") {
  process.exit(0);
} else if (state.outcome === "defaite") {
  process.exit(1);
} else {
  process.exit(2);
}
