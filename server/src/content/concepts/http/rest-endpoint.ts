import type { Concept } from "@fsl/shared";

export const restEndpoint: Concept = {
  id: "rest-endpoint",
  slug: "rest-endpoint",
  title: "REST endpoints",
  topicId: "http",
  summary:
    "A predictable way to design an API where URLs name the things (resources) and HTTP methods say what to do with them.",
  basics: [
    "An API (application programming interface) is the set of requests a program agrees to answer. For a web backend, it is the list of URLs the frontend may call and what each one does.",
    "Every HTTP request names a method (an action, like `GET` or `POST`) and a path (a target, like `/api/notes`). The server looks at both to decide which code to run.",
    "An endpoint is one method and path pair that the server handles, such as `GET /api/notes`. A typical app has a handful of them.",
  ],
  what: [
    "REST is a style for designing those endpoints. The path names a resource — a thing your app stores, like notes or users — using a noun: `/api/notes` for the whole collection, `/api/notes/42` for the one note with id 42.",
    "The method is the verb: `GET` reads, `POST` creates, `PUT` replaces, `PATCH` changes part of something, `DELETE` removes. So you write `DELETE /api/notes/42`, not `POST /api/deleteNote?id=42`.",
  ],
  why: [
    "Once you know the pattern, you can guess an API without reading its code. If `GET /api/notes` lists notes, you would expect `DELETE /api/notes/42` to remove one — and in a REST API you would be right.",
    "It reuses what HTTP already gives you: methods with agreed meanings, status codes for results, and caching for `GET`. Browsers, tools and other developers already understand these, so you do not have to invent and explain your own rules.",
  ],
  howItWorks: [
    "In a route, a part of the path starting with a colon is a placeholder. `/api/notes/:id` matches `/api/notes/42`, and the server reads `42` from `req.params.id`.",
    "Each endpoint answers with a status code that matches the result: `200 OK` with data, `201 Created` after a POST, `204 No Content` after a delete, `400` for invalid input, `401` when not logged in, `404` when the item does not exist.",
    'Bodies use one consistent shape. Successful responses return the resource as JSON; errors always look the same, for example `{ "error": "Title is required" }`, so the frontend can show any error with the same code.',
    '"RESTful" loosely means an API that follows this pattern. The original definition of REST has more rules, but in everyday use people mean nouns in URLs, methods as verbs, proper status codes and JSON. Being consistent matters more than being strict.',
  ],
  basicExample: {
    language: "http",
    code: `GET    /api/notes      -> 200 [ { "id": 42, "title": "Shopping" } ]
POST   /api/notes      -> 201 { "id": 43, "title": "Ideas" }
PUT    /api/notes/43   -> 200 { "id": 43, "title": "Big ideas" }
DELETE /api/notes/43   -> 204 (no body)
DELETE /api/notes/999  -> 404 { "error": "Note not found" }`,
    caption:
      "The Notes App's note endpoints: one noun, two URLs, four methods, and the status code each one answers with.",
  },
  internals: [
    'The server does not know what "REST" is. Express simply compares each incoming method and path against the routes you registered, in order, and runs the first one that matches.',
    "REST is stateless: every request carries everything the server needs, including who you are (in a cookie or header). The server does not remember earlier requests, which is what lets you restart it or run several copies.",
    "`GET`, `PUT` and `DELETE` are idempotent: sending the same request twice leaves the server in the same state as sending it once. `POST` is not — two identical POSTs usually create two items. This is why the method choice matters, not just the name.",
  ],
  howToCreate: [
    {
      text: "In a new folder, install Express.",
      code: {
        language: "bash",
        code: `mkdir rest-demo && cd rest-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js` with the four note endpoints, keeping notes in an array for now.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.use(express.json());

let notes = [{ id: 1, title: "Shopping" }];
let nextId = 2;

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.post("/api/notes", (req, res) => {
  if (!req.body?.title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const note = { id: nextId++, title: req.body.title };
  notes.push(note);
  res.status(201).json(note);
});

app.put("/api/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Note not found" });
  note.title = req.body.title;
  res.json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  const before = notes.length;
  notes = notes.filter((n) => n.id !== Number(req.params.id));
  if (notes.length === before) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.status(204).end();
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js` and open http://localhost:3000/api/notes in the browser: you see the list as JSON. Then try the other methods from a second terminal.",
      code: {
        language: "bash",
        code: `curl -i -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" -d '{"title":"Ideas"}'
curl -i -X PUT http://localhost:3000/api/notes/2 \\
  -H "Content-Type: application/json" -d '{"title":"Big ideas"}'
curl -i -X DELETE http://localhost:3000/api/notes/2
curl -i -X DELETE http://localhost:3000/api/notes/2`,
      },
    },
    {
      text: 'Check the first line of each response: `201`, `200`, `204`, and finally `404` with `{"error":"Note not found"}`, because the note is already gone.',
    },
  ],
  whereUsed: [
    "Almost every web app backend that a frontend calls with `fetch()`.",
    "Public APIs from services like payment providers and code-hosting sites, which follow the same nouns-and-methods pattern.",
    "Mobile apps, which often talk to the very same REST endpoints as the website.",
  ],
  connectsTo: [
    "HTTP methods and status codes, which give each endpoint its verb and its result.",
    "Express routes (`router.get`, `router.post` and so on), one per endpoint.",
    "Controllers, the functions that do the work for each endpoint.",
    "SQL queries in the database: `GET` runs a `SELECT`, `POST` an `INSERT`, `PUT` an `UPDATE`, `DELETE` a `DELETE`.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App API is: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id` and `DELETE /api/notes/:id` (plus `GET /api/health`). Auth actions use POST because they send data and change state, even though they do not create a visible item.",
      fileId: "backend/src/routes/auth.js",
      match: 'authRoutes.post("/register", authController.register);',
    },
    {
      explanation:
        "`backend/src/routes/notes.js` maps these to `notesController`: `listNotes` answers `200`, `createNote` `201`, `updateNote` `200` or `404`, and `deleteNote` `204` or `404`.",
      fileId: "backend/src/routes/notes.js",
      match: 'notesRoutes.get("/", notesController.listNotes);',
    },
    {
      explanation:
        'Every error body has the same shape, `{ "error": "message" }` — from validation (`Title is required`), from `requireAuth` (`Please log in`) and from the final error handler (`Something went wrong`) — so the frontend reads `error` in one place.',
      fileId: "frontend/src/services/request.js",
      match: 'throw new Error(data?.error ?? "Something went wrong");',
    },
  ],
  commonMistakes: [
    "Putting verbs in URLs, like `/api/getNotes` or `/api/notes/delete/42`. Use the noun in the path and let the method be the verb: `DELETE /api/notes/42`.",
    "Answering `200` for everything and putting `success: false` in the body. Use the real status code so `response.ok` and other tools work correctly.",
    'Returning a different error shape from each endpoint. Pick one shape, such as `{ "error": "message" }`, and use it everywhere.',
    "Forgetting that `req.params.id` is always a string. Convert it with `Number(...)` before comparing it with numeric ids.",
  ],
  relatedConcepts: [
    "http-methods",
    "http-status-codes",
    "http-get",
    "http-post",
    "http-put-delete",
    "express-route",
    "controller",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
