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

// Status codes: the five classes, the status line taken apart, success codes (200, 201 with Location,
// 204), client errors, server errors, choosing the right one, fetch and
// response.ok (step by step), 204 and request.js, the Notes App's choices,
// mistakes, practice and a recap.
export const statusCodesModule = moduleLesson(
  "status-codes",
  "Status codes: how did it go?",
  45,
  [
    "Name the five classes of status code and what each one means.",
    "Use 200, 201, 204, 400, 401, 403, 404, 409, 500 and 503 for the right situations.",
    "Choose the right status when designing an endpoint, including Location on a 201.",
    "Check response.ok or status after fetch, since fetch doesn't reject on 4xx or 5xx.",
    "Read the status choices in the Notes App's controllers and request.js.",
  ],

  part(
    "classes",
    "Five classes",
    explain(
      "Every response starts with a three-digit [[http-status-codes|status code]], and its first digit is the class. Code that calls an API mostly branches on the class first (did it work?), then on the exact code (why not?). As an API designer, you pick the code, so the client can react without reading your error message.",
    ),
    reference("The five classes", [
      [
        "1xx",
        "Informational: keep going. Rare in APIs.",
        "101 Switching Protocols",
      ],
      ["2xx", "Success: it worked.", "200, 201, 204"],
      ["3xx", "Redirect: look somewhere else.", "301, 304"],
      ["4xx", "Client error: fix the request.", "400, 401, 404"],
      ["5xx", "Server error: not your request's fault.", "500, 503"],
    ]),
    keyPoints(
      "The first digit answers “did it work, and whose fault is it?”",
      "4xx: sending the same request again won't help.",
      "5xx: the same request might work later.",
    ),
  ),

  part(
    "status-line",
    "The status line, taken apart",
    explain(
      "The status code sits on the response's first line, before any header or body, so a client can decide what to do before reading anything else. The words after it are for people; programs read only the number.",
    ),
    anatomy(
      "A response to a new note",
      [
        "HTTP/1.1 201 Created",
        "Location: /api/notes/9",
        "Content-Type: application/json",
        '{"id":9,"title":"Eggs"}',
      ],
      [
        ["2", "class", "The first digit: 2xx, success."],
        ["01", "exact code", "Which success: something was created."],
        ["Created", "reason", "Words for people; code reads the number."],
        ["/api/notes/9", "Location", "Where the new note lives."],
        ['{"id":9,"title":"Eggs"}', "body", "Often the new thing itself."],
      ],
    ),
  ),

  part(
    "success",
    "Success: 200, 201 and 204",
    explain(
      "**200 OK** is the general success, with a body. **201 Created** says a new thing exists, usually after a POST; it should come with a [[location-header|Location header]] giving the new thing's URL, and often the new thing as the body. **204 No Content** is success with nothing to send back, typical for a DELETE.",
    ),
    code(
      "http",
      "Three successes",
      [
        "GET /api/notes      → 200 OK",
        '[{"id":8,"title":"Milk"}]',
        "",
        "POST /api/notes     → 201 Created",
        "Location: /api/notes/9",
        '{"id":9,"title":"Eggs"}',
        "",
        "DELETE /api/notes/8 → 204 No Content",
      ],
      {
        2: "the data you asked for",
        5: "where the new note now lives",
        8: "done; no body at all",
      },
    ),
  ),

  part(
    "client-errors",
    "Client errors: 4xx",
    explain(
      "A 4xx says the request itself is the problem, so the client must change something before trying again. Each code tells it *what*: fix the data, log in, give up, or reload. These are the ones APIs really use:",
    ),
    reference("The 4xx codes you'll use", [
      [
        "400 Bad Request",
        "The data is wrong or unreadable.",
        "no title; broken JSON",
      ],
      [
        "401 Unauthorized",
        "We don't know who you are: log in.",
        "no login cookie",
      ],
      [
        "403 Forbidden",
        "We know you; you're not allowed.",
        "a user opens an admin page",
      ],
      ["404 Not Found", "No such thing at this URL.", "GET /api/notes/999"],
      [
        "409 Conflict",
        "Clashes with what's stored.",
        "email already registered",
      ],
      [
        "422 Unprocessable",
        "Valid JSON, but breaks the rules. Some APIs use 400.",
        "title too long",
      ],
    ]),
    keyPoints(
      "401 means “log in”; 403 means “logging in won't help”.",
      "400 and 422 should say what's wrong, so a form can show it.",
      "404 can hide that something exists but isn't yours.",
    ),
  ),

  part(
    "server-errors",
    "Server errors: 5xx",
    explain(
      "A 5xx says the server failed, not the request. **500 Internal Server Error** means a bug or a crash: the server should log the details and send the client only a short, safe message. **503 Service Unavailable** means “not now”: overloaded or down for maintenance, so trying again later may work, often after a `Retry-After` header's wait.",
    ),
    keyPoints(
      "500: a bug. Log it on the server; never send the stack trace.",
      "503: temporary. The client may retry later.",
      "A client can't fix a 5xx by changing its request.",
    ),
  ),

  part(
    "choosing",
    "Choosing the right code",
    explain(
      "When you design an endpoint, go through what can happen and give each outcome its code. Be exact: a client that gets 404 stops; one that gets 503 retries; one that gets 401 shows the login page. Never send 200 with an error inside: the client's `ok` check would call it success.",
    ),
    reference("Situation → status", [
      ["Listed or read", "200 + the data"],
      ["Created", "201 + Location + the new thing"],
      ["Deleted, nothing to say", "204"],
      ["Missing or invalid field", "400 (or 422) + what's wrong"],
      ["Not logged in", "401"],
      ["Logged in, not allowed", "403 (or 404 to hide it)"],
      ["Id doesn't exist", "404"],
      ["Duplicate, e.g. email taken", "409"],
      ["An exception was thrown", "500"],
    ]),
    quickCheck(
      "Someone registers with an email that already has an account. Which status fits best?",
      ["400 Bad Request", "409 Conflict", "500 Internal Server Error"],
      1,
      "The request is well formed; it clashes with what's already stored. 409 Conflict says exactly that, and the Notes App uses it for this case.",
    ),
  ),

  part(
    "fetch-ok",
    "fetch doesn't reject on 404",
    explain(
      "`fetch` only rejects when there's no response at all, such as no network. A 404 or 500 is still a response, so the promise resolves. You must check [[response-ok|`response.ok`]] (true for 200–299) or `response.status` yourself. Step through a request for a note that doesn't exist:",
    ),
    trace(
      "Asking for note 99",
      [
        "async function request(path, send) {",
        "  const res = await send(path);",
        "  if (res.status === 204) return null;",
        "  const data = await res.json();",
        "  if (!res.ok) {",
        "    throw new Error(data.error);",
        "  }",
        "  return data;",
        "}",
        'request("/api/notes/99", send)',
        "  .catch((err) => show(err.message));",
      ],
      [
        {
          line: 10,
          note: "The app asks for note 99, which doesn't exist.",
          stack: ["(top level)"],
        },
        {
          line: 2,
          note: "The server answers 404. That's a response, so the promise *resolves*: no error yet.",
          vars: [
            ["path", '"/api/notes/99"'],
            ["res", "{ status: 404, ok: false }"],
          ],
          stack: ["request"],
        },
        {
          line: 4,
          note: "Not 204, so there's a body: the server's error message.",
          vars: [
            ["path", '"/api/notes/99"'],
            ["res", "{ status: 404, ok: false }"],
            ["data", '{ error: "Note not found" }'],
          ],
          stack: ["request"],
        },
        {
          line: 6,
          note: "`ok` is false, so we throw ourselves, using the server's message.",
          vars: [
            ["path", '"/api/notes/99"'],
            ["res", "{ status: 404, ok: false }"],
            ["data", '{ error: "Note not found" }'],
          ],
          stack: ["request"],
        },
        {
          line: 11,
          note: "Now the promise rejects, and the caller's `catch` shows the message.",
          vars: [["err", 'Error("Note not found")']],
          stack: ["(top level)"],
          output: "Note not found",
        },
      ],
    ),
  ),

  part(
    "no-content",
    "204: success with no body",
    explain(
      "A 204 has no body, so `response.json()` would fail: there's no JSON to read. Check for 204 *before* reading the body. The Notes App's `request.js` does exactly that, then reads the JSON, then checks `ok`. It also adds `.catch(() => null)`, so an error page that isn't JSON can't crash it.",
    ),
    code(
      "js",
      "request.js: status checks, in order",
      [
        "if (response.status === 204) return null;",
        "",
        "const data = await response.json()",
        "  .catch(() => null);",
        "",
        "if (!response.ok) {",
        "  throw new Error(",
        '    data?.error ?? "Something went wrong");',
        "}",
        "return data;",
      ],
      {
        1: "nothing to read: return early",
        4: "a body that isn't JSON becomes null",
        6: "any 4xx or 5xx",
        8: "the server's message, or a fallback",
      },
    ),
    inTheNotesApp(
      "`request.js` handles 204, reads the JSON, and turns every status outside 200–299 into a thrown error.",
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "notes-app",
    "The Notes App's choices",
    explain(
      "The notes controller answers 201 when it creates, 204 when it deletes, 400 when the title is missing or too long, and 404 for a note that doesn't exist **or belongs to someone else**: the same answer, so nobody can find out which ids exist. Without a login, every notes route answers 401. It doesn't send a Location header with its 201; line 3 below shows how it could.",
    ),
    code(
      "js",
      "notesController.js, the status lines",
      [
        "if (error)",
        "  return res.status(400).json({ error });",
        "// res.location(`/api/notes/${note.id}`);",
        "res.status(201).json(note);",
        "",
        "if (result.rowCount === 0) {",
        "  return res.status(404)",
        '    .json({ error: "Note not found" });',
        "}",
        "res.status(204).end();",
      ],
      {
        2: "invalid note: say why",
        3: "not in the Notes App: a Location header",
        6: "no row was yours: not found",
        10: "deleted: no body",
      },
    ),
    inTheNotesApp(
      "`notesController.js` picks 201, 204, 400 and 404. Someone else's note gets 404, not 403.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    inTheNotesApp(
      "`authController.js` uses 201 on register, 409 for an email already taken and 401 for a wrong password.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Trusting fetch to catch errors",
      wrong: [
        "try {",
        "  const res = await fetch(url);",
        "  setNotes(await res.json());",
        '} catch { setError("Failed"); }',
      ],
      problem:
        "A 401 or 500 doesn't reach `catch`. The error body `{ error: … }` lands in `notes` and the list breaks.",
      right: [
        "const res = await fetch(url);",
        "if (!res.ok) throw new Error(res.status);",
        "setNotes(await res.json());",
      ],
      why: "Check `ok` (or `status`) on every response before using the body.",
    }),
    mistake({
      title: "200 with an error inside",
      wrong: ['res.json({ error: "Title is required" });'],
      problem:
        "`res.json` sends 200. The client's `ok` check says success, and it treats the error as a note.",
      right: ["res.status(400)", '  .json({ error: "Title is required" });'],
      why: "The status is the first thing every client reads: make it true.",
    }),
    mistake({
      title: "Reading the body of a 204",
      wrong: ["const res = await deleteRequest();", "return await res.json();"],
      problem:
        "A 204 has no body, so `res.json()` rejects with a SyntaxError, even though the delete worked.",
      right: [
        "if (res.status === 204) return null;",
        "return await res.json();",
      ],
      why: "Handle 204 before reading JSON.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Name the class",
      task: 'Write `statusClass(code)` returning `"info"` for 1xx, `"success"` for 2xx, `"redirect"` for 3xx, `"client error"` for 4xx and `"server error"` for 5xx.',
      starter: ["function statusClass(code) {", '  return "success";', "}"],
      tests: [
        ["statusClass(201)", '"success"'],
        ["statusClass(204)", '"success"'],
        ["statusClass(304)", '"redirect"'],
        ["statusClass(404)", '"client error"'],
        ["statusClass(503)", '"server error"'],
        ["statusClass(101)", '"info"'],
      ],
      hint: "`Math.floor(code / 100)` gives the first digit. Use it to pick from an array.",
      solution: [
        "function statusClass(code) {",
        '  const names = [, "info", "success",',
        '    "redirect", "client error",',
        '    "server error"];',
        "  return names[Math.floor(code / 100)];",
        "}",
      ],
    }),
    yourTurn({
      title: "Write request()",
      task: "Write `async function request(path, opts, send)` like `request.js`. `send(path, opts)` returns a promise of `{ status, ok, json() }`. Return `null` for a 204. Otherwise read the JSON; if `ok` is false throw `new Error(data.error)`, else return the data.",
      starter: [
        "async function request(path, opts, send) {",
        "  const res = await send(path, opts);",
        "  return await res.json();",
        "}",
      ],
      tests: [
        [
          'request("/api/notes", {}, async () => ({ status: 200, ok: true, json: async () => [{ id: 8 }] }))',
          "[{ id: 8 }]",
        ],
        [
          'request("/api/notes/8", { method: "DELETE" }, async () => ({ status: 204, ok: true, json: async () => { throw new SyntaxError("no body"); } }))',
          "null",
        ],
        [
          'request("/api/notes/99", {}, async () => ({ status: 404, ok: false, json: async () => ({ error: "Note not found" }) })).catch((e) => e.message)',
          '"Note not found"',
        ],
      ],
      hint: "Check `res.status === 204` first. Then `const data = await res.json()`, then `if (!res.ok) throw …`.",
      solution: [
        "async function request(path, opts, send) {",
        "  const res = await send(path, opts);",
        "  if (res.status === 204) return null;",
        "  const data = await res.json();",
        "  if (!res.ok) throw new Error(data.error);",
        "  return data;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Status codes cheat sheet", [
      ["2xx / 3xx", "It worked / look elsewhere."],
      ["4xx / 5xx", "Fix the request / the server failed."],
      ["200 OK", "Success with a body.", "GET /api/notes"],
      [
        "201 Created",
        "Made it; Location says where.",
        "Location: /api/notes/9",
      ],
      [
        "204 No Content",
        "Success, no body. Don't read JSON.",
        "DELETE /api/notes/8",
      ],
      [
        "400 / 422",
        "The data breaks the rules.",
        '{"error":"Title is required"}',
      ],
      ["401 / 403", "Log in / not allowed even so."],
      ["404 / 409", "Not there / clashes with what's stored."],
      ["500 / 503", "A bug / not now, try later."],
      [
        "response.ok",
        "true for 200–299. fetch doesn't reject on 4xx.",
        "if (!res.ok) throw …",
      ],
    ]),
    quickCheck(
      '`await fetch("/api/notes")` gets a 500. What happens?',
      [
        "The await throws, so the `catch` runs",
        "It resolves; `response.ok` is false and you must check it",
        "fetch retries until it gets a 200",
      ],
      1,
      "fetch only rejects when there's no response at all. A 500 is a response, so check `response.ok` or `response.status` before using the body.",
    ),
  ),
);
