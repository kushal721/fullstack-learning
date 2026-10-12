import type { CodeSymbol, Flow, FlowSummary } from "@fsl/shared";
import { flows as allFlows } from "../content/flows/index.js";
import { getSymbol, withLine } from "./project-graph.js";

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

export const FLOW_GROUPS: Flow["group"][] = ["request", "security"];

export function toFlowSummary(flow: Flow): FlowSummary {
  const { id, title, summary, group, direction, steps } = flow;
  return { id, title, summary, group, direction, stepCount: steps.length };
}

/** The symbols a flow's steps are at, with lines resolved, by id. */
export function symbolsForFlow(flow: Flow): Record<string, CodeSymbol> {
  const symbols: Record<string, CodeSymbol> = {};
  for (const step of flow.steps) {
    const symbol = getSymbol(step.symbolId);
    // Validation guarantees every step's symbol exists.
    if (symbol) symbols[symbol.id] = withLine(symbol);
  }
  return symbols;
}
