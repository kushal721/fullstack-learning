import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";

// Intermediate: working with others.
export const intermediate: LevelPlan = {
  outcome:
    "Resolve conflicts, keep a tidy history, decide what belongs in a repository and review others' code.",
  steps: [levelCheck("intermediate-check", "Intermediate check", [])],
};
