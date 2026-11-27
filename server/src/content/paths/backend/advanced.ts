import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { backgroundJobsModule } from "./background-jobs.js";
import { layersAndArchitectureModule } from "./layers-and-architecture.js";
import { scalingModule } from "./scaling.js";

// Advanced: steps 13–16. Layers and architecture, background jobs and scaling.
export const advanced: LevelPlan = {
  outcome:
    "Structure a backend in layers, move slow work into background jobs, and run it on more than one server.",
  steps: [
    layersAndArchitectureModule,
    backgroundJobsModule,
    scalingModule,
    levelCheck("advanced-check", "Advanced check", [
      ["backend-advanced-service-layer", "layers-and-architecture"],
      ["backend-advanced-fake-repo", "layers-and-architecture"],
      ["backend-advanced-job-queue", "background-jobs"],
      ["backend-advanced-cron-once", "background-jobs"],
      ["backend-advanced-stateless", "scaling"],
      ["backend-advanced-graceful-shutdown", "scaling"],
    ]),
  ],
};
