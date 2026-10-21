import type { PathResponse } from "@fsl/shared";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { Badge } from "../ui/Badge.tsx";
import { LEVEL_STYLE, doneIn, resumeStep, stepHref } from "./levels.ts";
import type { PathProgress } from "./progress.ts";

type Props = {
  topicSlug: string;
  path: PathResponse;
  progress: PathProgress;
  onReset: () => void;
};

const QUESTIONS = [
  ["what", "What is it?"],
  ["does", "What does it do?"],
  ["how", "How does it work?"],
] as const;

/**
 * A topic's start screen: the three-part summary, the overview scene, and
 * one card per level with its range, time, outcome and progress.
 */
export function PathOverview({ topicSlug, path, progress, onReset }: Props) {
  const { summary, overviewScene, levels } = path;
  const started = progress.done.length > 0;
  const current = levels.find((l) => l.level === progress.level) ?? levels[0]!;

  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">In short</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {QUESTIONS.map(([key, question]) => (
          <li key={key} className="rounded-lg border border-border p-4">
            <h3 className="font-medium">{question}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{summary[key]}</p>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-10 text-xl font-semibold">See it happen</h2>
      {/* The animated player replaces this list in #380; it keeps the
          same steps as its text version. */}
      <figure className="rounded-lg border border-border">
        <figcaption className="border-b border-border bg-foreground/5 px-4 py-2 text-sm font-medium">
          {overviewScene.title}
        </figcaption>
        <ol className="flex flex-col gap-1 p-3 text-sm">
          {overviewScene.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="w-5 shrink-0 text-right text-muted">
                {index + 1}.
              </span>
              <span>
                <span className="font-medium">{step.caption}</span>
                {step.detail && (
                  <span className="text-muted"> {step.detail}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </figure>

      <h2 className="mb-2 mt-10 text-xl font-semibold">
        Three levels, one numbered path
      </h2>
      <p className="mb-4 leading-7 text-muted">
        Start with Basic. When you finish it, Intermediate carries on from the
        next step number, and Advanced after that. You can switch levels at any
        time.
      </p>
      <ol className="flex flex-col gap-3">
        {levels.map((level, index) => {
          const style = LEVEL_STYLE[level.level];
          const done = doneIn(level, progress.done);
          const all = done === level.steps.length;
          const isStart = index === 0 && !started;
          const action = all
            ? "Review"
            : done > 0 || progress.lastStep[level.level]
              ? `Continue at step ${resumeStep(level, progress).number}`
              : `Start at step ${level.firstNumber}`;
          return (
            <li
              key={level.level}
              className={`flex flex-col gap-3 rounded-lg border p-4 ${isStart ? "border-accent/50" : "border-border"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={style.tone}>{style.name}</Badge>
                <h3 className="font-medium">
                  Steps {level.firstNumber}–{level.lastNumber}
                </h3>
                <span className="text-sm text-muted">
                  {level.steps.length} steps · about {level.minutes} min
                </span>
                {isStart && <Badge tone="info">Start here</Badge>}
              </div>
              <p className="leading-7">
                <span className="text-muted">After this level: </span>
                {level.outcome}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-foreground/10"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full ${all ? "bg-green-600" : "bg-accent"}`}
                    style={{ width: `${(100 * done) / level.steps.length}%` }}
                  />
                </div>
                <span className="shrink-0 text-sm text-muted">
                  {done} of {level.steps.length} done
                </span>
                <ButtonLink
                  variant="secondary"
                  to={stepHref(topicSlug, resumeStep(level, progress).id)}
                >
                  {action}
                  <span className="sr-only"> in {style.name}</span>
                </ButtonLink>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to={stepHref(topicSlug, resumeStep(current, progress).id)}>
          {started
            ? `Continue: step ${resumeStep(current, progress).number} →`
            : `Start ${LEVEL_STYLE[levels[0]!.level].name}: step 1 →`}
        </ButtonLink>
        {started && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-foreground/5"
          >
            Reset progress
          </button>
        )}
      </div>
    </div>
  );
}
