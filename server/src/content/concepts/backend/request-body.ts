import type { Concept } from "@fsl/shared";

export const requestBody: Concept = {
  id: "request-body",
  slug: "request-body",
  title: "Request body",
  topicId: "backend",
  summary:
    "The data a client sends along with an HTTP request, such as the title and content of a new note in a POST.",
  basics: [
    "An HTTP request has three parts: a first line with the method and path (`POST /api/notes`), headers (extra information written as name and value, like `Content-Type: application/json`), and an optional body.",
    "The body is where the actual data goes. A GET request only asks for something, so it has no body; a POST or PUT request sends new or changed data, so it carries it in the body.",
    'The body travels as plain text. Web apps usually write it as JSON, text that looks like a JavaScript object: `{ "title": "Shopping" }`. The server has to turn that text back into an object before it can use it.',
  ],
  what: [
    "The request body is the data part of a request. The `Content-Type` header says what format it is in, for example `application/json` for JSON.",
    "In Express, the `express.json()` middleware reads a JSON body and puts the resulting object in `req.body`. Without it, `req.body` is `undefined`.",
  ],
  why: [
    "Data like a note's text or a password does not belong in the URL: URLs are short, visible and saved in browser history and server logs. The body can carry larger and private data.",
    "The body comes from the user's computer, where anyone can change the code or send requests with tools like curl. The server must treat it as untrusted and check it before saving or using it.",
  ],
  howItWorks: [
    "The browser turns your object into text with `JSON.stringify` and sends it with `fetch()`, together with the header `Content-Type: application/json`.",
    "On the server, `express.json()` looks at that header. If it says JSON, it reads the body text, runs `JSON.parse` and stores the object in `req.body`, then calls `next()`. If the header is missing or different, it leaves the body alone and `req.body` stays `undefined`.",
    "The route or controller then validates `req.body`: is it an object, are the required fields there, are they the right type, are they not too long? Only then is the data used.",
    "If the text is not valid JSON, `express.json()` passes a `400 Bad Request` error to the error-handling middleware. If the body is bigger than the limit (100 KB by default), it passes a `413 Content Too Large` error instead.",
  ],
  basicExample: {
    language: "js",
    fileName: "server.js",
    code: `app.use(express.json());

app.post("/api/notes", (req, res) => {
  const { title, content } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  res.status(201).json({ id: 1, title, content });
});`,
    caption:
      "`express.json()` turns the JSON text into `req.body`; the route checks the title before using it.",
  },
  internals: [
    "A body arrives over the network in pieces. `express.json()` collects the pieces until the whole body is there (using the `Content-Length` header to know how much to expect), and stops early if it grows past the size limit, so a huge body cannot use up the server's memory.",
    'By default `express.json()` only accepts objects and arrays at the top level. A body like `"hello"` or `42` is rejected with a `400` error.',
    'Express does not check the meaning of the data. A body like `{ "title": 123 }` or `{ "title": "" }` is valid JSON and lands in `req.body` unchanged; checking types, required fields and lengths is your job.',
    "Fields you did not expect are also kept. That is why controllers pick the fields they need (`const { title, content } = req.body`) instead of saving the whole object, so a client cannot sneak in extra fields like `user_id`.",
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
      text: "Create `server.js` with a route that prints the body it receives and validates it.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.use(express.json({ limit: "10kb" }));

app.post("/api/notes", (req, res) => {
  console.log("Body:", req.body);
  const { title, content = "" } = req.body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  if (title.length > 200 || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid note" });
  }
  res.status(201).json({ id: 1, title: title.trim(), content });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js` and send a body with and without the `Content-Type` header.",
      code: {
        language: "bash",
        code: `curl -i -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Shopping","content":"Milk"}'

curl -i -X POST http://localhost:3000/api/notes \\
  -d '{"title":"Shopping","content":"Milk"}'`,
      },
    },
    {
      text: "The first request answers `201` and the server prints the object. The second answers `400` and prints `Body: undefined`: without `Content-Type: application/json`, `express.json()` did not read the body. Try `-d '{\"title\":42}'` with the header to see validation reject a wrong type.",
    },
  ],
  whereUsed: [
    "Every request that sends data: creating and updating items (POST, PUT, PATCH), logging in and registering.",
    "Forms in the browser, file uploads and webhooks from other services all send their data in the body, sometimes in other formats than JSON.",
  ],
  connectsTo: [
    "`fetch()` on the frontend, which sends the body with `JSON.stringify` and a `Content-Type` header.",
    "The `express.json()` middleware, which turns the JSON text into `req.body`.",
    "Validation code and the controller that checks the data and stores it.",
    "HTTP headers, especially `Content-Type` and `Content-Length`, which describe the body.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/server.js` adds `app.use(express.json())` before mounting the routes, so every controller can read `req.body`.",
    },
    {
      explanation:
        '`notesController.createNote` checks `req.body` with `validateNote` from `validation/noteValidation.js` and answers `400` with `{ "error": "Title is required" }` when the title is missing, before running the `INSERT`.',
    },
    {
      explanation:
        "On the frontend, `frontend/src/services/notesApi.js` sends the note with `JSON.stringify` and `Content-Type: application/json`; the login form sends the email and password in the body of `POST /api/auth/login`, never in the URL.",
    },
  ],
  commonMistakes: [
    "Forgetting `app.use(express.json())`, or adding it after the routes. `req.body` is then `undefined` and destructuring it crashes; add it once, before the routes.",
    "Sending JSON without the `Content-Type: application/json` header, so the server skips parsing. Always set the header together with `JSON.stringify` in `fetch()`.",
    "Trusting the body without checking it, for example saving `req.body` directly or assuming `title` is a string. Check the type, required fields and length of every field you use, and pick only those fields.",
    "Taking ownership or permission data from the body, like `req.body.userId`. The user's id must come from the verified login (`req.user.id`), never from data the client controls.",
  ],
  relatedConcepts: [
    "http-post",
    "json",
    "express-middleware",
    "http-headers",
    "js-fetch",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
