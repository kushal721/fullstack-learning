import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const addDatabaseStep: BuildStep = {
  id: "add-database",
  slug: "add-database",
  order: 10,
  title: "Add the database",
  goal: "Store the notes in PostgreSQL with a schema, a connection pool and parameterized queries.",
  why: "A database keeps data safe across restarts and many users. Parameterized queries keep it safe from SQL injection.",
  problemSolved: "Notes that disappear whenever the server restarts.",
  prerequisites: ["create-api-routes"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "database/schema.sql",
    "database/seed.sql",
    "backend/src/db.js",
  ],
  filesModified: [
    "backend/src/controllers/notesController.js",
    "backend/.env.example",
  ],
  filesRemoved: [],
  conceptIds: [
    "database",
    "sql",
    "sql-table",
    "crud",
    "parameterized-query",
    "db-connection-pool",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables: "Keep notes permanently in a real database.",
  commonMistakes: [],
  nextStepId: "add-authentication",
  nextWhy: "Everyone can see every note; next we add accounts and logging in.",
};
