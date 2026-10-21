import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
  ExerciseAnswer,
  LevelCheckQuestionView,
  LevelSummary,
  TopicResponse,
  TopicSummary,
} from "@fsl/shared";
import { type FormEvent, useState } from "react";
import { Link } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { ApiRequestError, apiPaths, apiPost } from "../../services/api.ts";
import { modeInputs } from "../practice/mode-inputs.ts";
import { RichText } from "../ui/RichText.tsx";
import { LEVEL_STYLE, stepHref } from "./levels.ts";

type Props = {
  topicSlug: string;
  /** The check's own step id, marked done on a pass. */
  stepId: string;
  level: LevelSummary;
  /** The level after this one; none after Advanced. */
  nextLevel?: LevelSummary;
  nextTopic?: TopicSummary;
  questions: LevelCheckQuestionView[];
  onPassed: (stepId: string) => void;
};

type Results = Record<string, CheckAnswerResponse>;

const card =
  "block rounded-lg border border-border p-4 transition-colors hover:border-accent hover:bg-accent/5";

/** "Now build it": the topic's first build step, once the level is passed. */
function BuildLink({ topicSlug }: { topicSlug: string }) {
  const step = useApi<TopicResponse>(apiPaths.topic(topicSlug)).data
    ?.buildSteps[0];
  return (
    <Link to={step ? `/build/${step.slug}` : "/build"} className={card}>
      <span className="block text-sm text-muted">Now build it →</span>
      <span className="font-medium">
        {step ? `Build step ${step.order}: ${step.title}` : "The Build journey"}
      </span>
    </Link>
  );
}

/**
 * The check that ends a level: every question at once (any practice mode),
 * checked on the server. All but one right completes the level; each wrong
 * answer points at the step that teaches it.
 */
export function LevelCheck({
  topicSlug,
  stepId,
  level,
  nextLevel,
  nextTopic,
  questions,
  onPassed,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, ExerciseAnswer | null>>(
    {},
  );
  const [results, setResults] = useState<Results | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = LEVEL_STYLE[level.level].name;
  const need = questions.length - 1;
  const allAnswered = questions.every((q) => answers[q.exercise.id]);

  function change(id: string, answer: ExerciseAnswer | null) {
    setAnswers((current) => ({ ...current, [id]: answer }));
    setResults(null);
  }

  async function check(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const checked = await Promise.all(
        questions.map(async ({ exercise }) => {
          const body: CheckAnswerRequest = { answer: answers[exercise.id]! };
          const result = await apiPost<CheckAnswerResponse>(
            apiPaths.checkExercise(exercise.id),
            body,
          );
          return [exercise.id, result] as const;
        }),
      );
      const next = Object.fromEntries(checked);
      setResults(next);
      if (Object.values(next).filter((r) => r.correct).length >= need) {
        onPassed(stepId);
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  const wrong = results
    ? questions.filter((q) => !results[q.exercise.id]?.correct)
    : [];
  const score = questions.length - wrong.length;
  const passed = results !== null && score >= need;

  return (
    <form onSubmit={check} className="mt-5 flex flex-col gap-6">
      <p className="text-muted">
        {questions.length} questions. Answer them all, then check: {need} of{" "}
        {questions.length} completes {name}.
      </p>
      <ol className="flex flex-col gap-4">
        {questions.map(({ exercise }, i) => {
          const Input = modeInputs[exercise.mode];
          return (
            <li key={exercise.id}>
              <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4">
                <legend className="sr-only">
                  Question {i + 1} of {questions.length}
                </legend>
                <p className="text-sm text-muted" aria-hidden="true">
                  Question {i + 1} of {questions.length}
                </p>
                <p className="text-lg leading-8">
                  <RichText text={exercise.prompt} />
                </p>
                {"task" in exercise && (
                  <p className="leading-7">
                    <RichText text={exercise.task} />
                  </p>
                )}
                {Input && (
                  <Input
                    exercise={exercise}
                    answer={answers[exercise.id] ?? null}
                    onChange={(answer) => change(exercise.id, answer)}
                    result={null}
                  />
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <button
        type="submit"
        disabled={!allAnswered || checking || results !== null}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
      >
        {checking ? "Checking…" : "Check answers"}
      </button>

      <div aria-live="polite" className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        {results && (
          <section
            aria-labelledby="level-check-result"
            className={`flex flex-col gap-2 rounded-lg border-l-4 p-4 leading-7 ${
              passed
                ? "border-green-600 bg-green-600/5"
                : "border-amber-500 bg-amber-500/10"
            }`}
          >
            <h3 id="level-check-result" className="text-lg font-semibold">
              {score} of {questions.length} correct ·{" "}
              {passed ? `${name} complete` : "Almost there"}
            </h3>
            <p>
              {passed
                ? `After this level: ${level.outcome}`
                : "Go back to these steps, then change your answers and check again."}
            </p>
            {wrong.length > 0 && (
              <ul className="flex list-disc flex-col gap-1 pl-6">
                {wrong.map((q) => (
                  <li key={q.exercise.id}>
                    Question {questions.indexOf(q) + 1}:{" "}
                    <Link
                      to={stepHref(topicSlug, q.step.id)}
                      className="text-accent underline"
                    >
                      revisit step {q.step.number}, {q.step.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {passed && (
          <div className="grid gap-3 sm:grid-cols-2">
            {nextLevel ? (
              <Link
                to={stepHref(topicSlug, nextLevel.steps[0]!.id)}
                className={card}
              >
                <span className="block text-sm text-muted">
                  Keep going → {LEVEL_STYLE[nextLevel.level].name}
                </span>
                <span className="font-medium">
                  Step {nextLevel.firstNumber}: {nextLevel.steps[0]!.title}
                </span>
              </Link>
            ) : nextTopic ? (
              <Link to={`/learn/${nextTopic.slug}`} className={card}>
                <span className="block text-sm text-muted">Next topic →</span>
                <span className="font-medium">
                  {nextTopic.order}. {nextTopic.title}
                </span>
              </Link>
            ) : null}
            <BuildLink topicSlug={topicSlug} />
          </div>
        )}
      </div>
    </form>
  );
}
