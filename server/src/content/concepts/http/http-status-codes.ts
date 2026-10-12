import type { Concept } from "@fsl/shared";

export const httpStatusCodes: Concept = {
  id: "http-status-codes",
  slug: "http-status-codes",
  title: "HTTP status codes",
  topicId: "http",
  summary:
    "The three-digit number at the start of every HTTP response that tells the client whether its request worked and, if not, why.",
  basics: [
    "When the browser sends a request, the server always answers with a response. The first line of that response is the status line, like `HTTP/1.1 404 Not Found`: the HTTP version, a number and a short reason in words.",
    "That number is the status code. Programs read the number, not the words, so the code is what your JavaScript uses to decide what to do next.",
    "The first digit groups the codes into five classes, so even a code you have never seen tells you roughly what happened.",
  ],
  what: [
    "1xx means informational: an interim message sent before the real response, rarely seen in app code. 2xx means success. 3xx means redirection: look somewhere else or use your saved copy. 4xx means the client made a mistake. 5xx means the server failed.",
    "The common ones: `200 OK`, `201 Created`, `204 No Content` (success, no body), `301 Moved Permanently` and `302 Found` (redirects), `304 Not Modified` (your cached copy is still good), `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Content` and `500 Internal Server Error`.",
  ],
  why: [
    "The status code lets the client react correctly without reading the body first: show the new note on `201`, show a form error on `400`, send the user to the login page on `401`, and show a try again message on `500`.",
    "Browsers, caches and monitoring tools understand codes too. A `301` makes the browser remember the new address, a `304` lets it reuse its copy, and a rise in `5xx` codes alerts developers that the server is broken.",
  ],
  howItWorks: [
    "Pick the class first: did it work (2xx), is the client at fault (4xx), or did the server fail (5xx)? Then pick the most specific code: `201` after creating, `204` when there is nothing to return, `404` when the item does not exist.",
    "401 versus 403: despite its name, `401 Unauthorized` means not logged in, or the login is invalid (who are you?). `403 Forbidden` means the server knows who you are but you are not allowed to do this (you may not).",
    "For bad input, `400` is the general choice; `422` is a more specific option for data that is well-formed JSON but fails validation, and `409` means the request conflicts with what is already stored, such as an email address that is already registered.",
    "In Express you set the code with `res.status(201).json(...)` or `res.status(204).end()`. If you do not set one, a successful `res.json()` sends `200`.",
  ],
  basicExample: {
    language: "http",
    code: `POST /api/notes HTTP/1.1
Content-Type: application/json

{ "content": "No title" }

HTTP/1.1 400 Bad Request
Content-Type: application/json

{ "error": "Title is required" }`,
    caption:
      "The note has no title, so the server answers 400: the client sent something invalid, and the body explains what.",
  },
  internals: [
    "`fetch()` only rejects its promise when the network fails, for example when the server is unreachable. A `404` or `500` is still a response, so `fetch()` resolves normally and your code must check it.",
    "`response.ok` is `true` for any 2xx code and `false` otherwise, and `response.status` holds the exact number. Checking `response.ok` is the simplest way to tell success from failure.",
    "`fetch()` follows `301` and `302` redirects automatically, so your code usually sees the final response, not the redirect. `304` is handled by the browser's cache, which gives your code the saved copy.",
    "In Express 5, an error thrown in a route, including in an `async` function, is passed to the error-handling middleware automatically. That middleware is where an unexpected failure becomes a `500` response.",
  ],
  howToCreate: [
    {
      text: "Create a project with Express and switch it to ES modules.",
      code: {
        language: "bash",
        code: `mkdir api && cd api && npm init -y && npm install express
npm pkg set type=module`,
      },
    },
    {
      text: "Create `server.js` with routes that answer different status codes, plus an error handler that turns crashes into `500`.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.use(express.json());

const notes = [{ id: 1, title: "Shopping" }];

app.post("/api/notes", (req, res) => {
  const { title } = req.body ?? {};
  if (!title) return res.status(400).json({ error: "Title is required" });
  const note = { id: notes.length + 1, title };
  notes.push(note);
  res.status(201).json(note);
});

app.get("/api/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note); // 200
});

app.get("/api/secret", (req, res) => {
  res.status(401).json({ error: "Please log in" });
});

app.get("/api/broken", async () => {
  throw new Error("Database is down"); // Express 5 sends this to the error handler
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with `node server.js`, then call each route with `curl -i` so the status line is printed.",
      code: {
        language: "bash",
        code: `curl -i http://localhost:3000/api/notes/1
curl -i http://localhost:3000/api/notes/99
curl -i -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d '{}'
curl -i -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d '{"title":"Milk"}'
curl -i http://localhost:3000/api/secret
curl -i http://localhost:3000/api/broken`,
      },
    },
    {
      text: "You should see `200 OK`, `404 Not Found`, `400 Bad Request`, `201 Created`, `401 Unauthorized` and `500 Internal Server Error`, in that order, and the server terminal prints the `Database is down` error.",
    },
    {
      text: "In the browser, check the status before using the data.",
      code: {
        language: "js",
        code: `const response = await fetch("/api/notes/99");
if (!response.ok) {
  const { error } = await response.json();
  console.log(response.status, error); // 404 "Note not found"
} else {
  const note = await response.json();
}`,
      },
    },
  ],
  whereUsed: [
    "Every HTTP response, from web pages to API calls, carries exactly one status code.",
    "Frontend code, which checks `response.ok` or `response.status` to decide whether to show data, an error message or the login page.",
    "Logs and monitoring dashboards, which count codes to spot broken pages (`404`) and server failures (`5xx`).",
  ],
  connectsTo: [
    "The status line of an HTTP response.",
    "`res.status()` in Express routes and controllers, and the error-handling middleware that sends `500`.",
    "`response.ok` and `response.status` after `fetch()` in the browser.",
    "JavaScript error handling, where a non-2xx response is often turned into a thrown error the UI can catch.",
  ],
  projectUsage: [
    {
      explanation:
        '`notesController.js` uses `201` after creating a note, `200` for listing and updating, `204` after deleting, `400` with `{ "error": "Title is required" }` when validation fails, and `404` when a note does not exist for this user.',
      fileId: "backend/src/controllers/notesController.js",
      match: "res.status(201).json(result.rows[0]);",
    },
    {
      explanation:
        '`requireAuth` in `backend/src/middleware/authMiddleware.js` answers `401` with `{ "error": "Please log in" }` when the `token` cookie is missing or invalid, and the final error-handling middleware in `app.js` answers `500` with `{ "error": "Something went wrong" }` for anything unexpected.',
      fileId: "backend/src/middleware/authMiddleware.js",
      match: 'res.status(401).json({ error: "Please log in" });',
    },
    {
      explanation:
        "Because `fetch()` resolves even for a `401` or `400`, the shared `request()` function in `frontend/src/services/request.js` checks `response.ok` before using the body, so an error like `Please log in` is shown to the user instead of being treated as notes.",
      fileId: "frontend/src/services/request.js",
      match: "if (!response.ok) {",
    },
  ],
  commonMistakes: [
    "Assuming `fetch()` throws on `404` or `500`. It does not; check `response.ok` before reading the data.",
    'Answering `200` with `{ "error": ... }` in the body. The client then thinks it worked. Send a 4xx or 5xx code so the error is visible from the code alone.',
    "Mixing up `401` and `403`. Use `401` when the user is not logged in and `403` when they are logged in but not allowed.",
    "Sending `500` for bad user input, which blames the server for the client's mistake. Use `400` (or `422`) and explain what is wrong in the body.",
  ],
  relatedConcepts: [
    "http-request-response",
    "http-methods",
    "js-fetch",
    "js-error-handling",
    "express-middleware",
    "controller",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
