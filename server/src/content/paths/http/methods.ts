import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Methods: the five verbs, GET and POST, PUT and PATCH (step by step),
// DELETE, safe and idempotent, why those promises matter, HEAD and
// OPTIONS, sending each with fetch, the Notes App, mistakes, practice and
// a recap.
export const methodsModule = moduleLesson(
  "methods",
  "Methods: what to do with a resource",
  45,
  [
    "Choose GET, POST, PUT, PATCH or DELETE for an action, and know which carry a body.",
    "Explain the difference between PUT (replace) and PATCH (change some fields).",
    "Say which methods are safe and which are idempotent, and why retries and caches depend on it.",
    "Send any method with fetch, with or without a JSON body.",
    "Read the Notes App's four notes routes and the functions that call them.",
  ],

  part(
    "verbs",
    "Five verbs for one resource",
    explain(
      "The URL names a thing; the [[http-methods|method]] says what to do with it. One URL, `/api/notes/8`, can be read, replaced, changed or deleted, just by changing the method. Five methods cover almost every API you'll write or call:",
    ),
    reference("The five methods", [
      ["GET", "Read. No body.", "GET /api/notes/8"],
      ["POST", "Create, or run an action. Body.", "POST /api/notes"],
      ["PUT", "Replace the whole thing. Body.", "PUT /api/notes/8"],
      ["PATCH", "Change some fields. Body.", "PATCH /api/notes/8"],
      ["DELETE", "Remove. Usually no body.", "DELETE /api/notes/8"],
    ]),
    keyPoints(
      "The method is the verb; the URL is the noun.",
      "The same URL means different things with different methods.",
      "Methods are written in capitals: GET, not get.",
    ),
  ),

  part(
    "get-post",
    "GET reads, POST creates",
    explain(
      "[[http-get|GET]] asks for data and changes nothing. Any details go in the URL, never a body: `/api/notes?search=milk`. [[http-post|POST]] sends data in its body for the server to act on, usually to create something in a collection. The server picks the new item's id, which is why you POST to `/api/notes`, not to `/api/notes/9`.",
    ),
    code(
      "http",
      "A GET and a POST",
      [
        "GET /api/notes?search=milk",
        "",
        "POST /api/notes",
        "Content-Type: application/json",
        "",
        '{"title":"Milk","content":"2 litres"}',
      ],
      {
        1: "filters go in the query string",
        3: "to the collection: the server picks the id",
        6: "the new note's data",
      },
    ),
    keyPoints(
      "GET: no body; put filters in the query string.",
      "POST to the collection; the response holds the new id.",
      "POST also fits actions that aren't create, like /api/auth/login.",
    ),
  ),

  part(
    "put-patch",
    "PUT replaces, PATCH changes",
    explain(
      "Both edit something that exists ([[http-put-delete|PUT, PATCH and DELETE]]). **PUT** sends the whole new version: whatever you leave out is gone. **PATCH** sends only the fields to change; the rest stay. Step through both on the same note:",
    ),
    trace(
      "The same body, two methods",
      [
        "const stored = { id: 8,",
        '  title: "Milk", content: "2 litres" };',
        'const body = { title: "Oat milk" };',
        "",
        "function put(note, body) {",
        '  return { id: note.id, content: "",',
        "    ...body };",
        "}",
        "function patch(note, body) {",
        "  return { ...note, ...body };",
        "}",
        "const a = put(stored, body);",
        "const b = patch(stored, body);",
      ],
      [
        {
          line: 3,
          note: "Note 8 is stored on the server. The client sends a body with only a new title.",
          vars: [
            ["stored", '{ id: 8, title: "Milk", content: "2 litres" }'],
            ["body", '{ title: "Oat milk" }'],
          ],
        },
        {
          line: 12,
          note: "PUT: the body *is* the new note. It had no content, so content falls back to empty.",
          vars: [
            ["stored", '{ id: 8, title: "Milk", content: "2 litres" }'],
            ["body", '{ title: "Oat milk" }'],
            ["a", '{ id: 8, content: "", title: "Oat milk" }'],
          ],
        },
        {
          line: 13,
          note: "PATCH: start from the stored note and change only what was sent. The content survives.",
          vars: [
            ["stored", '{ id: 8, title: "Milk", content: "2 litres" }'],
            ["body", '{ title: "Oat milk" }'],
            ["a", '{ id: 8, content: "", title: "Oat milk" }'],
            ["b", '{ id: 8, title: "Oat milk", content: "2 litres" }'],
          ],
        },
      ],
    ),
    keyPoints(
      "PUT: send every field, every time.",
      "PATCH: send only what changed.",
      "Use PUT when the form always has every field; PATCH for one toggle.",
    ),
  ),

  part(
    "delete",
    "DELETE removes",
    explain(
      "`DELETE /api/notes/8` removes note 8. The URL says everything, so there's no body. A successful delete usually answers `204 No Content`: done, nothing to send back. Deleting something already gone answers `404`, but the note is gone either way, which matters in the next part.",
    ),
    code(
      "http",
      "Deleting twice",
      [
        "DELETE /api/notes/8",
        "→ 204 No Content",
        "",
        "DELETE /api/notes/8",
        "→ 404 Not Found",
      ],
      {
        2: "deleted",
        5: "different answer, same result: no note 8",
      },
    ),
  ),

  part(
    "safe-idempotent",
    "Safe and idempotent",
    explain(
      "Each method makes two promises. A [[safe-method|safe method]] only reads: GET, HEAD and OPTIONS. An **idempotent** method has the same effect sent once or ten times: the safe ones, plus PUT and DELETE. Ten identical PUTs leave one note with that title. POST is neither: ten POSTs make ten notes. PATCH isn't promised either.",
    ),
    reference("What each method promises", [
      ["GET, HEAD, OPTIONS", "Safe and idempotent."],
      ["PUT", "Not safe; idempotent: same body, same end result."],
      ["DELETE", "Not safe; idempotent: gone is gone."],
      ["PATCH", "Not safe; not promised idempotent."],
      ["POST", "Neither: each one may create something new."],
    ]),
    quickCheck(
      "A save times out and you don't know if the server got it. Which is safe to simply send again?",
      [
        "`POST /api/notes` with the note",
        "`PUT /api/notes/8` with the note",
        "Both",
      ],
      1,
      "PUT is idempotent: sending the same note twice ends with one note 8. A second POST may create a duplicate note.",
    ),
  ),

  part(
    "why-it-matters",
    "Why the promises matter",
    explain(
      "Browsers, proxies and tools rely on these promises without asking you. They retry idempotent requests after a dropped connection. They prefetch and cache GETs. Crawlers follow every link, which is a GET. So a GET that deletes or saves *will* run when nobody meant it to: put changes behind POST, PUT, PATCH or DELETE.",
    ),
    mistake({
      title: "A GET that deletes",
      language: "jsx",
      wrong: ['<a href="/api/notes/8/delete">Delete</a>'],
      problem:
        "A link is a GET. A prefetch, a crawler or a link preview in a chat app can delete the note.",
      right: [
        "<button onClick={() => deleteNote(8)}>",
        "  Delete",
        "</button>",
      ],
      why: "Changes need a method that isn't safe, here DELETE, sent on purpose.",
    }),
  ),

  part(
    "head-options",
    "HEAD and OPTIONS",
    explain(
      "Two more you'll meet, rarely write. **HEAD** is GET without the body: just the status and headers, to check something exists or how big it is. **OPTIONS** asks which methods a URL allows. Browsers send OPTIONS themselves, before some requests to another site, to ask permission first; you'll see it in the Network tab.",
    ),
    code(
      "http",
      "Asking, not fetching",
      [
        "HEAD /api/health",
        "→ 200 OK (headers only)",
        "",
        "OPTIONS /api/notes",
        "→ 204 No Content",
        "  Allow: GET, POST",
      ],
      {
        2: "same headers a GET would get, no body",
        6: "the methods this URL accepts",
      },
    ),
  ),

  part(
    "fetch",
    "Sending each method with fetch",
    explain(
      "`fetch` sends GET unless you pass `method`. A method with a body also needs the body as JSON text and a `Content-Type` header saying so. GET and HEAD can't have a body at all: fetch rejects with a TypeError if you try.",
    ),
    anatomy(
      "A PUT with fetch",
      [
        'fetch("/api/notes/8", { method: "PUT",',
        "  headers: {",
        '    "Content-Type": "application/json" },',
        "  body: JSON.stringify(note) });",
      ],
      [
        ['"/api/notes/8"', "URL", "Which note."],
        ['method: "PUT"', "method", "Left out, it would be GET."],
        [
          '"Content-Type": "application/json"',
          "header",
          "Tells the server the body is JSON.",
        ],
        ["JSON.stringify(note)", "body", "Objects must become text first."],
      ],
    ),
    code(
      "js",
      "The other four",
      [
        'fetch("/api/notes");',
        'fetch("/api/notes", { method: "POST",',
        "  headers: json, body: text });",
        'fetch("/api/notes/8", { method: "PATCH",',
        "  headers: json, body: text });",
        'fetch("/api/notes/8",',
        '  { method: "DELETE" });',
      ],
      {
        1: "GET: the default",
        3: "json is the Content-Type header object",
        7: "no body, no Content-Type",
      },
    ),
  ),

  part(
    "notes-app",
    "Methods in the Notes App",
    explain(
      "The Notes App uses four methods on two URLs. It edits with **PUT**, not PATCH: the edit form always sends both title and content, so replacing fits. If you sent only a title, the server would save the content as empty. Its account endpoints use POST for actions (log in, log out) that aren't really “create”.",
    ),
    code(
      "js",
      "routes/notes.js: method + path → handler",
      [
        'notesRoutes.get("/", listNotes);',
        'notesRoutes.post("/", createNote);',
        'notesRoutes.put("/:id", updateNote);',
        'notesRoutes.delete("/:id", deleteNote);',
      ],
      {
        1: "GET /api/notes",
        3: ":id is the note's id from the URL",
      },
    ),
    inTheNotesApp(
      "`notes.js` maps each method and path to a controller function. There is no PATCH route.",
      { fileId: "backend/src/routes/notes.js" },
    ),
    inTheNotesApp(
      "`notesApi.js` has one function per route; each passes its method to `request`.",
      { fileId: "frontend/src/services/notesApi.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting the method",
      wrong: ['fetch("/api/notes", {', "  body: JSON.stringify(note) });"],
      problem:
        "Without `method`, fetch sends a GET, and a GET can't have a body: fetch throws a TypeError.",
      right: [
        'fetch("/api/notes", { method: "POST",',
        "  headers: json,",
        "  body: JSON.stringify(note) });",
      ],
      why: "Any request with a body needs its method, usually POST, PUT or PATCH.",
    }),
    mistake({
      title: "A PUT with half the fields",
      wrong: ['updateNote(8, { title: "Oat milk" });'],
      problem:
        "PUT replaces. The Notes App saves the missing content as empty, so the note loses its text.",
      right: [
        "updateNote(8, {",
        '  title: "Oat milk",',
        "  content: note.content,",
        "});",
      ],
      why: "With PUT, send every field. Use PATCH (if the API has it) to send only some.",
    }),
    mistake({
      title: "Verbs in the URL",
      wrong: ["POST /api/deleteNote?id=8"],
      language: "http",
      problem:
        "The method says POST but the URL says delete. Tools and people can't tell it's a delete.",
      right: ["DELETE /api/notes/8"],
      why: "Let the method be the verb; the URL names the thing.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build the fetch options",
      task: 'Write `fetchOptions(method, body)` returning the options object for fetch. Always include `method`. Only when there\'s a `body`, add `headers: { "Content-Type": "application/json" }` and `body` as JSON text.',
      starter: [
        "function fetchOptions(method, body) {",
        "  return { method };",
        "}",
      ],
      tests: [
        ['fetchOptions("DELETE")', '{ method: "DELETE" }'],
        [
          'fetchOptions("POST", { title: "Milk" })',
          '{ method: "POST", headers: { "Content-Type": "application/json" }, body: \'{"title":"Milk"}\' }',
        ],
        ['fetchOptions("PUT", { id: 8 }).body', "'{\"id\":8}'"],
      ],
      hint: "Return `{ method }` early when there's no body; otherwise return all three properties.",
      solution: [
        "function fetchOptions(method, body) {",
        "  if (body === undefined) return { method };",
        "  return {",
        "    method,",
        "    headers: {",
        '      "Content-Type": "application/json",',
        "    },",
        "    body: JSON.stringify(body),",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Safe to repeat?",
      task: "Write `promises(method)` returning `{ safe, idempotent }` as true/false. Safe: GET, HEAD, OPTIONS. Idempotent: those three plus PUT and DELETE.",
      starter: [
        "function promises(method) {",
        "  return { safe: false, idempotent: false };",
        "}",
      ],
      tests: [
        ['promises("GET")', "{ safe: true, idempotent: true }"],
        ['promises("PUT")', "{ safe: false, idempotent: true }"],
        ['promises("DELETE")', "{ safe: false, idempotent: true }"],
        ['promises("POST")', "{ safe: false, idempotent: false }"],
        ['promises("PATCH")', "{ safe: false, idempotent: false }"],
      ],
      hint: "Keep two arrays and use `includes`. Idempotent is safe, or PUT, or DELETE.",
      solution: [
        "function promises(method) {",
        '  const safe = ["GET", "HEAD", "OPTIONS"]',
        "    .includes(method);",
        "  const idempotent = safe ||",
        '    ["PUT", "DELETE"].includes(method);',
        "  return { safe, idempotent };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Methods cheat sheet", [
      ["GET", "Read. Safe, idempotent, no body.", 'fetch("/api/notes")'],
      ["POST", "Create or act. Body. Neither promise.", "POST /api/notes"],
      ["PUT", "Replace all fields. Idempotent.", "PUT /api/notes/8"],
      ["PATCH", "Change some fields. Not promised.", "PATCH /api/notes/8"],
      ["DELETE", "Remove. Idempotent, no body.", "DELETE /api/notes/8"],
      ["HEAD", "GET without the body.", "HEAD /api/health"],
      ["OPTIONS", "Which methods are allowed?", "Allow: GET, POST"],
      [
        "With fetch",
        "method, plus headers and body if sending data.",
        '{ method: "PUT", headers, body }',
      ],
    ]),
    quickCheck(
      "You add “mark as done” to a note: one field changes, the rest stay. Which request fits best?",
      [
        "`GET /api/notes/8?done=true`",
        '`PATCH /api/notes/8` with `{"done":true}`',
        '`POST /api/notes` with `{"done":true}`',
      ],
      1,
      "PATCH changes only the fields you send. A GET must never change anything, and POST to the collection would create a new note.",
    ),
  ),
);
