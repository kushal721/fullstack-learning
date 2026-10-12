import type { Concept } from "@fsl/shared";

export const expressRoute: Concept = {
  id: "express-route",
  slug: "express-route",
  title: "Express routes",
  topicId: "backend",
  summary:
    "A rule in an Express server that connects one HTTP method and path, such as `POST /api/notes`, to the function that handles it.",
  basics: [
    "Every HTTP request names a method (what to do, such as `GET` to read or `POST` to create) and a path (what to do it to, such as `/api/notes`).",
    "A server usually has many different jobs: list notes, create a note, delete a note, log in. It needs a way to decide which piece of code should run for each incoming request.",
    "A handler is a function you write that receives the request (`req`) and the response (`res`) and sends an answer. In Express, the rule that picks a handler is called a route.",
  ],
  what: [
    "A route is registered with a method name and a path: `app.get(path, handler)`, `app.post(...)`, `app.put(...)` and `app.delete(...)`. Express runs the handler only when both the method and the path match.",
    "A path can contain parameters, like `/api/notes/:id`, which match any value in that position and make it available as `req.params.id`. Extra values after a `?` in the URL (the query string) appear in `req.query`.",
  ],
  why: [
    "Without routes you would write one giant function full of `if` checks on the method and URL. Routes keep each job in its own small function, so you can find and change one without touching the others.",
    "Matching the method as well as the path follows HTTP's meaning: `GET /api/notes` reads the list, `POST /api/notes` creates a note. The same URL can safely do different things depending on the method.",
  ],
  howItWorks: [
    "When a request arrives, Express checks your routes from top to bottom. The first one whose method and path match runs its handler; routes further down are not tried unless that handler calls `next()`.",
    'For a path like `/api/notes/:id`, the request `PUT /api/notes/42` matches and Express sets `req.params.id` to the string `"42"`. For `GET /api/notes?search=milk`, the path is just `/api/notes` and `req.query.search` is `"milk"`.',
    '`express.Router()` creates a mini app that holds a group of routes. Mounting it with `app.use("/api/notes", router)` puts the prefix in front of each of them, so `router.put("/:id", ...)` handles `PUT /api/notes/:id`.',
    "If no route matches, Express replies `404 Not Found` by itself. You can replace that answer by adding a last `app.use((req, res) => ...)` after all routes.",
  ],
  basicExample: {
    language: "js",
    fileName: "server.js",
    code: `app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("/api/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});`,
    caption:
      "Two routes on the same base path: the first lists every note, the second returns one note picked by the `:id` in the URL.",
  },
  internals: [
    "Express turns each path pattern into a matcher when you register the route. `/api/notes/:id` matches exactly one path segment after `/api/notes/`, so `/api/notes/42` matches but `/api/notes/42/extra` and `/api/notes` do not.",
    'Everything that comes from the URL is text. `req.params.id` is the string `"42"`, not the number `42`, so convert it with `Number()` before comparing it to a number, and check the result is a valid number.',
    'A router is itself a kind of middleware. When `app.use("/api/notes", router)` matches, Express removes the `/api/notes` prefix and lets the router match the rest of the path against its own routes.',
    "`app.get` only matches `GET` (and `HEAD`) requests. A `DELETE` to a path that only has a `GET` route falls through to the 404 at the end.",
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
      text: "Put the note routes in their own file using `express.Router()`.",
      code: {
        language: "js",
        fileName: "notesRoutes.js",
        code: `import express from "express";

const router = express.Router();
const notes = [{ id: 1, title: "Shopping" }];

router.get("/", (req, res) => {
  const search = req.query.search ?? "";
  res.json(notes.filter((n) => n.title.includes(search)));
});

router.get("/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});

export default router;`,
      },
    },
    {
      text: "Mount the router in `server.js` and add a final handler for paths that match nothing.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
import notesRoutes from "./notesRoutes.js";

const app = express();

app.use("/api/notes", notesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js` and try each route from a second terminal.",
      code: {
        language: "bash",
        code: `curl -i http://localhost:3000/api/notes
curl -i "http://localhost:3000/api/notes?search=Shop"
curl -i http://localhost:3000/api/notes/1
curl -i http://localhost:3000/api/notes/99`,
      },
    },
    {
      text: 'The first three answer `200 OK` with JSON. `/api/notes/99` answers `404` with `{"error":"Note not found"}`, and any unknown path such as `/api/users` gets `{"error":"Not found"}` from the last handler.',
    },
  ],
  whereUsed: [
    "Every Express API: one route per action, such as list, create, update and delete for each kind of data.",
    "Grouping routes by resource (notes, users, auth) with `express.Router()`, each in its own file.",
  ],
  connectsTo: [
    "HTTP methods and paths sent by the client with `fetch()`.",
    "Controllers, the functions that a route calls to do the actual work.",
    "Middleware, which can run before every route in a router, such as a login check.",
    "REST endpoints: the list of method plus path pairs that make up the API.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/routes/notes.js` creates a router with `express.Router()`, adds `notesRoutes.use(requireAuth)`, then maps `GET /` to `listNotes`, `POST /` to `createNote`, `PUT /:id` to `updateNote` and `DELETE /:id` to `deleteNote` from `notesController`.",
      fileId: "backend/src/routes/notes.js",
      match: "export const notesRoutes = express.Router();",
    },
    {
      explanation:
        '`backend/src/app.js` mounts it with `app.use("/api/notes", notesRoutes)`, so the router\'s `PUT /:id` becomes `PUT /api/notes/:id` and the controller reads the note id from `req.params.id`.',
      fileId: "backend/src/app.js",
      match: 'app.use("/api/notes", notesRoutes);',
    },
    {
      explanation:
        "`backend/src/routes/auth.js` groups `POST /register`, `POST /login` and `POST /logout` the same way and is mounted at `/api/auth`.",
      fileId: "backend/src/routes/auth.js",
      match: "export const authRoutes = express.Router();",
    },
  ],
  commonMistakes: [
    "Treating `req.params.id` as a number. It is always a string, so `n.id === req.params.id` is never true for numeric ids; convert it with `Number(req.params.id)` first.",
    'Writing the full path again inside a router, like `router.get("/api/notes", ...)` mounted at `/api/notes`. That route answers `/api/notes/api/notes`; inside the router use `/` and `/:id`.',
    "Putting the catch-all 404 handler before the routes. Express runs things in order, so it answers every request with 404; it must come after all routes.",
    "Using the wrong method, such as `app.get` for an action that creates or deletes data. Match the method to the action: GET reads, POST creates, PUT changes, DELETE removes.",
  ],
  relatedConcepts: [
    "express",
    "controller",
    "http-methods",
    "rest-endpoint",
    "express-middleware",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
