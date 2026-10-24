import type {
  GlossaryEntrySummary,
  LessonSection,
  LevelSummary,
  StepResponse,
  StepSummary,
  TopicSummary,
} from "@fsl/shared";
import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { ErrorState } from "../ui/ErrorState.tsx";
import { Loading } from "../ui/Loading.tsx";
import {
  LEVEL_STYLE,
  partHref,
  partIndex,
  stepHref,
  termHref,
} from "./levels.ts";
import { LevelCheck } from "./LevelCheck.tsx";
import { StepBlock } from "./StepBlocks.tsx";
import { StepText } from "./StepText.tsx";

type Props = {
  topicSlug: string;
  step: StepSummary;
  level: LevelSummary;
  /** The level after this one, for a level check's "Keep going". */
  nextLevel?: LevelSummary;
  nextTopic?: TopicSummary;
  /** Marks the step done (when the learner moves on, or passes a check). */
  onDone: (stepId: string) => void;
};

function WordChip({ entry }: { entry: GlossaryEntrySummary }) {
  const { search } = useLocation();
  const concept = entry.kind === "concept";
  return (
    <Link
      to={termHref(search, entry.id)}
      title={entry.short}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-sm transition-colors hover:border-accent hover:text-accent ${
        concept ? "border-accent/40 bg-accent/5" : "border-border"
      }`}
    >
      {concept && (
        <span aria-hidden="true" className="text-accent">
          ◆
        </span>
      )}
      {entry.term}
      <span className="sr-only">{concept ? " (concept)" : " (term)"}</span>
    </Link>
  );
}

/** The concepts (first, marked ◆) and terms a step uses. */
function WordsBox({ glossary }: { glossary: GlossaryEntrySummary[] }) {
  if (glossary.length === 0) return null;
  const ordered = [
    ...glossary.filter((g) => g.kind === "concept"),
    ...glossary.filter((g) => g.kind === "term"),
  ];
  return (
    <section
      aria-label="Concepts and terms in this step"
      className="rounded-lg border border-border p-3"
    >
      <p className="mb-2 flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-medium">Concepts and terms in this step</span>
        <span className="text-muted">Stuck on a word? Click it.</span>
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {ordered.map((entry) => (
          <li key={entry.id}>
            <WordChip entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What a module teaches, shown before its first part. */
function Objectives({ items }: { items: string[] }) {
  return (
    <section
      aria-label="What you'll learn"
      className="rounded-lg border border-accent/30 bg-accent/5 p-4"
    >
      <p className="mb-2 font-medium">By the end of this module you can:</p>
      <ul className="flex flex-col gap-1 leading-7">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden="true" className="text-accent">
              ✓
            </span>
            <StepText text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Where the learner is in a module, and every part to jump to. */
function PartNav({
  sections,
  index,
}: {
  sections: LessonSection[];
  index: number;
}) {
  const { pathname, search } = useLocation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium">
          Part {index + 1} of {sections.length}
        </span>
        <div
          aria-hidden="true"
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10"
        >
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((index + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-accent">All parts</summary>
        <ol className="mt-2 flex flex-col gap-0.5">
          {sections.map((section, i) => (
            <li key={section.id}>
              <Link
                to={partHref(pathname, search, i)}
                state={{ focusPart: true }}
                aria-current={i === index ? "step" : undefined}
                className={`flex gap-2 rounded px-2 py-1 hover:bg-foreground/5 ${
                  i === index ? "bg-accent/10 font-medium text-accent" : ""
                }`}
              >
                <span className="w-5 text-right text-muted">{i + 1}</span>
                {section.title}
              </Link>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

/**
 * One step on one screen: its words, its blocks, and a footer that moves
 * on, across levels (Basic's last step leads to Intermediate's first).
 */
export function StepPlayer({
  topicSlug,
  step,
  level,
  nextLevel,
  nextTopic,
  onDone,
}: Props) {
  const navigate = useNavigate();
  const { pathname, search, state } = useLocation();
  const partHeading = useRef<HTMLHeadingElement>(null);
  const { data, error, isLoading, reload } = useApi<StepResponse>(
    apiPaths.step(topicSlug, step.id),
  );
  const sections = data?.sections;
  const part = sections ? partIndex(search, sections.length) : 0;

  // Moving between parts puts focus (and the view) on the new part.
  const focusPart = (state as { focusPart?: boolean } | null)?.focusPart;
  useEffect(() => {
    if (focusPart) partHeading.current?.focus();
  }, [part, focusPart]);

  if (isLoading) return <Loading label="Loading step…" />;
  if (error || !data) {
    return (
      <ErrorState
        message={error?.message ?? "No data received."}
        onRetry={reload}
        homeLink={false}
      />
    );
  }

  const { previous, next } = data;
  const endOfLevel = step.id === level.steps.at(-1)?.id;
  const context = {
    topicSlug,
    stepId: step.id,
    glossary: data.glossary,
    scenes: data.scenes,
  };

  function moveOn() {
    onDone(step.id);
    navigate(stepHref(topicSlug, next?.id), { state: { focusTitle: true } });
  }

  // A module shows one part: its run of the step's blocks.
  const first = (sections ?? [])
    .slice(0, part)
    .reduce((sum, s) => sum + s.blockCount, 0);
  const shown = sections
    ? data.blocks.slice(first, first + sections[part]!.blockCount)
    : data.blocks;
  const lastPart = !sections || part === sections.length - 1;
  const goToPart = (index: number) =>
    navigate(partHref(pathname, search, index), {
      state: { focusPart: true },
    });

  return (
    <>
      <div className="mt-5 flex flex-col gap-5">
        {sections && part === 0 && data.objectives && (
          <Objectives items={data.objectives} />
        )}
        <WordsBox glossary={data.glossary} />
        {sections && (
          <>
            <PartNav sections={sections} index={part} />
            <h3
              ref={partHeading}
              tabIndex={-1}
              className="scroll-mt-20 text-xl font-semibold focus:outline-none"
            >
              {sections[part]!.title}
            </h3>
          </>
        )}
        {shown.map((block, i) => (
          <StepBlock
            // Keyed by its place in the whole step, so a new part starts fresh.
            key={first + i}
            block={block}
            index={first + i}
            context={context}
          />
        ))}
        {data.questions && (
          <LevelCheck
            topicSlug={topicSlug}
            stepId={step.id}
            level={level}
            nextLevel={nextLevel}
            nextTopic={nextTopic}
            questions={data.questions}
            onPassed={onDone}
          />
        )}
      </div>
      <nav
        aria-label="Step"
        className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
      >
        {part > 0 ? (
          <Link
            to={partHref(pathname, search, part - 1)}
            state={{ focusPart: true }}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-foreground/5"
          >
            ← Part {part}
          </Link>
        ) : (
          <Link
            to={stepHref(topicSlug, previous?.id)}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-foreground/5"
          >
            {previous ? `← Step ${previous.number}` : "← Overview"}
          </Link>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* A level check is completed by passing it, not by a button. */}
          {!lastPart && sections && (
            <button
              type="button"
              onClick={() => goToPart(part + 1)}
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:text-black"
            >
              Next: {sections[part + 1]!.title} →
            </button>
          )}
          {lastPart && next && step.kind === "lesson" && (
            <span className="text-sm text-muted">
              Up next:{" "}
              <span className="text-foreground">
                {next.number} · {next.title}
              </span>
            </span>
          )}
          {lastPart && step.kind === "lesson" && (
            <button
              type="button"
              onClick={moveOn}
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:text-black"
            >
              {endOfLevel
                ? `Finish ${LEVEL_STYLE[level.level].name} ✓`
                : "Done, next step →"}
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
