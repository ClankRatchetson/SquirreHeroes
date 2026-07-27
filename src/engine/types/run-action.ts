import type { CardId } from "./card";
import type { CombatAction } from "./action";

export interface ChoisirNoeudAction {
  readonly type: "CHOISIR_NOEUD";
  readonly nodeId: string;
}

export interface ChoisirRecompenseCarteAction {
  readonly type: "CHOISIR_RECOMPENSE_CARTE";
  readonly cardId: CardId;
}

export interface PasserRecompenseAction {
  readonly type: "PASSER_RECOMPENSE";
}

export interface AcheterCarteAction {
  readonly type: "ACHETER_CARTE";
  readonly cardId: CardId;
}

export interface AcheterAmeliorationAction {
  readonly type: "ACHETER_AMELIORATION";
  readonly runCardId: string;
}

export interface AcheterSuppressionAction {
  readonly type: "ACHETER_SUPPRESSION";
  readonly runCardId: string;
}

export interface QuitterBoutiqueAction {
  readonly type: "QUITTER_BOUTIQUE";
}

export interface FeuDeCampSoignerAction {
  readonly type: "FEU_DE_CAMP_SOIGNER";
}

export interface FeuDeCampAmeliorerAction {
  readonly type: "FEU_DE_CAMP_AMELIORER";
  readonly runCardId: string;
}

export interface ChoisirEvenementOptionAction {
  readonly type: "CHOISIR_EVENEMENT_OPTION";
  readonly choiceId: string;
}

/**
 * Actions du réducteur de run. `PLAY_CARD`/`END_TURN` (de `CombatAction`)
 * sont forwardées à `combatReducer` par `runReducer` quand `phase ===
 * "combat"` — c'est le réducteur de run qui orchestre cette composition,
 * jamais la UI (cf. `forwardToCombat`).
 */
export type RunAction =
  | CombatAction
  | ChoisirNoeudAction
  | ChoisirRecompenseCarteAction
  | PasserRecompenseAction
  | AcheterCarteAction
  | AcheterAmeliorationAction
  | AcheterSuppressionAction
  | QuitterBoutiqueAction
  | FeuDeCampSoignerAction
  | FeuDeCampAmeliorerAction
  | ChoisirEvenementOptionAction;
