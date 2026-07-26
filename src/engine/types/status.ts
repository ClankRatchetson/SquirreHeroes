export type StatusId =
  | "a_decouvert"
  | "etourdi"
  | "coquille_fetee"
  | "force"
  | "leste"
  | "seve_empoisonnee"
  | "repousse"
  | "piquants";

export interface StatusInstance {
  readonly id: StatusId;
  readonly stacks: number;
}
