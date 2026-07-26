import { combatReducer, createCombat, getVisibleEnemyIntents, isCardPlayable } from "../src/engine/core";
import type { Card, CombatAction, CombatState } from "../src/engine/types";
import { CARD_CATALOG } from "../src/content/cards";
import { CASSE_NOIX } from "../src/content/heroes";
import { CAMPAGNOL_CAGOULE, MULOT_MASQUE, PIE_KLEPTOMANE } from "../src/content/enemies";
import { tFromContent } from "../src/content/i18n/t";

/**
 * Démo CLI déterministe (§ Phase 1 — "combat jouable via un script CLI,
 * sans aucune UI"). Politique gloutonne : joue la carte jouable la plus
 * chère, cible le premier ennemi vivant. Pas d'interactivité stdin — le
 * vrai jouable au doigt arrive en Phase 2 (UI).
 */

const SEED = 42;
const SAFETY_CAP = 200;

function cardOf(state: CombatState, cardInstanceId: string): Card | undefined {
  const instance = state.hand.find((c) => c.instanceId === cardInstanceId);
  return instance ? CARD_CATALOG[instance.cardId] : undefined;
}

/**
 * Priorité : coût décroissant, puis attaque avant défense/compétence à
 * coût égal — évite une démo dégénérée qui ne ferait jamais de dégâts.
 */
function chooseAction(state: CombatState): CombatAction {
  // Cible tentative fixée AVANT le filtre de jouabilité : une carte
  // d'attaque n'est jouable, avec plusieurs ennemis vivants, que si on lui
  // fournit déjà la cible qu'on compte utiliser.
  const targetEnemyId = state.enemies.find((e) => e.hp > 0)?.instanceId;

  const playable = state.hand.filter((c) => isCardPlayable(state, c.instanceId, targetEnemyId));
  if (playable.length === 0) {
    return { type: "END_TURN" };
  }

  const sorted = [...playable].sort((a, b) => {
    const cardA = cardOf(state, a.instanceId);
    const cardB = cardOf(state, b.instanceId);
    const costDiff = (cardB?.cost ?? 0) - (cardA?.cost ?? 0);
    if (costDiff !== 0) {
      return costDiff;
    }
    const attackA = cardA?.type === "attaque" ? 1 : 0;
    const attackB = cardB?.type === "attaque" ? 1 : 0;
    return attackB - attackA;
  });
  const chosen = sorted[0];
  if (!chosen) {
    return { type: "END_TURN" };
  }

  return {
    type: "PLAY_CARD",
    cardInstanceId: chosen.instanceId,
    ...(targetEnemyId !== undefined ? { targetEnemyId } : {}),
  };
}

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
  state = combatReducer(state, chooseAction(state));
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
