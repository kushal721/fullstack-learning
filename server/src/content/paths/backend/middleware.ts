import {
  analogy,
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  scene,
  trace,
  yourTurn,
} from "../blocks.js";

// Middleware: a function with next, a middleware taken apart, the chain in
// order, express.json() and req.body, answering or passing on, router-level
// and per-route middleware, a chain step by step, a logger and a timer,
// static files, mistakes, practice and a recap.
export const middlewareModule = moduleLesson(
  "middleware",
  "Middleware: code on the way in",
  45,
  [
    "Write middleware as a function of (req, res, next).",
    "Predict the order middleware runs in from the app.use calls.",
    "Use express.json() to fill req.body, and say what happens without it.",
    "Add middleware to the whole app, to one router, or to a single route.",
    "Make every middleware either answer the request or call next().",
  ],

  part(
    "what-it-is",
    "Code that runs before the route",
    explain(
      "Some jobs are the same for many routes: read the JSON body, read the cookies, check who is logged in. Instead of repeating them in every handler, you write them once as [[express-middleware|middleware]]: a function that runs on the request before the route's handler does. Each one either answers the request itself or passes it on with [[next-function|`next()`]].",
    ),
    analogy(
      "Security checks at an airport: each desk looks at you, then waves you on to the next one or stops you there.",
    ),
    diagram([
      ["Request", "POST /api/notes"],
      ["express.json()", "next()"],
      ["cookieParser()", "next()"],
      ["requireAuth", "next() or 401"],
      ["Handler", "createNote"],
    ]),
  ),

  part(
    "anatomy",
    "A middleware taken apart",
    explain(
      "Middleware looks like a route handler with a third parameter. `app.use(fn)` adds it for every request, whatever the method or path.",
    ),
    anatomy(
      "A logging middleware",
      [
        "function logRequests(req, res, next) {",
        "  console.log(req.method, req.path);",
        "  next();",
        "}",
      ],
      [
        ["req", "the request", "The same req object the handler will get."],
        [
          "res",
          "the response",
          "Middleware can answer with it, and stop the chain.",
        ],
        [
          "next",
          "pass it on",
          "A function Express gives you: call it to go to the next step.",
        ],
        [
          "console.log",
          "its job",
          "Here it only looks. It could also add things to req.",
        ],
        ["next();", "done", "Without this line the request would hang."],
      ],
    ),
    code(
      "js",
      "Adding it to the app",
      ["app.use(logRequests);", 'app.get("/api/notes", listNotes);'],
      {
        1: "runs for every request",
        2: "runs after logRequests calls next()",
      },
    ),
  ),

  part(
    "order",
    "The chain runs in order",
    explain(
      "Express keeps one list of middleware and routes, in the order your code added them with `app.use`, `app.get` and the rest. A request walks down that list from the top. So something added before the routes runs first, and something added after them only sees requests that no route answered.",
    ),
    code(
      "js",
      "The order in app.js",
      [
        "app.use(express.json());",
        "app.use(cookieParser());",
        "",
        'app.get("/api/health", health);',
        'app.use("/api/auth", authRoutes);',
        'app.use("/api/notes", notesRoutes);',
      ],
      {
        1: "1st: JSON body → req.body",
        2: "2nd: Cookie header → req.cookies",
        4: "then the routes, top to bottom",
      },
    ),
    inTheNotesApp(
      "`createApp` in `app.js` adds `express.json()` and `cookieParser()` first, then the health route and the two routers, and an error handler last.",
      { fileId: "backend/src/app.js" },
    ),
    scene("request-reaches-code"),
  ),

  part(
    "json-body",
    "express.json() and req.body",
    explain(
      "A POST arrives with its [[request-body|request body]] as plain text. `express.json()` is middleware that reads that text when the `Content-Type` is `application/json`, parses it, and puts the result in `req.body`. Without it, `req.body` is `undefined`. If the JSON is broken, it passes a 400 error on to the error handler instead.",
    ),
    code(
      "http",
      "What arrives",
      [
        "POST /api/notes HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"title":"Milk","content":"2 litres"}',
      ],
      {
        2: "express.json() only reads JSON bodies",
        4: 'becomes req.body = { title: "Milk", … }',
      },
    ),
    quickCheck(
      "You forgot `app.use(express.json())`. A client POSTs a note as JSON. What is `req.body` in the handler?",
      [
        "The JSON text, as a string",
        "undefined",
        "The parsed object, Express always parses JSON",
      ],
      1,
      "Express doesn't read bodies on its own. Without the middleware nothing fills req.body, so `req.body.title` throws a TypeError.",
    ),
  ),

  part(
    "answer-or-next",
    "Answer, or call next()",
    explain(
      "Every middleware ends one of two ways. It calls `next()`, and the request moves on. Or it sends a response with `res`, and the chain stops there: no later middleware or handler runs. A login check does both: `next()` for a logged-in user, a 401 for everyone else.",
    ),
    code(
      "js",
      "requireAuth, simplified",
      [
        "function requireAuth(req, res, next) {",
        "  const user = checkLogin(req.cookies.token);",
        "  if (!user) {",
        "    return res",
        "      .status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "  req.user = user;",
        "  next();",
        "}",
      ],
      {
        2: "checkLogin stands in for the token check",
        4: "answered: the chain stops here",
        8: "leave something for the handler",
        9: "passed: the handler runs next",
      },
    ),
    inTheNotesApp(
      "`requireAuth` reads the `token` cookie, sets `req.user = { id }` and calls `next()`, or answers 401 Please log in.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
    keyPoints(
      "Answer with res, or call next(). Never neither.",
      "Never both: after next(), don't touch res.",
      "Middleware passes data on by adding it to req, like req.user.",
    ),
  ),

  part(
    "where",
    "For the app, a router, or one route",
    explain(
      "`app.use(fn)` runs for every request. A router has its own `use`, which runs only for that router's routes. And you can put middleware right inside a single route, between the path and the handler: it runs only there. Pick the smallest place that covers every route that needs it.",
    ),
    code(
      "js",
      "Three places",
      [
        "app.use(express.json());",
        "",
        "notesRoutes.use(requireAuth);",
        'notesRoutes.get("/", listNotes);',
        "",
        'authRoutes.post("/login", login);',
        'authRoutes.get("/me", requireAuth,',
        "  currentUser);",
      ],
      {
        1: "app-level: every request",
        3: "router-level: every notes route",
        6: "no check: you can't be logged in yet",
        7: "per-route: only GET /api/auth/me",
      },
    ),
    inTheNotesApp(
      "Every notes route needs a user, so `routes/notes.js` calls `notesRoutes.use(requireAuth)` once. In `routes/auth.js` only `/me` needs it.",
      { fileId: "backend/src/routes/notes.js" },
    ),
    quickCheck(
      "Why doesn't `routes/auth.js` put `authRoutes.use(requireAuth)` at the top?",
      [
        "Router-level middleware isn't allowed in auth routes",
        "Register and login must work for people who aren't logged in yet",
        "requireAuth only works on GET requests",
      ],
      1,
      "Router-level middleware would run for every auth route, so nobody could log in without already being logged in. Only `/me` needs a user, so it gets requireAuth per route.",
    ),
  ),

  part(
    "step-by-step",
    "A chain, step by step",
    explain(
      "How does `next` know what runs next? Express keeps a position in the list. Here is the same idea made small: `run` holds a counter, and `next` calls the middleware at that position and moves the counter on.",
    ),
    trace(
      "Running two middleware",
      [
        "function run(fns, req, res) {",
        "  let i = 0;",
        "  const next = () => fns[i++](req, res, next);",
        "  next();",
        "}",
        "function json(req, res, next) {",
        "  req.body = JSON.parse(req.raw);",
        "  next();",
        "}",
        "function create(req, res) {",
        "  res.statusCode = 201;",
        "  console.log(201, req.body.title);",
        "}",
        'const req = { raw: \'{"title":"Milk"}\' };',
        "run([json, create], req, {});",
      ],
      [
        {
          line: 14,
          note: "A request arrives with its body still as text.",
          vars: [["req", '{ raw: \'{"title":"Milk"}\' }']],
        },
        {
          line: 2,
          note: "run starts at position 0 of the chain.",
          vars: [
            ["fns", "[json, create]"],
            ["req", "{ raw: … }"],
            ["res", "{}"],
            ["i", "0"],
          ],
          stack: ["run"],
        },
        {
          line: 4,
          note: "The first next() call: fns[0] is json, and i moves on to 1.",
          vars: [
            ["fns", "[json, create]"],
            ["req", "{ raw: … }"],
            ["res", "{}"],
            ["i", "1"],
            ["next", "() => …"],
          ],
          stack: ["run", "next"],
        },
        {
          line: 7,
          note: "json parses the text and stores the result on req. It is the same req object the handler will see.",
          vars: [
            ["req", '{ raw: …, body: { title: "Milk" } }'],
            ["res", "{}"],
            ["next", "() => …"],
          ],
          stack: ["run", "next", "json"],
        },
        {
          line: 8,
          note: "json is done and calls next(): fns[1] is create, and i moves on to 2.",
          vars: [
            ["req", '{ raw: …, body: { title: "Milk" } }'],
            ["res", "{}"],
            ["next", "() => …"],
          ],
          stack: ["run", "next", "json", "next"],
        },
        {
          line: 11,
          note: "create is the handler. It answers, so it doesn't need next.",
          vars: [
            ["req", '{ raw: …, body: { title: "Milk" } }'],
            ["res", "{ statusCode: 201 }"],
          ],
          stack: ["run", "next", "json", "next", "create"],
        },
        {
          line: 12,
          note: "req.body was filled in by json, earlier in the chain.",
          vars: [
            ["req", '{ raw: …, body: { title: "Milk" } }'],
            ["res", "{ statusCode: 201 }"],
          ],
          stack: ["run", "next", "json", "next", "create"],
          output: "201 Milk",
        },
      ],
    ),
  ),

  part(
    "logger",
    "Writing your own: a logger and a timer",
    explain(
      "Your own middleware is just a function. A useful first one logs each request with how long it took. The time is only known once the response has gone, so it listens for `res`'s `finish` event, then calls `next()` straight away. The Notes App has no request logger; it only logs errors with `console.error`.",
    ),
    code(
      "js",
      "A request timer (not in the Notes App)",
      [
        "app.use((req, res, next) => {",
        "  const start = Date.now();",
        '  res.on("finish", () => {',
        "    const ms = Date.now() - start;",
        "    console.log(req.method, req.path,",
        "      res.statusCode, `${ms}ms`);",
        "  });",
        "  next();",
        "});",
      ],
      {
        1: "first in app.js, so it times everything",
        3: "runs later, after the answer is sent",
        6: "POST /api/notes 201 12ms",
        8: "don't wait: pass the request on now",
      },
    ),
  ),

  part(
    "static",
    "Serving files: express.static",
    explain(
      "Some requests want a file, not code: an image, a CSS file, a built React app. Those are [[static-files|static files]]. `express.static(folder)` is middleware that looks for a file matching the path. If it finds one, it sends it and the chain stops; if not, it calls `next()` and your routes get a turn.",
    ),
    code(
      "js",
      "Serving a folder",
      [
        'app.use(express.static("public"));',
        "",
        "// GET /logo.png → public/logo.png",
        "// GET /api/notes → no such file: next()",
      ],
      {
        1: "a folder next to where node was started",
      },
    ),
    keyPoints(
      "The Notes App API serves no files: it only answers /api.",
      "In development Vite serves the React app and forwards /api.",
      "One server could serve the built app with express.static.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting next()",
      wrong: [
        "app.use((req, res, next) => {",
        "  console.log(req.method, req.path);",
        "});",
      ],
      problem:
        "Nothing answers and nothing passes it on, so every request hangs until the browser gives up.",
      right: [
        "app.use((req, res, next) => {",
        "  console.log(req.method, req.path);",
        "  next();",
        "});",
      ],
      why: "Every middleware must either send a response or call next().",
    }),
    mistake({
      title: "Adding express.json() after the routes",
      wrong: [
        'app.use("/api/notes", notesRoutes);',
        "app.use(express.json());",
      ],
      problem:
        "The notes routes run first and answer, so express.json() never runs for them and req.body is undefined.",
      right: [
        "app.use(express.json());",
        'app.use("/api/notes", notesRoutes);',
      ],
      why: "Middleware only helps the routes added after it.",
    }),
    mistake({
      title: "Answering and then calling next()",
      wrong: [
        "if (!req.user) {",
        '  res.status(401).json({ error: "Log in" });',
        "}",
        "next();",
      ],
      problem:
        "The 401 is sent, then the handler runs and tries to answer again: “Cannot set headers after they are sent”.",
      right: [
        "if (!req.user) {",
        '  return res.status(401).json({ error: "Log in" });',
        "}",
        "next();",
      ],
      why: "return stops the middleware once it has answered.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Run a chain",
      task: "Write `run(middlewares, req, res)`. Call the first middleware with `(req, res, next)`. When a middleware calls `next()`, call the next one. If one doesn't call `next()`, stop. An empty list does nothing.",
      starter: [
        "function run(middlewares, req, res) {",
        "  middlewares[0](req, res, () => {});",
        "}",
      ],
      tests: [
        [
          '(() => { const a = (req, res, next) => { req.seen.push("a"); next(); }; const b = (req, res, next) => { req.seen.push("b"); next(); }; const req = { seen: [] }; run([a, b], req, {}); return req.seen; })()',
          '["a", "b"]',
        ],
        [
          '(() => { const a = (req, res, next) => { req.seen.push("a"); }; const b = (req, res, next) => { req.seen.push("b"); next(); }; const req = { seen: [] }; run([a, b], req, {}); return req.seen; })()',
          '["a"]',
        ],
        [
          "(() => { const req = { seen: [] }; run([], req, {}); return req.seen; })()",
          "[]",
        ],
      ],
      hint: "Keep a counter `i`. Write `function next()` that takes `middlewares[i++]` and, if there is one, calls it with `(req, res, next)`. Then call `next()` once.",
      solution: [
        "function run(middlewares, req, res) {",
        "  let i = 0;",
        "  function next() {",
        "    const mw = middlewares[i++];",
        "    if (mw) mw(req, res, next);",
        "  }",
        "  next();",
        "}",
      ],
    }),
    yourTurn({
      title: "Logged in or 401",
      task: 'Write the middleware `requireUser(req, res, next)`. If `req.user` is set, call `next()`. Otherwise answer `res.status(401).json({ error: "Please log in" })` and don\'t call `next()`.',
      starter: ["function requireUser(req, res, next) {", "  next();", "}"],
      tests: [
        [
          "(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; let passed = false; requireUser({ user: { id: 1 } }, res, () => { passed = true; }); return [passed, res.statusCode]; })()",
          "[true, 200]",
        ],
        [
          "(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; let passed = false; requireUser({}, res, () => { passed = true; }); return [passed, res.statusCode, res.body]; })()",
          '[false, 401, { error: "Please log in" }]',
        ],
      ],
      hint: "`if (!req.user) return res.status(401).json(…);` then `next();`.",
      solution: [
        "function requireUser(req, res, next) {",
        "  if (!req.user) {",
        "    return res",
        "      .status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "  next();",
        "}",
      ],
    }),
    yourTurn({
      title: "A logger you can configure",
      task: 'Write `logger(lines)`. It returns a middleware that pushes `"METHOD path"` (e.g. `"GET /api/notes"`) onto the `lines` array, then calls `next()`.',
      starter: [
        "function logger(lines) {",
        "  return (req, res, next) => {",
        "    lines.push(req.path);",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const lines = []; const mw = logger(lines); let passed = false; mw({ method: "GET", path: "/api/notes" }, {}, () => { passed = true; }); return [lines, passed]; })()',
          '[["GET /api/notes"], true]',
        ],
        [
          '(() => { const lines = []; const mw = logger(lines); mw({ method: "POST", path: "/a" }, {}, () => {}); mw({ method: "PUT", path: "/b" }, {}, () => {}); return lines; })()',
          '["POST /a", "PUT /b"]',
        ],
      ],
      hint: "Use a template string: `${req.method} ${req.path}`. Don't forget `next()`.",
      solution: [
        "function logger(lines) {",
        "  return (req, res, next) => {",
        "    lines.push(`${req.method} ${req.path}`);",
        "    next();",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Middleware cheat sheet", [
      [
        "(req, res, next)",
        "A middleware's parameters.",
        "function logRequests(req, res, next)",
      ],
      ["next()", "Pass the request on to the next step.", "next();"],
      [
        "res.status(…).json(…)",
        "Answer now; the chain stops.",
        "return res.status(401).json(e)",
      ],
      [
        "app.use(fn)",
        "Run for every request, in order.",
        "app.use(cookieParser())",
      ],
      [
        "router.use(fn)",
        "Run for every route in one router.",
        "notesRoutes.use(requireAuth)",
      ],
      [
        "Per route",
        "Between the path and the handler.",
        'get("/me", requireAuth, currentUser)',
      ],
      [
        "express.json()",
        "JSON body → req.body. Add it first.",
        'req.body.title // "Milk"',
      ],
      [
        "express.static(dir)",
        "Send files from a folder, or next().",
        'express.static("public")',
      ],
    ]),
    quickCheck(
      "A middleware logs the request and does nothing else. What does the browser see?",
      [
        "The route's normal answer",
        "A 404, because the middleware didn't answer",
        "Nothing: the request hangs until it times out",
      ],
      2,
      "The middleware neither answered nor called next(), so the request is stuck there: no route runs and Express sends nothing.",
    ),
  ),
);
