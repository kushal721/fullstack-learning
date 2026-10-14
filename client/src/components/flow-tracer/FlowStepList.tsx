import type { CodeSymbol, FlowStep } from "@fsl/shared";
import { Link } from "react-router";
import { LANES } from "./layout.ts";

type Props = {
  flowId: string;
  steps: FlowStep[];
  symbols: Record<string, CodeSymbol>;
  /** The current step, highlighted; none for an overview. */
  current?: number;
  /** Jump to a step on this page; without it, steps link to the Flow page. */
  onSelect?: (index: number) => void;
};

const laneLabel = (layer: FlowStep["layer"]) =>
  LANES.find((lane) => lane.layer === layer)?.label ?? layer;

/**
 * The same steps as the canvas, as a list: easier than a wide diagram on a
 * phone, and readable by screen readers. Collapsed until asked for.
 */
export function FlowStepList({
  flowId,
  steps,
  symbols,
  current,
  onSelect,
}: Props) {
  return (
    <details className="rounded-lg border border-border">
      <summary className="cursor-pointer px-4 py-3 font-medium">
        All {steps.length} steps as a list
      </summary>
      <ol className="flex flex-col gap-1 px-2 pb-3">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          const content = (
            <>
              <span className="text-xs text-muted">
                {index + 1}. {laneLabel(step.layer)} ·{" "}
                <code className="font-mono">
                  {symbols[step.symbolId]?.name ?? step.symbolId}
                </code>
              </span>
              <span className="block">{step.title}</span>
            </>
          );
          const itemClass = `block w-full rounded-md px-2 py-2 text-left hover:bg-foreground/5 ${
            isCurrent ? "bg-accent/10 font-medium" : ""
          }`;
          return (
            <li key={step.id}>
              {onSelect ? (
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => onSelect(index)}
                  className={itemClass}
                >
                  {content}
                </button>
              ) : (
                <Link
                  to={`/flow?flow=${flowId}&step=${index + 1}`}
                  className={itemClass}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </details>
  );
}
