import { describe, expect, it } from "vitest";
import { looksLikePersistedRunState, parseEnvelope } from "../../src/persistence/validate";
import { stripRunState } from "../../src/persistence/serialize";
import { makeRunState } from "../engine/helpers";

describe("parseEnvelope", () => {
  it("accepte une enveloppe valide avec currentRun: null", () => {
    expect(parseEnvelope({ schemaVersion: 1, currentRun: null }).success).toBe(true);
  });

  it("accepte une enveloppe valide avec un currentRun non nul (forme non vérifiée à ce niveau)", () => {
    expect(parseEnvelope({ schemaVersion: 1, currentRun: { anything: true } }).success).toBe(true);
  });

  it("rejette schemaVersion manquant", () => {
    expect(parseEnvelope({ currentRun: null }).success).toBe(false);
  });

  it("rejette schemaVersion de mauvais type", () => {
    expect(parseEnvelope({ schemaVersion: "1", currentRun: null }).success).toBe(false);
  });

  it("rejette une donnée qui n'est pas un objet", () => {
    expect(parseEnvelope("garbage").success).toBe(false);
    expect(parseEnvelope(null).success).toBe(false);
    expect(parseEnvelope(42).success).toBe(false);
    expect(parseEnvelope(undefined).success).toBe(false);
  });
});

describe("looksLikePersistedRunState", () => {
  it("accepte un vrai PersistedRunState produit par stripRunState", () => {
    const persisted = stripRunState(makeRunState());
    expect(looksLikePersistedRunState(persisted)).toBe(true);
  });

  it("rejette un objet vide ou null", () => {
    expect(looksLikePersistedRunState({})).toBe(false);
    expect(looksLikePersistedRunState(null)).toBe(false);
  });

  it("rejette un objet incomplet (champ map manquant)", () => {
    const persisted = stripRunState(makeRunState()) as unknown as Record<string, unknown>;
    const withoutMap = { ...persisted };
    delete withoutMap.map;
    expect(looksLikePersistedRunState(withoutMap)).toBe(false);
  });

  it("rejette un rng de forme invalide", () => {
    const persisted = stripRunState(makeRunState());
    expect(looksLikePersistedRunState({ ...persisted, rng: "nope" })).toBe(false);
  });
});
