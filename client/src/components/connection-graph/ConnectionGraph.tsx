import type { SymbolGraphResponse } from "@fsl/shared";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { ConnectionNode } from "./ConnectionNode.tsx";
import { layoutConnections } from "./layout.ts";

const nodeTypes = { symbol: ConnectionNode };

type Props = SymbolGraphResponse & { centerId: string };

/**
 * A symbol's neighbourhood drawn with React Flow. Loaded with React.lazy,
 * so React Flow is only downloaded when a graph is shown.
 */
export default function ConnectionGraph({ nodes, edges, centerId }: Props) {
  const flow = useMemo(
    () => layoutConnections(nodes, edges, centerId),
    [nodes, edges, centerId],
  );
  return (
    <div
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
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
