import type { LevelSummary, StepSummary } from "@fsl/shared";
import { Link } from "react-router";
import { Badge } from "../ui/Badge.tsx";
import { LEVEL_STYLE, doneIn, stepHref } from "./levels.ts";

/** "Basic · Step 7 · 7 of 18 in Basic · about 3 min" and the title. */
export function StepHeader({
  step,
  level,
}: {
  step: StepSummary;
  level: LevelSummary;
}) {
  const style = LEVEL_STYLE[level.level];
  const position = level.steps.findIndex((s) => s.id === step.id) + 1;
  return (
    <div className="flex flex-col gap-1">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Badge tone={style.tone}>{style.name}</Badge>
        Step {step.number} · {position} of {level.steps.length} in {style.name}{" "}
        · about {step.minutes} min
      </p>
      <h2 tabIndex={-1} className="text-2xl font-semibold tracking-tight">
        {step.title}
      </h2>
    </div>
  );
}

type NoteProps = {
  topicSlug: string;
  /** The level being opened and the one below it. */
  level: LevelSummary;
  previous: LevelSummary;
  done: string[];
  onDismiss: () => void;
};

/**
 * Shown when a learner opens a level before finishing the one below it.
 * Nothing is locked: they can go back or carry on.
 */
export function ContinuesNote({
  topicSlug,
  level,
  previous,
  done,
  onDismiss,
}: NoteProps) {
  const finished = doneIn(previous, done);
  const firstOpen = previous.steps.find((step) => !done.includes(step.id))!;
  const name = LEVEL_STYLE[level.level].name;
  const previousName = LEVEL_STYLE[previous.level].name;
  return (
    <div
      role="note"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 leading-7"
    >
      <p>
        <span className="font-medium">
          {name} continues from {previousName}
        </span>{" "}
        (steps {previous.firstNumber}–{previous.lastNumber}). You&apos;ve
        finished {finished} of those {previous.steps.length}.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          to={stepHref(topicSlug, firstOpen.id)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-foreground/5"
        >
          Back to {previousName}: step {firstOpen.number}
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-foreground/5"
        >
          Carry on here
        </button>
      </div>
    </div>
  );
}
