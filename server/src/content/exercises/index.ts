import type { Exercise } from "@fsl/shared";
import { buildExercises } from "./build.js";
import { findExercises } from "./find.js";
import { fixExercises } from "./fix.js";
import { predictExercises } from "./predict.js";
import { traceExercises } from "./trace.js";

// Every practice exercise, one file per mode. `npm run validate` checks
// that every id they mention exists and that every answer is possible.
export const exercises: Exercise[] = [
  ...predictExercises,
  ...traceExercises,
  ...findExercises,
  ...fixExercises,
  ...buildExercises,
];
