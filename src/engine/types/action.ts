export interface PlayCardAction {
  readonly type: "PLAY_CARD";
  readonly cardInstanceId: string;
  readonly targetEnemyId?: string;
}

export interface EndTurnAction {
  readonly type: "END_TURN";
}

/**
 * Seules actions externes du moteur. Le tour ennemi est entièrement interne
 * (les intentions sont déjà figées) : aucune action dédiée n'est nécessaire.
 */
export type CombatAction = PlayCardAction | EndTurnAction;
