import { describe, expect, it } from "vitest";
import { createRng, nextInt, shuffle } from "../../../src/engine/rng";

describe("nextInt", () => {
  it("reste dans [0, maxExclusive) sur de nombreux tirages", () => {
    let rng = createRng(123);
    for (let i = 0; i < 200; i += 1) {
      const [value, next] = nextInt(rng, 6);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
      rng = next;
    }
  });
});

describe("shuffle", () => {
  it("retourne une permutation valide (mêmes éléments, même longueur)", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const [shuffled] = shuffle(createRng(5), items);
    expect(shuffled).toHaveLength(items.length);
    expect([...shuffled].sort()).toEqual([...items].sort());
  });

  it("est déterministe : la même seed produit le même mélange", () => {
    const items = ["a", "b", "c", "d", "e"];
    const [first] = shuffle(createRng(99), items);
    const [second] = shuffle(createRng(99), items);
    expect(first).toEqual(second);
  });

  it("ne mute pas le tableau d'entrée", () => {
    const items = [1, 2, 3, 4];
    const copy = [...items];
    shuffle(createRng(1), items);
    expect(items).toEqual(copy);
  });

  it("gère les tableaux vides et à un élément sans consommer le rng", () => {
    const rng = createRng(1);
    const [emptyResult, rngAfterEmpty] = shuffle(rng, []);
    expect(emptyResult).toEqual([]);
    expect(rngAfterEmpty).toEqual(rng);

    const [singleResult, rngAfterSingle] = shuffle(rng, [42]);
    expect(singleResult).toEqual([42]);
    expect(rngAfterSingle).toEqual(rng);
  });
});
