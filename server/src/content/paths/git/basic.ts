import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { commitsModule } from "./commits.js";
import { repositoriesModule } from "./repositories.js";

// Basic: from an empty folder to a commit on GitHub.
export const basic: LevelPlan = {
  outcome:
    "Track a project with Git, save clear commits, work on a branch and share it on GitHub with a pull request.",
  steps: [
    repositoriesModule,
    commitsModule,
    levelCheck("basic-check", "Basic check", []),
  ],
};
