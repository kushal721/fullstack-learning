import { BaseEdge, type EdgeProps, getSmoothStepPath } from "@xyflow/react";

type Data = { active?: boolean; done?: boolean };

/**
 * The path between two steps. The edge into the current step is thicker
 * (React Flow animates it unless the learner prefers reduced motion);
 * edges already travelled stay coloured.
 */
export function FlowEdge(props: EdgeProps) {
  const data = (props.data ?? {}) as Data;
  const [path] = getSmoothStepPath(props);
  return (
    <BaseEdge
      id={props.id}
      path={path}
      markerEnd={props.markerEnd}
      style={{
        stroke: data.active || data.done ? "var(--accent)" : "var(--border)",
        strokeWidth: data.active ? 3 : 1.5,
      }}
    />
  );
}
