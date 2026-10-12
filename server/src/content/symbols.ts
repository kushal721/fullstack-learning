import type { CodeSymbol } from "@fsl/shared";

// Named pieces of the Notes App that relationships connect. Ids follow
// docs/NOTES_APP.md "Symbol ids". `match` is exact text on the defining
// line; `npm run validate` fails if it disappears from the file.
//
// M06.1.1 seeds the backbone of "create a note"; M06.1.2–M06.1.4 add the
// rest of the functions, components, hooks and imports.
export const symbols: CodeSymbol[] = [
  {
    id: "event:noteForm.submit",
    kind: "event",
    name: "NoteForm submit",
    fileId: "frontend/src/components/NoteForm.jsx",
    match: '<form className="note-form" onSubmit={handleSave}>',
    summary:
      "The browser fires `submit` when the user presses Save or Enter in the note form.",
    conceptIds: ["js-event", "html-form"],
  },
  {
    id: "fn:handleSave",
    kind: "function",
    name: "handleSave",
    fileId: "frontend/src/components/NoteForm.jsx",
    match: "async function handleSave(event) {",
    summary:
      "Stops the page reload, sends the new note to the API and clears the form when it is saved.",
    dataHandled: "the title and content typed into the form",
    conceptIds: ["react-controlled-form", "js-async-await"],
  },
  {
    id: "fn:notesApi.createNote",
    kind: "function",
    name: "createNote",
    fileId: "frontend/src/services/notesApi.js",
    match: "export function createNote({ title, content }) {",
    summary: "Asks the API to create a note: `POST /api/notes` with the note.",
    dataHandled: "the new note's title and content",
    conceptIds: ["http-post", "js-module-import-export"],
  },
  {
    id: "fn:request",
    kind: "function",
    name: "request",
    fileId: "frontend/src/services/request.js",
    match: "export async function request(path, { method = ",
    summary:
      "Sends every API request: adds the login cookie and JSON headers, and turns error answers into errors.",
    dataHandled: "the request body as JSON and the response data",
    conceptIds: ["js-fetch", "json", "js-error-handling"],
  },
  {
    id: "external:fetch",
    kind: "external",
    name: "fetch",
    summary: "The browser's built-in function for sending HTTP requests.",
    conceptIds: ["js-fetch"],
  },
  {
    id: "http-request:POST /api/notes",
    kind: "http-request",
    name: "POST /api/notes",
    summary:
      "The HTTP request that travels from the browser to the backend, with the note as JSON and the login cookie.",
    dataHandled: '`{ "title": …, "content": … }` and the `token` cookie',
    conceptIds: ["http-post", "http-request-response"],
  },
  {
    id: "route:POST /api/notes",
    kind: "route",
    name: "POST /api/notes",
    fileId: "backend/src/routes/notes.js",
    match: 'notesRoutes.post("/", notesController.createNote);',
    summary:
      "The backend route that receives the request and hands it to the controller.",
    conceptIds: ["express-route", "rest-endpoint"],
  },
  {
    id: "middleware:requireAuth",
    kind: "middleware",
    name: "requireAuth",
    fileId: "backend/src/middleware/authMiddleware.js",
    match: "export function requireAuth(req, res, next) {",
    summary:
      "Checks the login cookie before every notes route and puts the user in `req.user`, or answers 401.",
    dataHandled: "the `token` cookie and the user id inside it",
    conceptIds: ["express-middleware"],
  },
  {
    id: "controller:notesController.createNote",
    kind: "controller",
    name: "createNote",
    fileId: "backend/src/controllers/notesController.js",
    match: "export async function createNote(req, res) {",
    summary:
      "Validates the note, saves it for the logged-in user and answers 201 with the saved note.",
    dataHandled: "`req.body` in, the saved note row out",
    conceptIds: ["controller", "http-status-codes"],
  },
  {
    id: "fn:validateNote",
    kind: "function",
    name: "validateNote",
    fileId: "backend/src/validation/noteValidation.js",
    match: "export function validateNote(body) {",
    summary:
      "Returns an error message for a missing or too long title or content, or nothing when the note is valid.",
    dataHandled: "the request body",
    conceptIds: ["request-body"],
  },
  {
    id: "query:insertNote",
    kind: "query",
    name: "INSERT INTO notes",
    fileId: "backend/src/controllers/notesController.js",
    match: "`INSERT INTO notes (user_id, title, content)",
    summary:
      "The parameterized SQL that stores the note and returns the saved row.",
    dataHandled: "the user id, title and content",
    conceptIds: ["sql-insert", "parameterized-query"],
  },
  {
    id: "table:notes",
    kind: "table",
    name: "notes",
    fileId: "database/schema.sql",
    match: "CREATE TABLE notes (",
    summary: "One row per note, each belonging to one user.",
    dataHandled: "id, user_id, title, content, created_at, updated_at",
    conceptIds: ["sql-table", "foreign-key"],
  },
];
