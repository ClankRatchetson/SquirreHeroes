import { describe, expect, it } from "vitest";
import { diffCombatStates } from "../../src/ui/animation/diff-events";
import { makeEnemy, makeState } from "../engine/helpers";

describe("diffCombatStates", () => {
  it("émet un événement damage quand les PV du héros baissent", () => {
    const prev = makeState({ hero: { maxHp: 80, hp: 80, block: 0, statuses: [], retainsBlock: false } });
    const next = makeState({ hero: { maxHp: 80, hp: 70, block: 0, statuses: [], retainsBlock: false } });
    const events = diffCombatStates(prev, next);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "damage", targetId: "hero", amount: 10 });
  });

  it("émet un événement heal quand les PV augmentent", () => {
    const prev = makeState({ hero: { maxHp: 80, hp: 60, block: 0, statuses: [], retainsBlock: false } });
    const next = makeState({ hero: { maxHp: 80, hp: 75, block: 0, statuses: [], retainsBlock: false } });
    const events = diffCombatStates(prev, next);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "heal", targetId: "hero", amount: 15 });
  });

  it("émet un événement block quand le blocage augmente", () => {
    const prev = makeState({ hero: { maxHp: 80, hp: 80, block: 0, statuses: [], retainsBlock: false } });
    const next = makeState({ hero: { maxHp: 80, hp: 80, block: 8, statuses: [], retainsBlock: false } });
    const events = diffCombatStates(prev, next);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "block", targetId: "hero", amount: 8 });
  });

  it("n'émet rien pour une baisse de blocage (déjà impliquée par l'événement de dégât)", () => {
    const prev = makeState({ hero: { maxHp: 80, hp: 80, block: 10, statuses: [], retainsBlock: false } });
    const next = makeState({ hero: { maxHp: 80, hp: 80, block: 4, statuses: [], retainsBlock: false } });
    expect(diffCombatStates(prev, next)).toEqual([]);
  });

  it("apparie les ennemis par instanceId (un ennemi tué produit un événement damage)", () => {
    const prev = makeState({ enemies: [makeEnemy({ instanceId: "e1", hp: 10 })] });
    const next = makeState({ enemies: [makeEnemy({ instanceId: "e1", hp: 0 })] });
    const events = diffCombatStates(prev, next);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "damage", targetId: "e1", amount: 10 });
  });

  it("produit plusieurs événements simultanés (héros + plusieurs ennemis)", () => {
    const prev = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [], retainsBlock: false },
      enemies: [makeEnemy({ instanceId: "a", hp: 20 }), makeEnemy({ instanceId: "b", hp: 20 })],
    });
    const next = makeState({
      hero: { maxHp: 80, hp: 70, block: 0, statuses: [], retainsBlock: false },
      enemies: [makeEnemy({ instanceId: "a", hp: 12 }), makeEnemy({ instanceId: "b", hp: 20 })],
    });
    const events = diffCombatStates(prev, next);
    expect(events).toHaveLength(2);
    expect(events).toContainEqual(expect.objectContaining({ kind: "damage", targetId: "hero", amount: 10 }));
    expect(events).toContainEqual(expect.objectContaining({ kind: "damage", targetId: "a", amount: 8 }));
  });

  it("aucun changement -> liste vide", () => {
    const state = makeState();
    expect(diffCombatStates(state, state)).toEqual([]);
  });
});
