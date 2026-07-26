import type { StatusId, StatusInstance } from "../../../engine/types";

const STATUS_COLOR: Record<StatusId, string> = {
  a_decouvert: "bg-red-600",
  etourdi: "bg-slate-500",
  coquille_fetee: "bg-amber-700",
  force: "bg-orange-600",
  leste: "bg-sky-600",
  seve_empoisonnee: "bg-emerald-700",
  repousse: "bg-pink-600",
  piquants: "bg-yellow-600",
};

export interface StatusIconProps {
  readonly status: StatusInstance;
}

/** L'icône affiche toujours la valeur chiffrée (règle produit) — le détail mécanique vient de `StatusTooltip`. */
export function StatusIcon({ status }: StatusIconProps) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${STATUS_COLOR[status.id]}`}
    >
      {status.stacks}
    </span>
  );
}
