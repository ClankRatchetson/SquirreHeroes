import type { StatusId, StatusInstance } from "../types";

export function getStacks(statuses: readonly StatusInstance[], id: StatusId): number {
  return statuses.find((s) => s.id === id)?.stacks ?? 0;
}

/** Additionne les stacks au statut existant, ou l'ajoute s'il est absent. */
export function addStacks(
  statuses: readonly StatusInstance[],
  id: StatusId,
  stacksToAdd: number,
): readonly StatusInstance[] {
  const existing = statuses.find((s) => s.id === id);
  if (!existing) {
    return [...statuses, { id, stacks: stacksToAdd }];
  }
  return statuses.map((s) => (s.id === id ? { id, stacks: s.stacks + stacksToAdd } : s));
}

/** Retire entièrement le statut (no-op s'il est absent). */
export function removeStatusEntry(
  statuses: readonly StatusInstance[],
  id: StatusId,
): readonly StatusInstance[] {
  return statuses.filter((s) => s.id !== id);
}

/** Double les stacks du statut (no-op s'il est absent : 0 x 2 = 0). */
export function doubleStacks(
  statuses: readonly StatusInstance[],
  id: StatusId,
): readonly StatusInstance[] {
  return statuses.map((s) => (s.id === id ? { id, stacks: s.stacks * 2 } : s));
}

/** Décrémente d'une unité, retire l'entrée si elle tombe à 0. */
export function decrementStacks(
  statuses: readonly StatusInstance[],
  id: StatusId,
): readonly StatusInstance[] {
  return statuses
    .map((s) => (s.id === id ? { id, stacks: s.stacks - 1 } : s))
    .filter((s) => s.stacks > 0);
}
