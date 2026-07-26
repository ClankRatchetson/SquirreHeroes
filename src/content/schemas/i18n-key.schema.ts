import { z } from "zod";
import { fr } from "../i18n/fr";

const KNOWN_KEYS = new Set<string>(Object.keys(fr));

/**
 * Valide qu'une clé référencée par le contenu (carte/ennemi/héros) existe
 * réellement dans `fr.ts` — c'est ce qui garantit "toutes les clés i18n
 * résolvent" au chargement, pas seulement en test.
 */
export const translationKeySchema = z.string().refine((key) => KNOWN_KEYS.has(key), {
  message: "Clé i18n inconnue dans fr.ts",
});
