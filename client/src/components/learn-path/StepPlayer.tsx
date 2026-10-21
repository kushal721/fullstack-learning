import type {
  GlossaryEntrySummary,
  LevelSummary,
  StepResponse,
  StepSummary,
  TopicSummary,
} from "@fsl/shared";
import { Link, useLocation, useNavigate } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { ErrorState } from "../ui/ErrorState.tsx";
import { Loading } from "../ui/Loading.tsx";
import { LEVEL_STYLE, stepHref, termHref } from "./levels.ts";
import { LevelCheck } from "./LevelCheck.tsx";
import { StepBlock } from "./StepBlocks.tsx";

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
  const { data, error, isLoading, reload } = useApi<StepResponse>(
    apiPaths.step(topicSlug, step.id),
  );

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

  return (
    <>
      <div className="mt-5 flex flex-col gap-5">
        <WordsBox glossary={data.glossary} />
        {data.blocks.map((block, index) => (
          <StepBlock
            key={index}
            block={block}
            index={index}
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
        <Link
          to={stepHref(topicSlug, previous?.id)}
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-foreground/5"
        >
          {previous ? `← Step ${previous.number}` : "← Overview"}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* A level check is completed by passing it, not by a button. */}
          {next && step.kind === "lesson" && (
            <span className="text-sm text-muted">
              Up next:{" "}
              <span className="text-foreground">
                {next.number} · {next.title}
              </span>
            </span>
          )}
          {step.kind === "lesson" && (
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
