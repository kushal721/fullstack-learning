import type { Concept } from "@fsl/shared";

export const csrf: Concept = {
  id: "csrf",
  slug: "csrf",
  title: "Cross-site request forgery (CSRF)",
  topicId: "security",
  summary:
    "An attack where another website makes your browser send a request to an app you're logged in to, and the browser adds your login cookie, so the app thinks you asked for it.",
  basics: [
    "Browsers add a site's cookies to requests going to that site automatically. That is what keeps you logged in.",
    '"Automatically" originally meant: no matter which page started the request. If a page on `evil.example` contains a form that posts to `notes.example`, the browser would send that request with your `notes.example` cookies.',
    "Web pages can send requests to other sites without your help: a form can submit itself with one line of JavaScript, and an image tag loads its URL as soon as the page opens.",
  ],
  what: [
    'Cross-site request forgery, CSRF (sometimes pronounced "sea-surf"), is when a page you visit on one site causes a request to another site where you\'re logged in, to make a change you never asked for: delete your notes, change your email, transfer money.',
    "The attacker never sees your cookie or the response. They don't need to: the damage is done by the request itself, sent by your browser with your login.",
  ],
  why: [
    "Being logged in is normal, and so is visiting other websites at the same time. Without protection, any page you open, an ad, a forum post with a hidden form, could act as you on every site you're logged in to.",
    "The server sees a perfectly normal request with a valid login cookie, so authentication alone can't tell a forged request from a real one.",
    "Understanding it explains why the Notes App's cookie has `SameSite`, why its API only accepts JSON and why reading data never uses a method that changes it.",
  ],
  howItWorks: [
    'The attack: you are logged in to a notes app. You open `evil.example`, which contains `<form method="POST" action="https://notes.example/api/auth/logout">` and a script that submits it. Your browser sends the POST and, without protection, includes your `token` cookie. You\'ve been logged out by a site you never trusted.',
    "SameSite stops it: the Notes App's cookie is `SameSite=Lax`, so the browser doesn't add it to POST requests started by another site. The forged request arrives without a login, `requireAuth` finds no token, and nothing happens. (Lax still sends the cookie when you click a normal link to the site, so you arrive logged in.)",
    'JSON-only routes add a second wall: an HTML form can only send form data or plain text, never `Content-Type: application/json`. The Notes App\'s `express.json()` ignores other content types, so a forged "create note" form arrives with no `req.body` and fails validation.',
    "Other methods add a third: forms can't send `PUT` or `DELETE`, and when JavaScript on another site tries, the browser first asks the server for permission (a CORS preflight request). The Notes App never grants it, so the real request is never sent.",
  ],
  basicExample: {
    language: "html",
    code: `<!-- On evil.example: submits itself as soon as the page opens -->
<form id="f" method="POST" action="https://notes.example/api/notes"
      enctype="text/plain">
  <input name='{"title":"hacked","x":"' value='"}' />
</form>
<script>document.getElementById("f").submit();</script>

<!-- Notes App: the browser leaves the SameSite=Lax cookie out
     → no login → 401. And the body isn't application/json
     → express.json() ignores it → 400 "Title is required". -->`,
    caption:
      "A classic forged form. The odd input name is a trick to make plain text look like JSON; it still fails twice.",
    highlightLines: [2, 3],
  },
  internals: [
    '"Site" means the registrable domain: `app.example.com` and `api.example.com` are the same site, `example.com` and `evil.com` aren\'t. That is why the Notes App serves the frontend and the API from one site.',
    "Requests that only read data, such as `GET`, should never change anything. Lax cookies are sent on top-level `GET` navigations, so a `GET /api/notes/7/delete` route would be forgeable with a simple link.",
    "Before SameSite existed, apps used CSRF tokens: a random value the server puts in each form and checks on submit, which another site can't know. Apps that must accept form posts or cookies from other sites still use them.",
    "Some browsers, such as Chrome, treat a cookie without a `SameSite` attribute as `Lax`, but not all do, and that default has exceptions. Always set it explicitly.",
  ],
  howToCreate: [
    {
      text: 'Build a tiny "bank" and an "attacker" page. `localhost` and `127.0.0.1` count as different sites, so two ports and two host names are enough.',
      code: {
        language: "bash",
        code: `mkdir csrf-demo && cd csrf-demo
npm init -y
npm pkg set type=module
npm install express cookie-parser`,
      },
    },
    {
      text: "Create `servers.js`. The bank (localhost:3001) sets a `SameSite=Lax` login cookie and reports whether each request carried it. The attacker (127.0.0.1:3002) serves a page with a self-submitting form and a normal link.",
      code: {
        language: "js",
        fileName: "servers.js",
        code: `import cookieParser from "cookie-parser";
import express from "express";

const bank = express();
bank.use(cookieParser());
bank.get("/", (req, res) => {
  res.cookie("token", "ana-is-logged-in", { httpOnly: true, sameSite: "lax" });
  res.send(\`Logged in. Cookie sent with this request: \${Boolean(req.cookies.token)}\`);
});
bank.post("/transfer", (req, res) => {
  console.log("POST /transfer, cookie sent:", Boolean(req.cookies.token));
  res.send(req.cookies.token ? "Money sent!" : "Not logged in: nothing happened.");
});
bank.listen(3001, () => console.log("bank: http://localhost:3001"));

const attacker = express();
attacker.get("/", (req, res) =>
  res.send(\`<form method="POST" action="http://localhost:3001/transfer"></form>
    <a href="http://localhost:3001/">A normal link to the bank</a>
    <button onclick="document.forms[0].submit()">Win a prize!</button>\`),
);
attacker.listen(3002, () => console.log("attacker: http://127.0.0.1:3002"));`,
      },
    },
    {
      text: 'Run `node servers.js`. Open http://localhost:3001 to "log in" to the bank. Then open http://127.0.0.1:3002 and press Win a prize: the bank answers "Not logged in: nothing happened." and logs `cookie sent: false`, because SameSite kept the cookie out of the forged POST. Go back and click the normal link instead: the bank says the cookie was sent, so links still work.',
      code: { language: "bash", code: "node servers.js" },
    },
  ],
  whereUsed: [
    "Any app that keeps users logged in with cookies: SameSite cookies, and CSRF tokens where cross-site forms are needed.",
    "API design: changes only through POST, PUT, PATCH and DELETE; GET only reads.",
  ],
  connectsTo: [
    "Secure cookies: `SameSite` is the main defence.",
    "CORS: the preflight that blocks cross-site `PUT`/`DELETE` and JSON requests from scripts.",
    "HTTP methods: safe methods (GET) must never change data.",
    "Authentication: CSRF abuses an existing login rather than stealing it.",
  ],
  projectUsage: [
    {
      explanation:
        'The login cookie is `sameSite: "lax"`, so the browser leaves it out of requests that other websites start. The comment above it says exactly that.',
      fileId: "backend/src/controllers/authController.js",
      match: 'sameSite: "lax",',
    },
    {
      explanation:
        "The API reads bodies with `express.json()` only, so data from a cross-site HTML form (which can't be JSON) never becomes `req.body`.",
      fileId: "backend/src/app.js",
      match: "app.use(express.json()); // JSON body → req.body",
    },
    {
      explanation:
        "Changing a note uses `PUT` and deleting uses `DELETE`, methods an HTML form can't send. Reading uses `GET` and never changes anything.",
      fileId: "backend/src/routes/notes.js",
      match: 'notesRoutes.put("/:id", notesController.updateNote);',
    },
    {
      explanation:
        "In development the Vite proxy makes the frontend and the API one site, so the cookie can stay `SameSite=Lax`; in production a rewrite does the same.",
      fileId: "frontend/vite.config.js",
      match: '"/api": "http://localhost:3000",',
    },
  ],
  commonMistakes: [
    "Changing data in a `GET` route, such as `/logout` or `/notes/7/delete` as links. Lax cookies are sent with them.",
    "Setting `SameSite=None` to make a frontend on another domain work. That switches CSRF protection off; put frontend and API on the same site instead, or add CSRF tokens.",
    "Accepting form-encoded bodies as well as JSON (`express.urlencoded()`) on an API that doesn't need them. That re-opens the door for forged forms.",
    "Thinking CORS stops CSRF. CORS controls who can read responses; a simple form POST is sent without asking.",
  ],
  relatedConcepts: [
    "secure-cookies",
    "cors",
    "http-methods",
    "html-form",
    "xss",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["add-authentication"],
};
