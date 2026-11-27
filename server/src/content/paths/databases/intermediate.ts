import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { indexesModule } from "./indexes.js";
import { migrationsModule } from "./migrations.js";
import { ormsModule } from "./orms.js";
import { relationshipsAndJoinsModule } from "./relationships-and-joins.js";

// Intermediate: steps 7–11. Relationships and joins, indexes, migrations and ORMs.
export const intermediate: LevelPlan = {
  outcome:
    "Link tables and query them together, make lookups fast, change a schema safely and choose between SQL and an ORM.",
  steps: [
    relationshipsAndJoinsModule,
    indexesModule,
    migrationsModule,
    ormsModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["databases-intermediate-left-join", "relationships-and-joins"],
      ["databases-intermediate-on-delete", "relationships-and-joins"],
      ["databases-intermediate-index-order", "indexes"],
      ["databases-intermediate-index-fk", "indexes"],
      ["databases-intermediate-migration-edit", "migrations"],
      ["databases-intermediate-n-plus-one", "orms"],
    ]),
  ],
};
