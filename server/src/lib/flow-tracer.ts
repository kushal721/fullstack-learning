import type { Flow } from "@fsl/shared";
import { flows as allFlows } from "../content/flows/index.js";

export function getFlow(
  id: string,
  flows: Flow[] = allFlows,
): Flow | undefined {
  return flows.find((flow) => flow.id === id);
}

/** Flows in one group, or all of them, in registry order. */
export function getFlows(
  group?: Flow["group"],
  flows: Flow[] = allFlows,
): Flow[] {
  return group ? flows.filter((flow) => flow.group === group) : flows;
}

/** Flows that pass through a symbol (any of their steps is at it). */
export function flowsForSymbol(
  symbolId: string,
  flows: Flow[] = allFlows,
): Flow[] {
  return flows.filter((flow) =>
    flow.steps.some((step) => step.symbolId === symbolId),
  );
}
