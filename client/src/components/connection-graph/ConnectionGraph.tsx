import type { CodeSymbol, SymbolGraphResponse } from "@fsl/shared";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useRef } from "react";
import { ConnectionNode } from "./ConnectionNode.tsx";
import { layoutConnections } from "./layout.ts";

const nodeTypes = { symbol: ConnectionNode };

type Props = SymbolGraphResponse & {
  centerId: string;
  onSelect?: (symbol: CodeSymbol) => void;
  /** Move keyboard focus to the centre node (after picking a node). */
  focusCenter?: boolean;
};

/**
 * A symbol's neighbourhood drawn with React Flow. Loaded with React.lazy,
 * so React Flow is only downloaded when a graph is shown.
 */
export default function ConnectionGraph({
  nodes,
  edges,
  centerId,
  onSelect,
  focusCenter = false,
}: Props) {
  const flow = useMemo(
    () => layoutConnections(nodes, edges, centerId, onSelect),
    [nodes, edges, centerId, onSelect],
  );

  // After walking to a node with the keyboard, keep focus on the graph so
  // the learner can Tab on from the new centre instead of starting over.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusCenter) return;
    // React Flow keeps new nodes hidden until it has measured them, and a
    // hidden button can't take focus, so retry (up to about a second) until
    // focus has really landed.
    let frame = 0;
    let tries = 0;
    const tryFocus = () => {
      const button = containerRef.current?.querySelector<HTMLButtonElement>(
        `[data-symbol-id="${CSS.escape(centerId)}"]`,
      );
      button?.focus({ preventScroll: true });
      if (document.activeElement !== button && tries++ < 60) {
        frame = requestAnimationFrame(tryFocus);
      }
    };
    frame = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(frame);
  }, [focusCenter, centerId]);

  return (
    <div
      ref={containerRef}
      className="h-[28rem] rounded-lg border border-border"
      role="img"
      aria-label={`Connections of ${centerId}: ${edges
        .map((edge) => `${edge.source} ${edge.type} ${edge.target}`)
        .join("; ")}`}
    >
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        colorMode="system"
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        // The button inside each node is the focus target; React Flow's
        // own node focus would add a second, non-clickable tab stop.
        nodesFocusable={false}
        edgesFocusable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
