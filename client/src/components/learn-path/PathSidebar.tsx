import type { Level, LevelSummary } from "@fsl/shared";
import { Link } from "react-router";
import { LEVEL_STYLE, doneIn, resumeStep, stepHref } from "./levels.ts";
import type { PathProgress } from "../../hooks/usePathProgress.ts";

type Props = {
  topicSlug: string;
  topicTitle: string;
  levels: LevelSummary[];
  current: Level;
  currentStepId?: string;
  progress: PathProgress;
};

/**
 * The sidebar's "this topic" part: its three levels, the open one listing
 * its numbered steps. The topic tree sits below it, kept as a separate
 * tree widget so its keyboard navigation stays intact.
 */
export function PathSidebar({
  topicSlug,
  topicTitle,
  levels,
  current,
  currentStepId,
  progress,
}: Props) {
  return (
    <nav aria-label={`${topicTitle}: levels and steps`} className="mb-6">
      <ul className="flex flex-col gap-1">
        {levels.map((level) => {
          const style = LEVEL_STYLE[level.level];
          const isOpen = level.level === current;
          return (
            <li key={level.level}>
              <Link
                to={stepHref(topicSlug, resumeStep(level, progress).id)}
                aria-current={isOpen ? "true" : undefined}
                className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-sm ${
                  isOpen
                    ? "font-medium"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${style.dot}`}
                />
                <span className="flex-1">
                  {style.name} · {level.firstNumber}–{level.lastNumber}
                </span>
                <span className="text-xs text-muted">
                  {doneIn(level, progress.done)}/{level.steps.length}
                </span>
              </Link>
              {isOpen && (
                <ol className="mb-1 ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
                  {level.steps.map((step) => {
                    const isCurrent = step.id === currentStepId;
                    const isDone = progress.done.includes(step.id);
                    return (
                      <li key={step.id}>
                        <Link
                          to={stepHref(topicSlug, step.id)}
                          aria-label={`Step ${step.number}: ${step.title}${isDone ? " (done)" : ""}`}
                          aria-current={isCurrent ? "step" : undefined}
                          className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-sm ${
                            isCurrent
                              ? "bg-accent/10 font-medium text-accent"
                              : "text-muted hover:bg-foreground/5 hover:text-foreground"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`w-5 shrink-0 text-right text-xs ${
                              isDone && !isCurrent
                                ? "text-green-700 dark:text-green-400"
                                : ""
                            }`}
                          >
                            {isDone && !isCurrent ? "✓" : step.number}
                          </span>
                          <span>{step.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
