import {
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
  trace,
  yourTurn,
} from "../blocks.js";

// Logging: why logs and console.log vs a logger, structured JSON lines taken
// apart, log levels, what to log and what never to, a request-logging
// middleware, a request step by step, request ids, pino, where logs go,
// mistakes, practice and a recap.
export const loggingModule = moduleLesson(
  "logging",
  "Logging: what happened, and when",
  40,
  [
    "Explain why a server in production needs logs, and what a logger adds to console.log.",
    "Write structured JSON log lines with a level, a message and named fields.",
    "Decide what to log for each request, and what must never be logged.",
    "Log every request with its status and duration, and tag lines with a request id.",
    "Use pino, and send logs to stdout for the platform to collect.",
  ],

  part(
    "why",
    "Why logs, and why not just console.log",
    explain(
      "In production you can't add a breakpoint or watch the terminal. When a user says “saving failed at 14:05”, logs are the only record of what the server did. `console.log` writes plain text with no level and no fields. A logger adds both, and writes fast enough to log every request. The Notes App only uses `console.log` and `console.error`.",
    ),
    diagram([
      ["Request", "POST /api/notes"],
      ["Server", "writes a log line"],
      ["stdout", "the platform collects it"],
      ["Log viewer", "search, filter, alert"],
    ]),
    code(
      "js",
      "The same event, twice",
      [
        'console.log("saved note 42 for user 7");',
        "",
        "logger.info(",
        "  { noteId: 42, userId: 7 },",
        '  "note saved",',
        ");",
      ],
      {
        1: "a sentence: hard to search for every note 42",
        3: "a level: info",
        4: "fields a log tool can filter on",
      },
    ),
  ),

  part(
    "structured",
    "Structured logs",
    explain(
      "[[structured-logging|Structured logging]] writes each event as one line of JSON with named fields, instead of a sentence. A log tool can then answer questions like “every 500 in the last hour” or “everything request r7 did”, and count and graph them. Here is one line, taken apart.",
    ),
    anatomy(
      "One request, one JSON line",
      [
        '{"level":"info","msg":"request done",',
        ' "reqId":"r7","method":"POST",',
        ' "path":"/api/notes","status":201,',
        ' "ms":12}',
      ],
      [
        ['"level"', "how serious", "info: normal, nothing to do."],
        [
          '"msg"',
          "what happened",
          "A short, fixed text, the same for every request.",
        ],
        [
          '"reqId"',
          "which request",
          "Ties together every line from one request.",
        ],
        [
          '"method"',
          "what was asked",
          "Method and path, without the query string.",
        ],
        ['"status"', "the answer", "201: the note was created."],
        ['"ms"', "how long", "Slow requests are easy to find."],
      ],
    ),
  ),

  part(
    "levels",
    "Log levels",
    explain(
      "Each line has a [[log-level|log level]] saying how serious it is. The app is set to a minimum level, often with a `LOG_LEVEL` variable: lines below it are skipped. Development might show `debug`; production usually shows `info` and above, so the logs stay readable and cheap to store.",
    ),
    reference("The usual levels, low to high", [
      ["debug", "Detail for developers, off in production.", "query took 3 ms"],
      ["info", "Normal events worth recording.", "request done, 201"],
      ["warn", "Odd but handled; worth a look.", "401 Please log in"],
      [
        "error",
        "Something failed; someone may need to act.",
        "database connection lost",
      ],
      ["fatal", "The process is about to stop.", "missing JWT_SECRET"],
    ]),
    quickCheck(
      "The level is set to `warn`. Which line is written?",
      [
        "debug: query took 3 ms",
        "info: request done",
        "error: database connection lost",
      ],
      2,
      "Only lines at or above the minimum appear. error is above warn; debug and info are below it.",
    ),
  ),

  part(
    "what-to-log",
    "What to log, and what never to",
    explain(
      "Log enough to rebuild what happened: what was asked, by whom, the answer and how long it took. Never log anything that grants access or is private: passwords, tokens, cookies, the Authorization header. Avoid whole request bodies: a login body holds a password, and a note's content is the user's own business.",
    ),
    reference("Log it?", [
      ["Method and path", "Yes: what was asked.", "POST /api/notes"],
      ["Status and duration", "Yes: the answer and its speed.", "201, 12 ms"],
      ["Ids", "Yes: request, user and note ids.", "reqId r7, userId 7"],
      [
        "Error stack",
        "Yes, on errors: where it broke.",
        "TypeError at notesController.js:31",
      ],
      ["Passwords, tokens", "Never.", "req.body.password"],
      [
        "Cookie, Authorization",
        "Never: they log someone in.",
        "Cookie: token=eyJ…",
      ],
      ["Whole bodies", "No: secrets and private data hide there.", "req.body"],
    ]),
  ),

  part(
    "middleware",
    "Logging every request",
    explain(
      "One line per request, written when the response is finished, covers most needs. A [[express-middleware|middleware]] notes the start time, then listens for the response's `finish` event, which fires once the last byte is sent. By then the status is known. It must call `next()`, or no request would get past it.",
    ),
    code(
      "js",
      "A request logger (not in the Notes App)",
      [
        "function logRequests(req, res, next) {",
        "  const start = performance.now();",
        '  res.on("finish", () => {',
        "    const ms = Math.round(",
        "      performance.now() - start);",
        "    console.log(JSON.stringify({",
        "      method: req.method,",
        "      path: req.path,",
        "      status: res.statusCode,",
        "      ms,",
        "    }));",
        "  });",
        "  next();",
        "}",
        "app.use(logRequests); // before routes",
      ],
      {
        2: "a precise clock, in milliseconds",
        3: "runs later, after the response is sent",
        8: "path, not the URL: query strings can hold tokens",
        13: "let the request carry on",
        15: "first, so it sees every request",
      },
    ),
  ),

  part(
    "step-by-step",
    "A request, step by step",
    explain(
      "Follow `POST /api/notes` through the logger. Notice the order: the listener is set up first, the route runs, and only when the response is done does the line get written.",
    ),
    trace(
      "Logging POST /api/notes",
      [
        "function logRequests(req, res, next) {",
        "  const start = performance.now();",
        '  res.on("finish", () => {',
        "    const ms = Math.round(",
        "      performance.now() - start);",
        "    console.log(JSON.stringify({",
        "      method: req.method,",
        "      path: req.path,",
        "      status: res.statusCode,",
        "      ms,",
        "    }));",
        "  });",
        "  next();",
        "}",
      ],
      [
        {
          line: 2,
          note: "The request arrives. The clock reads 1000 ms.",
          vars: [
            ["req", '{ method: "POST", path: "/api/notes" }'],
            ["res", "{ statusCode: 200 }"],
            ["next", "ƒ next"],
            ["start", "1000"],
          ],
          stack: ["logRequests"],
        },
        {
          line: 3,
          note: "A listener is attached. It doesn't run now; it waits for `finish`.",
          vars: [
            ["req", '{ method: "POST", path: "/api/notes" }'],
            ["res", "{ statusCode: 200 }"],
            ["next", "ƒ next"],
            ["start", "1000"],
          ],
          stack: ["logRequests"],
        },
        {
          line: 13,
          note: "`next()` passes the request on. The auth check and `createNote` run and send 201.",
          vars: [
            ["req", '{ method: "POST", path: "/api/notes" }'],
            ["res", "{ statusCode: 201 }"],
            ["next", "ƒ next"],
            ["start", "1000"],
          ],
          stack: ["logRequests"],
        },
        {
          line: 4,
          note: "The response is sent, so `finish` fires. The clock reads 1012: it took 12 ms.",
          vars: [
            ["req", '{ method: "POST", path: "/api/notes" }'],
            ["res", "{ statusCode: 201 }"],
            ["next", "ƒ next"],
            ["start", "1000"],
            ["ms", "12"],
          ],
          stack: ["finish listener"],
        },
        {
          line: 6,
          note: "One JSON line goes to stdout, with the status the route chose.",
          vars: [
            ["req", '{ method: "POST", path: "/api/notes" }'],
            ["res", "{ statusCode: 201 }"],
            ["next", "ƒ next"],
            ["start", "1000"],
            ["ms", "12"],
          ],
          stack: ["finish listener"],
          output: '{"method":"POST","path":"/api/notes","status":201,"ms":12}',
        },
      ],
    ),
  ),

  part(
    "request-id",
    "Request ids",
    explain(
      "With many requests at once, their lines mix together. A [[request-id|request id]] fixes that: middleware gives each request a unique id, every line about it includes the id, and the response sends it back in a header. A user reporting an error can quote it, and you find exactly that request's lines.",
    ),
    code(
      "js",
      "Giving each request an id",
      [
        "app.use((req, res, next) => {",
        "  req.id = crypto.randomUUID();",
        '  res.set("X-Request-Id", req.id);',
        "  next();",
        "});",
        "",
        "// later, in the error handler:",
        "console.error({ reqId: req.id, err });",
        "res.status(500).json({",
        '  error: "Something went wrong",',
        "  requestId: req.id,",
        "});",
      ],
      {
        2: "unique per request",
        3: "the client can see it too",
        11: "safe to show: it only helps you find the logs",
      },
    ),
  ),

  part(
    "pino",
    "pino, and where logs go",
    explain(
      "pino is the usual Node.js logger: it writes one JSON line per call and is very fast. pino-http adds a request logger and a request id, and gives each handler `req.log`. This platform's own server uses pino-http, logging method, URL and status and never headers. Write logs to stdout; Docker or the hosting platform collects, stores and searches them.",
    ),
    code(
      "js",
      "pino and pino-http (not in the Notes App)",
      [
        'import pino from "pino";',
        'import { pinoHttp } from "pino-http";',
        "",
        "const logger = pino({",
        '  level: process.env.LOG_LEVEL ?? "info",',
        "  redact: [",
        '    "req.headers.cookie",',
        '    "req.headers.authorization",',
        "  ],",
        "});",
        "app.use(pinoHttp({ logger }));",
        "",
        'req.log.info({ noteId: 42 }, "note saved");',
      ],
      {
        5: "the minimum level, from the environment",
        6: "these fields are replaced before writing",
        11: "one line per request, with an id",
        13: "this line carries the request's id too",
      },
    ),
    inTheNotesApp(
      "The error handler logs with `console.error(err)`; there's no logger, request id or request log.",
      { fileId: "backend/src/app.js" },
    ),
    keyPoints(
      "The app writes to stdout; it doesn't manage log files.",
      "The platform keeps, rotates and searches the logs.",
      "Use the same JSON shape everywhere, so one query finds it all.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Logging the whole body",
      wrong: ["console.log(req.method, req.path, req.body);"],
      problem:
        "On `POST /api/auth/login` the body holds the password, which is now readable by anyone with access to the logs.",
      right: ["console.log(req.method, req.path);"],
      why: "Log named, harmless fields. Never bodies, passwords, tokens or cookies.",
    }),
    mistake({
      title: "Values glued into a sentence",
      wrong: ['console.log("Note " + id + " saved in " + ms);'],
      problem:
        "To find slow saves you'd have to parse sentences, and the wording drifts over time.",
      right: ['logger.info({ noteId: id, ms }, "note saved");'],
      why: "Fixed message, data in fields: easy to filter, count and graph.",
    }),
    mistake({
      title: "Everything at error",
      wrong: ['logger.error("user not logged in");'],
      problem:
        "A 401 is normal. If ordinary events are errors, the real ones are lost, and alerts fire all day.",
      right: ['logger.warn("user not logged in");'],
      why: "Save error for failures someone may need to fix.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Should this line be logged?",
      task: "Levels from low to high are `debug`, `info`, `warn`, `error`. Write `shouldLog(level, minLevel)`: `true` when `level` is at or above `minLevel`.",
      starter: ["function shouldLog(level, minLevel) {", "  return true;", "}"],
      tests: [
        ['shouldLog("error", "warn")', "true"],
        ['shouldLog("info", "info")', "true"],
        ['shouldLog("debug", "info")', "false"],
        ['shouldLog("warn", "error")', "false"],
      ],
      hint: "Put the levels in an array and compare their `indexOf`.",
      solution: [
        "function shouldLog(level, minLevel) {",
        '  const order = ["debug", "info", "warn", "error"];',
        "  return order.indexOf(level) >= order.indexOf(minLevel);",
        "}",
      ],
    }),
    yourTurn({
      title: "One line per request",
      task: 'Write `logLine(req, res, ms)` returning `{ level, method, path, status, ms }`. `level` is `"error"` for status 500 and above, `"warn"` for 400–499 and `"info"` otherwise. Use `req.path`, never the body.',
      starter: [
        "function logLine(req, res, ms) {",
        "  return { ...req, ms };",
        "}",
      ],
      tests: [
        [
          'logLine({ method: "POST", path: "/api/notes", body: { title: "x" } }, { statusCode: 201 }, 12)',
          '{ level: "info", method: "POST", path: "/api/notes", status: 201, ms: 12 }',
        ],
        [
          'logLine({ method: "GET", path: "/api/notes/9" }, { statusCode: 404 }, 3).level',
          '"warn"',
        ],
        [
          'logLine({ method: "GET", path: "/api/notes" }, { statusCode: 500 }, 40).level',
          '"error"',
        ],
      ],
      hint: "Work out `level` from `res.statusCode` first, then build the object from named fields.",
      solution: [
        "function logLine(req, res, ms) {",
        "  const status = res.statusCode;",
        "  const level =",
        '    status >= 500 ? "error"',
        '    : status >= 400 ? "warn"',
        '    : "info";',
        "  const { method, path } = req;",
        "  return { level, method, path, status, ms };",
        "}",
      ],
    }),
    yourTurn({
      title: "Redact the headers",
      task: 'Write `redact(headers)`: a copy where the `cookie` and `authorization` headers (any case) are replaced by `"[redacted]"`. Other headers stay as they are.',
      starter: ["function redact(headers) {", "  return { ...headers };", "}"],
      tests: [
        [
          'redact({ cookie: "token=abc", accept: "application/json" })',
          '{ cookie: "[redacted]", accept: "application/json" }',
        ],
        [
          'redact({ Authorization: "Bearer xyz" })',
          '{ Authorization: "[redacted]" }',
        ],
        ['redact({ host: "localhost" })', '{ host: "localhost" }'],
      ],
      hint: "Loop over `Object.entries` and compare `key.toLowerCase()` with the two names.",
      solution: [
        "function redact(headers) {",
        '  const hidden = ["cookie", "authorization"];',
        "  const out = {};",
        "  for (const [k, v] of Object.entries(headers)) {",
        "    const hide = hidden.includes(k.toLowerCase());",
        '    out[k] = hide ? "[redacted]" : v;',
        "  }",
        "  return out;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Logging cheat sheet", [
      [
        "Structured",
        "One JSON line per event, data in fields.",
        '{"msg":"note saved","noteId":42}',
      ],
      [
        "Levels",
        "debug < info < warn < error; set a minimum.",
        "LOG_LEVEL=info",
      ],
      [
        "Per request",
        "Method, path, status, duration, ids.",
        "POST /api/notes 201 12ms",
      ],
      [
        "Never",
        "Passwords, tokens, cookies, whole bodies.",
        "redact: req.headers.cookie",
      ],
      ["Timing", "Start in middleware, log on finish.", 'res.on("finish", …)'],
      [
        "Request id",
        "One id on every line of a request.",
        "X-Request-Id: 5b1e…",
      ],
      [
        "pino",
        "A fast JSON logger; pino-http logs requests.",
        "req.log.info(…)",
      ],
      [
        "Where",
        "stdout; the platform collects it.",
        "docker logs, Render logs",
      ],
    ]),
    quickCheck(
      "A user says “my save failed” and gives the request id from the error. How do you find out why?",
      [
        "Ask them to send a screenshot",
        "Search the logs for that id: every line of that request has it",
        "Restart the server and try again",
      ],
      1,
      "Every line logged for that request carries its id, including the error handler's line with the stack, so you see exactly what happened.",
    ),
  ),
);
