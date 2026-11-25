import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { codeReviewModule } from "./code-review.js";
import { mergeConflictsModule } from "./merge-conflicts.js";
import { rewritingHistoryModule } from "./rewriting-history.js";
import { whatToCommitModule } from "./what-to-commit.js";

// Intermediate: steps 7–11. Working with others: conflicts, history,
// what belongs in a repository, and reviewing each other's code.
export const intermediate: LevelPlan = {
  outcome:
    "Resolve conflicts, keep a tidy history, decide what belongs in a repository and review others' code.",
  steps: [
    mergeConflictsModule,
    rewritingHistoryModule,
    whatToCommitModule,
    codeReviewModule,
    levelCheck("intermediate-check", "Intermediate check", []),
  ],
};
