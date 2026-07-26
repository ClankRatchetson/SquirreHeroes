import { describe, expect, it } from "vitest";
import { createRng, nextFloat } from "../../../src/engine/rng";

describe("mulberry32", () => {
  it("produit une valeur dans [0, 1)", () => {
    const [value] = nextFloat(createRng(1));
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  it("est déterministe : la même seed produit la même séquence", () => {
    const sequenceFrom = (seed: number): readonly number[] => {
      let rng = createRng(seed);
      const values: number[] = [];
      for (let i = 0; i < 10; i += 1) {
        const [value, next] = nextFloat(rng);
        values.push(value);
        rng = next;
      }
      return values;
    };

    expect(sequenceFrom(42)).toEqual(sequenceFrom(42));
  });

  it("deux seeds différentes produisent des séquences différentes", () => {
    const [a] = nextFloat(createRng(1));
    const [b] = nextFloat(createRng(2));
    expect(a).not.toBe(b);
  });

  it("ne mute jamais l'état reçu (immutabilité)", () => {
    const rng = createRng(7);
    const snapshot = { ...rng };
    nextFloat(rng);
    expect(rng).toEqual(snapshot);
  });
});
