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

// Routes: a method and a path to a function, a route taken apart, path
// parameters, the query string, the req object, the res object and one
// answer per request, routers, route order and 404, a match step by step,
// mistakes, practice and a recap.
export const routesModule = moduleLesson(
  "routes",
  "Routes: which code answers",
  45,
  [
    "Write routes with app.get, app.post, app.put and app.delete.",
    "Read path parameters from req.params and the query string from req.query.",
    "Use req and res, and send exactly one response per request.",
    "Group routes in a router and mount it under a path with app.use.",
    "Predict which route answers a request, and when Express sends a 404.",
  ],

  part(
    "what-a-route-is",
    "A method and a path, then a function",
    explain(
      "A request arrives as a method and a path, like `GET /api/notes`. A [[express-route|route]] is a rule that says: for this method and this path, run this function. Express has one method per HTTP method: `app.get`, `app.post`, `app.put` and `app.delete`. The path is the same for all four; the method decides which runs.",
    ),
    code(
      "js",
      "Four routes for notes",
      [
        'app.get("/api/notes", listNotes);',
        'app.post("/api/notes", createNote);',
        'app.put("/api/notes/:id", updateNote);',
        'app.delete("/api/notes/:id", deleteNote);',
      ],
      {
        1: "GET /api/notes: read the list",
        2: "same path, POST: make a new note",
        3: ":id matches any one note's id",
      },
    ),
    keyPoints(
      "A route = one method + one path + a function.",
      "Same path, different method: a different route.",
      "Routes are checked only when a request arrives.",
    ),
  ),

  part(
    "anatomy",
    "A route taken apart",
    explain(
      "Every route has the same shape. The function at the end is called the handler. Express calls it with two objects, [[req-res|`req` and `res`]]: what arrived, and the answer you are building.",
    ),
    anatomy(
      "One route",
      [
        'app.get("/api/notes/:id", (req, res) => {',
        "  const id = req.params.id;",
        '  res.json({ id, title: "Milk" });',
        "});",
      ],
      [
        ["app.get", "the method", "Only GET requests can match this route."],
        [
          '"/api/notes/:id"',
          "the path",
          "Fixed parts must match exactly; :id matches any one segment.",
        ],
        [
          "(req, res) =>",
          "the handler",
          "Express calls it when the route matches.",
        ],
        ["req.params.id", "a parameter", "The text that stood where :id is."],
        ["res.json", "the answer", "Sends JSON with status 200."],
      ],
    ),
  ),

  part(
    "params",
    "Path parameters: req.params",
    explain(
      'A part of the path starting with `:` is a [[path-parameter|path parameter]]. It matches any one segment, and Express puts what it found in `req.params` under that name. `/api/notes/7` against `/api/notes/:id` gives `req.params.id === "7"`. Note the quotes: params are always strings, because they come from the URL.',
    ),
    code(
      "js",
      "Params are text",
      [
        'app.get("/api/notes/:id", (req, res) => {',
        '  req.params.id;         // "7"',
        "  req.params.id === 7;   // false",
        "  Number(req.params.id); // 7",
        "});",
      ],
      {
        2: "for GET /api/notes/7",
        3: "a string never equals a number",
        4: "turn it into a number before comparing",
      },
    ),
    quickCheck(
      "For `GET /api/users/42/notes/9` and the route `/api/users/:userId/notes/:noteId`, what is `req.params`?",
      [
        "{ userId: 42, noteId: 9 }",
        '{ userId: "42", noteId: "9" }',
        '{ id: "9" }',
      ],
      1,
      "Each `:name` becomes a key in `req.params`, and every value is a string, because it was cut out of the URL.",
    ),
  ),

  part(
    "query",
    "The query string: req.query",
    explain(
      "Everything after `?` is the [[query-parameter|query string]]. It isn't part of the route's path, so `/api/notes?sort=old` still matches `/api/notes`. Express reads it into `req.query`, an object. Like params, the values are strings, and a key that wasn't sent is `undefined`, so give it a default.",
    ),
    code(
      "js",
      "Reading the query",
      [
        "// GET /api/notes?sort=old&limit=20",
        'app.get("/api/notes", (req, res) => {',
        '  const sort = req.query.sort ?? "new";',
        "  const limit = Number(req.query.limit);",
        "  res.json({ sort, limit });",
        "});",
      ],
      {
        3: '"old" here; "new" when it is left out',
        4: '"20" becomes 20 (NaN if it is left out)',
        5: '{ "sort": "old", "limit": 20 }',
      },
    ),
    keyPoints(
      "Path params pick which thing: /notes/7.",
      "Query params change how: ?sort=old&limit=20.",
      "Both arrive as strings. Convert and check them.",
    ),
  ),

  part(
    "req",
    "The req object",
    explain(
      "`req` holds everything about the request that arrived. Some parts are always there; `body` and `cookies` are only filled in when the right middleware ran first (the next module). You'll read these in nearly every handler.",
    ),
    reference("What's on req", [
      ["req.method", "The HTTP method.", '"POST"'],
      ["req.path", "The path, without the query string.", '"/api/notes/7"'],
      ["req.params", "Path parameters, as strings.", '{ id: "7" }'],
      ["req.query", "The query string, as an object.", '{ sort: "old" }'],
      [
        "req.headers",
        "Request headers, names in lower case.",
        'req.headers["content-type"]',
      ],
      [
        "req.body",
        "The parsed body. Needs express.json().",
        '{ title: "Milk" }',
      ],
      ["req.cookies", "Cookies. Needs cookieParser().", '{ token: "eyJ…" }'],
    ]),
  ),

  part(
    "res",
    "The res object: one answer per request",
    explain(
      "`res` builds the answer. `res.status(code)` sets the [[http-status-codes|status code]] and returns `res`, so you can chain it. Then one call sends the answer and ends it: `res.json` for JSON, `res.send` for text, `res.end` for no body. Every request gets exactly one answer: none and the browser waits forever, two and Express throws an error.",
    ),
    code(
      "js",
      "Ways to answer",
      [
        "res.json(notes);",
        "res.status(201).json(note);",
        'res.status(404).json({ error: "Not found" });',
        "res.status(204).end();",
        'res.send("pong");',
        'res.set("Cache-Control", "no-store");',
      ],
      {
        1: "200 is the default status",
        2: "created: status first, then the body",
        4: "no body at all",
        5: "plain text (or HTML)",
        6: "set a header; it doesn't send anything",
      },
    ),
    keyPoints(
      "status() and set() only prepare; json(), send(), end() send.",
      "Send once. Use return so the code after can't send again.",
      "res.json sets Content-Type: application/json for you.",
    ),
  ),

  part(
    "routers",
    "Routers: routes in groups",
    explain(
      'Putting every route in `app.js` gets long. An [[express-router|`express.Router()`]] is a small group of routes in its own file. You mount it with `app.use("/api/notes", notesRoutes)`: every route inside then starts with `/api/notes`, so the router\'s `"/"` answers `/api/notes` and its `"/:id"` answers `/api/notes/7`.',
    ),
    code(
      "js",
      "A router and where it's mounted",
      [
        "// routes/notes.js",
        "export const notesRoutes = express.Router();",
        'notesRoutes.get("/", listNotes);',
        'notesRoutes.post("/", createNote);',
        'notesRoutes.put("/:id", updateNote);',
        'notesRoutes.delete("/:id", deleteNote);',
        "",
        "// app.js",
        'app.use("/api/notes", notesRoutes);',
      ],
      {
        3: "GET /api/notes",
        5: "PUT /api/notes/7",
        9: "the prefix is added here, once",
      },
    ),
    inTheNotesApp(
      "`routes/notes.js` holds the four notes routes and `routes/auth.js` holds register, login, logout and me. `app.js` mounts them under `/api/notes` and `/api/auth`.",
      { fileId: "backend/src/routes/notes.js" },
    ),
    inTheNotesApp(
      'The auth router: `authRoutes.post("/login", …)` answers `POST /api/auth/login`.',
      { fileId: "backend/src/routes/auth.js" },
    ),
  ),

  part(
    "order",
    "First match wins, and 404",
    explain(
      'Express checks routes in the order you wrote them and runs the first one that matches. So a fixed path must come before a parameter that would also match it: `/notes/:id` matches `/notes/search` too, with `id` = `"search"`. If no route matches, Express answers `404 Not Found` with a small HTML page by itself.',
    ),
    code(
      "js",
      "Order matters",
      [
        'app.get("/api/notes/search", searchNotes);',
        'app.get("/api/notes/:id", getNote);',
      ],
      {
        1: "first: /api/notes/search lands here",
        2: "second: /api/notes/7 lands here",
      },
    ),
    quickCheck(
      'The routes are `app.get("/api/notes/:id", getNote)` then `app.get("/api/notes/latest", latest)`. What runs for `GET /api/notes/latest`?',
      [
        "latest, because it matches exactly",
        'getNote, with req.params.id = "latest"',
        "Both, one after the other",
      ],
      1,
      "Express doesn't look for the best match, only the first. `:id` matches any segment, so `getNote` runs and `latest` is never reached. Swap the two lines.",
    ),
  ),

  part(
    "step-by-step",
    "A route match, step by step",
    explain(
      "Here is the idea Express uses, made small: split the pattern and the path at `/`, then compare piece by piece. A piece starting with `:` matches anything and is saved as a parameter; any other piece must be equal.",
    ),
    trace(
      "Matching /api/notes/7",
      [
        "function match(pattern, path) {",
        '  const a = pattern.split("/");',
        '  const b = path.split("/");',
        "  if (a.length !== b.length) return null;",
        "  const params = {};",
        "  for (let i = 0; i < a.length; i++) {",
        '    if (a[i][0] === ":") {',
        "      params[a[i].slice(1)] = b[i];",
        "    } else if (a[i] !== b[i]) {",
        "      return null;",
        "    }",
        "  }",
        "  return params;",
        "}",
        'match("/api/notes/:id", "/api/notes/7");',
      ],
      [
        {
          line: 15,
          note: "A request for /api/notes/7 is checked against the route /api/notes/:id.",
          vars: [],
        },
        {
          line: 2,
          note: "The pattern splits into four pieces. The first is empty, because the path starts with /.",
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
          ],
          stack: ["match"],
        },
        {
          line: 3,
          note: "The path splits the same way.",
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
          ],
          stack: ["match"],
        },
        {
          line: 4,
          note: "Four pieces each, so it can still match. /api/notes/7/x would stop here.",
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
          ],
          stack: ["match"],
        },
        {
          line: 5,
          note: "An empty object to collect the parameters.",
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
            ["params", "{}"],
          ],
          stack: ["match"],
        },
        {
          line: 9,
          note: 'i is 1: "api" equals "api", so the loop goes on. (i = 0 compared two empty pieces the same way.)',
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
            ["params", "{}"],
            ["i", "1"],
          ],
          stack: ["match"],
        },
        {
          line: 9,
          note: 'i is 2: "notes" equals "notes".',
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
            ["params", "{}"],
            ["i", "2"],
          ],
          stack: ["match"],
        },
        {
          line: 7,
          note: 'i is 3: ":id" starts with a colon, so it is a parameter.',
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
            ["params", "{}"],
            ["i", "3"],
          ],
          stack: ["match"],
        },
        {
          line: 8,
          note: 'Its name is "id" and its value is the text "7".',
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
            ["params", '{ id: "7" }'],
            ["i", "3"],
          ],
          stack: ["match"],
        },
        {
          line: 13,
          note: "Every piece matched. Express would now call the handler with req.params set to this object.",
          vars: [
            ["pattern", '"/api/notes/:id"'],
            ["path", '"/api/notes/7"'],
            ["a", '["", "api", "notes", ":id"]'],
            ["b", '["", "api", "notes", "7"]'],
            ["params", '{ id: "7" }'],
          ],
          stack: ["match"],
          output: '{ id: "7" }',
        },
      ],
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Comparing a param to a number",
      wrong: [
        "const note = notes.find(",
        "  (n) => n.id === req.params.id,",
        ");",
      ],
      problem:
        'note ids are numbers and req.params.id is the string "7", so nothing is ever found.',
      right: [
        "const id = Number(req.params.id);",
        "const note = notes.find((n) => n.id === id);",
      ],
      why: "Everything from the URL is text. Convert it first (and check it is a real number).",
    }),
    mistake({
      title: "Sending two answers",
      wrong: [
        "if (!note) {",
        '  res.status(404).json({ error: "Not found" });',
        "}",
        "res.json(note);",
      ],
      problem:
        "For a missing note both lines run. Express throws “Cannot set headers after they are sent”.",
      right: [
        "if (!note) {",
        '  return res.status(404).json({ error: "Not found" });',
        "}",
        "res.json(note);",
      ],
      why: "return stops the function after the first answer.",
    }),
    mistake({
      title: "A parameter route before a fixed one",
      wrong: [
        'app.get("/api/notes/:id", getNote);',
        'app.get("/api/notes/search", search);',
      ],
      problem: 'search never runs: :id matches "search" first.',
      right: [
        'app.get("/api/notes/search", search);',
        'app.get("/api/notes/:id", getNote);',
      ],
      why: "First match wins, so put the most specific paths first.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Match a pattern",
      task: 'Write `matchRoute(pattern, path)`. Split both at `/`. If they have a different number of pieces, or a fixed piece differs, return `null`. A piece like `:id` matches anything: return an object with every parameter, e.g. `{ id: "7" }`.',
      starter: [
        "function matchRoute(pattern, path) {",
        "  return pattern === path ? {} : null;",
        "}",
      ],
      tests: [
        ['matchRoute("/api/notes/:id", "/api/notes/7")', '{ id: "7" }'],
        ['matchRoute("/api/notes", "/api/notes")', "{}"],
        ['matchRoute("/api/notes/:id", "/api/notes")', "null"],
        ['matchRoute("/api/notes/:id", "/api/users/7")', "null"],
        [
          'matchRoute("/users/:userId/notes/:noteId", "/users/3/notes/9")',
          '{ userId: "3", noteId: "9" }',
        ],
      ],
      hint: 'Loop over the pieces. If a pattern piece starts with ":", save `params[piece.slice(1)] = pathPiece`.',
      solution: [
        "function matchRoute(pattern, path) {",
        '  const a = pattern.split("/");',
        '  const b = path.split("/");',
        "  if (a.length !== b.length) return null;",
        "  const params = {};",
        "  for (let i = 0; i < a.length; i++) {",
        '    if (a[i].startsWith(":")) {',
        "      params[a[i].slice(1)] = b[i];",
        "    } else if (a[i] !== b[i]) {",
        "      return null;",
        "    }",
        "  }",
        "  return params;",
        "}",
      ],
    }),
    yourTurn({
      title: "First match wins",
      task: 'Write `handle(routes, method, path)`. Each route is `{ method, path, name }` with an exact path. Return the `name` of the first route whose method and path both match, or `"404"` if none does.',
      starter: [
        "function handle(routes, method, path) {",
        "  const route = routes.find(",
        "    (r) => r.path === path,",
        "  );",
        '  return route ? route.name : "404";',
        "}",
      ],
      tests: [
        [
          'handle([{ method: "GET", path: "/api/notes", name: "list" }, { method: "POST", path: "/api/notes", name: "create" }], "POST", "/api/notes")',
          '"create"',
        ],
        [
          'handle([{ method: "GET", path: "/a", name: "one" }, { method: "GET", path: "/a", name: "two" }], "GET", "/a")',
          '"one"',
        ],
        [
          'handle([{ method: "GET", path: "/api/notes", name: "list" }], "DELETE", "/api/notes")',
          '"404"',
        ],
        ['handle([], "GET", "/")', '"404"'],
      ],
      hint: "`find` already returns the first match. It just has to check the method too.",
      solution: [
        "function handle(routes, method, path) {",
        "  const route = routes.find(",
        "    (r) => r.method === method && r.path === path,",
        "  );",
        '  return route ? route.name : "404";',
        "}",
      ],
    }),
    yourTurn({
      title: "Get one note",
      task: 'Write the handler `getNote(req, res, notes)`. `req.params.id` is a string; the notes have number ids. Send the matching note with `res.json(note)`, or `res.status(404).json({ error: "Not found" })` when there\'s none. Send only one answer.',
      starter: [
        "function getNote(req, res, notes) {",
        "  const note = notes.find(",
        "    (n) => n.id === req.params.id,",
        "  );",
        "  res.json(note);",
        "}",
      ],
      tests: [
        [
          '(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; getNote({ params: { id: "2" } }, res, [{ id: 1, title: "Tea" }, { id: 2, title: "Milk" }]); return [res.statusCode, res.body]; })()',
          '[200, { id: 2, title: "Milk" }]',
        ],
        [
          '(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; getNote({ params: { id: "9" } }, res, [{ id: 1, title: "Tea" }]); return [res.statusCode, res.body]; })()',
          '[404, { error: "Not found" }]',
        ],
      ],
      hint: "Convert with `Number(req.params.id)`, then `return res.status(404)…` when nothing was found.",
      solution: [
        "function getNote(req, res, notes) {",
        "  const id = Number(req.params.id);",
        "  const note = notes.find((n) => n.id === id);",
        "  if (!note) {",
        "    return res",
        "      .status(404)",
        '      .json({ error: "Not found" });',
        "  }",
        "  res.json(note);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Routes cheat sheet", [
      [
        "app.get(path, fn)",
        "Run fn for GET on this path.",
        'app.get("/api/notes", list)',
      ],
      [
        "app.post / put / delete",
        "The same for other methods.",
        'app.delete("/api/notes/:id", del)',
      ],
      [
        ":name",
        "Matches one segment; read it from req.params.",
        'req.params.id // "7"',
      ],
      ["req.query", "The query string, as strings.", 'req.query.sort // "old"'],
      [
        "res.status(c)",
        "Set the status; chain the send.",
        "res.status(201).json(note)",
      ],
      [
        "res.json / send / end",
        "Send the one answer.",
        "res.status(204).end()",
      ],
      [
        "express.Router()",
        "A group of routes in its own file.",
        'notesRoutes.get("/", list)',
      ],
      [
        "app.use(prefix, router)",
        "Mount a router under a path.",
        'app.use("/api/notes", notesRoutes)',
      ],
      [
        "Order",
        "First match wins: specific paths first.",
        "/search before /:id",
      ],
      ["No match", "Express answers 404 Not Found.", "GET /api/nope"],
    ]),
    quickCheck(
      'The notes router is mounted with `app.use("/api/notes", notesRoutes)`. Which request does `notesRoutes.put("/:id", updateNote)` answer?',
      ["PUT /:id", "PUT /api/notes/7", "PUT /api/notes?id=7"],
      1,
      "The mount path is added in front of every route in the router, so `/:id` becomes `/api/notes/:id`. The id is a path parameter, not a query string.",
    ),
  ),
);
