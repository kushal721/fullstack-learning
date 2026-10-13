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
  {
    id: "trace-button-to-database",
    mode: "trace",
    title: "From the Save button to the database",
    prompt:
      "The user clicks the Save button under a new note. Trace what happens, from the button all the way to the row PostgreSQL stores.",
    symbolIds: [
      "component:Button",
      "event:noteForm.submit",
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
      "event:noteCard.submit",
      "fn:validateNote",
      "middleware:express.json",
    ],
    conceptIds: ["js-event", "http-request-response", "sql-insert"],
    buildStepId: "add-database",
    hints: [
      "A submit button doesn't run your code itself: what does the browser fire when it's clicked?",
      "Three steps happen in the browser before anything goes over the network.",
    ],
    explanation:
      "Save is a `<Button type=\"submit\">`, so clicking it makes the browser fire the note form's `submit` event, which React hands to `handleSave`. `handleSave` calls `createNote`, which builds the call with the shared `request()`, which calls `fetch`. `fetch` sends `POST /api/notes`; Express matches the route, the route calls the `createNote` controller, and the controller runs the INSERT that stores the row in `notes`. `express.json` and `validateNote` really do run on the way, but they are side trips that return to the same place, not links in this chain; the card's `submit` belongs to editing, not creating.",
  },
  {
    id: "trace-load-notes",
    mode: "trace",
    title: "Loading the notes",
    prompt:
      "When the Dashboard appears, the user's notes are loaded. Trace the request from the `useNotes` hook to the table the notes come from.",
    symbolIds: [
      "hook:useNotes",
      "fn:notesApi.getNotes",
      "fn:request",
      "external:fetch",
      "http-request:GET /api/notes",
      "route:GET /api/notes",
      "controller:notesController.listNotes",
      "query:selectNotes",
      "table:notes",
    ],
    distractorIds: [
      "fn:notesApi.createNote",
      "query:insertNote",
      "table:users",
    ],
    conceptIds: ["react-useeffect", "http-get", "sql-select"],
    buildStepId: "add-database",
    hints: [
      "`useNotes` loads the notes in an effect when the Dashboard first renders.",
      "Reading data uses GET, and in SQL a SELECT.",
    ],
    explanation:
      "`useNotes` calls `getNotes` in its effect. `getNotes` uses `request()` with no method, so `fetch` sends a `GET /api/notes` with the login cookie. Express matches the GET route, the route calls `listNotes`, and the controller runs a SELECT that reads only this user's rows from `notes`, newest first. The INSERT and `createNote` belong to saving; `users` is where accounts live, not notes.",
  },
  {
    id: "trace-log-in",
    mode: "trace",
    title: "Logging in",
    prompt:
      "The user submits the login form. Trace the request from the form's submit event to the table where the account is found.",
    symbolIds: [
      "event:login.submit",
      "fn:login.handleSubmit",
      "fn:authApi.login",
      "fn:request",
      "external:fetch",
      "http-request:POST /api/auth/login",
      "route:POST /api/auth/login",
      "controller:authController.login",
      "query:selectUserByEmail",
      "table:users",
    ],
    distractorIds: [
      "middleware:requireAuth",
      "fn:authApi.register",
      "table:notes",
    ],
    conceptIds: ["authentication-vs-authorization", "http-post", "sql-select"],
    buildStepId: "add-authentication",
    hints: [
      "Can `requireAuth` be on the way to logging in?",
      "The login controller looks the account up by email.",
    ],
    explanation:
      "React hands the login form's `submit` event to `handleSubmit`, which calls `authApi.login`, which uses `request()` and `fetch` to send `POST /api/auth/login`. Express matches the login route, which calls the `login` controller. The controller looks the account up by email with a SELECT on `users`, then checks the password. `requireAuth` isn't on this path: you can't need to be logged in to log in, so the login route deliberately has no login check.",
  },
  {
    id: "trace-edit-note",
    mode: "trace",
    title: "Saving an edited note",
    prompt:
      "The user edits a note on its card and saves. Trace the change from the card's submit event to the table row it updates.",
    symbolIds: [
      "event:noteCard.submit",
      "fn:noteCard.handleUpdate",
      "fn:notesApi.updateNote",
      "fn:request",
      "external:fetch",
      "http-request:PUT /api/notes/:id",
      "route:PUT /api/notes/:id",
      "controller:notesController.updateNote",
      "query:updateNote",
      "table:notes",
    ],
    distractorIds: [
      "fn:handleSave",
      "fn:notesApi.createNote",
      "http-request:POST /api/notes",
    ],
    conceptIds: [
      "http-put-delete",
      "sql-update-delete",
      "authentication-vs-authorization",
    ],
    buildStepId: "add-security",
    hints: [
      "Editing changes an existing note. Which HTTP method replaces something?",
      "`handleSave` belongs to the form for new notes; the card has its own handler.",
    ],
    explanation:
      "The card's edit form fires `submit`, which React hands to `handleUpdate`. It calls `updateNote(note.id, …)`, which puts the id in the URL and sends `PUT /api/notes/7` through `request()` and `fetch`. Express matches the PUT route, the route calls the `updateNote` controller, and the controller runs an UPDATE that only matches the row with this id and this user's `user_id`. `handleSave`, `createNote` and the POST are the path for new notes.",
  },
];
