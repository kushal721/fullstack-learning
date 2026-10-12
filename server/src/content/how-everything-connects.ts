import type { LayerOverview } from "@fsl/shared";

// The five layers a request passes through, in the order the create-note
// flow visits them, for the "How everything connects" topic (spec §46).
// `npm run validate` checks every concept, build step and file exists.
export const layerOverviews: LayerOverview[] = [
  {
    layer: "user",
    title: "The user",
    why: [
      "Every request starts with a person doing something: typing a note and pressing Save. The whole app exists to turn those actions into lasting results, and every flow ends back with them, on the screen.",
      "That is why the interface is made of real HTML elements: a `<form>` and a submit `<button>` work with the keyboard and with screen readers before a single line of JavaScript runs.",
    ],
    conceptIds: ["html-form", "html-button", "js-event"],
    buildStepIds: ["understand-the-application", "create-first-component"],
    fileIds: [
      "frontend/src/components/NoteForm.jsx",
      "frontend/src/components/Button.jsx",
    ],
  },
  {
    layer: "frontend",
    title: "The frontend",
    why: [
      "The frontend is the React app running in the browser. It shows the notes, remembers what the user is typing in state, and redraws only what changed when data arrives.",
      "It never talks to the database. It only knows the API's URLs, through one service file and one `request` function, so how the backend stores data can change without the screens noticing.",
    ],
    conceptIds: [
      "react-component",
      "react-state",
      "react-custom-hook",
      "js-fetch",
    ],
    buildStepIds: ["create-page", "add-state", "add-api-communication"],
    fileIds: [
      "frontend/src/pages/Dashboard.jsx",
      "frontend/src/hooks/useNotes.js",
      "frontend/src/services/notesApi.js",
      "frontend/src/services/request.js",
    ],
  },
  {
    layer: "network",
    title: "The network",
    why: [
      "The browser and the server are separate programs, usually on separate computers, so they talk by sending HTTP messages: a request with a method, a path, headers and maybe a JSON body, and a response with a status code.",
      "The login cookie travels in these messages too. Because HTTP forgets everything between requests, the cookie is how the server recognises the same user each time.",
    ],
    conceptIds: [
      "http-request-response",
      "http-methods",
      "http-status-codes",
      "json",
    ],
    buildStepIds: ["add-api-communication", "create-api-routes"],
    fileIds: ["frontend/vite.config.js", "frontend/src/services/request.js"],
  },
  {
    layer: "backend",
    title: "The backend",
    why: [
      "Code in the browser can be read and changed by anyone using it, so the rules can't live there. The Express backend receives every request and decides: who is asking (`requireAuth`), whether the input is valid (`validateNote`), and what they may see or change.",
      "Each request passes through the same layers in order (middleware, route, controller), which keeps every rule in one place instead of copied into every endpoint.",
    ],
    conceptIds: [
      "express",
      "express-middleware",
      "express-route",
      "controller",
    ],
    buildStepIds: [
      "create-backend",
      "create-api-routes",
      "add-authentication",
      "add-security",
    ],
    fileIds: [
      "backend/src/app.js",
      "backend/src/routes/notes.js",
      "backend/src/middleware/authMiddleware.js",
      "backend/src/controllers/notesController.js",
    ],
  },
  {
    layer: "database",
    title: "The database",
    why: [
      "The server's memory is wiped whenever it restarts, so the notes live in PostgreSQL. It keeps them safely on disk, finds one user's notes quickly, and enforces rules even if the code has a bug, like every note belonging to an existing user.",
      "The backend talks to it only through parameterized queries, so what users type can never change the SQL.",
    ],
    conceptIds: ["database", "sql-table", "foreign-key", "parameterized-query"],
    buildStepIds: ["add-database"],
    fileIds: ["database/schema.sql", "backend/src/db.js"],
  },
];
