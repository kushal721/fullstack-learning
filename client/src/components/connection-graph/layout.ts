import type { CodeSymbol, Relationship } from "@fsl/shared";
import { Graph, layout } from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

/** Size every node is laid out with (the node component uses the same). */
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 72;

export type ConnectionNodeData = {
  symbol: CodeSymbol;
  /** The symbol the graph is centred on. */
  isCenter: boolean;
  /** Called when the learner picks this node. */
  onSelect?: (symbol: CodeSymbol) => void;
};

export type ConnectionFlowNode = Node<ConnectionNodeData, "symbol">;

/**
 * Places the symbols left to right in the direction the relationships point
 * (dagre does the layout), so a chain like handleSave → createNote → request
 * reads like a sentence.
 */
export function layoutConnections(
  nodes: CodeSymbol[],
  edges: Relationship[],
  centerId: string,
  onSelect?: (symbol: CodeSymbol) => void,
): { nodes: ConnectionFlowNode[]; edges: Edge[] } {
  const graph = new Graph();
  graph.setGraph({ rankdir: "LR", nodesep: 24, ranksep: 90 });
  graph.setDefaultEdgeLabel(() => ({}));
  for (const symbol of nodes) {
    graph.setNode(symbol.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) graph.setEdge(edge.source, edge.target);
  layout(graph);

  return {
    nodes: nodes.map((symbol) => {
      const { x, y } = graph.node(symbol.id);
      return {
        id: symbol.id,
        type: "symbol",
        // dagre gives the centre; React Flow wants the top-left corner.
        position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
        data: { symbol, isCenter: symbol.id === centerId, onSelect },
      };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      markerEnd: { type: "arrowclosed" as const },
    })),
  };
}
