import type { ExerciseMode } from "@fsl/shared";

/** The five kinds of practice, in the order the Practice page lists them. */
export const MODES: { mode: ExerciseMode; label: string; skill: string }[] = [
  {
    mode: "predict",
    label: "Predict",
    skill: "What happens when…? Pick the outcome.",
  },
  {
    mode: "trace",
    label: "Trace",
    skill: "Put the steps of a path through the code in order.",
  },
  {
    mode: "find",
    label: "Find",
    skill: "Locate the file or the piece of code.",
  },
  { mode: "fix", label: "Fix", skill: "Spot the bug and pick the fix." },
  {
    mode: "build",
    label: "Build",
    skill: "Plan a feature: which files, layers and connections does it need?",
  },
];

export const modeLabel = (mode: ExerciseMode) =>
  MODES.find((m) => m.mode === mode)?.label ?? mode;
