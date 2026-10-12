import type { Concept } from "@fsl/shared";

export const express: Concept = {
  id: "express",
  slug: "express",
  title: "Express",
  topicId: "backend",
  summary:
    "A small Node.js library for building web servers that receive HTTP requests and send back responses.",
  basics: [
    "A server is a program that runs all the time and waits for requests. When a browser asks for something, such as `GET /api/notes`, the server runs some code and sends back a response.",
    "Node.js is a program that runs JavaScript outside the browser, on your computer or on a server machine. It comes with a built-in `http` module that can receive requests, but it only gives you the raw pieces: you have to work out the path, read the body and build the response yourself.",
    "A library is code someone else wrote that you install and reuse. Libraries for Node.js are installed with npm, the package manager that comes with Node.js, using `npm install <name>`.",
    "Express is one of these libraries. It sits on top of Node's `http` module and gives you a simpler way to say which code should run for which request.",
  ],
  what: [
    "Express is a web framework for Node.js. You create an app with `express()`, tell it which function should handle which method and path (a route), and start it with `app.listen(port)`.",
    "Every handler receives two objects: `req` (the request: method, path, headers, body) and `res` (the response you are building). You answer with helpers like `res.status(201).json(note)`.",
  ],
  why: [
    "With the raw `http` module, every server has to repeat the same chores: compare the URL by hand, collect the body in pieces, turn JSON into objects, set the `Content-Type` header and write the status code. Express does these chores for you, so your code is about your app, not about plumbing.",
    "Express also gives you a clear structure: small functions called middleware and routes that run one after another. This makes it easy to add things like logging or a login check once and reuse them for many routes.",
  ],
  howItWorks: [
    "`app.listen(3000)` asks Node.js to open port 3000 (a numbered door on the computer that network messages arrive at) and wait. Every time a request arrives, Express creates a `req` and a `res` object for it.",
    "Express then walks through everything you registered with `app.use()`, `app.get()`, `app.post()` and so on, in the order you wrote it. Each one whose method and path match gets a turn.",
    "Middleware (for example `express.json()`) does a job and passes the request on by calling `next()`. A route handler usually ends the request by sending a response with `res.json()`, `res.send()` or `res.end()`.",
    "If nothing matches, Express sends its own `404 Not Found` response. If something throws an error, Express skips ahead to your error-handling middleware.",
  ],
  basicExample: {
    language: "js",
    fileName: "server.js",
    code: `import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  res.status(200).json({ message: "Hello from Express" });
});

app.listen(3000, () => console.log("Listening on http://localhost:3000"));`,
    caption:
      "A complete Express server: one route that answers `GET /api/hello` with JSON.",
  },
  internals: [
    "`express()` returns a function that Express hands to Node's `http.createServer()` when you call `app.listen()`. Node still does the network work; Express only decides what to do with each request.",
    "`req` and `res` are Node's own request and response objects with extra helpers added. For example, `res.json(data)` runs `JSON.stringify(data)`, sets `Content-Type: application/json` and sends the text.",
    "`res.status(404)` only sets the status code and returns `res`, which is why you can chain `res.status(404).json(...)`. Nothing is sent until you call a method like `json`, `send` or `end`.",
    'A response can be sent only once. Calling `res.json()` a second time for the same request throws the error "Cannot set headers after they are sent to the client".',
  ],
  howToCreate: [
    {
      text: "Create a new project folder and install Express.",
      code: {
        language: "bash",
        code: `mkdir api && cd api
npm init -y
npm install express`,
      },
    },
    {
      text: 'Open `package.json` and add `"type": "module"` so Node.js understands `import` statements.',
      code: {
        language: "json",
        fileName: "package.json",
        code: `{
  "name": "api",
  "type": "module",
  "dependencies": {
    "express": "^5.1.0"
  }
}`,
      },
    },
    {
      text: "Create `server.js` with one route.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express" });
});

app.listen(3000, () => console.log("Listening on http://localhost:3000"));`,
      },
    },
    {
      text: "Start the server with `node server.js` and, in a second terminal, send a request with curl. You can also open http://localhost:3000/api/hello in the browser.",
      code: {
        language: "bash",
        code: `curl -i http://localhost:3000/api/hello`,
      },
    },
    {
      text: 'You should see `HTTP/1.1 200 OK`, a `Content-Type: application/json` header and `{"message":"Hello from Express"}`. Try `curl -i http://localhost:3000/nope` and Express answers `404 Not Found` because no route matches.',
    },
  ],
  whereUsed: [
    "Building JSON APIs that a frontend (React, a mobile app) calls with `fetch()`.",
    "Small and medium web servers of all kinds; many other Node.js frameworks are built on the same ideas of middleware and routes.",
  ],
  connectsTo: [
    "Node.js, which runs the server and handles the network connection.",
    "HTTP requests and responses: Express gives you `req` to read the request and `res` to build the response.",
    "Routes, middleware and controllers, the pieces you register on the app.",
    "The database, which your route handlers read from and write to.",
  ],
  projectUsage: [
    {
      explanation:
        '`backend/src/server.js` creates the Notes App server with `express()`, adds `app.use(express.json())` and mounts the routes with `app.use("/api/auth", authRoutes)` and `app.use("/api/notes", notesRoutes)`.',
      fileId: "backend/src/app.js",
      match: "const app = express();",
    },
    {
      explanation:
        'The same file ends with an error-handling middleware that logs the error and replies `500` with `{ "error": "Something went wrong" }`, then starts listening with `app.listen(process.env.PORT ?? 3000)`.',
      fileId: "backend/src/app.js",
      match: 'res.status(500).json({ error: "Something went wrong" });',
    },
    {
      explanation:
        "The backend is started with `node --env-file=.env src/server.js`, and in development Vite forwards every `/api` request from http://localhost:5173 to this Express server on port 3000.",
      fileId: "frontend/vite.config.js",
      match: '"/api": "http://localhost:3000",',
    },
  ],
  commonMistakes: [
    'Using `import express from "express"` without `"type": "module"` in `package.json`. Node.js then fails with "Cannot use import statement outside a module"; add the field (or use `require`).',
    "Forgetting to send a response in a handler. The browser waits until it gives up; every path through a handler must end with `res.json()`, `res.send()`, `res.end()` or `next()`.",
    "Sending two responses for one request, for example a `res.status(400).json(...)` without `return` followed by another `res.json(...)`. Write `return res.status(400).json(...)` to stop there.",
    'Starting a second server on a port that is already in use and getting "EADDRINUSE". Stop the old server with Ctrl+C or choose another port.',
  ],
  relatedConcepts: [
    "nodejs",
    "npm-packages",
    "express-route",
    "express-middleware",
    "http-request-response",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
