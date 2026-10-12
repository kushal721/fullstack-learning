import type { Concept } from "@fsl/shared";

export const httpGet: Concept = {
  id: "http-get",
  slug: "http-get",
  title: "HTTP GET",
  topicId: "http",
  summary:
    "The HTTP method a client uses to read data from a server, such as loading the list of notes, without changing anything.",
  basics: [
    "The browser and the server talk by sending messages: the browser sends a request and the server sends back a response. Every request starts with a method, the word that says what kind of action is wanted.",
    "A URL is the full address of something on the web, like `http://localhost:3000/api/notes`. The part after the host (`/api/notes`) is the path, and it says which resource you want.",
    "Typing a URL into the address bar, clicking a link or loading an image all make GET requests. It is the most common request on the web.",
  ],
  what: [
    'GET is the HTTP method for reading. `GET /api/notes` means "please send me the notes", and the server answers with the data, usually as JSON.',
    "A GET request has no body. Any extra details, such as a search word or a filter, go into the URL as a query string: the part after `?`, like `/api/notes?topic=react`, made of `name=value` pairs joined with `&`.",
  ],
  why: [
    "Reading is the most frequent thing an app does, and keeping it separate from changing data lets everyone treat reads as harmless. That is what allows a GET to be bookmarked, shared as a link, refreshed, cached and retried without worry.",
    "Because the browser, caches and link preloaders all assume GET is safe, a GET that changed data would be triggered by accident. That is why a GET must only ever read.",
  ],
  howItWorks: [
    "The client sends the request line, like `GET /api/notes?topic=react HTTP/1.1`, plus headers, and nothing after the empty line because there is no body.",
    'The server finds the code registered for GET on that path. In Express, the query string is already parsed into `req.query`, so `req.query.topic` is `"react"`.',
    "The server reads the data (often with an SQL `SELECT`) and replies `200 OK` with it in the body. If the thing does not exist, it replies `404 Not Found` instead.",
  ],
  basicExample: {
    language: "http",
    code: `GET /api/notes?topic=react HTTP/1.1
Host: localhost:3000
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{ "id": 7, "title": "Learn hooks", "topic": "react" }]`,
    caption:
      "A GET request with a query string and no body (top), and the response with the matching notes (bottom).",
  },
  internals: [
    '`fetch()` sends a GET when you do not pass a `method`, so `fetch("/api/notes")` is a GET request. If you try to give a GET a `body`, `fetch()` throws an error, because GET requests are not meant to carry one.',
    'Query string values must be encoded, because characters like spaces, `&` and `?` have special meanings in a URL. `new URLSearchParams({ topic: "web dev" })` produces `topic=web+dev` for you.',
    "Browsers and servers can cache GET responses, meaning they keep a copy and reuse it instead of asking again. The `Cache-Control` response header says whether and how long a copy may be reused. Express also adds an `ETag` header, a fingerprint of the body; the browser can send it back, and if nothing changed Express answers `304 Not Modified` with no body, saving the download.",
    "The full URL, including the query string, is stored in browser history and server logs. That is fine for `?topic=react`, but it means passwords and other secrets must never go in a GET URL.",
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
      text: "Create `server.js` with a GET route that returns notes, filtered by `topic` when the query string has one.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();

const notes = [
  { id: 1, title: "Learn hooks", topic: "react" },
  { id: 2, title: "Write a route", topic: "express" },
  { id: 3, title: "Learn props", topic: "react" },
];

app.get("/api/notes", (req, res) => {
  const { topic } = req.query; // from ?topic=...
  const result = topic ? notes.filter((n) => n.topic === topic) : notes;
  res.json(result); // status 200 by default
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with `node server.js`, then request all notes and only the React notes.",
      code: {
        language: "bash",
        code: `curl -i http://localhost:3000/api/notes
curl -i "http://localhost:3000/api/notes?topic=react"`,
      },
    },
    {
      text: "The first command returns all three notes, the second only notes 1 and 3, both with `HTTP/1.1 200 OK`. Because they are GET requests, you can also open both URLs straight in the browser.",
    },
    {
      text: "From a page, the same request is a `fetch()` with no `method`, building the query string with `URLSearchParams`.",
      code: {
        language: "js",
        code: `const params = new URLSearchParams({ topic: "react" });
const response = await fetch("/api/notes?" + params);
const notes = await response.json();`,
      },
    },
  ],
  whereUsed: [
    "Loading pages, images, scripts and stylesheets, which are all GET requests made by the browser.",
    "Reading data from an API: a list of items, one item by id (`/api/notes/42`), or a filtered search (`/api/notes?topic=react`).",
    "Links and bookmarks, which only work because GET puts everything it needs in the URL.",
  ],
  connectsTo: [
    "`fetch()` in the browser, which uses GET by default.",
    "An Express route registered with `router.get(...)`, and `req.query` for the query string.",
    "An SQL `SELECT` that reads the rows from the database.",
    "A React component that shows the returned data once it arrives.",
  ],
  projectUsage: [
    {
      explanation:
        'When the notes page loads, `frontend/src/services/notesApi.js` sends `GET /api/notes` with `credentials: "include"`, so the login cookie goes with it.',
      fileId: "frontend/src/services/notesApi.js",
      match: 'return request("/api/notes");',
    },
    {
      explanation:
        'In `backend/src/routes/notes.js`, `router.get("/", notesController.listNotes)` handles it after `requireAuth` has checked the login. `listNotes` selects only the notes that belong to `req.user.id` and replies `200` with them as JSON.',
      fileId: "backend/src/routes/notes.js",
      match: 'notesRoutes.get("/", notesController.listNotes);',
    },
    {
      explanation:
        "Every other note action (create, edit, delete) uses POST, PUT or DELETE, so loading or refreshing the notes page can never change your notes.",
      fileId: "backend/src/routes/notes.js",
      match: 'notesRoutes.post("/", notesController.createNote);',
    },
  ],
  commonMistakes: [
    "Changing data in a GET route, such as `GET /api/notes/42/delete`. Browsers and crawlers may fetch it without anyone clicking. Use DELETE, PUT or POST for anything that changes data.",
    "Trying to send a body with GET, which `fetch()` rejects with an error. Put the details in the query string instead.",
    "Building query strings by hand and forgetting to encode them, so a value with a space or `&` breaks the URL. Use `URLSearchParams` or `encodeURIComponent`.",
    "Putting passwords or tokens in the URL, where they end up in history and logs. Send them in the body of a POST or in a cookie.",
  ],
  relatedConcepts: [
    "http-methods",
    "http-post",
    "http-request-response",
    "js-fetch",
    "express-route",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
