import type {
  CheckResult,
  Exercise,
  ExerciseAnswer,
  ExerciseMode,
  PublicExercise,
} from "@fsl/shared";
import { exercises as allExercises } from "../content/exercises/index.js";

export const EXERCISE_MODES: ExerciseMode[] = [
  "predict",
  "trace",
  "find",
  "fix",
  "build",
];

export function getExercise(
  id: string,
  exercises: Exercise[] = allExercises,
): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id);
}

/** Every exercise, or only one mode's, in the registry's order. */
export function getExercises(
  mode?: ExerciseMode,
  exercises: Exercise[] = allExercises,
): Exercise[] {
  return mode
    ? exercises.filter((exercise) => exercise.mode === mode)
    : exercises;
}

/**
 * Practice exercises keep their answers on the server: the browser gets
 * `toPublic(exercise)` and sends answers back to be checked.
 */
export function toPublic(exercise: Exercise): PublicExercise {
  switch (exercise.mode) {
    case "predict":
    case "fix": {
      const { correctChoiceId: _, explanation: __, ...rest } = exercise;
      return rest;
    }
    case "trace": {
      const { symbolIds, distractorIds, explanation: _, ...rest } = exercise;
      return {
        ...rest,
        startSymbolId: symbolIds[0]!,
        endSymbolId: symbolIds.at(-1)!,
        length: symbolIds.length,
        // Sorted, so the order gives nothing away.
        candidateIds: [...symbolIds, ...distractorIds].sort(),
      };
    }
    case "find": {
      const { acceptedIds: _, explanation: __, ...rest } = exercise;
      return rest;
    }
    case "build": {
      const { checklist, modelAnswer: _, explanation: __, ...rest } = exercise;
      return {
        ...rest,
        checklist: checklist.map(({ required: _, ...item }) => item),
      };
    }
  }
}

const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

/**
 * Why `answer` doesn't have the shape this exercise's mode expects, or
 * undefined when it does. Checked before `checkAnswer`.
 */
export function answerError(
  exercise: Exercise,
  answer: unknown,
): string | undefined {
  const body = (answer ?? {}) as Record<string, unknown>;
  switch (exercise.mode) {
    case "predict":
    case "fix":
      return isString(body.choiceId)
        ? undefined
        : "The answer needs a `choiceId` (text).";
    case "trace":
      return isStringArray(body.symbolIds)
        ? undefined
        : "The answer needs `symbolIds` (a list of symbol ids, in order).";
    case "find":
      return isString(body.id)
        ? undefined
        : "The answer needs an `id` (a file or symbol id).";
    case "build":
      return isStringArray(body.itemIds)
        ? undefined
        : "The answer needs `itemIds` (the checklist items you ticked).";
  }
}

const sameSet = (a: string[], b: string[]) =>
  new Set(a).size === new Set(b).size && a.every((id) => b.includes(id));

/**
 * Checks an answer whose shape `answerError` accepted. The result always
 * includes the expected answer, so the learner can compare.
 */
export function checkAnswer(
  exercise: Exercise,
  answer: ExerciseAnswer,
): CheckResult {
  const { explanation } = exercise;
  switch (exercise.mode) {
    case "predict":
    case "fix": {
      const { choiceId } = answer as { choiceId: string };
      return {
        correct: choiceId === exercise.correctChoiceId,
        explanation,
        expected: { choiceId: exercise.correctChoiceId },
      };
    }
    case "trace": {
      const { symbolIds } = answer as { symbolIds: string[] };
      return {
        correct:
          symbolIds.length === exercise.symbolIds.length &&
          symbolIds.every((id, i) => id === exercise.symbolIds[i]),
        explanation,
        expected: { symbolIds: exercise.symbolIds },
      };
    }
    case "find": {
      const { id } = answer as { id: string };
      return {
        correct: exercise.acceptedIds.includes(id),
        explanation,
        expected: { ids: exercise.acceptedIds },
      };
    }
    case "build": {
      const { itemIds } = answer as { itemIds: string[] };
      const required = exercise.checklist
        .filter((item) => item.required)
        .map((item) => item.id);
      return {
        correct: sameSet(itemIds, required),
        explanation,
        expected: { itemIds: required, modelAnswer: exercise.modelAnswer },
      };
    }
  }
}
