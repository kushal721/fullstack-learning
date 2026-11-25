import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { branchesModule } from "./branches.js";
import { commitsModule } from "./commits.js";
import { githubModule } from "./github.js";
import { pullRequestsModule } from "./pull-requests.js";
import { repositoriesModule } from "./repositories.js";

// Basic: steps 1–6. From an empty folder to a pull request on GitHub.
export const basic: LevelPlan = {
  outcome:
    "Track a project with Git, save clear commits, work on a branch and share it on GitHub with a pull request.",
  steps: [
    repositoriesModule,
    commitsModule,
    branchesModule,
    githubModule,
    pullRequestsModule,
    levelCheck("basic-check", "Basic check", [
      ["git-basic-staged", "repositories"],
      ["git-basic-message", "commits"],
      ["git-basic-fast-forward", "branches"],
      ["git-basic-rejected", "github"],
      ["git-basic-pr-red", "pull-requests"],
    ]),
  ],
};
