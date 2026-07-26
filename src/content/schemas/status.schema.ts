import { z } from "zod";
import type { StatusId } from "../../engine/types";

export const statusIdSchema: z.ZodType<StatusId> = z.enum([
  "a_decouvert",
  "etourdi",
  "coquille_fetee",
  "force",
  "leste",
  "seve_empoisonnee",
  "repousse",
  "piquants",
]);
