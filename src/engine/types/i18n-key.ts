/**
 * Référence à une clé du dictionnaire i18n (`t(key)`). Le moteur ignore le
 * contenu réel du dictionnaire — c'est une simple chaîne de son point de
 * vue. Valider qu'elle existe bien dans `fr.ts` est un souci de la couche
 * `/src/content/schemas`, jamais du moteur (qui ne doit rien connaître de
 * `/src/content`).
 */
export type TranslationKey = string;
