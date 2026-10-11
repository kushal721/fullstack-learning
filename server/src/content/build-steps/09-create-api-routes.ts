import type { BuildStep } from "@fsl/shared";

export const createApiRoutesStep: BuildStep = {
  id: "create-api-routes",
  slug: "create-api-routes",
  order: 9,
  title: "Create the API routes",
  goal: "Add the notes routes, the controller that handles them and input validation.",
  why: "Routes decide which URL runs which code, controllers decide what that code does, and validation keeps bad input out. Keeping the three apart means each file has one job and is easy to find.",
  problemSolved:
    "A server that can't list, create, update or delete notes, and would accept any input it is sent.",
  prerequisites: ["create-backend"],
  explanation: [
    'A **REST** API names things with URLs and actions with HTTP methods. The frontend from step 7 already calls the four **endpoints**: `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id` and `DELETE /api/notes/:id`. `:id` is a **route parameter**: for `/api/notes/7`, `req.params.id` is `"7"`.',
    'A **router** (`express.Router()`) groups routes. `app.use("/api/notes", notesRoutes)` mounts it, so the router only writes the rest of the path: `"/"` and `"/:id"`.',
    "A **controller** is a function `(req, res)` that does the work: reads the request (`req.body`, `req.params`), and answers with a **status code** and JSON. 200 means OK, 201 *Created*, 204 *No Content* (success with nothing to send), 400 *Bad Request* (invalid input) and 404 *Not Found*.",
    "**Validation** checks the request body before using it. The frontend checks too, but anyone can send a request with `curl` and skip the browser, so the server must always check. `validateNote` returns an error message or nothing.",
    "For now the controller keeps notes in an array in the server's memory. That lets us test the whole frontend → backend round trip today; step 10 swaps the array for a database without changing the routes.",
  ],
  howToCreate: [
    {
      text: "In the second terminal (in `notes-app/backend`), create folders for routes, controllers and validation.",
      code: {
        language: "bash",
        code: "mkdir src/routes src/controllers src/validation",
      },
    },
    {
      text: "Create `src/validation/noteValidation.js`. A title is required and can be at most 100 characters.",
      code: {
        language: "js",
        code: 'export const MAX_TITLE_LENGTH = 100;\n\n// Returns an error message, or nothing when the note is valid. The browser\n// checks too, but anyone can send a request without the browser, so the\n// server must always check again.\nexport function validateNote(body) {\n  const title = typeof body?.title === "string" ? body.title.trim() : "";\n\n  if (!title) return "Title is required";\n  if (title.length > MAX_TITLE_LENGTH) {\n    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;\n  }\n}',
        fileName: "backend/src/validation/noteValidation.js",
        caption:
          "First version. Step 12 also checks the content's type and length.",
      },
    },
    {
      text: "Create `src/controllers/notesController.js` with one function per endpoint. `noteId` turns the `:id` text into a number and rejects anything that can't be an id.",
      code: {
        language: "js",
        code: 'import { validateNote } from "../validation/noteValidation.js";\n\n// For now the notes live in this array, in the server\'s memory: they are\n// lost whenever the server restarts. Step 10 stores them in PostgreSQL.\nconst notes = [];\nlet nextId = 1;\n\n// Ids in the URL are text. Anything that isn\'t a positive whole number can\'t\n// be a note, so it is "not found" instead of a database error.\nfunction noteId(req) {\n  const id = Number(req.params.id);\n  return Number.isInteger(id) && id > 0 ? id : null;\n}\n\nexport function listNotes(req, res) {\n  // Newest first.\n  res.json([...notes].reverse());\n}\n\nexport function createNote(req, res) {\n  const error = validateNote(req.body);\n  if (error) return res.status(400).json({ error });\n\n  const { title, content = "" } = req.body;\n  const now = new Date().toISOString();\n  const note = {\n    id: nextId++,\n    title: title.trim(),\n    content,\n    created_at: now,\n    updated_at: now,\n  };\n  notes.push(note);\n  res.status(201).json(note);\n}\n\nexport function updateNote(req, res) {\n  const note = notes.find((n) => n.id === noteId(req));\n  if (!note) return res.status(404).json({ error: "Note not found" });\n  const error = validateNote(req.body);\n  if (error) return res.status(400).json({ error });\n\n  const { title, content = "" } = req.body;\n  note.title = title.trim();\n  note.content = content;\n  note.updated_at = new Date().toISOString();\n  res.json(note);\n}\n\nexport function deleteNote(req, res) {\n  const index = notes.findIndex((n) => n.id === noteId(req));\n  if (index === -1) return res.status(404).json({ error: "Note not found" });\n  notes.splice(index, 1);\n  res.status(204).end();\n}',
        fileName: "backend/src/controllers/notesController.js",
        caption:
          "Temporary in-memory version. Step 10 replaces the array with SQL queries.",
      },
    },
    {
      text: "Create `src/routes/notes.js`, connecting each method and path to a controller function.",
      code: {
        language: "js",
        code: 'import express from "express";\nimport * as notesController from "../controllers/notesController.js";\n\n// Which URL runs which controller function.\nexport const notesRoutes = express.Router();\n\nnotesRoutes.get("/", notesController.listNotes);\nnotesRoutes.post("/", notesController.createNote);\nnotesRoutes.put("/:id", notesController.updateNote);\nnotesRoutes.delete("/:id", notesController.deleteNote);',
        fileName: "backend/src/routes/notes.js",
        caption: "Step 11 makes every notes route require a logged-in user.",
      },
    },
    {
      text: "Replace `src/app.js` to mount the notes router under `/api/notes`.",
      code: {
        language: "js",
        code: 'import express from "express";\nimport { notesRoutes } from "./routes/notes.js";\n\n// Builds the Express app without starting it, so tests can send requests\n// to it directly (server.js starts it).\nexport function createApp() {\n  const app = express();\n\n  // Middleware runs in this order for every request.\n  app.use(express.json()); // JSON body → req.body\n\n  app.get("/api/health", (req, res) => res.json({ status: "ok" }));\n  app.use("/api/notes", notesRoutes);\n\n  return app;\n}',
        fileName: "backend/src/app.js",
      },
    },
    {
      text: "Check it with `curl` in the second terminal (the backend in the third terminal restarted by itself when you saved). Create a note, list notes, try an invalid note, update and delete.",
      code: {
        language: "bash",
        code: 'curl -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d \'{"title":"First","content":"Hello"}\'\ncurl http://localhost:3000/api/notes\ncurl -i -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d \'{"title":""}\'\ncurl -X PUT http://localhost:3000/api/notes/1 -H "Content-Type: application/json" -d \'{"title":"First (edited)"}\'\ncurl -i -X DELETE http://localhost:3000/api/notes/1',
        caption:
          'Expected: the new note with `"id":1`; a list containing it; `400` with `{"error":"Title is required"}`; the edited note; `204 No Content`. On Windows PowerShell type `curl.exe` instead of `curl`.',
      },
    },
    {
      text: "Check it in the app: reload the frontend (http://localhost:5173). The error message is gone. Add, edit and delete notes — it all works. Now stop the backend (Ctrl+C) and start it again: the notes are gone, because they only lived in the server's memory.",
    },
  ],
  fromScratch: [
    "List your resources and their endpoints first (method + path + what it returns), using REST names: `GET /things`, `POST /things`, `PUT /things/:id`, `DELETE /things/:id`.",
    "Create `routes/` (which URL runs which function), `controllers/` (what each function does) and `validation/` (checking input), and keep each file to one job.",
    "Validate every request body on the server, even if the frontend validates too, and answer 400 with a clear message.",
    "Use the right status codes: 201 after creating, 204 after deleting, 404 when the id doesn't exist.",
    "Test each endpoint with `curl` (or a tool like Bruno or Postman) before connecting the frontend.",
  ],
  filesCreated: [
    "backend/src/routes/notes.js",
    "backend/src/controllers/notesController.js",
    "backend/src/validation/noteValidation.js",
  ],
  filesModified: ["backend/src/app.js"],
  filesRemoved: [],
  conceptIds: [
    "express-route",
    "controller",
    "rest-endpoint",
    "request-body",
    "http-status-codes",
  ],
  codeExamples: [
    {
      language: "js",
      code: 'notesRoutes.put("/:id", notesController.updateNote);',
      fileName: "backend/src/routes/notes.js",
      caption:
        'Mounted under `/api/notes`, this answers `PUT /api/notes/7` with `req.params.id === "7"`.',
    },
    {
      language: "js",
      code: "const error = validateNote(req.body);\nif (error) return res.status(400).json({ error });",
      fileName: "backend/src/controllers/notesController.js",
      caption:
        "Validate first and stop with 400; only valid input reaches the rest of the function. `return` matters: without it the function carries on.",
    },
  ],
  relationshipIds: [],
  enables:
    "Create, read, update and delete notes through the API, from `curl` and from the real frontend.",
  commonMistakes: [
    'Forgetting `return` before `res.status(400).json(…)`. The function continues, tries to answer a second time and Express throws "Cannot set headers after they are sent".',
    'Writing the full path in the router (`notesRoutes.get("/api/notes", …)`) while also mounting it at `/api/notes`. The route then only answers `/api/notes/api/notes`.',
    'Comparing `req.params.id` (text) with a number id using `===`. `"1" === 1` is false, so nothing is found; convert it with `Number()` first.',
    "Trusting the frontend's checks and skipping server validation. Anyone can send any request with `curl`.",
    "Sending the request body without the `Content-Type: application/json` header. `express.json()` ignores it and `req.body` is empty.",
  ],
  nextStepId: "add-database",
  nextWhy:
    "The notes are kept in the server's memory and lost every time it restarts. Next we store them permanently in a PostgreSQL database.",
};
