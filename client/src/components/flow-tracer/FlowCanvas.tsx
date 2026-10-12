import type { CodeSymbol, FlowStep } from "@fsl/shared";
import {
  Background,
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
};

function Canvas({
  steps,
  symbols,
  current,
  onSelect,
  reducedMotion = false,
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
    const step = steps[current];
    if (!step) return;
    const { x, y } = stepCenter(step, current);
    void setCenter(x, y, { zoom: 0.85, duration: reducedMotion ? 0 : 400 });
  }, [steps, current, reducedMotion, setCenter]);

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
      minZoom={0.3}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
    </ReactFlow>
  );
}

/**
 * The flow as a timeline across five lanes (User → Database). Loaded with
 * React.lazy, so React Flow is only downloaded when a flow is shown.
 */
export default function FlowCanvas(props: Props) {
  return (
    <div className="h-[30rem] rounded-lg border border-border">
      <ReactFlowProvider>
        <Canvas {...props} />
      </ReactFlowProvider>
    </div>
  );
}
