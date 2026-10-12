import type { Concept } from "@fsl/shared";

export const httpRequestResponse: Concept = {
  id: "http-request-response",
  slug: "http-request-response",
  title: "HTTP request and response",
  topicId: "http",
  summary:
    "The pair of text messages every web conversation is made of: the browser sends a request, and the server sends back exactly one response.",
  basics: [
    "A client is the program that asks for something, usually the browser running your page. A server is the program that answers, such as the Notes App backend. They are separate programs, often on different computers, and the only way they can work together is by sending messages over the network.",
    "HTTP (HyperText Transfer Protocol) is the agreed format for those messages. Because both sides follow the same rules, any browser can talk to any server without knowing how the other was built.",
    "A header is a small labelled piece of information, written as `Name: value`, such as `Content-Type: application/json`. The body is the actual data being sent, like a note written as JSON.",
  ],
  what: [
    "An HTTP request is the message the client sends. It has a request line (the method, the path and the HTTP version, like `GET /api/notes HTTP/1.1`), then headers, then an empty line, then an optional body.",
    "An HTTP response is the message the server sends back. It has a status line (the version, a status code and a short reason, like `HTTP/1.1 200 OK`), then headers, then an empty line, then the body: the requested data, an error message, or nothing at all.",
  ],
  why: [
    "Every action in a web app, from loading a page to saving a note, is one or more request and response pairs. Once you can read these two messages, you can see exactly what your frontend asked for and what your backend answered, which is how most bugs between the two are found.",
    "Having a fixed structure means each side knows where to look: the method says what to do, the path says to what, the headers describe the message, and the status code says how it went, all before anyone reads the body.",
  ],
  howItWorks: [
    "The client opens a connection to the server and sends the request. The request line comes first, so the server immediately knows the method and path; the headers follow, one per line.",
    "The empty line marks the end of the headers. Anything after it is the body, and the `Content-Length` or `Content-Type` headers tell the receiver how long it is and how to read it.",
    "The server runs the code for that method and path, then sends one response in the same shape: status line, headers, empty line, body. The client reads the status code first to decide what to do with the rest.",
    "HTTP is stateless: the server does not remember earlier requests. Each request must carry everything needed to handle it, which is why the browser sends the login cookie again with every single request.",
  ],
  basicExample: {
    language: "http",
    code: `GET /api/notes HTTP/1.1
Host: localhost:3000
Accept: application/json
Cookie: token=eyJhbGciOi...

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 64

[{ "id": 42, "title": "Shopping", "content": "Milk and bread" }]`,
    caption:
      "A request to list notes (top, no body after the empty line) and the server's response (bottom) with a status line, headers, an empty line and a JSON body.",
  },
  internals: [
    "In HTTP/1.1 these messages really are lines of text sent over the connection. Newer versions (HTTP/2 and HTTP/3) pack the same parts into a more efficient binary form, but the method, path, headers, status and body mean exactly the same, and tools display them in the familiar text layout.",
    "Because the server keeps no memory between requests, two requests from the same user could even be handled by two different server machines. Anything that must survive between requests lives elsewhere: in a cookie the browser sends back, or in the database.",
    "The browser's DevTools Network tab records every request the page makes. Clicking one shows its headers, the request body (Payload) and the response body (Preview or Response), so you can see the real messages instead of guessing.",
    "`curl -v` prints the same conversation in a terminal: lines starting with `>` are the request curl sent, and lines starting with `<` are the response it received.",
  ],
  howToCreate: [
    {
      text: "Create a project with Express, the library we use to build the server, and switch it to ES modules so `import` works.",
      code: {
        language: "bash",
        code: `mkdir api && cd api && npm init -y && npm install express
npm pkg set type=module`,
      },
    },
    {
      text: "Create `server.js` with one route that logs the parts of the request it receives and sends a JSON response.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  // The parts of the request line and the headers, as Express sees them
  console.log(req.method, req.url);
  console.log(req.headers);

  res.status(200).json({ message: "Hello from the server" });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with `node server.js`, then in a second terminal ask curl to show the whole conversation.",
      code: {
        language: "bash",
        code: `curl -v http://localhost:3000/api/hello`,
      },
    },
    {
      text: "You should see `> GET /api/hello HTTP/1.1` and the request headers, then `< HTTP/1.1 200 OK`, the response headers and the JSON body. The server's terminal prints the same method, path and headers it received.",
    },
    {
      text: "Now open http://localhost:3000/api/hello in the browser, open DevTools (F12), choose the Network tab and reload. Click the `hello` row to see the request headers, the status `200` and the response body.",
    },
  ],
  whereUsed: [
    "Every page load, image, stylesheet and script: each one is fetched with its own request and response.",
    "Every API call from a frontend to a backend, such as loading, creating, editing or deleting a note.",
    "Debugging: reading the real messages in the Network tab or with `curl -v` is the fastest way to tell whether a bug is in the frontend or the backend.",
  ],
  connectsTo: [
    "HTTP methods and status codes, the two most important parts of the request line and the status line.",
    "HTTP headers such as `Content-Type`, `Cookie` and `Set-Cookie`, which describe the message and carry the login.",
    "`fetch()` in the browser, which builds the request and gives you the response as an object.",
    "Express on the server, which turns the request into `req` and builds the response from `res`.",
  ],
  projectUsage: [
    {
      explanation:
        'Every function in `frontend/src/services/notesApi.js` sends one request with `fetch("/api/notes", { credentials: "include", ... })` and reads the one response that comes back. In development, Vite forwards these requests from http://localhost:5173 to the backend on http://localhost:3000.',
      fileId: "frontend/src/services/request.js",
      match: "const response = await fetch(path, {",
    },
    {
      explanation:
        'Because HTTP is stateless, the backend does not remember who logged in. The browser sends the `token` cookie with each request, and `requireAuth` in `backend/src/middleware/authMiddleware.js` checks it every time, replying `401` with `{ "error": "Please log in" }` if it is missing or invalid.',
      fileId: "backend/src/middleware/authMiddleware.js",
      match: 'res.status(401).json({ error: "Please log in" });',
    },
    {
      explanation:
        "In `backend/src/server.js`, `app.use(express.json())` reads the body of each incoming request, and controllers like `createNote` build the response with `res.status(201).json(note)`.",
      fileId: "backend/src/app.js",
      match: "app.use(express.json());",
    },
  ],
  commonMistakes: [
    "Guessing what was sent instead of looking. Open the Network tab or use `curl -v` and read the actual request and response before changing code.",
    "Expecting the server to remember the previous request, for example storing the logged-in user in a variable on the server. Send what each request needs with it (like the login cookie) and keep lasting data in the database.",
    "Sending a response twice from one route, for example calling `res.json()` and then `res.send()`, which makes Express throw an error because a request gets exactly one response. Use `return res.status(...).json(...)` so the function stops after answering.",
    "Never sending a response at all, so the browser waits until it times out. Make sure every path through a route ends in `res.json()`, `res.send()` or `res.end()`.",
  ],
  relatedConcepts: [
    "http-methods",
    "http-status-codes",
    "http-headers",
    "how-the-web-works",
    "js-fetch",
    "express",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
