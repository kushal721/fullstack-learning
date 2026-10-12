import type { CodeSymbol, Relationship } from "@fsl/shared";
import { render, screen } from "@testing-library/react";
import { type NodeProps, ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { ConnectionNode } from "./ConnectionNode.tsx";
import {
  type ConnectionFlowNode,
  layoutConnections,
  NODE_WIDTH,
} from "./layout.ts";

const symbol = (id: string, extra: Partial<CodeSymbol> = {}): CodeSymbol => ({
  id,
  kind: "function",
  name: id.split(":")[1]!,
  summary: "x",
  conceptIds: [],
  ...extra,
});
const rel = (source: string, target: string): Relationship => ({
  id: `${source}->calls->${target}`,
  source,
  target,
  type: "calls",
  explanation: "x",
});

describe("layoutConnections", () => {
  const nodes = [symbol("fn:a"), symbol("fn:b"), symbol("fn:c")];
  const edges = [rel("fn:a", "fn:b"), rel("fn:b", "fn:c")];

  it("places a chain left to right, following the relationships", () => {
    const flow = layoutConnections(nodes, edges, "fn:b");
    const x = (id: string) => flow.nodes.find((n) => n.id === id)!.position.x;
    expect(x("fn:a")).toBeLessThan(x("fn:b"));
    expect(x("fn:b")).toBeLessThan(x("fn:c"));
    // Nodes don't overlap horizontally.
    expect(x("fn:b") - x("fn:a")).toBeGreaterThanOrEqual(NODE_WIDTH);
  });

  it("marks the centre symbol and labels each edge with its type", () => {
    const flow = layoutConnections(nodes, edges, "fn:b");
    expect(flow.nodes.map((n) => [n.id, n.data.isCenter])).toEqual([
      ["fn:a", false],
      ["fn:b", true],
      ["fn:c", false],
    ]);
    expect(flow.edges).toEqual([
      expect.objectContaining({
        id: "fn:a->calls->fn:b",
        source: "fn:a",
        target: "fn:b",
        label: "calls",
      }),
      expect.objectContaining({ id: "fn:b->calls->fn:c", label: "calls" }),
    ]);
  });
});

describe("ConnectionNode", () => {
  const renderNode = (s: CodeSymbol, isCenter = false) =>
    render(
      <ReactFlowProvider>
        <ConnectionNode
          {...({
            id: s.id,
            data: { symbol: s, isCenter },
          } as unknown as NodeProps<ConnectionFlowNode>)}
        />
      </ReactFlowProvider>,
    );

  it("shows the kind, name and file:line", () => {
    renderNode(
      symbol("fn:handleSave", {
        fileId: "frontend/src/components/NoteForm.jsx",
        line: 15,
      }),
    );
    expect(screen.getByText("function")).toBeInTheDocument();
    expect(screen.getByText("handleSave")).toBeInTheDocument();
    expect(screen.getByText("NoteForm.jsx:15")).toBeInTheDocument();
  });

  it("says when a symbol lives outside the project", () => {
    renderNode(symbol("external:fetch", { kind: "external" }));
    expect(screen.getByText("outside the project")).toBeInTheDocument();
  });
});
