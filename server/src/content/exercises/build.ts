import type { BuildExercise } from "@fsl/shared";

// Plan a feature: which files, layers and connections does it need?
export const buildExercises: BuildExercise[] = [
  {
    id: "build-favorite-notes",
    mode: "build",
    title: "Favorite notes",
    prompt:
      "Plan a feature before writing any code: tick everything it needs, then compare your plan with a model answer.",
    task: "Let users mark a note as a favorite with a star button on its card. The star must still be there after a reload.",
    checklist: [
      {
        id: "schema",
        kind: "file",
        ref: "database/schema.sql",
        text: "`database/schema.sql`: store whether a note is a favorite",
        required: true,
      },
      {
        id: "database-layer",
        kind: "layer",
        ref: "database",
        text: "The database layer: the value must survive a reload",
        required: true,
      },
      {
        id: "controller",
        kind: "file",
        ref: "backend/src/controllers/notesController.js",
        text: "`notesController.js`: return the flag and change it",
        required: true,
      },
      {
        id: "routes",
        kind: "file",
        ref: "backend/src/routes/notes.js",
        text: "`routes/notes.js`: a route to change the flag",
        required: true,
      },
      {
        id: "protected",
        kind: "relationship",
        ref: "route:PUT /api/notes/:id->uses->middleware:requireAuth",
        text: "The new route runs behind `requireAuth`, like `PUT /api/notes/:id` does",
        required: true,
      },
      {
        id: "service",
        kind: "file",
        ref: "frontend/src/services/notesApi.js",
        text: "`notesApi.js`: a function that calls the new route",
        required: true,
      },
      {
        id: "card",
        kind: "file",
        ref: "frontend/src/components/NoteCard.jsx",
        text: "`NoteCard.jsx`: the star button",
        required: true,
      },
      {
        id: "auth-controller",
        kind: "file",
        ref: "backend/src/controllers/authController.js",
        text: "`authController.js`: change how users log in",
        required: false,
      },
      {
        id: "login-page",
        kind: "file",
        ref: "frontend/src/pages/Login.jsx",
        text: "`Login.jsx`: add the star to the login page",
        required: false,
      },
    ],
    modelAnswer: [
      "Database: `ALTER TABLE notes ADD COLUMN favorite BOOLEAN NOT NULL DEFAULT false;` (and the same column in `schema.sql`), so existing notes start as not favorite.",
      "Controller: add `favorite` to the columns in every `SELECT` and `RETURNING`, and add `setFavorite`, which runs `UPDATE notes SET favorite = $1 WHERE id = $2 AND user_id = $3`.",
      'Route: `notesRoutes.patch("/:id/favorite", notesController.setFavorite);`. It is in the notes router, so `requireAuth` already runs first.',
      "Service: `favoriteNote(id, favorite)` sends `PATCH /api/notes/:id/favorite` with the body `{ favorite }` through `request()`.",
      "Card: a star button that calls `favoriteNote` and then `onUpdated(updated)`, so the list shows the new state.",
    ],
    conceptIds: ["crud", "sql-table", "rest-endpoint"],
    hints: [
      '"Still there after a reload" means the value can\'t live only in React state.',
      "Follow the data: where is it stored, which route changes it, and what calls that route?",
    ],
    explanation:
      "A favorite is data about a note, so it needs a column in `notes`; React state alone would be lost on reload. The backend must return it and offer a way to change it (controller and route), protected like every notes route and filtered by `user_id`. The frontend needs a service function to call the route and a button on the card. Logging in and the login page have nothing to do with it.",
  },
];
