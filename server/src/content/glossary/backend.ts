import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "Backend" topic.
export const backendGlossary: GlossaryEntry[] = [
  {
    id: "nodejs",
    topicId: "backend",
    term: "Node.js",
    aliases: ["node", "node js", "runtime"],
    kind: "concept",
    short:
      "A program that runs JavaScript outside the browser, so you can write servers and tools in it.",
    body: "`node server.js` runs a JavaScript file from the terminal. There's no page, so no `document` or `window`; instead Node.js can read files, open network connections and read [[environment-variables|environment variables]]. [[express|Express]] servers run on it.",
    conceptPageId: "nodejs",
  },
  {
    id: "npm-packages",
    topicId: "backend",
    term: "npm and packages",
    aliases: ["npm", "package", "package.json", "node_modules", "dependency"],
    kind: "concept",
    short:
      "The tool that installs other people's code (packages) and records which ones and versions you need.",
    body: "`npm install express` downloads a package into `node_modules` and lists it in `package.json`, which also holds your scripts like `npm run dev`. `package-lock.json` pins every exact version so everyone installs the same code. You then [[js-module-import-export|import]] it.",
    conceptPageId: "npm-packages",
  },
  {
    id: "express",
    topicId: "backend",
    term: "Express",
    aliases: ["express.js", "expressjs", "web framework", "app.listen"],
    kind: "concept",
    properNoun: true,
    short:
      "A small Node.js library for building servers that receive HTTP requests and send responses.",
    body: "`express()` creates an app, [[express-route|routes]] connect a method and path to a handler, and `app.listen(3000)` starts it. Each handler gets `req` (the request) and `res` (the response you build), and answers with helpers like `res.status(201).json(note)`.",
    conceptPageId: "express",
  },
  {
    id: "express-route",
    topicId: "backend",
    term: "Route",
    aliases: ["express route", "routes", "route parameter", "req.params"],
    kind: "concept",
    short:
      "A rule connecting one HTTP method and path, such as `POST /api/notes`, to the function that handles it.",
    body: '`app.post("/api/notes", handler)` runs `handler` only for that method and path. `/api/notes/:id` matches any id and puts it in `req.params.id`; the query string is in `req.query`. The handler is usually a [[controller]].',
    conceptPageId: "express-route",
  },
  {
    id: "express-middleware",
    topicId: "backend",
    term: "Middleware",
    aliases: ["express middleware", "next", "error middleware"],
    kind: "concept",
    short:
      "A function that runs on a request before the route handler, for shared jobs like reading JSON or checking login.",
    body: "Middleware gets `(req, res, next)`: it can read or change the request, then call `next()` to pass it on, or answer straight away. `express.json()` reads the [[request-body|request body]]; an auth middleware checks who is logged in. Four-parameter middleware handles errors.",
    analogy:
      "Security checks at an airport: each one looks at you and either waves you on or stops you.",
    conceptPageId: "express-middleware",
  },
  {
    id: "controller",
    topicId: "backend",
    term: "Controller",
    aliases: ["controllers", "handler", "route handler"],
    kind: "concept",
    short:
      "The function that does the work for a route: read the request, validate, use the database, respond.",
    body: "`createNote(req, res)` is a controller. The [[express-route|route]] only says which URL calls it; the controller checks the input, runs a [[parameterized-query|query]] and sends a response with the right [[http-status-codes|status code]].",
    conceptPageId: "controller",
  },
  {
    id: "request-body",
    topicId: "backend",
    term: "Request body",
    aliases: ["body", "req.body", "payload"],
    kind: "concept",
    short:
      "The data a client sends with a request, such as the title and content of a new note.",
    body: "The `Content-Type` [[http-headers|header]] says its format, usually [[json]]. In Express, the `express.json()` [[express-middleware|middleware]] reads it into `req.body`; without it, `req.body` is `undefined`. Always validate it before use.",
    conceptPageId: "request-body",
  },
  {
    id: "environment-variables",
    topicId: "backend",
    term: "Environment variables",
    aliases: ["env", "env vars", "process.env", ".env"],
    kind: "concept",
    short:
      "Named settings given to a program when it starts, like the port, the database address and secret keys.",
    body: "`PORT=3000` is one. Node.js reads them from `process.env`, so the same code runs with different settings on your laptop and in production. They are also how [[secrets-env-vars|secrets stay out of the code]].",
    conceptPageId: "environment-variables",
  },
];
