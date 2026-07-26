import { fr } from "./fr";

export type TranslationKey = keyof typeof fr;

export function t(key: TranslationKey): string {
  return fr[key];
}

/**
 * Le moteur (`/src/engine`) ne connaît qu'une clé i18n générique (`string`),
 * pour ne jamais dépendre de `/src/content`. Les clés qui transitent par le
 * contenu JSON (cartes/ennemis/héros) sont déjà validées par Zod au
 * chargement (`translationKeySchema`) — cette fonction est donc le seul
 * point où l'on convertit cette chaîne générique déjà garantie valide vers
 * le type strict `TranslationKey`, plutôt que de disséminer des `as
 * TranslationKey` dans le reste du code.
 */
export function tFromContent(key: string): string {
  return t(key as TranslationKey);
}
