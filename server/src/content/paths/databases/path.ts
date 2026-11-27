import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const saveScene: Scene = {
  id: "note-saved-read-back",
  title: "A note is saved and read back",
  actors: [
    { id: "controller", label: "Controller", sub: "createNote()" },
    { id: "pool", label: "Connection pool", sub: "pg" },
    { id: "database", label: "PostgreSQL", sub: "notes table" },
    { id: "disk", label: "Disk", sub: "stored safely" },
  ],
  steps: [
    {
      from: "controller",
      to: "pool",
      message: "INSERT … ($1, $2, $3)",
      caption:
        "The controller sends SQL with placeholders, and the values separately.",
      detail: "The values can never change what the SQL means.",
    },
    {
      from: "pool",
      to: "database",
      message: "borrow a connection",
      caption:
        "The pool lends an open connection, so there's no slow new login per query.",
      detail: "It gets the connection back when the query is done.",
    },
    {
      from: "database",
      to: "database",
      message: "check the rules",
      caption:
        "PostgreSQL checks the constraints: a title is there, user_id is a real user.",
      detail: "A broken rule fails the INSERT; nothing is saved.",
    },
    {
      from: "database",
      to: "disk",
      message: "commit",
      caption:
        "The new row is written to the log on disk before PostgreSQL says it's done.",
      detail: "So it survives even if the server crashes a moment later.",
    },
    {
      from: "database",
      to: "controller",
      message: "RETURNING id, …",
      caption:
        "The new row comes back, with the id and times the database filled in.",
      detail: "The controller sends it to the browser with 201.",
    },
    {
      from: "controller",
      to: "database",
      message: "SELECT … WHERE user_id = $1",
      caption:
        "Later, loading the list asks for this user's notes, newest first. The index finds them fast.",
      detail: "notes_user_id_idx: no need to read every note.",
    },
  ],
};

// Databases: every step is a module. Counts and numbering are in the level
// files.
export const databasesPath: TopicPath = {
  topicId: "databases",
  summary: {
    what: "A database is a program that stores an app's data safely and lets you search and change it, like the Notes App's PostgreSQL.",
    does: "It keeps data after the server restarts, enforces rules on it, lets many requests use it at once and finds rows fast.",
    how: "Data lives in tables of rows and columns linked by keys. The backend sends SQL such as SELECT and INSERT, with values passed separately.",
  },
  overviewSceneId: "note-saved-read-back",
  scenes: [saveScene],
  levels: { basic, intermediate, advanced },
};
