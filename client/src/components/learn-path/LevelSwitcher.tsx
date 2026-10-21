import type { Level, LevelSummary } from "@fsl/shared";
import { Link } from "react-router";
import { LEVEL_STYLE, doneIn, resumeStep, stepHref } from "./levels.ts";
import type { PathProgress } from "../../hooks/usePathProgress.ts";

type Props = {
  topicSlug: string;
  levels: LevelSummary[];
  current: Level;
  progress: PathProgress;
};

/**
 * Basic / Intermediate / Advanced, each with its step range and how many
 * steps are done. Choosing a level resumes where the learner was in it.
 */
export function LevelSwitcher({ topicSlug, levels, current, progress }: Props) {
  return (
    <nav aria-label="Levels" className="min-w-0">
      <ul className="grid grid-cols-3 gap-1 rounded-lg border border-border p-1">
        {levels.map((level) => {
          const style = LEVEL_STYLE[level.level];
          const isCurrent = level.level === current;
          const done = doneIn(level, progress.done);
          return (
            <li key={level.level} className="min-w-0">
              <Link
                to={stepHref(topicSlug, resumeStep(level, progress).id)}
                aria-current={isCurrent ? "true" : undefined}
                className={`flex h-full flex-col rounded-md px-2.5 py-1.5 transition-colors sm:px-3 ${
                  isCurrent
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-foreground/5"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-full ${style.dot}`}
                  />
                  {style.name}
                </span>
                <span
                  className={`text-xs ${isCurrent ? "text-accent" : "text-muted"}`}
                >
                  Steps {level.firstNumber}–{level.lastNumber}
                  <span className="hidden sm:inline">
                    {" "}
                    · {done}/{level.steps.length}
                  </span>
                  <span className="sr-only sm:hidden">
                    , {done} of {level.steps.length} done
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
