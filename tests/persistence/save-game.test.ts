import { describe, expect, it } from "vitest";
import { clearSaveFile, loadSaveFile, saveSaveFile } from "../../src/persistence/save-game";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence/save-file";
import { stripRunState } from "../../src/persistence/serialize";
import { makeRunState } from "../engine/helpers";
import { makeFakeStorageAdapter } from "./fake-storage-adapter";
import type { SaveFile } from "../../src/persistence/save-file";
import type { StorageAdapter } from "../../src/persistence/storage-adapter";

describe("loadSaveFile", () => {
  it("démarrage à froid : rien en base -> SaveFile vide", async () => {
    const adapter = makeFakeStorageAdapter(undefined);
    const saveFile = await loadSaveFile(adapter);
    expect(saveFile).toEqual({ schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: null });
  });

  it("aller-retour valide : une sauvegarde correcte se recharge à l'identique", async () => {
    const persisted = stripRunState(makeRunState());
    const saveFile: SaveFile = { schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: persisted };
    const adapter = makeFakeStorageAdapter();
    await saveSaveFile(adapter, saveFile);
    const loaded = await loadSaveFile(adapter);
    expect(loaded).toEqual(saveFile);
  });

  it("enveloppe corrompue -> repli sur SaveFile vide, pas de throw", async () => {
    const adapter = makeFakeStorageAdapter("not a save at all");
    const saveFile = await loadSaveFile(adapter);
    expect(saveFile).toEqual({ schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: null });
  });

  it("currentRun de forme invalide (enveloppe valide) -> repli sur SaveFile vide", async () => {
    const adapter = makeFakeStorageAdapter({ schemaVersion: 1, currentRun: { garbage: true } });
    const saveFile = await loadSaveFile(adapter);
    expect(saveFile).toEqual({ schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: null });
  });

  it("adapter.load() qui rejette -> capturé, repli sur SaveFile vide", async () => {
    const failingAdapter: StorageAdapter = {
      load: () => Promise.reject(new Error("boom")),
      save: () => Promise.resolve(),
      clear: () => Promise.resolve(),
    };
    const saveFile = await loadSaveFile(failingAdapter);
    expect(saveFile).toEqual({ schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: null });
  });
});

describe("saveSaveFile", () => {
  it("n'explose jamais même si adapter.save() rejette", async () => {
    const failingAdapter: StorageAdapter = {
      load: () => Promise.resolve(undefined),
      save: () => Promise.reject(new Error("boom")),
      clear: () => Promise.resolve(),
    };
    await expect(
      saveSaveFile(failingAdapter, { schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: null }),
    ).resolves.toBeUndefined();
  });
});

describe("clearSaveFile", () => {
  it("appelle adapter.clear()", async () => {
    const adapter = makeFakeStorageAdapter({ schemaVersion: 1, currentRun: null });
    await clearSaveFile(adapter);
    expect(await adapter.load()).toBeUndefined();
  });
});
