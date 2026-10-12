import type { Flow } from "@fsl/shared";
import { httpExchanges } from "./http-exchanges.js";

// Loading the notes when the Dashboard appears: the whole round trip from
// useNotes' effect to the database and back to the cards on screen.
export const listNotesFlow: Flow = {
  id: "list-notes",
  title: "Load your notes",
  summary:
    "Follow the request that loads your notes when the Dashboard appears, through the backend and the database, and back as cards on screen.",
  group: "request",
  direction: "round-trip",
  http: httpExchanges["http-request:GET /api/notes"],
  steps: [
    {
      id: "dashboard-appears",
      symbolId: "component:Dashboard",
      layer: "user",
      title: "The Dashboard appears",
      explanation:
        "After logging in, App shows the Dashboard. Its first render has no notes yet, so it shows *Loading notes…* while they are fetched.",
      dataShape: {
        language: "jsx",
        code: "const { notes, isLoading, error, addNote, replaceNote, removeNote } =\n  useNotes();\n// first render: notes = [], isLoading = true",
        fileName: "frontend/src/pages/Dashboard.jsx",
      },
    },
    {
      id: "effect-runs",
      symbolId: "hook:useNotes",
      layer: "frontend",
      title: "useNotes' effect starts loading",
      explanation:
        "`useEffect` with an empty dependency list runs once, after the Dashboard first appears. It starts loading and remembers `ignore`, so a late answer is thrown away if the page has already gone.",
      relationshipId: "component:Dashboard->uses->hook:useNotes",
      dataShape: {
        language: "js",
        code: "useEffect(() => {\n  let ignore = false;\n  getNotes().then((loaded) => { if (!ignore) setNotes(loaded); });\n  return () => { ignore = true; };\n}, []);",
        fileName: "frontend/src/hooks/useNotes.js",
        caption:
          "Shortened: the real effect also handles errors and the loading flag.",
      },
    },
    {
      id: "get-notes",
      symbolId: "fn:notesApi.getNotes",
      layer: "frontend",
      title: "getNotes asks the API",
      explanation:
        '`getNotes` knows the URL; a plain GET needs no method or body, so it just calls `request("/api/notes")`.',
      relationshipId: "hook:useNotes->calls->fn:notesApi.getNotes",
      dataShape: {
        language: "js",
        code: 'export function getNotes() {\n  return request("/api/notes");\n}',
        fileName: "frontend/src/services/notesApi.js",
      },
    },
    {
      id: "request",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() prepares a GET",
      explanation:
        'With no method given, `request` uses its default `"GET"`. There is no body, so it sends no `Content-Type` header either, but it still includes the login cookie.',
      relationshipId: "fn:notesApi.getNotes->calls->fn:request",
      dataShape: {
        language: "js",
        code: 'request("/api/notes"); // method = "GET", body = undefined',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "fetch",
      symbolId: "external:fetch",
      layer: "frontend",
      title: "fetch sends it",
      explanation:
        '`fetch` sends the GET from the browser with `credentials: "include"`, so the `token` cookie goes along and the server knows whose notes to return.',
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'fetch("/api/notes", { method: "GET", credentials: "include" });',
      },
    },
    {
      id: "http-request",
      symbolId: "http-request:GET /api/notes",
      layer: "network",
      title: "The GET request travels to the backend",
      explanation:
        "A GET only asks for data, so it has no body: the method, the path and the cookie say everything the server needs.",
      relationshipId: "external:fetch->sends->http-request:GET /api/notes",
      dataShape: {
        language: "http",
        code: "GET /api/notes HTTP/1.1\nHost: localhost:5173\nCookie: token=eyJhbGciOiJIUzI1NiIs…",
      },
    },
    {
      id: "parse-cookies",
      symbolId: "middleware:cookieParser",
      layer: "backend",
      title: "cookieParser reads the cookie",
      explanation:
        "As for every request, `cookieParser` turns the `Cookie` header into `req.cookies` before the routes run. (`express.json` runs too, but a GET has no body for it to read.)",
      dataShape: {
        language: "js",
        code: 'req.cookies = { token: "eyJhbGciOiJIUzI1NiIs…" };',
        fileName: "backend/src/app.js",
      },
    },
    {
      id: "match-route",
      symbolId: "route:GET /api/notes",
      layer: "backend",
      title: "Express matches the route",
      explanation:
        '`notesRoutes.get("/", …)` under the `/api/notes` mount point matches `GET /api/notes`.',
      relationshipId:
        "route:GET /api/notes->receives->http-request:GET /api/notes",
      dataShape: {
        language: "js",
        code: 'notesRoutes.get("/", notesController.listNotes);',
        fileName: "backend/src/routes/notes.js",
      },
    },
    {
      id: "require-auth",
      symbolId: "middleware:requireAuth",
      layer: "backend",
      title: "requireAuth identifies the user",
      explanation:
        "Like every notes route, listing needs a login: `requireAuth` verifies the token and sets `req.user`, or answers `401` and the list is never read.",
      relationshipId: "route:GET /api/notes->uses->middleware:requireAuth",
      dataShape: {
        language: "js",
        code: 'req.user = { id: 1 };\n// no valid token: 401 { "error": "Please log in" }',
        fileName: "backend/src/middleware/authMiddleware.js",
      },
    },
    {
      id: "controller",
      symbolId: "controller:notesController.listNotes",
      layer: "backend",
      title: "listNotes runs",
      explanation:
        "The controller needs nothing from the request except who is asking: `req.user.id` decides which notes come back.",
      relationshipId:
        "route:GET /api/notes->calls->controller:notesController.listNotes",
      dataShape: {
        language: "js",
        code: "export async function listNotes(req, res) { /* req.user.id = 1 */ }",
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "select-query",
      symbolId: "query:selectNotes",
      layer: "backend",
      title: "A parameterized SELECT asks for the user's notes",
      explanation:
        "`WHERE user_id = $1` is the authorization: only this user's rows match. `ORDER BY created_at DESC` puts the newest first, so the list is in the order the screen shows.",
      relationshipId:
        "controller:notesController.listNotes->calls->query:selectNotes",
      dataShape: {
        language: "js",
        code: "await pool.query(\n  `SELECT id, title, content, created_at, updated_at\n     FROM notes\n    WHERE user_id = $1\n    ORDER BY created_at DESC`,\n  [1], // req.user.id\n);",
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "read-rows",
      symbolId: "table:notes",
      layer: "database",
      title: "PostgreSQL finds the rows",
      explanation:
        "PostgreSQL finds this user's rows (the index on `user_id` lets it do that quickly once there are many notes), sorts them and returns them as `result.rows`, an array of objects.",
      relationshipId: "query:selectNotes->queries->table:notes",
      dataShape: {
        language: "js",
        code: 'result.rows = [\n  { id: 2, title: "Ideas", content: "…", created_at: …, updated_at: … },\n  { id: 1, title: "Welcome to your notes", content: "…", created_at: …, updated_at: … },\n];',
        caption: "Shortened; the real rows have full text and Date times.",
      },
    },
    {
      id: "answer",
      symbolId: "controller:notesController.listNotes",
      layer: "backend",
      title: "The controller answers with the list",
      explanation:
        "`res.json(result.rows)` sends the array as JSON with status `200`, the default for a successful answer.",
      relationshipId:
        "controller:notesController.listNotes->returns->http-request:GET /api/notes",
      dataShape: {
        language: "js",
        code: "res.json(result.rows); // 200 OK",
        fileName: "backend/src/controllers/notesController.js",
      },
    },
    {
      id: "http-response",
      symbolId: "http-request:GET /api/notes",
      layer: "network",
      title: "The list travels back",
      explanation:
        "The response body is a JSON array: one object per note, newest first.",
      dataShape: {
        language: "http",
        code: 'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n\n[{"id":2,"title":"Ideas",…},{"id":1,"title":"Welcome to your notes",…}]',
      },
    },
    {
      id: "read-response",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() returns the array",
      explanation:
        "`response.json()` turns the text back into an array of note objects and `request` returns it, because `response.ok` is true for 200.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'return data; // [\n  { id: 2, title: "Ideas", content: "…", created_at: …, updated_at: … },\n  { id: 1, title: "Welcome to your notes", content: "…", created_at: …, updated_at: … },\n]',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "store-notes",
      symbolId: "hook:useNotes",
      layer: "frontend",
      title: "useNotes stores the notes",
      explanation:
        "The effect's `.then` puts the array in state, and `.finally` sets `isLoading` to `false`. Both are state changes, so React renders the Dashboard again.",
      relationshipId: "hook:useNotes->calls->fn:notesApi.getNotes",
      dataShape: {
        language: "js",
        code: "setNotes(loaded);     // two notes\nsetIsLoading(false);",
        fileName: "frontend/src/hooks/useNotes.js",
      },
    },
    {
      id: "dashboard-renders",
      symbolId: "component:Dashboard",
      layer: "frontend",
      title: "The Dashboard renders the list",
      explanation:
        "Now `isLoading` is `false` and `notes` has two items, so *Loading notes…* disappears and the Dashboard maps the notes to cards.",
      relationshipId: "component:Dashboard->uses->hook:useNotes",
      dataShape: {
        language: "jsx",
        code: "{isLoading && <p>Loading notes…</p>} // gone now\n{notes.map((note) => <NoteCard key={note.id} note={note} … />)}",
        fileName: "frontend/src/pages/Dashboard.jsx",
      },
    },
    {
      id: "cards-appear",
      symbolId: "component:NoteCard",
      layer: "user",
      title: "The notes appear",
      explanation:
        "One NoteCard per note appears, newest first. Each has Edit and Delete, which start flows of their own.",
      relationshipId: "component:Dashboard->renders->component:NoteCard",
      dataShape: {
        language: "jsx",
        code: '<article className="note-card"><h2>Ideas</h2>…</article>\n<article className="note-card"><h2>Welcome to your notes</h2>…</article>',
        fileName: "frontend/src/components/NoteCard.jsx",
      },
    },
  ],
};
