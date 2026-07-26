import { describe, expect, it } from "vitest";
import { fr } from "../../src/content/i18n/fr";
import { t } from "../../src/content/i18n/t";

describe("i18n dictionary", () => {
  it("resolves every declared key to a non-empty string", () => {
    for (const key of Object.keys(fr) as Array<keyof typeof fr>) {
      expect(t(key)).toBe(fr[key]);
      expect(t(key).length).toBeGreaterThan(0);
    }
  });
});
