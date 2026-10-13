import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
  ExerciseAnswer,
  PublicExercise,
} from "@fsl/shared";
import { type FormEvent, useState } from "react";
import { ApiRequestError, apiPaths, apiPost } from "../../services/api.ts";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { RichText } from "../ui/RichText.tsx";
import { modeInputs } from "./mode-inputs.ts";

type Props = {
  exercise: PublicExercise;
  /** Where "Next exercise" goes; none on the last exercise. */
  nextHref?: string;
};

const buttonClass =
  "rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Runs one exercise of any mode: the prompt, hints on request, the mode's
 * answer input, checking on the server and the feedback. Render it with
 * `key={exercise.id}` so moving to another exercise starts fresh.
 */
export function ExerciseRunner({ exercise, nextHref }: Props) {
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [result, setResult] = useState<CheckAnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const Input = modeInputs[exercise.mode];
  // A wrong answer only says so; the explanation and the right answer wait
  // until the learner gets it right or asks to see them.
  const finished = result !== null && (result.correct || revealed);

  async function check(event: FormEvent) {
    event.preventDefault();
    if (!answer) return;
    setChecking(true);
    setError(null);
    try {
      const body: CheckAnswerRequest = { answer };
      setResult(
        await apiPost<CheckAnswerResponse>(
          apiPaths.checkExercise(exercise.id),
          body,
        ),
      );
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

  function changeAnswer(next: ExerciseAnswer | null) {
    setAnswer(next);
    setResult(null);
  }

  return (
    <form onSubmit={check} className="flex max-w-3xl flex-col gap-6">
      <p className="text-lg leading-8">
        <RichText text={exercise.prompt} />
      </p>
      {"task" in exercise && (
        <p className="rounded-lg border border-border p-4 leading-7">
          <RichText text={exercise.task} />
        </p>
      )}

      {Input ? (
        <Input
          exercise={exercise}
          answer={answer}
          onChange={changeAnswer}
          result={finished ? result : null}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-muted">
          Answering this kind of exercise isn't available yet. You can still
          read the question and the hints.
        </p>
      )}

      {exercise.hints.length > 0 && (
        <section aria-label="Hints" className="flex flex-col gap-2">
          {hintsShown > 0 && (
            <ol className="flex list-decimal flex-col gap-1 pl-6">
              {exercise.hints.slice(0, hintsShown).map((hint) => (
                <li key={hint}>
                  <RichText text={hint} />
                </li>
              ))}
            </ol>
          )}
          {hintsShown < exercise.hints.length && !finished && (
            <button
              type="button"
              className={`${buttonClass} self-start border border-border hover:bg-foreground/5`}
              onClick={() => setHintsShown((n) => n + 1)}
            >
              {hintsShown === 0
                ? "Show a hint"
                : `Show another hint (${hintsShown + 1} of ${exercise.hints.length})`}
            </button>
          )}
        </section>
      )}

      {Input && !finished && (
        <button
          type="submit"
          disabled={!answer || checking || result !== null}
          className={`${buttonClass} self-start bg-accent text-white hover:opacity-90 dark:text-black`}
        >
          {checking ? "Checking…" : "Check answer"}
        </button>
      )}

      {/* Announced by screen readers as soon as it changes. */}
      <div aria-live="polite" className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        {result && !finished && (
          <p className="rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-4">
            <strong>Not quite.</strong> Change your answer and check again, or
            show the answer.
          </p>
        )}
        {result && finished && (
          <section
            aria-label="Feedback"
            className={`flex flex-col gap-3 rounded-lg border-l-4 p-4 ${
              result.correct
                ? "border-green-600 bg-green-600/5"
                : "border-amber-500 bg-amber-500/10"
            }`}
          >
            <h2 className="text-lg font-semibold">
              {result.correct ? "Correct!" : "The answer"}
            </h2>
            <p className="leading-7">
              <RichText text={result.explanation} />
            </p>
          </section>
        )}
      </div>

      {result && !finished && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className={`${buttonClass} self-start border border-border hover:bg-foreground/5`}
        >
          Show the answer
        </button>
      )}

      {finished && (
        <div className="flex flex-wrap gap-3">
          {nextHref ? (
            <ButtonLink to={nextHref}>Next exercise</ButtonLink>
          ) : (
            <ButtonLink to="/practice" variant="secondary">
              Back to all exercises
            </ButtonLink>
          )}
        </div>
      )}
    </form>
  );
}
