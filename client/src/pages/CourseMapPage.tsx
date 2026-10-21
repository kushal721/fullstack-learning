import type { CourseMapResponse, CourseMapTopic, Level } from "@fsl/shared";
import { useState } from "react";
import { Link } from "react-router";
import {
  LEVEL_STYLE,
  doneIn,
  stepHref,
} from "../components/learn-path/levels.ts";
import { usePathProgress } from "../hooks/usePathProgress.ts";
import { Badge } from "../components/ui/Badge.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { PageMeta } from "../components/ui/PageMeta.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";

const BLURB: Record<Level, string> = {
  basic: "The essentials. No experience needed.",
  intermediate: "How it really works, enough to build the Notes App.",
  advanced: "The details professionals need: security, speed and scale.",
};
const LEVELS: Level[] = ["basic", "intermediate", "advanced"];
const COVERS_SHOWN = 6;

/** One topic: its three levels side by side, or "planned". */
function TopicCard({
  entry,
  filter,
}: {
  entry: CourseMapTopic;
  filter: Level | "all";
}) {
  const { topic, status, levels } = entry;
  const progress = usePathProgress(topic.id);
  const total = levels.reduce((n, level) => n + level.stepCount, 0);
  const done = levels.reduce((n, level) => n + doneIn(level, progress.done), 0);
  const shown = levels.filter((l) => filter === "all" || l.level === filter);

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent"
        >
          {topic.order}
        </span>
        <h2 className="text-lg font-medium">
          <Link
            to={`/learn/${topic.slug}`}
            className="hover:text-accent hover:underline"
          >
            {topic.title}
          </Link>
        </h2>
        {status === "ready" && (
          <span className="text-sm text-muted">{total} steps</span>
        )}
        <span className="ml-auto">
          {status === "ready" ? (
            <Badge tone="success">
              {done} of {total} done
            </Badge>
          ) : (
            <Badge>Steps coming soon</Badge>
          )}
        </span>
      </div>

      {status === "planned" ? (
        <p className="text-sm leading-6 text-muted">
          {topic.summary}{" "}
          <Link to={`/learn/${topic.slug}`} className="text-accent underline">
            Read the topic now →
          </Link>
        </p>
      ) : (
        <div
          className={`grid gap-3 ${filter === "all" ? "md:grid-cols-3" : ""}`}
        >
          {shown.map((level) => {
            const style = LEVEL_STYLE[level.level];
            const extra = level.covers.length - COVERS_SHOWN;
            return (
              <section
                key={level.level}
                aria-label={`${topic.title}: ${style.name}`}
                className="flex flex-col gap-2 rounded-md bg-foreground/[0.03] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={style.tone}>{style.name}</Badge>
                  <span className="text-sm font-medium">
                    Steps {level.firstNumber}–{level.lastNumber}
                  </span>
                  <span className="text-xs text-muted">
                    {level.stepCount} steps · ~{level.minutes} min
                  </span>
                </div>
                <ul className="flex list-disc flex-col gap-0.5 pl-5 text-sm leading-6">
                  {level.covers.slice(0, COVERS_SHOWN).map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                  {extra > 0 && (
                    <li className="text-muted">and {extra} more</li>
                  )}
                </ul>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-accent">
                    All {level.stepCount} steps
                  </summary>
                  <ol className="mt-1 flex flex-col">
                    {level.steps.map((step) => {
                      const isDone = progress.done.includes(step.id);
                      return (
                        <li key={step.id}>
                          <Link
                            to={stepHref(topic.slug, step.id)}
                            aria-label={`Step ${step.number}: ${step.title}${isDone ? " (done)" : ""}`}
                            className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-foreground/5"
                          >
                            <span
                              aria-hidden="true"
                              className={`w-6 shrink-0 text-right font-mono text-xs ${
                                isDone
                                  ? "text-green-700 dark:text-green-400"
                                  : "text-muted"
                              }`}
                            >
                              {isDone ? "✓" : step.number}
                            </span>
                            {step.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              </section>
            );
          })}
        </div>
      )}
    </li>
  );
}

/**
 * Every topic in reading order with its three levels: where each level's
 * steps start and end, how long it takes and what it covers.
 */
export default function CourseMapPage() {
  const { data, error, isLoading, reload } = useApi<CourseMapResponse>(
    apiPaths.courseMap(),
  );
  const [filter, setFilter] = useState<Level | "all">("all");
  const description =
    "Every topic in three levels. Steps are numbered straight through a topic: Basic first, then Intermediate and Advanced carry on the count.";

  return (
    <>
      <PageMeta title="Course map" description={description} />
      {isLoading ? (
        <>
          <PageHeader title="Course map" description={description} />
          <Loading label="Loading the course map…" />
        </>
      ) : error || !data ? (
        <>
          <PageHeader title="Course map" />
          <ErrorState
            message={error?.message ?? "No data received."}
            onRetry={reload}
          />
        </>
      ) : (
        <CourseMap
          topics={data.topics}
          filter={filter}
          setFilter={setFilter}
          description={description}
        />
      )}
    </>
  );
}

function CourseMap({
  topics,
  filter,
  setFilter,
  description,
}: {
  topics: CourseMapTopic[];
  filter: Level | "all";
  setFilter: (filter: Level | "all") => void;
  description: string;
}) {
  const ready = topics.filter((t) => t.status === "ready");
  const steps = ready
    .flatMap((t) => t.levels)
    .reduce((n, l) => n + l.stepCount, 0);
  const minutes = ready
    .flatMap((t) => t.levels)
    .reduce((n, l) => n + l.minutes, 0);
  const eyebrow = ready.length
    ? `${topics.length} topics · ${ready.length} with guided steps · ${steps} steps · about ${Math.max(0.5, Math.round(minutes / 30) / 2)} h`
    : `${topics.length} topics · guided steps are being written`;

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title="Course map"
        description={description}
      />
      <ul className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map((level) => (
          <li key={level} className="rounded-lg border border-border p-4">
            <Badge tone={LEVEL_STYLE[level].tone}>
              {LEVEL_STYLE[level].name}
            </Badge>
            <p className="mt-2 text-sm leading-6 text-muted">{BLURB[level]}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span id="course-map-show" className="text-sm font-medium text-muted">
          Show
        </span>
        <div
          role="group"
          aria-labelledby="course-map-show"
          className="flex flex-wrap gap-1 rounded-lg border border-border p-1"
        >
          {(["all", ...LEVELS] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                filter === value
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-foreground/5"
              }`}
            >
              {value === "all" ? "All levels" : LEVEL_STYLE[value].name}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {topics.map((entry) => (
          <TopicCard key={entry.topic.id} entry={entry} filter={filter} />
        ))}
      </ol>
    </>
  );
}
