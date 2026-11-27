import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { selectAndInsertModule } from "./select-and-insert.js";
import { sqlFromNodeModule } from "./sql-from-node.js";
import { tablesRowsKeysModule } from "./tables-rows-keys.js";
import { updateAndDeleteModule } from "./update-and-delete.js";
import { whyADatabaseModule } from "./why-a-database.js";

// Basic: steps 1–6. Why a database, tables and keys, SELECT, INSERT, UPDATE and DELETE, and SQL from the backend.
export const basic: LevelPlan = {
  outcome:
    "Design a table with keys and constraints, read and change its rows with SQL, and run those queries safely from Node.js.",
  steps: [
    whyADatabaseModule,
    tablesRowsKeysModule,
    selectAndInsertModule,
    updateAndDeleteModule,
    sqlFromNodeModule,
    levelCheck("basic-check", "Basic check", [
      ["databases-basic-json-file", "why-a-database"],
      ["databases-basic-foreign-key", "tables-rows-keys"],
      ["databases-basic-newest-three", "select-and-insert"],
      ["databases-basic-returning", "select-and-insert"],
      ["databases-basic-no-where", "update-and-delete"],
      ["databases-basic-rowcount-404", "update-and-delete"],
      ["databases-basic-parameters", "sql-from-node"],
      ["databases-basic-one-pool", "sql-from-node"],
    ]),
  ],
};
