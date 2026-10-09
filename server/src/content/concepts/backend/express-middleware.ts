import type { Concept } from "@fsl/shared";

export const expressMiddleware: Concept = {
  id: "express-middleware",
  slug: "express-middleware",
  title: "Express middleware",
  topicId: "backend",
  summary:
    "A function that runs on a request before (or instead of) the route handler, used for shared jobs like reading JSON, logging and checking that the user is logged in.",
  basics: [
    "In an Express server, every incoming request is handled by functions you register. Each one receives the request (`req`) and the response (`res`).",
    "Many jobs are the same for lots of routes: turning a JSON body into an object, writing a line to the log, checking that the user is logged in. Copying that code into every route would be repetitive and easy to forget.",
    "Middleware is the name for these shared steps. The request passes through them one after another, like a parcel on a conveyor belt passing several checkpoints before it reaches its destination.",
  ],
  what: [
    "Middleware is a function with three parameters, `(req, res, next)`. It can read or change `req` and `res`, and then it either calls `next()` to pass the request to the next function, or ends the request by sending a response itself.",
    "Error-handling middleware is a special kind with four parameters, `(err, req, res, next)`. Express only runs it when something went wrong, so you can answer every error in one place.",
  ],
  why: [
    "Writing a job once as middleware and adding it with `app.use()` or `router.use()` means every route gets it automatically. A new route cannot forget the login check if the whole router uses `requireAuth`.",
    "It also keeps route handlers short: by the time a handler runs, the body is already parsed and `req.user` is already set, so the handler only does its own job.",
  ],
  howItWorks: [
    "Express keeps a list of everything registered with `app.use()`, `app.get()`, `router.use()` and so on, in the order you wrote it. For each request it calls the first matching function and gives it a `next` function.",
    "Calling `next()` tells Express to move on to the next matching function. Sending a response (for example `res.status(401).json(...)`) without calling `next()` stops the chain there, so later middleware and the route never run.",
    "Calling `next(err)` with an error, or throwing inside a handler, makes Express skip the normal functions and jump to the next error-handling middleware.",
    "In Express 5 this also works for `async` functions: if the promise they return is rejected (for example because a database query failed), Express passes the error to your error-handling middleware for you.",
  ],
  basicExample: {
    language: "js",
    fileName: "server.js",
    code: `function logRequest(req, res, next) {
  console.log(req.method, req.url);
  next(); // pass the request on
}

app.use(logRequest);
app.use(express.json());

app.get("/api/notes", (req, res) => {
  res.json(notes);
});`,
    caption:
      "Every request is logged, then its JSON body is parsed, then the matching route runs.",
  },
  internals: [
    "Order matters because Express runs the list from top to bottom. Middleware added after a route never runs for requests that route already answered, and error-handling middleware must be added after the routes whose errors it should catch.",
    "Express recognises error-handling middleware by counting its parameters. A function with four parameters is treated as an error handler, so keep all four, even if you do not use `next`.",
    "Middleware can pass information forward by adding it to `req`. An auth middleware sets `req.user`, and any later handler for the same request can read it.",
    "`express.json()` is middleware that comes with Express. It reads the body text, runs `JSON.parse` on it and stores the result in `req.body`, then calls `next()`.",
  ],
  howToCreate: [
    {
      text: "Set up a project with Express (skip this if you already have one).",
      code: {
        language: "bash",
        code: `mkdir api && cd api
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js` with a logger, a simple login check, an `async` route that fails and an error handler at the end.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

function requireKey(req, res, next) {
  if (req.headers["x-api-key"] !== "secret") {
    return res.status(401).json({ error: "Please log in" });
  }
  next();
}

app.get("/api/public", (req, res) => res.json({ ok: true }));
app.get("/api/private", requireKey, (req, res) => res.json({ secret: 42 }));

app.get("/api/broken", async (req, res) => {
  throw new Error("Database is down");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js` and call each route from a second terminal.",
      code: {
        language: "bash",
        code: `curl -i http://localhost:3000/api/public
curl -i http://localhost:3000/api/private
curl -i -H "x-api-key: secret" http://localhost:3000/api/private
curl -i http://localhost:3000/api/broken`,
      },
    },
    {
      text: 'Every request is printed in the server terminal by the logger. `/api/private` answers `401` without the header and `200` with it, and `/api/broken` answers `500` with `{"error":"Something went wrong"}` because Express 5 sent the rejected promise to the error handler.',
    },
  ],
  whereUsed: [
    "Parsing request bodies (`express.json()`), serving static files, handling cookies and CORS.",
    "Checking authentication before protected routes, logging requests, and answering every error in one consistent format.",
  ],
  connectsTo: [
    "Express routes: middleware runs before them, either for the whole app or for one router or route.",
    "The request body: `express.json()` is the middleware that fills `req.body`.",
    "Authentication: a middleware reads the login token and sets `req.user` for the controllers.",
    "Error handling in JavaScript: thrown errors and rejected promises end up in the error-handling middleware.",
  ],
  projectUsage: [
    {
      explanation:
        '`backend/src/server.js` adds `app.use(express.json())` before the routes and finishes with an error-handling middleware `(err, req, res, next)` that logs the error and replies `500` with `{ "error": "Something went wrong" }`.',
    },
    {
      explanation:
        '`backend/src/middleware/authMiddleware.js` exports `requireAuth(req, res, next)`. It reads the JWT from the `token` cookie, verifies it with `process.env.JWT_SECRET`, sets `req.user = { id }` and calls `next()`, or replies `401` with `{ "error": "Please log in" }`.',
    },
    {
      explanation:
        "`backend/src/routes/notes.js` calls `router.use(requireAuth)` before its routes, so every `/api/notes` request must come from a logged-in user.",
    },
  ],
  commonMistakes: [
    "Forgetting to call `next()` (and not sending a response either). The request hangs until the browser gives up; every middleware must do one or the other.",
    "Calling `next()` after already sending a response, for example a missing `return` after `res.status(401).json(...)`. The route then runs anyway and may try to answer a second time; use `return res.status(401).json(...)`.",
    "Registering middleware in the wrong order, such as `app.use(express.json())` after the routes or the error handler before them. Put body parsing and auth first and the error handler last.",
    "Writing the error handler with three parameters. Express then treats it as normal middleware and never sends errors to it; it needs all four: `(err, req, res, next)`.",
  ],
  relatedConcepts: [
    "express",
    "express-route",
    "request-body",
    "js-error-handling",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
