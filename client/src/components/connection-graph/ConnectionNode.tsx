import { Handle, type NodeProps, Position } from "@xyflow/react";
import type { ConnectionFlowNode } from "./layout.ts";
import { NODE_HEIGHT, NODE_WIDTH } from "./layout.ts";

/**
 * One symbol in the graph: its kind, name and where it is defined. The node
 * is a real button, so Tab reaches it and Enter or Space selects it.
 */
export function ConnectionNode({ data }: NodeProps<ConnectionFlowNode>) {
  const { symbol, isCenter, onSelect } = data;
  const fileName = symbol.fileId?.split("/").at(-1);
  const where = fileName
    ? `${fileName}${symbol.line ? `:${symbol.line}` : ""}`
    : "outside the project";
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <button
        type="button"
        data-symbol-id={symbol.id}
        aria-current={isCenter ? "true" : undefined}
        aria-label={`${symbol.kind} ${symbol.name}, ${where}${isCenter ? " (shown)" : ""}`}
        onClick={() => onSelect?.(symbol)}
        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
        className={`nodrag flex cursor-pointer flex-col justify-center rounded-lg border bg-background px-3 text-left outline-none hover:border-accent focus-visible:ring-4 focus-visible:ring-accent/60 ${
          isCenter ? "border-accent ring-2 ring-accent/30" : "border-border"
        }`}
      >
        <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">
          {symbol.kind}
        </span>
        <span className="w-full truncate font-mono text-sm font-semibold">
          {symbol.name}
        </span>
        <span className="w-full truncate font-mono text-xs text-muted">
          {where}
        </span>
      </button>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
