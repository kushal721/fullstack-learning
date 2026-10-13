import type { ExerciseChoice } from "@fsl/shared";
import { CodeExample } from "../concept-explorer/CodeExample.tsx";
import { RichText } from "../ui/RichText.tsx";
import type { ModeInputProps } from "./mode-inputs.ts";

/**
 * Pick one of several options (predict, and later fix). After checking, the
 * right option and the learner's own choice are marked in words, not only
 * in colour.
 */
export function ChoiceInput({
  exercise,
  answer,
  onChange,
  result,
}: ModeInputProps) {
  if (!("choices" in exercise)) return null;
  const code = "code" in exercise ? exercise.code : undefined;
  const chosen = answer && "choiceId" in answer ? answer.choiceId : null;
  const right =
    result?.expected && "choiceId" in result.expected
      ? result.expected.choiceId
      : null;
  const name = `choice-${exercise.id}`;

  const note = (choice: ExerciseChoice) =>
    choice.id === right
      ? "Right answer"
      : result && choice.id === chosen
        ? "Your choice"
        : null;

  return (
    <div className="flex flex-col gap-4">
      {code && <CodeExample example={code} />}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">Your answer</legend>
        {exercise.choices.map((choice) => {
          const label = note(choice);
          return (
            <label
              key={choice.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                choice.id === right
                  ? "border-green-600 bg-green-600/5"
                  : choice.id === chosen
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent"
              } ${result ? "cursor-default" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={choice.id}
                checked={choice.id === chosen}
                disabled={result !== null}
                onChange={() => onChange({ choiceId: choice.id })}
                className="mt-1 accent-accent"
              />
              <span className="flex flex-col gap-1">
                <span>
                  <RichText text={choice.text} />
                </span>
                {label && (
                  <span
                    className={`text-sm font-semibold ${
                      label === "Right answer"
                        ? "text-green-700 dark:text-green-400"
                        : "text-muted"
                    }`}
                  >
                    {label}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
