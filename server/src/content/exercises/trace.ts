import type { TraceExercise } from "@fsl/shared";

// Follow the data: each symbol must be linked to the next in the graph.
export const traceExercises: TraceExercise[] = [
  {
    id: "trace-save-to-database",
    mode: "trace",
    title: "From Save to the notes table",
    prompt:
      "A new note leaves `handleSave` and ends up as a row in the `notes` table. Put the pieces of code it passes through in order.",
    symbolIds: [
      "fn:handleSave",
      "fn:notesApi.createNote",
      "fn:request",
      "external:fetch",
      "http-request:POST /api/notes",
      "route:POST /api/notes",
      "controller:notesController.createNote",
      "query:insertNote",
      "table:notes",
    ],
    distractorIds: [
      "fn:notesApi.updateNote",
      "controller:notesController.listNotes",
      "query:selectNotes",
    ],
    conceptIds: ["http-request-response", "js-fetch", "sql-insert"],
    buildStepId: "add-database",
    hints: [
      "The frontend never talks to the database. Which function sends things over the network?",
      "On the backend, Express matches a route first, and the route hands the request to a controller.",
    ],
    explanation:
      "`handleSave` calls the notes service's `createNote`, which uses the shared `request()` helper, which calls the browser's `fetch`. `fetch` sends `POST /api/notes` over the network; Express matches the route, which calls the `createNote` controller. The controller runs the parameterized INSERT, and PostgreSQL stores the row in `notes`. `updateNote`, `listNotes` and the SELECT belong to editing and loading notes, not creating them.",
  },
];
