import type { CardId, HeroId } from "./card";
import type { Card } from "./card";
import type { CombatState } from "./combat-state";
import type { EnemyDefinition, EnemyId } from "./enemy";
import type { EventDefinition } from "./event";
import type { RngState } from "../rng/mulberry32";

export type RunNodeType = "combat" | "elite" | "evenement" | "boutique" | "feu_de_camp" | "boss";

export interface RunNode {
  readonly id: string;
  readonly floor: number;
  readonly type: RunNodeType;
  readonly enemyIds?: readonly EnemyId[];
  readonly eventId?: string;
  readonly edges: readonly string[];
}

export interface RunMap {
  readonly actId: string;
  readonly floorCount: number;
  readonly nodes: readonly RunNode[];
}

/** Une carte DANS le deck du run — distincte de `CardInstance` (combat), survit entre combats. */
export interface RunDeckEntry {
  readonly runCardId: string;
  readonly cardId: CardId;
  readonly upgraded: boolean;
}

export type RunOutcome = "en_cours" | "victoire" | "defaite";
export type RunPhase = "carte" | "combat" | "recompense" | "boutique" | "feu_de_camp" | "evenement" | "run_over";

export interface RunRewardOffer {
  readonly cardChoices: readonly CardId[];
  readonly noisettes: number;
}

export interface ShopOfferSlot {
  readonly cardId: CardId;
  readonly price: number;
  readonly purchased: boolean;
}

export interface ShopOffer {
  readonly cardsForSale: readonly ShopOfferSlot[];
  readonly upgradePrice: number;
  readonly removePrice: number;
}

export interface RunState {
  readonly heroId: HeroId;
  readonly heroMaxHp: number;
  readonly heroHp: number;
  readonly deck: readonly RunDeckEntry[];
  readonly noisettes: number;
  readonly map: RunMap;
  readonly currentNodeId: string | null;
  readonly visitedNodeIds: readonly string[];
  readonly phase: RunPhase;
  readonly outcome: RunOutcome;
  readonly pendingCombat: CombatState | null;
  readonly pendingReward: RunRewardOffer | null;
  readonly pendingShop: ShopOffer | null;
  readonly pendingEventId: string | null;
  readonly rng: RngState;
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly enemyCatalog: Readonly<Record<EnemyId, EnemyDefinition>>;
  readonly eventCatalog: Readonly<Record<string, EventDefinition>>;
  readonly nextRunCardSeq: number;
}
