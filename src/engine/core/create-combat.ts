import type {
  Card,
  CardId,
  CardInstance,
  CombatState,
  EnemyDefinition,
  EnemyInstance,
  EnemyMoveDef,
  HeroDefinition,
  HeroState,
  MoveId,
} from "../types";
import { createRng, shuffle } from "../rng";
import { BASE_MAX_ENERGY, HAND_SIZE } from "./constants";

export interface CreateCombatParams {
  readonly hero: HeroDefinition;
  readonly enemies: readonly EnemyDefinition[];
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly seed: number;
}

function buildEnemyInstance(def: EnemyDefinition, index: number): EnemyInstance {
  const moves: Record<MoveId, EnemyMoveDef> = {};
  for (const move of def.moves) {
    moves[move.id] = move;
  }
  const firstMoveId = def.pattern[0];
  const firstMove = firstMoveId !== undefined ? moves[firstMoveId] : undefined;
  if (!firstMove) {
    // Erreur de contenu (pattern vide ou move introuvable), pas une action
    // joueur illégale : la validation Zod du contenu doit empêcher ce cas
    // avant qu'il n'atteigne jamais le moteur.
    throw new Error(`Ennemi "${def.id}" : pattern vide ou move introuvable.`);
  }
  return {
    instanceId: `${def.id}-${String(index)}`,
    defId: def.id,
    nameKey: def.nameKey,
    maxHp: def.maxHp,
    hp: def.maxHp,
    block: 0,
    statuses: [],
    movesTaken: 0,
    intent: firstMove,
    pattern: def.pattern,
    moves,
  };
}

export function createCombat(params: CreateCombatParams): CombatState {
  const rng0 = createRng(params.seed);

  let nextInstanceSeq = 0;
  const unshuffledDraw: CardInstance[] = params.hero.startingDeck.map((cardId) => {
    const instance: CardInstance = { instanceId: `card-${String(nextInstanceSeq)}`, cardId, upgraded: false };
    nextInstanceSeq += 1;
    return instance;
  });

  const [shuffledDraw, rng1] = shuffle(rng0, unshuffledDraw);
  const hand = shuffledDraw.slice(0, HAND_SIZE);
  const drawPile = shuffledDraw.slice(HAND_SIZE);

  const heroState: HeroState = {
    maxHp: params.hero.maxHp,
    hp: params.hero.maxHp,
    block: 0,
    statuses: [],
    retainsBlock: false,
  };

  return {
    hero: heroState,
    enemies: params.enemies.map(buildEnemyInstance),
    drawPile,
    hand,
    discardPile: [],
    exhaustPile: [],
    energy: BASE_MAX_ENERGY,
    maxEnergy: BASE_MAX_ENERGY,
    turnNumber: 1,
    phase: "hero_turn",
    outcome: "en_cours",
    rng: rng1,
    cardCatalog: params.cardCatalog,
    nextInstanceSeq,
  };
}
