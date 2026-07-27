import type { CardId, FamiliarId, HeroId } from "./card";
import type { Card } from "./card";
import type { CombatState } from "./combat-state";
import type { EnemyDefinition, EnemyId } from "./enemy";
import type { EventDefinition } from "./event";
import type { FamiliarPassive } from "./familiar";
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

/** Pools d'ennemis d'UN acte — `RunState.acts` porte la liste ordonnée complète, figée à la création de la run. */
export interface RunActConfig {
  readonly actId: string;
  readonly commonEnemyIds: readonly EnemyId[];
  readonly eliteEnemyIds: readonly EnemyId[];
  readonly bossEnemyIds: readonly EnemyId[];
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
  /** Figé une fois à la création de la run (jamais relu en direct depuis la méta-progression en cours de run). */
  readonly noisettesBonusPerCombat: number;
  /** Identité du familier choisi pour la run (affichage/éligibilité de cartes) — `null` si aucun. */
  readonly familiarId: FamiliarId | null;
  /** Passif résolu une fois à la création de la run — dénormalisé plutôt que de porter un catalogue complet sur `RunState`. */
  readonly familiarPassive: FamiliarPassive | null;
  /** Liste ordonnée figée à la création de la run — un acte par entrée, jamais modifiée en cours de run. */
  readonly acts: readonly RunActConfig[];
  /** 0-based : quel acte de `acts` est actif (correspond à `map.actId`). */
  readonly actIndex: number;
  /** Accumulé (dédupliqué) à chaque boss vaincu pendant la run — jamais dérivé rétroactivement du nœud boss de la carte courante. */
  readonly bossesDefeatedThisRun: readonly EnemyId[];
  /** Vrai quand `pendingReward` existe parce qu'un boss non-final vient d'être vaincu : sa résolution déclenche la génération de l'acte suivant. */
  readonly pendingActTransition: boolean;
}
