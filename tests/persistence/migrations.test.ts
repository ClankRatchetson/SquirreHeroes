import { describe, expect, it } from "vitest";
import { MIGRATIONS, runMigrations } from "../../src/persistence/migrations";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence/save-file";

describe("migrations", () => {
  it("CURRENT_SCHEMA_VERSION vaut 1 (toute première version persistée par ce projet)", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(1);
  });

  it("MIGRATIONS est vide en Phase 4 — prêt à recevoir sa première entrée en Phase 5", () => {
    expect(MIGRATIONS).toEqual([]);
  });

  it("runMigrations retourne l'enveloppe inchangée si déjà à la version courante", () => {
    const envelope = { schemaVersion: 1, currentRun: null };
    expect(runMigrations(envelope)).toEqual(envelope);
  });

  it("runMigrations lève si aucun chemin de migration n'existe depuis une version antérieure", () => {
    expect(() => runMigrations({ schemaVersion: 0, currentRun: null })).toThrow();
  });

  it("runMigrations lève sur une sauvegarde annonçant une version future inconnue", () => {
    expect(() => runMigrations({ schemaVersion: 2, currentRun: null })).toThrow();
  });
});
