import type { ProjectLayer } from "@fsl/shared";
import { Badge } from "../ui/Badge.tsx";

// Colour helps, but the label is always written out, so the layer never
// depends on seeing colour.
const TONE = {
  frontend: "info",
  backend: "success",
  database: "warning",
  root: "neutral",
} as const;

export function LayerBadge({ layer }: { layer: ProjectLayer }) {
  return <Badge tone={TONE[layer]}>{layer}</Badge>;
}
