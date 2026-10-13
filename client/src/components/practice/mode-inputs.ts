import type {
  CheckResult,
  ExerciseAnswer,
  ExerciseMode,
  PublicExercise,
} from "@fsl/shared";
import type { ComponentType } from "react";
import { ChoiceInput } from "./modes/ChoiceInput.tsx";

/** What every mode's answer input receives from the runner. */
export type ModeInputProps = {
  exercise: PublicExercise;
  /** The answer so far, or null while nothing is chosen. */
  answer: ExerciseAnswer | null;
  onChange: (answer: ExerciseAnswer | null) => void;
  /** After checking: the result, so the input can show the right answer. */
  result: CheckResult | null;
};

/**
 * The answer input for each mode. A mode without an entry can be read but
 * not answered yet; each mode's issue adds its input here.
 */
export const modeInputs: Partial<
  Record<ExerciseMode, ComponentType<ModeInputProps>>
> = {
  predict: ChoiceInput,
};
