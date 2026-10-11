import type { BuildStepSummary } from "@fsl/shared";
import { Link } from "react-router";

type Props = {
  steps: BuildStepSummary[];
  /** The step being read (from the URL), or null on the overview. */
  currentOrder: number | null;
  /** Show each step's goal under its title (the overview has room). */
  showGoals?: boolean;
};

type Position = "before" | "current" | "after";

// Progress is not saved yet (M11): ✓ only means "comes before the step you
// are reading". The word is in the link's aria-label, not just the icon.
const MARKER: Record<
  Position,
  { symbol: string; label: string; className: string }
> = {
  before: {
    symbol: "✓",
    label: "earlier step",
    className: "bg-green-600/10 text-green-700 dark:text-green-400",
  },
  current: {
    symbol: "→",
    label: "current step",
    className: "bg-accent text-background",
  },
  after: { symbol: "○", label: "", className: "bg-foreground/5 text-muted" },
};

function positionOf(order: number, current: number | null): Position {
  if (current === null || order > current) return "after";
  return order === current ? "current" : "before";
}

/** The 14 build steps in order, with where the learner is. */
export function BuildTimeline({
  steps,
  currentOrder,
  showGoals = false,
}: Props) {
  return (
    <ol className="flex flex-col gap-1">
      {steps.map((step) => {
        const position = positionOf(step.order, currentOrder);
        const marker = MARKER[position];
        return (
          <li key={step.id}>
            <Link
              to={`/build/${step.slug}`}
              aria-current={position === "current" ? "step" : undefined}
              aria-label={`${step.order}. ${step.title}${
                marker.label ? ` (${marker.label})` : ""
              }${showGoals ? `: ${step.goal}` : ""}`}
              className={`flex gap-3 rounded-md px-2 py-2 ${
                position === "current"
                  ? "bg-accent/10"
                  : "hover:bg-foreground/5"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${marker.className}`}
              >
                {marker.symbol}
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  className={
                    position === "current" ? "font-semibold text-accent" : ""
                  }
                >
                  {step.order}. {step.title}
                </span>
                {showGoals && (
                  <span className="text-sm text-muted">{step.goal}</span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
