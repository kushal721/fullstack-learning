import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { codeSplittingModule } from "./code-splitting.js";
import { memoAndPerformanceModule } from "./memo-and-performance.js";
import { reducersModule } from "./reducers.js";
import { testingComponentsModule } from "./testing-components.js";

// Advanced: steps 14–18. Growing apps: complex state, speed, loading
// less up front, and tests you can trust.
export const advanced: LevelPlan = {
  outcome:
    "Manage complex state with reducers, find and fix slow renders, split code with lazy and Suspense, and test components like a user.",
  steps: [
    reducersModule,
    memoAndPerformanceModule,
    codeSplittingModule,
    testingComponentsModule,
    levelCheck("advanced-check", "Advanced check", [
      ["react-advanced-reducer-pure", "reducers"],
      ["react-advanced-reducer-effect", "reducers"],
      ["react-advanced-memo", "memo-and-performance"],
      ["react-advanced-measure", "memo-and-performance"],
      ["react-advanced-lazy", "code-splitting"],
      ["react-advanced-findby", "testing-components"],
    ]),
  ],
};
