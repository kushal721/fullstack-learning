import type { Flow } from "@fsl/shared";
import { httpExchanges } from "./http-exchanges.js";

// Creating a note, from the Save click to the database and back onto the
// screen, with the HTTP exchange of POST /api/notes.
export const createNoteFlow: Flow = {
  id: "create-note",
  title: "Create a note",
  summary:
    "Follow a new note from the Save button, through the API and the database, and back onto the screen.",
  group: "request",
  direction: "round-trip",
  http: httpExchanges["http-request:POST /api/notes"],
  steps: [
    // Frontend: from the user's click to the request leaving the browser.
    {
      id: "type-note",
      symbolId: "component:NoteForm",
      layer: "user",
      title: "The user types a note",
      explanation:
        "The title and content fields are controlled inputs: every keystroke calls `setTitle` or `setContent`, so React state always holds exactly what is on screen. That is why `handleSave` can read the note later without looking at the page.",
      dataShape: {
        language: "jsx",
        code: '// NoteForm\'s state after typing\nconst [title, setTitle] = useState("");     // "Shopping"\nconst [content, setContent] = useState(""); // "Milk, bread"',
        fileName: "frontend/src/components/NoteForm.jsx",
        caption: "The values live in React state, not in the input elements.",
      },
    },
    {
      id: "click-save",
      symbolId: "component:Button",
      layer: "user",
      title: "The user clicks Save",
      explanation:
        'Save is the reusable Button with `type="submit"`. A submit button inside a `<form>` doesn\'t run code itself: clicking it (or pressing Enter in a field) asks the browser to submit the form.',
      relationshipId: "component:NoteForm->renders->component:Button",
      dataShape: {
        language: "jsx",
        code: '<Button type="submit" disabled={isSaving}>\n  {isSaving ? "Saving…" : "Save"}\n</Button>',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "submit-event",
      symbolId: "event:noteForm.submit",
      layer: "frontend",
      title: "The browser fires a submit event",
      explanation:
        "The browser creates a `submit` event for the form. Left alone, it would reload the page and send the form the old-fashioned way; React hands the event to the function given as `onSubmit` so our code can decide what happens instead.",
      relationshipId: "component:Button->sends->event:noteForm.submit",
      dataShape: {
        language: "jsx",
        code: '<form className="note-form" onSubmit={handleSave}>',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "handle-save",
      symbolId: "fn:handleSave",
      layer: "frontend",
      title: "handleSave takes over",
      explanation:
        "`event.preventDefault()` stops the page reload, so the app keeps its state. Then `handleSave` marks the form as saving (the button shows Saving… and can't be pressed twice) and clears any old error before calling the API.",
      relationshipId: "fn:handleSave->handles->event:noteForm.submit",
      dataShape: {
        language: "js",
        code: '// NoteForm state while saving\n{ title: "Shopping", content: "Milk, bread", isSaving: true, error: null }',
        caption: "`isSaving` is now `true`, so the Save button is disabled.",
      },
    },
    {
      id: "create-note",
      symbolId: "fn:notesApi.createNote",
      layer: "frontend",
      title: "createNote is called with the note",
      explanation:
        "The component doesn't build HTTP requests itself: it calls `createNote` from the notes service and waits for the result with `await`. Only the service knows the URL and the method.",
      relationshipId: "fn:handleSave->calls->fn:notesApi.createNote",
      dataShape: {
        language: "js",
        code: 'const note = await createNote({ title: "Shopping", content: "Milk, bread" });',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "request",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() prepares the HTTP request",
      explanation:
        "`createNote` passes the path, method and body to the shared `request` function, which every API call uses. Writing this once means every request sends the login cookie and JSON in exactly the same way.",
      relationshipId: "fn:notesApi.createNote->calls->fn:request",
      dataShape: {
        language: "js",
        code: 'request("/api/notes", {\n  method: "POST",\n  body: { title: "Shopping", content: "Milk, bread" },\n});',
        fileName: "frontend/src/services/notesApi.js",
      },
    },
    {
      id: "fetch",
      symbolId: "external:fetch",
      layer: "frontend",
      title: "fetch sends it from the browser",
      explanation:
        '`request` turns the object into JSON text with `JSON.stringify`, says so with the `Content-Type` header, and asks the browser to include the login cookie (`credentials: "include"`). `fetch` is the browser\'s built-in way to send it.',
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'fetch("/api/notes", {\n  method: "POST",\n  credentials: "include",\n  headers: { "Content-Type": "application/json" },\n  body: \'{"title":"Shopping","content":"Milk, bread"}\',\n});',
        caption:
          "The body is now text: HTTP carries strings, not JavaScript objects.",
      },
    },
    {
      id: "http-request",
      symbolId: "http-request:POST /api/notes",
      layer: "network",
      title: "The HTTP request travels to the backend",
      explanation:
        "The browser sends the request over the network, adding the `token` cookie it stored at login. In development Vite receives it on port 5173 and forwards everything under `/api` to the Express backend on port 3000.",
      relationshipId: "external:fetch->sends->http-request:POST /api/notes",
      dataShape: {
        language: "http",
        code: 'POST /api/notes HTTP/1.1\nHost: localhost:5173\nContent-Type: application/json\nCookie: token=eyJhbGciOiJIUzI1NiIs…\n\n{"title":"Shopping","content":"Milk, bread"}',
        caption: "Method and path, headers, a blank line, then the body.",
      },
    },
    // Backend: from the request arriving to the input being checked.
    {
      id: "parse-json",
      symbolId: "middleware:express.json",
      layer: "backend",
      title: "express.json reads the body",
      explanation:
        "Before any route runs, `app.use(express.json())` reads the request body. It arrives as text; because the `Content-Type` header says JSON, `express.json` parses it into an object and puts it in `req.body`. Without it, `req.body` would be `undefined`.",
      dataShape: {
        language: "js",
        code: '// before: the body is text\n\'{"title":"Shopping","content":"Milk, bread"}\'\n\n// after: req.body is an object\nreq.body = { title: "Shopping", content: "Milk, bread" };',
        fileName: "backend/src/app.js",
      },
    },
    {
      id: "parse-cookies",
      symbolId: "middleware:cookieParser",
      layer: "backend",
      title: "cookieParser reads the login cookie",
      explanation:
        "Next, `cookieParser()` turns the `Cookie` header into an object in `req.cookies`, so the login check further on can find the token by name instead of picking the header apart.",
      dataShape: {
        language: "js",
        code: '// header: Cookie: token=eyJhbGciOiJIUzI1NiIs…\nreq.cookies = { token: "eyJhbGciOiJIUzI1NiIs…" };',
        fileName: "backend/src/app.js",
      },
    },
    {
      id: "match-route",
      symbolId: "route:POST /api/notes",
      layer: "backend",
      title: "Express matches the route",
      explanation:
        'Express compares the method and path with its routes. The notes router is mounted at `/api/notes`, and inside it `notesRoutes.post("/", …)` matches `POST` on the router\'s root, so this route handles the request.',
      relationshipId:
        "route:POST /api/notes->receives->http-request:POST /api/notes",
      dataShape: {
        language: "js",
        code: 'app.use("/api/notes", notesRoutes);                 // app.js\nnotesRoutes.post("/", notesController.createNote); // routes/notes.js',
        caption: "Mount path + route path = POST /api/notes.",
      },
    },
    {
      id: "require-auth",
      symbolId: "middleware:requireAuth",
      layer: "backend",
      title: "requireAuth checks who is asking",
      explanation:
        "Every notes route runs `requireAuth` first. It verifies the token's signature and expiry with `JWT_SECRET`; if that works it puts the user's id in `req.user` and calls `next()`. If the cookie is missing, forged or expired, it answers `401` right here and the controller never runs.",
      relationshipId: "route:POST /api/notes->uses->middleware:requireAuth",
      dataShape: {
        language: "js",
        code: 'jwt.verify(req.cookies.token, process.env.JWT_SECRET);\n// → { sub: 1, iat: 1760000000, exp: 1760604800 }\nreq.user = { id: 1 };\n\n// no valid token instead:\n// 401 { "error": "Please log in" }',
        fileName: "backend/src/middleware/authMiddleware.js",
      },
    },
    {
      id: "controller",
      symbolId: "controller:notesController.createNote",
      layer: "backend",
      title: "The controller receives the request",
      explanation:
        "Now `createNote(req, res)` runs with everything prepared by the steps before: the note in `req.body` and the logged-in user in `req.user`. The user id comes from the verified token, never from the body, so nobody can create notes for someone else.",
      relationshipId:
        "route:POST /api/notes->calls->controller:notesController.createNote",
      dataShape: {
        language: "js",
        code: 'req.body = { title: "Shopping", content: "Milk, bread" };\nreq.user = { id: 1 };',
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "validate",
      symbolId: "fn:validateNote",
      layer: "backend",
      title: "validateNote checks the input",
      explanation:
        "The browser checked the form too, but anyone can send a request without it, so the server checks again. `validateNote` returns nothing for a valid note and the controller carries on. For an invalid one it returns a message, and the controller answers `400` with it at once, so bad input never reaches the database.",
      relationshipId:
        "controller:notesController.createNote->calls->fn:validateNote",
      dataShape: {
        language: "js",
        code: 'validateNote({ title: "Shopping", content: "Milk, bread" }); // → undefined: carry on\n\nvalidateNote({ title: "" }); // → "Title is required"\n// the controller answers:\nres.status(400).json({ error: "Title is required" });',
        fileName: "backend/src/validation/noteValidation.js",
      },
    },
    // Database: the INSERT, the stored row and what PostgreSQL returns.
    {
      id: "insert-query",
      symbolId: "query:insertNote",
      layer: "backend",
      title: "The controller runs a parameterized INSERT",
      explanation:
        "The controller sends one SQL statement to PostgreSQL through the shared connection pool. The SQL text only has placeholders (`$1`, `$2`, `$3`); the values travel separately in an array, so a title like `'); DROP TABLE notes; --` is stored as plain text and can never change the query.",
      relationshipId:
        "controller:notesController.createNote->calls->query:insertNote",
      dataShape: {
        language: "js",
        code: 'await pool.query(\n  `INSERT INTO notes (user_id, title, content)\n   VALUES ($1, $2, $3)\n   RETURNING id, title, content, created_at, updated_at`,\n  [1, "Shopping", "Milk, bread"], // req.user.id, title.trim(), content\n);',
        fileName: "backend/src/controllers/notesController.js",
        caption:
          '$1 is filled with 1, $2 with "Shopping", $3 with "Milk, bread".',
      },
    },
    {
      id: "store-row",
      symbolId: "table:notes",
      layer: "database",
      title: "PostgreSQL stores a new row",
      explanation:
        "PostgreSQL adds one row to the `notes` table and fills in what the app didn't send: the next `id` and the times (`DEFAULT now()`). Its `user_id` must be the `id` of an existing user (a foreign key), so the database itself refuses a note that belongs to nobody. One statement is its own transaction: the row is saved completely or not at all.",
      relationshipId: "query:insertNote->queries->table:notes",
      dataShape: {
        language: "sql",
        code: "-- users                          notes\n-- id | email                     id | user_id | title    | content\n-- 1  | demo@example.com   <──    7  | 1       | Shopping | Milk, bread\n\nuser_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE",
        fileName: "database/schema.sql",
        caption:
          "One user has many notes: each note's user_id points at its user's id.",
      },
    },
    {
      id: "returning",
      symbolId: "query:insertNote",
      layer: "database",
      title: "RETURNING sends the saved row back",
      explanation:
        "Because the INSERT ends with `RETURNING`, PostgreSQL answers with the row it just wrote, including the `id` and times it created. The `pg` library turns it into a JavaScript object in `result.rows`, so the controller can answer without a second query.",
      relationshipId: "query:insertNote->queries->table:notes",
      dataShape: {
        language: "js",
        code: 'result.rows[0] = {\n  id: 7,\n  title: "Shopping",\n  content: "Milk, bread",\n  created_at: 2026-10-12T09:30:00.000Z, // a Date\n  updated_at: 2026-10-12T09:30:00.000Z,\n};',
        caption: "user_id isn't returned: the frontend doesn't need it.",
      },
    },
    // Response: from the saved row back to the new card on screen.
    {
      id: "answer",
      symbolId: "controller:notesController.createNote",
      layer: "backend",
      title: "The controller answers 201 Created",
      explanation:
        'The note is saved, so the controller answers `201 Created` ("something new was made") with the saved row. `res.json` turns the object into JSON text; the `Date` times become ISO strings because JSON has no date type.',
      relationshipId:
        "controller:notesController.createNote->returns->http-request:POST /api/notes",
      dataShape: {
        language: "js",
        code: 'res.status(201).json(result.rows[0]);\n// sends: {"id":7,"title":"Shopping","content":"Milk, bread","created_at":"2026-10-12T09:30:00.000Z","updated_at":"2026-10-12T09:30:00.000Z"}',
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "http-response",
      symbolId: "http-request:POST /api/notes",
      layer: "network",
      title: "The HTTP response travels back",
      explanation:
        "The answer goes back the way the request came: from Express, through the Vite proxy in development, to the browser that is still waiting for it.",
      dataShape: {
        language: "http",
        code: 'HTTP/1.1 201 Created\nContent-Type: application/json; charset=utf-8\n\n{"id":7,"title":"Shopping","content":"Milk, bread","created_at":"2026-10-12T09:30:00.000Z","updated_at":"2026-10-12T09:30:00.000Z"}',
        caption: "Status line, headers, a blank line, then the JSON body.",
      },
    },
    {
      id: "read-response",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() reads the answer",
      explanation:
        "`fetch` resolves with the response. `request` turns the JSON text back into an object with `response.json()`, checks `response.ok` (true for 201) and returns the note. For a 400 or 401 it would throw an `Error` with the server's message instead.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'const data = await response.json();\n// response.ok is true for 201, so request() returns:\n{\n  id: 7,\n  title: "Shopping",\n  content: "Milk, bread",\n  created_at: "2026-10-12T09:30:00.000Z",\n  updated_at: "2026-10-12T09:30:00.000Z",\n}',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "note-saved",
      symbolId: "fn:handleSave",
      layer: "frontend",
      title: "handleSave gets the saved note",
      explanation:
        "`await createNote(…)` now has a value: the note as the server stored it, with its real `id`. `handleSave` passes it up with `onSaved(note)`, empties both fields, and in `finally` sets `isSaving` back to `false` so Save works again.",
      relationshipId: "fn:handleSave->calls->fn:notesApi.createNote",
      dataShape: {
        language: "js",
        code: 'const note = await createNote({ title, content }); // { id: 7, title: "Shopping", … }\nonSaved(note);\nsetTitle("");\nsetContent("");',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "add-note",
      symbolId: "fn:useNotes.addNote",
      layer: "frontend",
      title: "addNote puts it first in the list",
      explanation:
        "`onSaved` is `addNote` from `useNotes`. It builds a new array with the saved note first, because React only re-renders when state gets a new value, never when an array is changed in place.",
      relationshipId: "fn:handleSave->calls->fn:useNotes.addNote",
      dataShape: {
        language: "js",
        code: 'setNotes((current) => [note, ...current]);\n// notes: [{ id: 7, title: "Shopping", … }, { id: 2, … }, { id: 1, … }]',
        fileName: "frontend/src/hooks/useNotes.js",
      },
    },
    {
      id: "state-changes",
      symbolId: "hook:useNotes",
      layer: "frontend",
      title: "useNotes' state changes",
      explanation:
        "The notes array lives in `useNotes`' state. Setting it to a new array tells React that the component using the hook, the Dashboard, must render again with the new list.",
      relationshipId: "hook:useNotes->returns->fn:useNotes.addNote",
      dataShape: {
        language: "js",
        code: "const [notes, setNotes] = useState([]); // now three notes",
        fileName: "frontend/src/hooks/useNotes.js",
      },
    },
    {
      id: "dashboard-renders",
      symbolId: "component:Dashboard",
      layer: "frontend",
      title: "The Dashboard renders again",
      explanation:
        "React calls `Dashboard` again. It gets the new `notes` from `useNotes` and maps them to cards; the `key` lets React see that only one card is new, so it adds just that one instead of rebuilding the list.",
      relationshipId: "component:Dashboard->uses->hook:useNotes",
      dataShape: {
        language: "jsx",
        code: "{notes.map((note) => (\n  <NoteCard key={note.id} note={note} onUpdated={replaceNote} onDelete={removeNote} />\n))}",
        fileName: "frontend/src/pages/Dashboard.jsx",
      },
    },
    {
      id: "card-appears",
      symbolId: "component:NoteCard",
      layer: "user",
      title: "The new card appears",
      explanation:
        "The new NoteCard shows the title and content at the top of the list, and the form is empty and ready again. No page reload happened: only the changed part of the screen was updated.",
      relationshipId: "component:Dashboard->renders->component:NoteCard",
      dataShape: {
        language: "jsx",
        code: '<article className="note-card">\n  <h2>Shopping</h2>\n  <p>Milk, bread</p>\n</article>',
        fileName: "frontend/src/components/NoteCard.jsx",
      },
    },
  ],
};
