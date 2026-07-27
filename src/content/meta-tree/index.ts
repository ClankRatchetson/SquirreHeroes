import pvMax1 from "./pv_max_1.json";
import pvMax2 from "./pv_max_2.json";
import carteAmelioreeCarapace from "./carte_amelioree_carapace.json";
import noisettesBonus1 from "./noisettes_bonus_1.json";
import noisettesBonus2 from "./noisettes_bonus_2.json";
import type { MetaTreeNode } from "../../engine/meta";
import { loadCatalog, metaTreeNodeSchema } from "../schemas";

const RAW_META_TREE_NODES: readonly unknown[] = [
  pvMax1,
  pvMax2,
  carteAmelioreeCarapace,
  noisettesBonus1,
  noisettesBonus2,
];

export const META_TREE_CATALOG: Readonly<Record<string, MetaTreeNode>> = loadCatalog(
  RAW_META_TREE_NODES,
  metaTreeNodeSchema,
);

export const META_TREE: readonly MetaTreeNode[] = Object.values(META_TREE_CATALOG);
