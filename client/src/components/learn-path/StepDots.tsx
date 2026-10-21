import type { LevelSummary } from "@fsl/shared";
import { type KeyboardEvent, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { LEVEL_STYLE, doneIn, stepHref } from "./levels.ts";

type Props = {
  topicSlug: string;
  level: LevelSummary;
  /** The step being shown; undefined on the overview. */
  currentStepId?: string;
  done: string[];
};

const dotClass = (isCurrent: boolean, isDone: boolean, isCheck: boolean) =>
  `flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
    isCheck ? "border-dashed" : ""
  } ${
    isCurrent
      ? "border-accent bg-accent text-white dark:text-black"
      : isDone
        ? "border-green-600/40 bg-green-600/10 text-green-800 dark:text-green-400"
        : "border-border text-muted hover:border-accent hover:text-accent"
  }`;

/**
 * The level's progress bar and its steps as numbered dots, after an
 * Overview link. ← and → move between them; on phones the row scrolls
 * sideways and keeps the current dot in view.
 */
export function StepDots({ topicSlug, level, currentStepId, done }: Props) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLOListElement>(null);
  const doneCount = doneIn(level, done);
  const order = [undefined, ...level.steps.map((step) => step.id)];
  // Set by ← →: once the new step is shown, focus its dot.
  const focusCurrent = useRef(false);

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>(
      '[aria-current="step"]',
    );
    current?.scrollIntoView?.({ block: "nearest", inline: "center" });
    if (focusCurrent.current) {
      focusCurrent.current = false;
      current?.focus();
    }
  }, [currentStepId]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index =
      order.indexOf(currentStepId) + (event.key === "ArrowRight" ? 1 : -1);
    if (index < 0 || index >= order.length) return;
    event.preventDefault();
    // Keep keyboard focus on the dot that becomes current (see the effect).
    focusCurrent.current = true;
    navigate(stepHref(topicSlug, order[index]));
  }

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-3 text-sm">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${(100 * doneCount) / level.steps.length}%` }}
          />
        </div>
        <span className="shrink-0 text-muted">
          {LEVEL_STYLE[level.level].name}: {doneCount} of {level.steps.length}{" "}
          done
        </span>
      </div>
      <nav
        aria-label={`${LEVEL_STYLE[level.level].name} steps`}
        className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        <ol
          ref={listRef}
          onKeyDown={onKeyDown}
          className="flex w-max gap-1.5 pb-1 sm:w-auto sm:flex-wrap"
        >
          <li>
            <Link
              to={stepHref(topicSlug)}
              aria-current={currentStepId === undefined ? "step" : undefined}
              className={`inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3 text-sm transition-colors ${
                currentStepId === undefined
                  ? "border-accent bg-accent/10 font-medium text-accent"
                  : "border-border hover:border-accent hover:text-accent"
              }`}
            >
              <span aria-hidden="true">★&nbsp;</span>Overview
            </Link>
          </li>
          {level.steps.map((step) => {
            const isDone = done.includes(step.id);
            const label = `Step ${step.number}: ${step.title}${
              step.kind === "check" ? " (level check)" : ""
            }${isDone ? " (done)" : ""}`;
            return (
              <li key={step.id}>
                <Link
                  to={stepHref(topicSlug, step.id)}
                  aria-label={label}
                  title={label}
                  aria-current={step.id === currentStepId ? "step" : undefined}
                  className={dotClass(
                    step.id === currentStepId,
                    isDone,
                    step.kind === "check",
                  )}
                >
                  {step.number}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
