import type {
  Card,
  CardId,
  EnemyDefinition,
  EnemyId,
  EventDefinition,
  FamiliarDefinition,
  HeroDefinition,
  RunActConfig,
  RunDeckEntry,
  RunState,
} from "../types";
import { createRng } from "../rng";
import { generateMap, poolsForAct } from "./map-generation";

export interface CreateRunParams {
  readonly hero: HeroDefinition;
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly enemyCatalog: Readonly<Record<EnemyId, EnemyDefinition>>;
  readonly eventCatalog: Readonly<Record<string, EventDefinition>>;
  /** Liste ordonnée des actes de la run (Acte I en premier) — figée telle quelle sur `RunState.acts`. */
  readonly acts: readonly RunActConfig[];
  readonly seed: number;
  /** Bonus de méta-progression (Canal B), additifs et rétro-compatibles — mêmes discipline que deckOverride/heroHpOverride de createCombat. */
  readonly bonusMaxHp?: number | undefined;
  readonly upgradedStartingCardIds?: readonly CardId[] | undefined;
  readonly noisettesBonusPerCombat?: number | undefined;
  /** Familier choisi pour la run (§3.3) — additif, rétro-compatible ; sa carte signature s'ajoute au deck de départ. */
  readonly familiar?: FamiliarDefinition | undefined;
}

export function createRun(params: CreateRunParams): RunState {
  const rng0 = createRng(params.seed);
  const firstAct = params.acts[0];
  if (!firstAct) {
    throw new Error("Contenu manquant : une run doit avoir au moins un acte.");
  }
  const [map, rng1] = generateMap(rng0, poolsForAct(firstAct, params.eventCatalog), firstAct.actId);

  const upgradedIds = new Set(params.upgradedStartingCardIds ?? []);
  const startingCardIds = params.familiar
    ? [...params.hero.startingDeck, params.familiar.signatureCardId]
    : params.hero.startingDeck;
  let nextRunCardSeq = 0;
  const deck: RunDeckEntry[] = startingCardIds.map((cardId) => {
    const entry: RunDeckEntry = {
      runCardId: `run-card-${String(nextRunCardSeq)}`,
      cardId,
      upgraded: upgradedIds.has(cardId),
    };
    nextRunCardSeq += 1;
    return entry;
  });

  const heroMaxHp = params.hero.maxHp + (params.bonusMaxHp ?? 0);

  return {
    heroId: params.hero.id,
    heroMaxHp,
    heroHp: heroMaxHp,
    deck,
    noisettes: 0,
    map,
    currentNodeId: null,
    visitedNodeIds: [],
    phase: "carte",
    outcome: "en_cours",
    pendingCombat: null,
    pendingReward: null,
    pendingShop: null,
    pendingEventId: null,
    rng: rng1,
    cardCatalog: params.cardCatalog,
    enemyCatalog: params.enemyCatalog,
    eventCatalog: params.eventCatalog,
    nextRunCardSeq,
    noisettesBonusPerCombat: params.noisettesBonusPerCombat ?? 0,
    familiarId: params.familiar?.id ?? null,
    familiarPassive: params.familiar?.passive ?? null,
    acts: params.acts,
    actIndex: 0,
    bossesDefeatedThisRun: [],
    pendingActTransition: false,
  };
}
