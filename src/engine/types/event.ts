import type { RunEffectSpec } from "./run-effect";
import type { TranslationKey } from "./i18n-key";

export interface EventChoice {
  readonly id: string;
  readonly labelKey: TranslationKey;
  readonly effects: readonly RunEffectSpec[];
}

export interface EventDefinition {
  readonly id: string;
  readonly titleKey: TranslationKey;
  readonly textKey: TranslationKey;
  readonly choices: readonly EventChoice[];
}
