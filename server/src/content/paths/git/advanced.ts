import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { hooksAndActionsModule } from "./hooks-and-actions.js";
import { searchingHistoryModule } from "./searching-history.js";
import { signedCommitsModule } from "./signed-commits.js";

// Advanced: steps 12–15. Searching history, automating checks, and
// trusting who made a change.
export const advanced: LevelPlan = {
  outcome:
    "Find the commit that broke something, automate checks with hooks and GitHub Actions, and prove who made a commit.",
  steps: [
    searchingHistoryModule,
    hooksAndActionsModule,
    signedCommitsModule,
    levelCheck("advanced-check", "Advanced check", [
      ["git-advanced-bisect", "searching-history"],
      ["git-advanced-pickaxe", "searching-history"],
      ["git-advanced-ci", "hooks-and-actions"],
      ["git-advanced-secret", "hooks-and-actions"],
      ["git-advanced-verified", "signed-commits"],
    ]),
  ],
};
