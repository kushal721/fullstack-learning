import type { Concept } from "@fsl/shared";

export const httpHeaders: Concept = {
  id: "http-headers",
  slug: "http-headers",
  title: "HTTP headers",
  topicId: "http",
  summary:
    "The name-value lines at the top of every HTTP request and response that describe the message, such as what format its body is in or who is sending it.",
  basics: [
    "The browser and the server talk by sending messages over the network: the browser sends a request and the server sends back a response. HTTP is the set of rules both sides follow for those messages.",
    "Every HTTP message has up to three parts: a first line (for a request, the method and path, like `POST /api/notes`; for a response, the status, like `201 Created`), then some header lines, then an optional body with the actual data.",
    "Metadata means data about data. A parcel is a good comparison: the body is what is inside the box, and the headers are the label on the outside — what is in it, who sent it, how to handle it.",
  ],
  what: [
    "A header is one line with a name, a colon and a value, like `Content-Type: application/json`. Header names are not case-sensitive, so `content-type` and `Content-Type` mean the same thing.",
    "Some headers are sent by the client (`Accept`, `Authorization`, `Cookie`), some by the server (`Set-Cookie`, `Location`, `Cache-Control`), and some by both (`Content-Type`, which describes whichever body is being sent).",
  ],
  why: [
    'A body on its own is just text or bytes. Without `Content-Type`, the server cannot tell whether `{"title":"Shopping"}` is JSON, plain text or something else, so it does not know how to read it.',
    "Headers keep extra information out of the URL and the body. Login proof, caching rules and format preferences travel alongside the data instead of being mixed into it, and every program that handles HTTP knows where to look for them.",
  ],
  howItWorks: [
    "`Content-Type` says what format the body is in: `application/json` for JSON, `text/html` for a web page. `Accept` is the client saying which formats it would like back.",
    "`Authorization` carries proof of who you are, such as `Authorization: Bearer <token>`. With cookies, the server sends `Set-Cookie: token=...` once, and from then on the browser automatically adds `Cookie: token=...` to every request to that site.",
    "`Cache-Control` tells browsers how long they may reuse a response without asking again (`no-store` means never keep it). `Location` points to another URL — after a redirect, or to where a newly created item can be found.",
    "The server reads the headers before it reads the body, so it can decide how to handle the request, for example by refusing it with `401` before doing any work.",
  ],
  basicExample: {
    language: "http",
    code: `POST /api/notes HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json
Cookie: token=eyJhbGciOi...

{ "title": "Shopping" }

HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Cache-Control: no-store

{ "id": 42, "title": "Shopping" }`,
    caption:
      "The headers sit between the first line and the empty line; the body comes after the empty line.",
  },
  internals: [
    "On the wire, headers are plain lines of text ending at an empty line. That empty line is how the receiver knows the headers are over and the body starts. (HTTP/2 and HTTP/3 send the same headers in a compressed binary form, but the meaning is identical.)",
    "Express 5's `express.json()` middleware only parses bodies whose `Content-Type` is `application/json`. For any other type it leaves the body alone, so `req.body` stays `undefined` and your code sees no data.",
    "`fetch()` adds some headers for you (like `Accept: */*` and the `Cookie` header when cookies are allowed), but it does not guess `Content-Type` for a JSON string. You must set it yourself.",
    "In the browser's developer tools (F12, then the Network tab), clicking any request shows its Request Headers and Response Headers. This is the first place to look when a request does not behave as expected.",
  ],
  howToCreate: [
    {
      text: "In a new folder, set up a tiny Express server.",
      code: {
        language: "bash",
        code: `mkdir headers-demo && cd headers-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js` with a route that shows the headers it received and sets one of its own.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.use(express.json());

app.post("/echo", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    contentType: req.get("Content-Type"),
    body: req.body,
  });
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js`, then in a second terminal send the same JSON twice: once with the header and once without it.",
      code: {
        language: "bash",
        code: `curl -i -X POST http://localhost:3000/echo \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Shopping"}'

curl -i -X POST http://localhost:3000/echo \\
  -d '{"title":"Shopping"}'`,
      },
    },
    {
      text: "The first response shows your `body` and the `Cache-Control: no-store` header at the top. The second shows no `body` at all: curl sent `application/x-www-form-urlencoded`, so `express.json()` skipped it.",
    },
  ],
  whereUsed: [
    "Every request that sends JSON, which needs `Content-Type: application/json`.",
    "Logging in and staying logged in: `Set-Cookie` on the login response, then `Cookie` on every request after it.",
    "Redirects and caching, which browsers handle automatically by reading `Location` and `Cache-Control`.",
  ],
  connectsTo: [
    "`fetch()` in the browser, where you set request headers with the `headers` option and read response headers with `response.headers.get(...)`.",
    "Express on the server, where `req.get(...)` reads a request header and `res.set(...)` sets a response header.",
    "Middleware such as `express.json()`, which decides what to do based on `Content-Type`.",
    "Status codes on the first line of the response, which headers like `Location` often go with.",
  ],
  projectUsage: [
    {
      explanation:
        'The frontend\'s `notesApi.js` sends `headers: { "Content-Type": "application/json" }` with every note it creates or updates, so `express.json()` in `backend/src/server.js` fills `req.body`.',
    },
    {
      explanation:
        'When you log in, `POST /api/auth/login` replies with a `Set-Cookie` header holding the JWT in an `httpOnly` cookie named `token`. Because the frontend uses `credentials: "include"`, the browser sends it back in the `Cookie` header on every later request.',
    },
    {
      explanation:
        "`requireAuth` in `backend/src/middleware/authMiddleware.js` reads that `token` cookie from the request; if it is missing or invalid, the request is answered with `401` before any note is touched.",
    },
  ],
  commonMistakes: [
    "Sending JSON without `Content-Type: application/json`, so `req.body` is `undefined` on the server. Always set the header when the body is `JSON.stringify(...)`.",
    "Putting secrets in custom headers or the URL on the frontend and assuming they are hidden. Anything the browser sends is visible in DevTools; real secrets stay on the server.",
    "Debugging by guessing. Open the Network tab in DevTools and read the actual request and response headers before changing code.",
    "Expecting JavaScript to read an `httpOnly` cookie. It cannot, by design; the browser attaches it to requests for you, which is exactly what protects it.",
  ],
  relatedConcepts: [
    "http-request-response",
    "http-post",
    "json",
    "js-fetch",
    "express-middleware",
    "request-body",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
