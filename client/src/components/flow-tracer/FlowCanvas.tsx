import type { CodeSymbol, FlowStep } from "@fsl/shared";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import { FlowEdge } from "./FlowEdge.tsx";
import { FlowNode, LaneNode } from "./FlowNode.tsx";
import { layoutFlow, stepCenter } from "./layout.ts";

const nodeTypes = { step: FlowNode, lane: LaneNode };
const edgeTypes = { flow: FlowEdge };

type Props = {
  steps: FlowStep[];
  symbols: Record<string, CodeSymbol>;
  /** Index of the current step. */
  current: number;
  onSelect?: (index: number) => void;
  reducedMotion?: boolean;
  /**
   * Show the whole flow at once with no current step (e.g. on a topic
   * page). Steps can't be selected.
   */
  readOnly?: boolean;
};

function Canvas({
  steps,
  symbols,
  current,
  onSelect,
  reducedMotion = false,
  readOnly = false,
}: Props) {
  const flow = useMemo(() => {
    const laid = layoutFlow(steps, symbols, current, onSelect);
    return {
      nodes: laid.nodes,
      edges: laid.edges.map((edge) => ({
        ...edge,
        animated:
          Boolean((edge.data as { active?: boolean }).active) && !reducedMotion,
        markerEnd: { type: "arrowclosed" as const },
      })),
    };
  }, [steps, symbols, current, onSelect, reducedMotion]);

  // Keep the current step in the middle of the view.
  const { setCenter } = useReactFlow();
  useEffect(() => {
    if (readOnly) return;
    const step = steps[current];
    if (!step) return;
    const { x, y } = stepCenter(step, current);
    void setCenter(x, y, { zoom: 0.85, duration: reducedMotion ? 0 : 400 });
  }, [steps, current, reducedMotion, setCenter, readOnly]);

  return (
    <ReactFlow
      nodes={flow.nodes}
      edges={flow.edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode="system"
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      // Read-only shows the whole journey's shape at once, however small;
      // the zoom controls let a learner look closer.
      minZoom={readOnly ? 0.05 : 0.2}
      fitView={readOnly}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      {readOnly && <Controls showInteractive={false} />}
    </ReactFlow>
  );
}

/**
 * The flow as a timeline across five lanes (User → Database). Loaded with
 * React.lazy, so React Flow is only downloaded when a flow is shown.
 */
export default function FlowCanvas(props: Props) {
  return (
    // Read-only fits the whole flow by width, so it needs less height.
    <div
      className={`${props.readOnly ? "h-48" : "h-[30rem]"} rounded-lg border border-border`}
    >
      <ReactFlowProvider>
        <Canvas {...props} />
      </ReactFlowProvider>
    </div>
  );
}
