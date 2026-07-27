import type { Card, CardId } from "./card";
import type { EnemyInstance, HeroState } from "./combatant";
import type { FamiliarPassive } from "./familiar";
import type { RngState } from "../rng/mulberry32";

export type CombatPhase = "hero_turn" | "combat_over";
export type CombatOutcome = "en_cours" | "victoire" | "defaite";

export interface CardInstance {
  readonly instanceId: string;
  readonly cardId: CardId;
  readonly upgraded: boolean;
}

/**
 * État racine du moteur. Le catalogue de cartes est injecté ici (jamais
 * importé depuis `/src/content` par le moteur) : le réducteur garde ainsi
 * une signature `(état, action) => nouvel état` sans dépendance cachée.
 */
export interface CombatState {
  readonly hero: HeroState;
  readonly enemies: readonly EnemyInstance[];
  readonly drawPile: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly discardPile: readonly CardInstance[];
  readonly exhaustPile: readonly CardInstance[];
  readonly energy: number;
  readonly maxEnergy: number;
  readonly turnNumber: number;
  readonly phase: CombatPhase;
  readonly outcome: CombatOutcome;
  readonly rng: RngState;
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly nextInstanceSeq: number;
  /** Figé pour tout le combat (§3.3 : le familier n'est pas une unité ciblable, juste un passif ambiant). */
  readonly familiarPassive: FamiliarPassive | null;
}
