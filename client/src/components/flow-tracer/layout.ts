import type { CodeSymbol, FlowLayer, FlowStep } from "@fsl/shared";
import type { Edge, Node } from "@xyflow/react";

/** The lanes, top to bottom: where each step happens. */
export const LANES: { layer: FlowLayer; label: string }[] = [
  { layer: "user", label: "User" },
  { layer: "frontend", label: "Frontend" },
  { layer: "network", label: "Network" },
  { layer: "backend", label: "Backend" },
  { layer: "database", label: "Database" },
];

export const STEP_WIDTH = 180;
export const STEP_HEIGHT = 76;
const COLUMN = STEP_WIDTH + 40;
const LANE_HEIGHT = 120;
const LABEL_WIDTH = 120;

export type FlowNodeData = {
  step: FlowStep;
  index: number;
  symbol?: CodeSymbol;
  state: "past" | "current" | "future";
  onSelect?: (index: number) => void;
};
export type LaneNodeData = { label: string; width: number };

export type FlowCanvasNode =
  Node<FlowNodeData, "step"> | Node<LaneNodeData, "lane">;

export function laneIndex(layer: FlowLayer) {
  return LANES.findIndex((lane) => lane.layer === layer);
}

/** Centre of a step's node, for moving the camera to it. */
export function stepCenter(step: FlowStep, index: number) {
  return {
    x: LABEL_WIDTH + index * COLUMN + STEP_WIDTH / 2,
    y: laneIndex(step.layer) * LANE_HEIGHT + LANE_HEIGHT / 2,
  };
}

/**
 * Lays a flow out as a timeline: one column per step, left to right, in
 * the lane of the layer where it happens. Lane bands sit behind the steps.
 */
export function layoutFlow(
  steps: FlowStep[],
  symbols: Record<string, CodeSymbol>,
  current: number,
  onSelect?: (index: number) => void,
): { nodes: FlowCanvasNode[]; edges: Edge[] } {
  const width = LABEL_WIDTH + steps.length * COLUMN + 40;
  const lanes: FlowCanvasNode[] = LANES.map((lane, i) => ({
    id: `lane:${lane.layer}`,
    type: "lane",
    position: { x: 0, y: i * LANE_HEIGHT },
    data: { label: lane.label, width },
    draggable: false,
    selectable: false,
    focusable: false,
    zIndex: -1,
  }));
  const stepNodes: FlowCanvasNode[] = steps.map((step, index) => {
    const { x, y } = stepCenter(step, index);
    return {
      id: step.id,
      type: "step",
      position: { x: x - STEP_WIDTH / 2, y: y - STEP_HEIGHT / 2 },
      data: {
        step,
        index,
        symbol: symbols[step.symbolId],
        state:
          index < current ? "past" : index === current ? "current" : "future",
        onSelect,
      },
    };
  });
  const edges: Edge[] = steps.slice(1).map((step, i) => ({
    id: `${steps[i]!.id}->${step.id}`,
    source: steps[i]!.id,
    target: step.id,
    type: "flow",
    // The edge into the current step is the one the data is travelling on.
    data: { active: i + 1 === current, done: i + 1 < current },
  }));
  return { nodes: [...lanes, ...stepNodes], edges };
}
