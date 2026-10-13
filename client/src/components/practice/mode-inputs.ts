import type {
  CheckResult,
  ExerciseAnswer,
  ExerciseMode,
  PublicExercise,
} from "@fsl/shared";
import type { ComponentType } from "react";
import { BuildInput } from "./modes/BuildInput.tsx";
import { ChoiceInput } from "./modes/ChoiceInput.tsx";
import { FindInput } from "./modes/FindInput.tsx";
import { TraceInput } from "./modes/TraceInput.tsx";

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
 * not answered (every mode has one now).
 */
export const modeInputs: Partial<
  Record<ExerciseMode, ComponentType<ModeInputProps>>
> = {
  predict: ChoiceInput,
  trace: TraceInput,
  find: FindInput,
  fix: ChoiceInput,
  build: BuildInput,
};
