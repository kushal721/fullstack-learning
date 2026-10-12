import { Handle, type NodeProps, Position } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { FlowNodeData, LaneNodeData } from "./layout.ts";
import { STEP_HEIGHT, STEP_WIDTH } from "./layout.ts";

/** One step: its number, title and the symbol it happens at. */
export function FlowNode({ data }: NodeProps<Node<FlowNodeData, "step">>) {
  const { step, index, symbol, state, onSelect } = data;
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <button
        type="button"
        tabIndex={-1}
        aria-current={state === "current" ? "step" : undefined}
        aria-label={`Step ${index + 1}: ${step.title}`}
        onClick={() => onSelect?.(index)}
        style={{ width: STEP_WIDTH, height: STEP_HEIGHT }}
        className={`nodrag flex cursor-pointer flex-col justify-center gap-0.5 rounded-lg border px-3 text-left ${
          state === "current"
            ? "border-accent bg-background ring-2 ring-accent/40"
            : state === "past"
              ? "border-accent/40 bg-background"
              : "border-border bg-background opacity-70"
        }`}
      >
        <span className="text-[0.7rem] font-medium text-muted">
          {index + 1}. {symbol?.name ?? step.symbolId}
        </span>
        <span className="line-clamp-2 text-xs font-semibold leading-snug">
          {step.title}
        </span>
      </button>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

/** A lane band behind the steps, labelled with its layer. */
export function LaneNode({ data }: NodeProps<Node<LaneNodeData, "lane">>) {
  return (
    <div
      aria-hidden="true"
      style={{ width: data.width, height: 120 }}
      className="flex items-center border-b border-dashed border-border bg-foreground/[0.02] pl-3 text-xs font-semibold uppercase tracking-wide text-muted"
    >
      {data.label}
    </div>
  );
}
