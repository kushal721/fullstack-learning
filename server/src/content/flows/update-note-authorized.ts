import type { Flow } from "@fsl/shared";
import { httpExchanges } from "./http-exchanges.js";

// Editing a note, told as an authorization story: who is asking (401), may
// they change this note (404), and why the SQL itself makes that decision.
export const updateNoteAuthorizedFlow: Flow = {
  id: "update-note-authorized",
  title: "Change only your own note",
  summary:
    "Follow an edit through the login check and the ownership check, and see why `WHERE id = … AND user_id = …` keeps every user's notes their own.",
  group: "security",
  direction: "round-trip",
  http: httpExchanges["http-request:PUT /api/notes/:id"],
  steps: [
    // Frontend: the edit leaves the browser with the note id in the URL.
    {
      id: "edit-note",
      symbolId: "component:NoteCard",
      layer: "user",
      title: "The user edits one of their notes",
      explanation:
        "The user presses Edit on a card, changes the text and presses Save. The card knows the note's `id` because the server sent it in the list of this user's notes. Only the user's own notes have an Edit button, but that is convenience, not security: the server never relies on it.",
      dataShape: {
        language: "jsx",
        code: '// NoteCard, editing note 7\nnote = { id: 7, title: "Shopping", content: "Milk, bread" };\nconst [content, setContent] = useState(note.content); // "Milk, bread, eggs"',
        fileName: "frontend/src/components/NoteCard.jsx",
      },
    },
    {
      id: "submit",
      symbolId: "event:noteCard.submit",
      layer: "frontend",
      title: "The edit form is submitted",
      explanation:
        "Pressing Save submits the card's edit form, and React calls the `onSubmit` handler instead of reloading the page.",
      dataShape: {
        language: "jsx",
        code: "<form onSubmit={handleUpdate}>",
        fileName: "frontend/src/components/NoteCard.jsx",
      },
    },
    {
      id: "handle-update",
      symbolId: "fn:noteCard.handleUpdate",
      layer: "frontend",
      title: "handleUpdate sends the change",
      explanation:
        "`handleUpdate` stops the page reload and calls `updateNote` with the note's id and the new text. It sends no user id: who is asking is decided on the server, from the login cookie.",
      relationshipId:
        "fn:noteCard.handleUpdate->handles->event:noteCard.submit",
      dataShape: {
        language: "js",
        code: 'event.preventDefault();\nconst updated = await updateNote(note.id, { title, content });\n// updateNote(7, { title: "Shopping", content: "Milk, bread, eggs" })',
        fileName: "frontend/src/components/NoteCard.jsx",
      },
    },
    {
      id: "update-note",
      symbolId: "fn:notesApi.updateNote",
      layer: "frontend",
      title: "updateNote puts the id in the URL",
      explanation:
        "The note id becomes part of the path. Anything in a request can be changed by whoever sends it: with the browser's developer tools or `curl`, anyone can send `PUT /api/notes/8` instead of 7. That is why the server has to check every request.",
      relationshipId: "fn:noteCard.handleUpdate->calls->fn:notesApi.updateNote",
      dataShape: {
        language: "js",
        code: 'request(`/api/notes/${id}`, { method: "PUT", body: { title, content } });\n// → request("/api/notes/7", { method: "PUT", body: { … } })',
        fileName: "frontend/src/services/notesApi.js",
      },
    },
    {
      id: "request",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() prepares the HTTP request",
      explanation:
        'The shared `request` function turns the body into JSON and sets `credentials: "include"`, so the browser sends the login cookie with the request.',
      relationshipId: "fn:notesApi.updateNote->calls->fn:request",
      dataShape: {
        language: "js",
        code: 'fetch("/api/notes/7", {\n  method: "PUT",\n  credentials: "include",\n  headers: { "Content-Type": "application/json" },\n  body: \'{"title":"Shopping","content":"Milk, bread, eggs"}\',\n});',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "fetch",
      symbolId: "external:fetch",
      layer: "frontend",
      title: "fetch sends it with the login cookie",
      explanation:
        "The browser adds the `token` cookie it stored at login. Page JavaScript can't read it (it is httpOnly), but the browser still sends it to the site that set it.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: "// The cookie jar for localhost (not readable by page JavaScript)\ntoken=eyJhbGciOiJIUzI1NiIs…; HttpOnly; SameSite=Lax",
      },
    },
    {
      id: "http-request",
      symbolId: "http-request:PUT /api/notes/:id",
      layer: "network",
      title: "The PUT request travels to the backend",
      explanation:
        "The request carries two things the server will check: the cookie says who is asking, the path says which note. The body only says what the new text is.",
      relationshipId: "external:fetch->sends->http-request:PUT /api/notes/:id",
      dataShape: {
        language: "http",
        code: 'PUT /api/notes/7 HTTP/1.1\nHost: localhost:5173\nContent-Type: application/json\nCookie: token=eyJhbGciOiJIUzI1NiIs…\n\n{"title":"Shopping","content":"Milk, bread, eggs"}',
        caption: "Who: the cookie. Which note: the path. What: the body.",
      },
    },
    // Backend: authentication (who is asking?) before anything else.
    {
      id: "parse-cookies",
      symbolId: "middleware:cookieParser",
      layer: "backend",
      title: "cookieParser reads the cookie",
      explanation:
        "`express.json()` reads the body first, then `cookieParser()` turns the `Cookie` header into `req.cookies`, where the login check finds the token.",
      dataShape: {
        language: "js",
        code: 'req.cookies = { token: "eyJhbGciOiJIUzI1NiIs…" };',
        fileName: "backend/src/app.js",
      },
    },
    {
      id: "match-route",
      symbolId: "route:PUT /api/notes/:id",
      layer: "backend",
      title: "Express matches PUT /api/notes/:id",
      explanation:
        "`:id` in the route path is a parameter: Express puts whatever is in that part of the URL into `req.params.id`, as text. It is just what the client asked for, nothing has been checked yet.",
      relationshipId:
        "route:PUT /api/notes/:id->receives->http-request:PUT /api/notes/:id",
      dataShape: {
        language: "js",
        code: 'notesRoutes.put("/:id", notesController.updateNote);\n// PUT /api/notes/7 → req.params = { id: "7" }',
        fileName: "backend/src/routes/notes.js",
      },
    },
    {
      id: "who-is-asking",
      symbolId: "middleware:requireAuth",
      layer: "backend",
      title: "Who is the user? requireAuth runs first",
      protects: {
        risk: "A new route added later could forget to check the login, leaving its notes open to anyone.",
        defence:
          "`notesRoutes.use(requireAuth)` puts the check in front of every notes route at once, including ones added later.",
      },
      explanation:
        "`notesRoutes.use(requireAuth)` puts the login check in front of every notes route, so no notes controller can be reached without it, and nobody can forget to add it to a new route. Its job is authentication: finding out who is asking.",
      relationshipId: "route:PUT /api/notes/:id->uses->middleware:requireAuth",
      dataShape: {
        language: "js",
        code: 'notesRoutes.use(requireAuth); // runs before every route below\n\nconst token = req.cookies.token; // "eyJhbGciOiJIUzI1NiIs…" or undefined',
        fileName: "backend/src/middleware/authMiddleware.js",
      },
    },
    {
      id: "verify-token",
      symbolId: "external:jsonwebtoken",
      layer: "backend",
      title: "Authenticated? jwt.verify checks the token",
      protects: {
        risk: "Someone sends a token they edited to say `sub: 2`, or an old one they found, to act as another user.",
        defence:
          "`jwt.verify` rejects any token whose signature doesn't match or that has expired, and the request stops with 401.",
      },
      explanation:
        "`jwt.verify` recomputes the token's signature with `JWT_SECRET`, which only the server knows, and checks the expiry date. A missing cookie, a token someone edited (say, to `sub: 2`) or an old one all throw, and `requireAuth` answers `401 Please log in`. The controller never runs.",
      relationshipId: "middleware:requireAuth->calls->external:jsonwebtoken",
      dataShape: {
        language: "js",
        code: 'jwt.verify(token, process.env.JWT_SECRET);\n// valid   → { sub: 1, iat: 1760000000, exp: 1760604800 }\n// missing → throws "jwt must be provided"\n// edited  → throws "invalid signature"\n// old     → throws "jwt expired"\n// any throw → res.status(401).json({ error: "Please log in" })',
        fileName: "backend/src/middleware/authMiddleware.js",
      },
    },
    {
      id: "set-user",
      symbolId: "middleware:requireAuth",
      layer: "backend",
      title: "req.user says who is asking",
      protects: {
        risk: "Taking the user id from the URL or the body would let anyone act as any user just by typing a different number.",
        defence:
          "The backend uses only `req.user`, which comes from the verified token.",
      },
      explanation:
        "The token is genuine, so its `sub` (subject) is the user's id. `requireAuth` stores it in `req.user` and calls `next()`. From here on the backend trusts only `req.user` for the user's identity, never an id from the URL or the body.",
      relationshipId: "middleware:requireAuth->calls->external:jsonwebtoken",
      dataShape: {
        language: "js",
        code: "req.user = { id: payload.sub }; // { id: 1 }\nnext();",
        fileName: "backend/src/middleware/authMiddleware.js",
      },
    },
    // Backend: authorization (may this user change this note?).
    {
      id: "controller",
      symbolId: "controller:notesController.updateNote",
      layer: "backend",
      title: "Logged in isn't the same as allowed",
      explanation:
        "`updateNote` now knows who is asking (user 1) and which note they want (7). Authentication is done; authorization isn't: being logged in doesn't mean you may change note 7. That still has to be checked.",
      relationshipId:
        "route:PUT /api/notes/:id->calls->controller:notesController.updateNote",
      dataShape: {
        language: "js",
        code: 'req.user   = { id: 1 };   // who: from the verified token\nreq.params = { id: "7" }; // which note: from the URL',
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "note-id",
      symbolId: "fn:noteId",
      layer: "backend",
      title: "noteId checks the id is a number",
      explanation:
        "The id is text from the URL. Anything that isn't a positive whole number can't be a note, so `updateNote` answers `404` before touching the database.",
      relationshipId: "controller:notesController.updateNote->calls->fn:noteId",
      dataShape: {
        language: "js",
        code: 'noteId(req); // "7"   → 7\n            // "abc" → null → 404 { "error": "Note not found" }',
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "validate",
      symbolId: "fn:validateNote",
      layer: "backend",
      title: "validateNote checks the new text",
      explanation:
        "The new title and content get the same checks as a new note. Invalid input is answered with `400` and the message, so it never reaches the UPDATE.",
      relationshipId:
        "controller:notesController.updateNote->calls->fn:validateNote",
      dataShape: {
        language: "js",
        code: 'validateNote({ title: "Shopping", content: "Milk, bread, eggs" }); // → undefined: carry on',
        fileName: "backend/src/validation/noteValidation.js",
      },
    },
    {
      id: "owner-check",
      symbolId: "query:updateNote",
      layer: "backend",
      title: "Owns this note? The WHERE clause decides",
      protects: {
        risk: "A logged-in user edits the URL to `PUT /api/notes/8` and changes someone else's note. This is called an insecure direct object reference (IDOR), one of the most common API bugs.",
        defence:
          "`AND user_id = $4` makes the database change the row only if it belongs to the user from the token. Every notes query in the app is tied to the logged-in user the same way: the INSERT stores `req.user.id`, and the SELECT, UPDATE and DELETE all filter by it.",
      },
      explanation:
        "The UPDATE only changes a row where both conditions are true: `id = $3` (the note asked for) AND `user_id = $4` (the user from the token). The ownership check is part of the query that changes the note, not a separate step before it, so it can't be forgotten and nothing can change between checking and writing. The values travel separately from the SQL, so they can't change the query either.",
      relationshipId:
        "controller:notesController.updateNote->calls->query:updateNote",
      dataShape: {
        language: "js",
        code: 'await pool.query(\n  `UPDATE notes\n      SET title = $1, content = $2, updated_at = now()\n    WHERE id = $3 AND user_id = $4\n    RETURNING id, title, content, created_at, updated_at`,\n  ["Shopping", "Milk, bread, eggs", 7, 1], // …, id, req.user.id\n);',
        fileName: "backend/src/controllers/notesController.js",
        caption: "$3 is the note from the URL, $4 the user from the token.",
      },
    },
    {
      id: "match-rows",
      symbolId: "table:notes",
      layer: "database",
      title: "PostgreSQL finds the row, or none",
      explanation:
        "PostgreSQL looks for a row matching both conditions. Note 7 belongs to user 1, so user 1's request changes it. If user 2 sent the same request, `id = 7` would match but `user_id = 2` wouldn't, so no row is changed and `rowCount` is 0. A note that doesn't exist gives 0 too.",
      relationshipId: "query:updateNote->queries->table:notes",
      dataShape: {
        language: "sql",
        code: "-- notes\n-- id | user_id | title\n--  7 |       1 | Shopping   ← id = 7 AND user_id = 1: changed\n--  8 |       2 | Holiday\n\n-- user 1 asks for note 7 → rowCount 1\n-- user 2 asks for note 7 → rowCount 0 (not theirs)\n-- user 1 asks for note 99 → rowCount 0 (doesn't exist)",
        fileName: "database/schema.sql",
      },
    },
    {
      id: "decide",
      symbolId: "controller:notesController.updateNote",
      layer: "backend",
      title: "No row means 404, not 403",
      protects: {
        risk: "Answering 403 Forbidden for someone else's note confirms that the note exists, so an attacker could map out which ids are in use.",
        defence:
          'Both "not yours" and "doesn\'t exist" get the same 404, which reveals nothing.',
      },
      explanation:
        "`rowCount === 0` means the note doesn't exist or belongs to someone else, and both get `404 Note not found`. Many APIs answer `403 Forbidden` for someone else's data, but that would tell an attacker the note exists. Answering 404 means nobody can find out which note ids exist. Here the row matched, so the answer is `200` with the updated note.",
      relationshipId:
        "controller:notesController.updateNote->returns->http-request:PUT /api/notes/:id",
      dataShape: {
        language: "js",
        code: 'if (result.rowCount === 0) {\n  return res.status(404).json({ error: "Note not found" });\n}\nres.json(result.rows[0]); // 200',
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    // Response: back to the card.
    {
      id: "http-response",
      symbolId: "http-request:PUT /api/notes/:id",
      layer: "network",
      title: "The HTTP response travels back",
      explanation:
        'The updated note goes back to the browser. For the other branches the body would be `{"error":"Please log in"}` with 401 or `{"error":"Note not found"}` with 404.',
      relationshipId:
        "controller:notesController.updateNote->returns->http-request:PUT /api/notes/:id",
      dataShape: {
        language: "http",
        code: 'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n{"id":7,"title":"Shopping","content":"Milk, bread, eggs","created_at":"2026-10-12T09:30:00.000Z","updated_at":"2026-10-12T10:05:00.000Z"}',
      },
    },
    {
      id: "read-response",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() reads the answer",
      explanation:
        "`response.ok` is true for 200, so `request` returns the note. For a 401 or 404 it throws an `Error` with the server's message, and `handleUpdate` catches it and shows it on the card.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'if (!response.ok) {\n  throw new Error(data?.error ?? "Something went wrong"); // "Note not found"\n}\nreturn data; // { id: 7, title: "Shopping", content: "Milk, bread, eggs", … }',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "replace-note",
      symbolId: "fn:useNotes.replaceNote",
      layer: "frontend",
      title: "replaceNote swaps in the saved note",
      explanation:
        "`handleUpdate` passes the saved note to `onUpdated`, which is `replaceNote`. It builds a new array with the note replaced, so React renders the list again, and the card leaves edit mode.",
      relationshipId:
        "fn:noteCard.handleUpdate->calls->fn:useNotes.replaceNote",
      dataShape: {
        language: "js",
        code: "setNotes((current) =>\n  current.map((note) => (note.id === updated.id ? updated : note)),\n);",
        fileName: "frontend/src/hooks/useNotes.js",
      },
    },
    {
      id: "card-updated",
      symbolId: "component:NoteCard",
      layer: "user",
      title: "The card shows the new text",
      explanation:
        "The user sees their change. They never saw the checks, but two were made: the token proved who they are, and the WHERE clause proved the note is theirs.",
      dataShape: {
        language: "jsx",
        code: '<article className="note-card">\n  <h2>Shopping</h2>\n  <p>Milk, bread, eggs</p>\n</article>',
        fileName: "frontend/src/components/NoteCard.jsx",
      },
    },
  ],
};
