import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { backupsModule } from "./backups.js";
import { normalisationModule } from "./normalisation.js";
import { queryPlansModule } from "./query-plans.js";
import { transactionsModule } from "./transactions.js";

// Advanced: steps 12–16. Transactions, normalisation, query plans and backups.
export const advanced: LevelPlan = {
  outcome:
    "Keep data correct under concurrent writes, design tables that don't contradict themselves, fix slow queries and recover from disaster.",
  steps: [
    transactionsModule,
    normalisationModule,
    queryPlansModule,
    backupsModule,
    levelCheck("advanced-check", "Advanced check", [
      ["databases-advanced-one-client", "transactions"],
      ["databases-advanced-lost-update", "transactions"],
      ["databases-advanced-each-fact-once", "normalisation"],
      ["databases-advanced-rows-removed", "query-plans"],
      ["databases-advanced-explain-analyze", "query-plans"],
      ["databases-advanced-rpo", "backups"],
      ["databases-advanced-test-restore", "backups"],
    ]),
  ],
};
