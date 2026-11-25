import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";

// Advanced: searching history, automation and trust.
export const advanced: LevelPlan = {
  outcome:
    "Find the commit that broke something, automate checks with hooks and GitHub Actions, and prove who made a commit.",
  steps: [levelCheck("advanced-check", "Advanced check", [])],
};
