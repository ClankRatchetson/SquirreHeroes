import { describe, expect, it } from "vitest";
import { looksLikeMetaProgression, looksLikePersistedRunState, parseEnvelope } from "../../src/persistence/validate";
import { stripRunState } from "../../src/persistence/serialize";
import { makeMetaProgression, makeRunState } from "../engine/helpers";

describe("parseEnvelope", () => {
  it("accepte une enveloppe valide avec currentRun: null", () => {
    expect(parseEnvelope({ schemaVersion: 1, currentRun: null }).success).toBe(true);
  });

  it("accepte et conserve un champ meta (nécessaire pour que runMigrations le voie)", () => {
    const meta = makeMetaProgression({ glandsDor: 5 });
    const result = parseEnvelope({ schemaVersion: 2, currentRun: null, meta });
    expect(result.success).toBe(true);
    expect(result.success && result.data.meta).toEqual(meta);
  });

  it("accepte une enveloppe sans meta (sauvegarde v1 authentique)", () => {
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

describe("looksLikeMetaProgression", () => {
  it("accepte une vraie MetaProgression", () => {
    expect(looksLikeMetaProgression(makeMetaProgression({ glandsDor: 20 }))).toBe(true);
  });

  it("rejette un objet vide, null ou incomplet", () => {
    expect(looksLikeMetaProgression({})).toBe(false);
    expect(looksLikeMetaProgression(null)).toBe(false);
    const incomplete = makeMetaProgression() as unknown as Record<string, unknown>;
    delete incomplete.glandsDor;
    expect(looksLikeMetaProgression(incomplete)).toBe(false);
  });
});
