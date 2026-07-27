import { describe, expect, it } from "vitest";
import { checkRunOutcome } from "../../../src/engine/run/outcome";
import { makeRunState } from "../helpers";

describe("checkRunOutcome", () => {
  it("bascule en defaite/run_over quand heroHp <= 0", () => {
    const state = makeRunState({ heroHp: 0 });
    const next = checkRunOutcome(state);
    expect(next.outcome).toBe("defaite");
    expect(next.phase).toBe("run_over");
  });

  it("ne change rien tant que heroHp > 0", () => {
    const state = makeRunState({ heroHp: 10 });
    expect(checkRunOutcome(state)).toBe(state);
  });
});
