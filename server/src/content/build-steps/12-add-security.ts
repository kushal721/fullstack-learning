import type { BuildStep } from "@fsl/shared";

export const addSecurityStep: BuildStep = {
  id: "add-security",
  slug: "add-security",
  order: 12,
  title: "Add security",
  goal: "Make every note query belong to the logged-in user, check all input on the server, keep error details out of responses and use a real secret.",
  why: "Authentication says who you are; **authorization** decides what you may do. Most real attacks don't break the login — they use a valid account to reach data that isn't theirs, or read the details an error message gives away.",
  problemSolved:
    "Any logged-in user can change or delete anyone's note by guessing its id, very long or wrongly typed input reaches the database, and errors send internal details such as stack traces to the browser.",
  prerequisites: ["add-authentication"],
  explanation: [
    "Look at step 11's update query: `WHERE id = $3`. It finds the note by id only. Note ids are just 1, 2, 3…, so a logged-in user can send `PUT /api/notes/1` and change someone else's note. This is called an **IDOR** (insecure direct object reference) and is one of the most common real security bugs.",
    "The fix is **authorization in the query itself**: `WHERE id = $3 AND user_id = $4`. If the note belongs to someone else, no row matches and the answer is **404 Not Found** — the same as for a note that doesn't exist, so nobody can even find out which ids exist.",
    "**Validation** on the server is a security control, not just politeness: the browser's `maxLength` can be skipped with `curl`. The final `validateNote` also checks that `content` is text and at most 10 000 characters, so nobody can fill the database with megabytes per note.",
    "**Safe errors:** without our own error handler, Express answers an unexpected error with its default page — in development that includes the stack trace: file paths, line numbers and library names that help an attacker. The final error handler logs the details on the server and sends only `Something went wrong` (or `Invalid JSON` for a broken request body). Express 5 also sends errors from `async` functions there.",
    "**Secrets:** `JWT_SECRET` is the key to every account — whoever knows it can create a token for any user. It lives only in the environment (never in code or git), and must be long and random. The example value from `.env.example` must never be used for real.",
    "Defence in depth: parameterized queries (step 10) stop SQL injection, React's escaping (step 4) stops XSS, httpOnly cookies (step 11) protect the token, and now authorization and validation protect the data. Each layer covers mistakes in the others.",
  ],
  howToCreate: [
    {
      text: "First see the hole for yourself. In the second terminal, go back to the backend folder.",
      code: {
        language: "bash",
        code: "cd ../backend",
      },
    },
    {
      text: "Register and log in as a second user, *mallory*, saving the login cookie in `cookies.txt`, then try to change note 1 — the demo user's *Welcome* note.",
      code: {
        language: "bash",
        code: 'curl -c cookies.txt -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d \'{"email":"mallory@example.com","password":"mallory-password"}\'\ncurl -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"mallory@example.com","password":"mallory-password"}\'\ncurl -b cookies.txt -X PUT http://localhost:3000/api/notes/1 -H "Content-Type: application/json" -d \'{"title":"Hacked"}\'',
        caption:
          "Expected (the hole): the last command answers with the demo user's note, now titled \"Hacked\". Mallory just edited someone else's note. On Windows PowerShell use `curl.exe`.",
      },
    },
    {
      text: "See the unsafe error page too: send a broken JSON body.",
      code: {
        language: "bash",
        code: "curl -i -b cookies.txt -X POST http://localhost:3000/api/notes -H \"Content-Type: application/json\" -d '{broken'",
        caption:
          "Expected: `400 Bad Request` with an HTML page. In development it shows the stack trace: file paths inside `node_modules` and line numbers.",
      },
    },
    {
      text: "Fix authorization: replace `src/controllers/notesController.js`. Update and delete now include `AND user_id = $n`, so they only match the logged-in user's own notes.",
      code: {
        language: "js",
        code: 'import { pool } from "../db.js";\nimport { validateNote } from "../validation/noteValidation.js";\n\n// Every query includes `user_id = $n` with the logged-in user\'s id, so a\n// user can only ever see or change their own notes (authorization).\n// Values are always passed separately ($1, $2…), never glued into the SQL,\n// so user input can never change the query (no SQL injection).\n\n// Ids in the URL are text. Anything that isn\'t a positive whole number can\'t\n// be a note, so it is "not found" instead of a database error.\nfunction noteId(req) {\n  const id = Number(req.params.id);\n  return Number.isInteger(id) && id > 0 ? id : null;\n}\n\nexport async function listNotes(req, res) {\n  const result = await pool.query(\n    `SELECT id, title, content, created_at, updated_at\n       FROM notes\n      WHERE user_id = $1\n      ORDER BY created_at DESC`,\n    [req.user.id],\n  );\n  res.json(result.rows);\n}\n\nexport async function createNote(req, res) {\n  const error = validateNote(req.body);\n  if (error) return res.status(400).json({ error });\n\n  const { title, content = "" } = req.body;\n  const result = await pool.query(\n    `INSERT INTO notes (user_id, title, content)\n     VALUES ($1, $2, $3)\n     RETURNING id, title, content, created_at, updated_at`,\n    [req.user.id, title.trim(), content],\n  );\n  res.status(201).json(result.rows[0]);\n}\n\nexport async function updateNote(req, res) {\n  const id = noteId(req);\n  if (!id) return res.status(404).json({ error: "Note not found" });\n  const error = validateNote(req.body);\n  if (error) return res.status(400).json({ error });\n\n  const { title, content = "" } = req.body;\n  const result = await pool.query(\n    `UPDATE notes\n        SET title = $1, content = $2, updated_at = now()\n      WHERE id = $3 AND user_id = $4\n      RETURNING id, title, content, created_at, updated_at`,\n    [title.trim(), content, id, req.user.id],\n  );\n  // No row: the note doesn\'t exist, or it belongs to someone else. Both get\n  // the same answer, so nobody can find out which note ids exist.\n  if (result.rowCount === 0) {\n    return res.status(404).json({ error: "Note not found" });\n  }\n  res.json(result.rows[0]);\n}\n\nexport async function deleteNote(req, res) {\n  const id = noteId(req);\n  if (!id) return res.status(404).json({ error: "Note not found" });\n  const result = await pool.query(\n    "DELETE FROM notes WHERE id = $1 AND user_id = $2",\n    [id, req.user.id],\n  );\n  if (result.rowCount === 0) {\n    return res.status(404).json({ error: "Note not found" });\n  }\n  res.status(204).end();\n}',
        fileName: "backend/src/controllers/notesController.js",
        caption:
          "Final version. The comment at the top explains both rules every query follows.",
      },
    },
    {
      text: "Validate content too: replace `src/validation/noteValidation.js`.",
      code: {
        language: "js",
        code: 'export const MAX_TITLE_LENGTH = 100;\nexport const MAX_CONTENT_LENGTH = 10000;\n\n// Returns an error message, or nothing when the note is valid. The browser\n// checks too, but anyone can send a request without the browser, so the\n// server must always check again.\nexport function validateNote(body) {\n  const title = typeof body?.title === "string" ? body.title.trim() : "";\n  const content = body?.content ?? "";\n\n  if (!title) return "Title is required";\n  if (title.length > MAX_TITLE_LENGTH) {\n    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;\n  }\n  if (typeof content !== "string") return "Content must be text";\n  if (content.length > MAX_CONTENT_LENGTH) {\n    return `Content must be at most ${MAX_CONTENT_LENGTH} characters`;\n  }\n}',
        fileName: "backend/src/validation/noteValidation.js",
        caption: "Final version.",
      },
    },
    {
      text: "Add the error handler at the end of `createApp()` in `src/app.js`, just before `return app;`. It must come after all routes, and its four parameters `(err, req, res, next)` tell Express it handles errors.",
      code: {
        language: "js",
        code: 'import cookieParser from "cookie-parser";\nimport express from "express";\nimport { authRoutes } from "./routes/auth.js";\nimport { notesRoutes } from "./routes/notes.js";\n\n// Builds the Express app without starting it, so tests can send requests\n// to it directly (server.js starts it).\nexport function createApp() {\n  const app = express();\n\n  // Middleware runs in this order for every request.\n  app.use(express.json()); // JSON body → req.body\n  app.use(cookieParser()); // Cookie header → req.cookies\n\n  app.get("/api/health", (req, res) => res.json({ status: "ok" }));\n  app.use("/api/auth", authRoutes);\n  app.use("/api/notes", notesRoutes);\n\n  // Last: any error thrown in a route ends up here (Express 5 also catches\n  // errors from async functions). Log the details, tell the user less.\n  app.use((err, req, res, next) => {\n    console.error(err);\n    if (res.headersSent) return next(err);\n    // express.json() reports bad JSON as a 400 error.\n    if (err.status === 400) {\n      return res.status(400).json({ error: "Invalid JSON" });\n    }\n    res.status(500).json({ error: "Something went wrong" });\n  });\n\n  return app;\n}',
        fileName: "backend/src/app.js",
        caption: "Final version of the whole file.",
      },
    },
    {
      text: "Replace the example secret in your `.env` with a long random one. This command prints 64 random hexadecimal characters; paste them as the value of `JWT_SECRET` in `.env` (not in `.env.example`).",
      code: {
        language: "bash",
        code: "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
        caption:
          "Then restart the backend in the third terminal. Everyone has to log in again, because tokens signed with the old secret are no longer valid — that is also how you log everybody out after a leak.",
      },
    },
    {
      text: "Check the fix: log in as mallory again (the old token stopped working with the new secret) and repeat the attack.",
      code: {
        language: "bash",
        code: 'curl -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"mallory@example.com","password":"mallory-password"}\'\ncurl -i -b cookies.txt -X PUT http://localhost:3000/api/notes/1 -H "Content-Type: application/json" -d \'{"title":"Hacked again"}\'\ncurl -i -b cookies.txt -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d \'{broken\'',
        caption:
          'Expected: the PUT now answers `404` with `{"error":"Note not found"}`, and the broken JSON answers `400` with only `{"error":"Invalid JSON"}` — the details appear in the backend\'s terminal instead.',
      },
    },
    {
      text: "Clean up: `cookies.txt` contains a login token, so delete it. In the app, log in as the demo user and rename the *Hacked* note back if you like.",
      code: {
        language: "bash",
        code: "rm cookies.txt",
      },
    },
  ],
  fromScratch: [
    "Put the owner check in every query that reads or changes a user's data (`WHERE id = $1 AND user_id = $2`), and answer 404 when nothing matches.",
    "Validate type and length of every field on the server, whatever the frontend does.",
    "Add one error-handling middleware last in the app: log the error, send a generic message, and never send stack traces or SQL errors to the client.",
    "Generate secrets randomly (`crypto.randomBytes`), keep them only in environment variables, and use different ones for development and production.",
    "Try to break your own app: log in as a second user and request the first user's ids with `curl`.",
  ],
  filesCreated: [],
  filesModified: [
    "backend/src/controllers/notesController.js",
    "backend/src/validation/noteValidation.js",
    "backend/src/app.js",
  ],
  filesRemoved: [],
  conceptIds: [
    "parameterized-query",
    "sql-update-delete",
    "js-error-handling",
    "environment-config",
    "http-status-codes",
  ],
  codeExamples: [
    {
      language: "sql",
      code: "UPDATE notes\n   SET title = $1, content = $2, updated_at = now()\n WHERE id = $3 AND user_id = $4",
      fileName: "backend/src/controllers/notesController.js",
      caption:
        "Authorization in the query: someone else's note simply doesn't match.",
    },
    {
      language: "js",
      code: '  // Last: any error thrown in a route ends up here (Express 5 also catches\n  // errors from async functions). Log the details, tell the user less.\n  app.use((err, req, res, next) => {\n    console.error(err);\n    if (res.headersSent) return next(err);\n    // express.json() reports bad JSON as a 400 error.\n    if (err.status === 400) {\n      return res.status(400).json({ error: "Invalid JSON" });\n    }\n    res.status(500).json({ error: "Something went wrong" });\n  });',
      fileName: "backend/src/app.js",
      caption:
        "Details go to the server's log; the user gets a short, safe message.",
    },
  ],
  flowIds: ["update-note-authorized"],
  relationshipIds: [],
  enables:
    "Trust that each user only ever sees and changes their own notes, that bad input is rejected and that errors reveal nothing internal.",
  commonMistakes: [
    "Checking ownership only when reading but not when updating or deleting. Every query that touches a user's data needs `AND user_id = …`.",
    "Answering 403 *Forbidden* for someone else's note. It confirms the note exists; 404 reveals nothing.",
    "Sending `err.message` or `err.stack` to the client. Database errors can contain table names and query text; log them, don't send them.",
    "Putting the error handler before the routes, or giving it fewer than four parameters. Express then never uses it as an error handler.",
    "Committing a real `JWT_SECRET`, or keeping the example value in production. Anyone who knows it can log in as any user.",
  ],
  nextStepId: "test",
  nextWhy:
    "The app works and is safe — today. Next we add automated tests, so a future change can't quietly break it or reopen these holes.",
};
