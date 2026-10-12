import { Handle, type NodeProps, Position } from "@xyflow/react";
import type { ConnectionFlowNode } from "./layout.ts";
import { NODE_HEIGHT, NODE_WIDTH } from "./layout.ts";

/** One symbol in the graph: its kind, name and where it is defined. */
export function ConnectionNode({ data }: NodeProps<ConnectionFlowNode>) {
  const { symbol, isCenter } = data;
  const fileName = symbol.fileId?.split("/").at(-1);
  return (
    <div
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      className={`flex flex-col justify-center rounded-lg border bg-background px-3 text-left ${
        isCenter ? "border-accent ring-2 ring-accent/30" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">
        {symbol.kind}
      </span>
      <span className="truncate font-mono text-sm font-semibold">
        {symbol.name}
      </span>
      <span className="truncate font-mono text-xs text-muted">
        {fileName
          ? `${fileName}${symbol.line ? `:${symbol.line}` : ""}`
          : "outside the project"}
      </span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
