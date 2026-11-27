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

// An Express server: a first server, a route taken apart, sending a
// response, how Express finds the handler (step by step), listening and a
// port that's taken, the port from the environment, createApp() and
// server.js, watch mode, trying it with curl and a health check, mistakes,
// practice and a recap.
export const expressServerModule = moduleLesson(
  "express-server",
  "An Express server",
  45,
  [
    "Create an Express app, add a route and start it listening on a port.",
    "Answer a request with res.json, res.send and res.status.",
    "Read the port from process.env.PORT with a default, and fix a port that's already taken.",
    "Explain why the Notes App builds the app in createApp() and listens only in server.js.",
    "Run the server in watch mode and try it with curl, the browser and a health check.",
  ],

  part(
    "first-server",
    "A first server",
    explain(
      "[[express|Express]] is a small library for writing HTTP servers in Node.js. `express()` gives you an [[express-app|app]]. You tell the app what to do for each method and path, then `app.listen` starts it on a port. Six lines, and you have a server that answers `GET /` with JSON.",
    ),
    code(
      "js",
      "server.js: the smallest useful server",
      [
        'import express from "express";',
        "",
        "const app = express();",
        "",
        'app.get("/", (req, res) => {',
        '  res.json({ message: "Hello" });',
        "});",
        "",
        "app.listen(3000, () => {",
        '  console.log("Listening on 3000");',
        "});",
      ],
      {
        3: "the app: routes and middleware go on it",
        5: "for GET requests to /",
        9: "start answering on port 3000",
        10: "runs once the server is ready",
      },
    ),
    keyPoints(
      "`npm install express`, then import it.",
      "`express()` makes the app.",
      "`app.get(path, handler)` adds a route.",
      "`app.listen(port)` starts the server; it keeps running.",
    ),
  ),

  part(
    "route",
    "A route, taken apart",
    explain(
      "A route connects a method and a path to a handler function. Express calls the handler with two objects: `req`, the request that arrived, and `res`, the response you build. This is the Notes App's health route from `app.js`, wrapped to fit.",
    ),
    anatomy(
      "The health route",
      [
        'app.get("/api/health",',
        "  (req, res) =>",
        '    res.json({ status: "ok" }),',
        ");",
      ],
      [
        [
          "app.get",
          "the method",
          "Only GET requests. There's also post, put, delete…",
        ],
        ['"/api/health"', "the path", "Only this exact path."],
        [
          "(req, res)",
          "the handler",
          "Express calls it with the request and the response.",
        ],
        [
          "res.json",
          "the answer",
          "Sends JSON with status 200 and the right Content-Type.",
        ],
        ['{ status: "ok" }', "the body", "Any value JSON can hold."],
      ],
    ),
  ),

  part(
    "respond",
    "Sending a response",
    explain(
      "`res` has helpers for the answer. `res.json(value)` turns a value into JSON and sets `Content-Type: application/json`. `res.send(text)` sends text or HTML. `res.status(code)` sets the status code and returns `res`, so you chain it: `res.status(201).json(note)`. Every request gets exactly one response.",
    ),
    code(
      "js",
      "Three ways to answer",
      [
        'app.get("/api/hello", (req, res) => {',
        '  res.send("Hello");',
        "});",
        "",
        'app.get("/api/notes/1", (req, res) => {',
        '  res.json({ id: 1, title: "Milk" });',
        "});",
        "",
        'app.get("/api/secret", (req, res) => {',
        "  res.status(401).json({",
        '    error: "Please log in",',
        "  });",
        "});",
      ],
      {
        2: "text/html, status 200",
        6: "application/json, status 200",
        10: "set the status, then send",
      },
    ),
    quickCheck(
      "What does `res.status(404)` on its own do?",
      [
        "Sends a 404 response at once",
        "Sets the status; nothing is sent until json, send or end",
        "Throws an error",
      ],
      1,
      "`status` only sets the code and returns `res` for chaining. Without `.json(...)`, `.send(...)` or `.end()`, the client keeps waiting.",
    ),
  ),

  part(
    "matching",
    "How Express finds the handler",
    explain(
      "Underneath, an app keeps a list of routes. `app.get` adds one; when a request arrives, Express looks for a route with the same method and path and calls its handler. No match: 404. Here's that idea in a few lines of plain JavaScript, with routes kept in an object. Step through adding a route and sending two requests.",
    ),
    trace(
      "A tiny app: add a route, then match requests",
      [
        "const routes = {};",
        "function get(path, handler) {",
        '  routes["GET " + path] = handler;',
        "}",
        "function handle(method, path) {",
        '  const handler = routes[method + " " + path];',
        "  if (!handler) return { status: 404 };",
        "  return handler();",
        "}",
        'get("/api/health", () => ({ status: "ok" }));',
        'handle("GET", "/api/health");',
        'handle("GET", "/api/nope");',
      ],
      [
        {
          line: 1,
          note: "An empty table of routes: the app knows no URLs yet.",
          vars: [["routes", "{}"]],
        },
        {
          line: 3,
          note: '`get` is called from line 10. It stores the handler under the key `"GET /api/health"`.',
          vars: [
            ["routes", '{ "GET /api/health": fn }'],
            ["path", '"/api/health"'],
            ["handler", "fn"],
          ],
          stack: ["get"],
        },
        {
          line: 6,
          note: "A request arrives (line 11). The same key is built from its method and path, and found.",
          vars: [
            ["routes", '{ "GET /api/health": fn }'],
            ["method", '"GET"'],
            ["path", '"/api/health"'],
            ["handler", "fn"],
          ],
          stack: ["handle"],
        },
        {
          line: 8,
          note: "A handler was found, so it's called and its answer returned.",
          vars: [
            ["routes", '{ "GET /api/health": fn }'],
            ["method", '"GET"'],
            ["path", '"/api/health"'],
            ["handler", "fn"],
          ],
          stack: ["handle"],
          output: '{ status: "ok" }',
        },
        {
          line: 6,
          note: 'Another request (line 12): nothing is stored under `"GET /api/nope"`.',
          vars: [
            ["routes", '{ "GET /api/health": fn }'],
            ["method", '"GET"'],
            ["path", '"/api/nope"'],
            ["handler", "undefined"],
          ],
          stack: ["handle"],
        },
        {
          line: 7,
          note: "No handler: the answer is 404. Express does the same, with a small HTML page.",
          vars: [
            ["routes", '{ "GET /api/health": fn }'],
            ["method", '"GET"'],
            ["path", '"/api/nope"'],
            ["handler", "undefined"],
          ],
          stack: ["handle"],
          output: "{ status: 404 }",
        },
      ],
    ),
  ),

  part(
    "listen",
    "Listening, and a port that's taken",
    explain(
      "`app.listen(port, callback)` asks the operating system for the port and starts waiting for connections. The callback runs once it's ready (in Express 5 it gets an error if it isn't). The process then keeps running until you press Ctrl+C. Only one program can listen on a port: if another server already has it, you get `EADDRINUSE`.",
    ),
    code(
      "js",
      "Check the error the callback gets (Express 5)",
      [
        "app.listen(port, (err) => {",
        "  if (err) throw err;",
        "  console.log(`Listening on ${port}`);",
        "});",
      ],
      {
        2: "e.g. EADDRINUSE: crash with a clear message",
        3: "only reached when it really is listening",
      },
    ),
    code(
      "bash",
      "Port 3000 is taken: find it, or use another",
      [
        "Error: listen EADDRINUSE: address already",
        "  in use :::3000",
        "",
        "$ lsof -i :3000   # who has the port?",
        "$ PORT=3001 npm run dev",
      ],
      {
        1: "often your own server, still running elsewhere",
        4: "macOS and Linux; then stop that process",
        5: "or run this one on another port",
      },
    ),
    inTheNotesApp(
      "`server.js` calls `createApp().listen(port, …)`. Its callback doesn't check for an error; the `if (err) throw err` above is what you'd add.",
      { fileId: "backend/src/server.js" },
    ),
  ),

  part(
    "port",
    "The port from the environment",
    explain(
      "Don't hard-code the port. Where the app runs decides it: your laptop, a container, a hosting platform that tells you which port to use. So read it from the [[environment-variables|environment]], with a default for development. Environment variables are always strings, so turn it into a number.",
    ),
    code(
      "js",
      "From the Notes App's server.js",
      ["const port = Number(", "  process.env.PORT ?? 3000,", ");"],
      {
        2: "the setting if there is one, else 3000",
      },
    ),
    keyPoints(
      "`process.env.PORT` is a string, or undefined.",
      "`??` gives the default only when it's missing.",
      '`Number("abc")` is NaN: a strict app checks for that too.',
    ),
  ),

  part(
    "create-app",
    "createApp() and server.js",
    explain(
      "The Notes App splits starting the server in two. `app.js` exports `createApp()`, which builds the app (middleware, routes, error handler) and returns it without listening. `server.js` checks the settings, calls `createApp()` and listens. Why? Tests can build a fresh app and send it requests directly, with no real port and no server left running.",
    ),
    code(
      "js",
      "Build in one file, start in another",
      [
        "// app.js",
        "export function createApp() {",
        "  const app = express();",
        '  app.get("/api/health", …);',
        "  return app;",
        "}",
        "",
        "// server.js",
        "createApp().listen(port);",
        "",
        "// notes.test.js",
        "await request(createApp())",
        '  .get("/api/health");',
      ],
      {
        5: "returned, not started",
        9: "the only place a port is opened",
        12: "supertest sends it a request: no port",
      },
    ),
    inTheNotesApp(
      "`createApp()` builds the app and returns it; the comment above it explains it's so tests can send requests directly.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "watch",
    "Watch mode",
    explain(
      "A running server keeps the code it started with. Change a file and you'd have to stop it and start it again. [[watch-mode|Watch mode]] does that for you: `node --watch` restarts the process whenever a file it uses changes. The Notes App's `dev` script also passes `--env-file=.env`, so Node.js loads your local settings into `process.env`.",
    ),
    anatomy(
      "The dev script",
      ["node --env-file=.env --watch src/server.js"],
      [
        ["node", "run", "Plain Node.js: no extra package needed."],
        [
          "--env-file=.env",
          "settings",
          "Loads NAME=value lines from .env into process.env.",
        ],
        ["--watch", "restart", "Restarts the process when a file changes."],
        [
          "src/server.js",
          "the entry",
          "The file that checks settings and listens.",
        ],
      ],
    ),
    keyPoints(
      "`npm run dev` while developing: restarts on save.",
      "`npm start` in production: plain `node`, no watching.",
      "nodemon is an older tool for the same job.",
    ),
  ),

  part(
    "try-it",
    "Try it: curl, the browser and a health check",
    explain(
      "With the server running, open `http://localhost:3000/api/health` in a browser: you see the JSON. A browser's address bar only sends GET, so for other methods, and to see the status and headers, use `curl -i`. A health route like this one is also how Docker and hosting platforms ask “are you up?”: a quick request that needs no login.",
    ),
    code(
      "bash",
      "curl -i shows the whole response",
      [
        "$ curl -i localhost:3000/api/health",
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        "",
        '{"status":"ok"}',
      ],
      {
        1: "-i: include the status line and headers",
        3: "set for you by res.json",
      },
    ),
    inTheNotesApp(
      "The Dockerfile's HEALTHCHECK fetches `/api/health` every 30 seconds and marks the container unhealthy if it fails.",
      { fileId: "backend/Dockerfile" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Never sending a response",
      wrong: [
        'app.get("/api/notes", (req, res) => {',
        "  const notes = loadNotes();",
        "});",
      ],
      problem:
        "Nothing is sent, so the browser or curl waits until it times out.",
      right: [
        'app.get("/api/notes", (req, res) => {',
        "  res.json(loadNotes());",
        "});",
      ],
      why: "Every path through a handler must end in exactly one response.",
    }),
    mistake({
      title: "Sending twice",
      wrong: ["if (!note) res.status(404).json({ error });", "res.json(note);"],
      problem:
        "For a missing note both lines run: Express throws ERR_HTTP_HEADERS_SENT.",
      right: [
        "if (!note) {",
        "  return res.status(404).json({ error });",
        "}",
        "res.json(note);",
      ],
      why: "`return` ends the handler once the response is sent.",
    }),
    mistake({
      title: "Listening inside app.js",
      wrong: [
        "const app = express();",
        "// routes…",
        "app.listen(3000);",
        "export default app;",
      ],
      problem:
        "Every test that imports the app opens port 3000, so tests clash and hang.",
      right: [
        "export function createApp() {",
        "  const app = express();",
        "  return app;",
        "}",
      ],
      why: "Build the app in one place and listen in server.js only.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Read the port",
      task: 'Write `readPort(env)`. With no `env.PORT` (or an empty one), return `3000`. Otherwise turn it into a number; if that\'s a whole number from 1 to 65535 return it, else throw an Error with the message `"PORT must be 1-65535"`.',
      starter: ["function readPort(env) {", "  return env.PORT;", "}"],
      tests: [
        ["readPort({})", "3000"],
        ['readPort({ PORT: "8080" })', "8080"],
        ['readPort({ PORT: "" })', "3000"],
        [
          '(() => { try { readPort({ PORT: "abc" }); return "no error"; } catch (e) { return e.message; } })()',
          '"PORT must be 1-65535"',
        ],
        [
          '(() => { try { readPort({ PORT: "70000" }); return "no error"; } catch (e) { return e.message; } })()',
          '"PORT must be 1-65535"',
        ],
      ],
      hint: "`if (!env.PORT) return 3000;` covers both missing and empty. Then `Number.isInteger(port)` and a range check.",
      solution: [
        "function readPort(env) {",
        "  if (!env.PORT) return 3000;",
        "  const port = Number(env.PORT);",
        "  if (!Number.isInteger(port) || port < 1 || port > 65535) {",
        '    throw new Error("PORT must be 1-65535");',
        "  }",
        "  return port;",
        "}",
      ],
    }),
    yourTurn({
      title: "A tiny app",
      task: "Write `createApp()`. It returns an object with `get(path, handler)`, which stores a handler for GET on that path, and `handle(method, path)`, which calls the matching handler and returns its result, or returns `{ status: 404 }` when nothing matches. Each `createApp()` has its own routes.",
      starter: [
        "function createApp() {",
        "  return {",
        "    get(path, handler) {},",
        "    handle(method, path) {},",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const app = createApp(); app.get("/api/health", () => "ok"); return app.handle("GET", "/api/health"); })()',
          '"ok"',
        ],
        [
          '(() => { const app = createApp(); app.get("/a", () => 1); return app.handle("GET", "/b"); })()',
          "{ status: 404 }",
        ],
        [
          '(() => { const app = createApp(); app.get("/a", () => 1); return app.handle("POST", "/a"); })()',
          "{ status: 404 }",
        ],
        [
          '(() => { createApp().get("/a", () => 1); return createApp().handle("GET", "/a"); })()',
          "{ status: 404 }",
        ],
      ],
      hint: 'Make `const routes = {}` inside `createApp`, so each app has its own. Store under `"GET " + path`; look up `method + " " + path`.',
      solution: [
        "function createApp() {",
        "  const routes = {};",
        "  return {",
        "    get(path, handler) {",
        '      routes["GET " + path] = handler;',
        "    },",
        "    handle(method, path) {",
        '      const handler = routes[method + " " + path];',
        "      return handler ? handler() : { status: 404 };",
        "    },",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Answer with res",
      task: 'Write the handler `getNote(req, res)`. Find the note in `notes` whose `id` equals `Number(req.params.id)`. Found: `res.json(note)`. Not found: `res.status(404).json({ error: "Note not found" })`. The tests pass a fake `res` whose `status` and `json` work like Express\'s.',
      starter: [
        'const notes = [{ id: 1, title: "Milk" }];',
        "",
        "function getNote(req, res) {",
        "  res.json(notes[0]);",
        "}",
      ],
      tests: [
        [
          '(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; getNote({ params: { id: "1" } }, res); return [res.statusCode, res.body]; })()',
          '[200, { id: 1, title: "Milk" }]',
        ],
        [
          '(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; getNote({ params: { id: "9" } }, res); return [res.statusCode, res.body]; })()',
          '[404, { error: "Note not found" }]',
        ],
      ],
      hint: "`notes.find((n) => n.id === Number(req.params.id))`. If it's undefined, `return res.status(404).json(...)` so nothing else runs.",
      solution: [
        'const notes = [{ id: 1, title: "Milk" }];',
        "",
        "function getNote(req, res) {",
        "  const id = Number(req.params.id);",
        "  const note = notes.find((n) => n.id === id);",
        "  if (!note) {",
        '    return res.status(404).json({ error: "Note not found" });',
        "  }",
        "  res.json(note);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Express server cheat sheet", [
      ["express()", "Create the app.", "const app = express();"],
      [
        "app.get(path, handler)",
        "Run handler for GET on that path (also post, put, delete).",
        'app.get("/api/health", h)',
      ],
      ["(req, res)", "The request that arrived; the response you send."],
      [
        "res.json(value)",
        "Send JSON with the right Content-Type.",
        'res.json({ status: "ok" })',
      ],
      ["res.send(text)", "Send text or HTML.", 'res.send("Hello")'],
      [
        "res.status(code)",
        "Set the status; chain the sending call.",
        "res.status(201).json(note)",
      ],
      [
        "app.listen(port, cb)",
        "Start the server. Express 5 passes cb an error if it fails.",
        "app.listen(3000, (err) => …)",
      ],
      [
        "PORT",
        "From the environment, with a default.",
        "Number(process.env.PORT ?? 3000)",
      ],
      [
        "createApp()",
        "Build the app without listening, so tests can use it.",
        "createApp().listen(port)",
      ],
      [
        "Watch mode",
        "Restart on every file change while developing.",
        "node --watch src/server.js",
      ],
      [
        "EADDRINUSE",
        "Another process has the port: stop it or pick another.",
        "PORT=3001 npm run dev",
      ],
      [
        "Health check",
        "A quick GET that says the server is up.",
        "GET /api/health → 200",
      ],
    ]),
    quickCheck(
      "Why does the Notes App build its app in `createApp()` and call `listen` only in `server.js`?",
      [
        "Express requires two files",
        "So tests can use the app without opening a real port",
        "So the server starts faster",
      ],
      1,
      "Tests import `createApp()` and send requests to the returned app directly. If `app.js` listened, every test would open port 3000 and they'd clash.",
    ),
  ),
);
