import type { Flow } from "@fsl/shared";
import { httpExchanges } from "./http-exchanges.js";

// Creating an account: input checks, bcrypt hashing and the UNIQUE email
// rule, then the automatic login (see the login flow).
export const registerFlow: Flow = {
  id: "register",
  title: "Create an account",
  summary:
    "Follow a new account from the form to a bcrypt hash in the database, then the automatic login.",
  group: "security",
  direction: "round-trip",
  http: httpExchanges["http-request:POST /api/auth/register"],
  steps: [
    {
      id: "type-credentials",
      symbolId: "component:Register",
      layer: "user",
      title: "The user chooses an email and password",
      explanation:
        "Register's controlled inputs keep the email and password in state. The browser already checks `minLength={8}`, but that is only a convenience: the server checks again.",
      dataShape: {
        language: "jsx",
        code: '<Input id="register-password" type="password" minLength={8} … />',
        fileName: "frontend/src/pages/Register.jsx",
      },
    },
    {
      id: "submit",
      symbolId: "event:register.submit",
      layer: "frontend",
      title: "The form is submitted",
      explanation:
        "Pressing Register submits the form, and React calls `handleSubmit` instead of reloading the page.",
      dataShape: {
        language: "jsx",
        code: "<form onSubmit={handleSubmit}>",
        fileName: "frontend/src/pages/Register.jsx",
      },
    },
    {
      id: "handle-submit",
      symbolId: "fn:register.handleSubmit",
      layer: "frontend",
      title: "handleSubmit creates the account",
      explanation:
        "It first asks the API to create the account; if that works it logs in with the same details, so the new user lands straight on their notes.",
      relationshipId:
        "fn:register.handleSubmit->handles->event:register.submit",
      dataShape: {
        language: "js",
        code: "event.preventDefault();\nawait register({ email, password });\nconst user = await login({ email, password });",
        fileName: "frontend/src/pages/Register.jsx",
      },
    },
    {
      id: "auth-api",
      symbolId: "fn:authApi.register",
      layer: "frontend",
      title: "register() asks the API",
      explanation:
        "The auth service sends the email and password as the body of a POST to `/api/auth/register`.",
      relationshipId: "fn:register.handleSubmit->calls->fn:authApi.register",
      dataShape: {
        language: "js",
        code: 'request("/api/auth/register", {\n  method: "POST",\n  body: { email: "you@example.com", password: "my-password-123" },\n});',
        fileName: "frontend/src/services/authApi.js",
      },
    },
    {
      id: "request",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() prepares it",
      explanation:
        "The body becomes JSON text with the matching `Content-Type` header.",
      relationshipId: "fn:authApi.register->calls->fn:request",
      dataShape: {
        language: "js",
        code: 'body: \'{"email":"you@example.com","password":"my-password-123"}\'',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "fetch",
      symbolId: "external:fetch",
      layer: "frontend",
      title: "fetch sends it",
      explanation: "The browser's `fetch` sends the request.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'await fetch("/api/auth/register", { method: "POST", … });',
      },
    },
    {
      id: "https",
      symbolId: "http-request:POST /api/auth/register",
      layer: "network",
      title: "The new password crosses the network",
      explanation:
        "The password is in the body of this request. In production the site is served over HTTPS, so everything in the request (body, headers and cookie) is encrypted between the browser and the server and nobody on the network can read it. In development it only travels inside your own computer, to `localhost`, over plain HTTP.",
      relationshipId:
        "external:fetch->sends->http-request:POST /api/auth/register",
      dataShape: {
        language: "http",
        code: 'POST /api/auth/register HTTP/1.1\nHost: localhost:5173\nContent-Type: application/json\n\n{"email":"you@example.com","password":"my-password-123"}',
      },
    },
    {
      id: "parse-json",
      symbolId: "middleware:express.json",
      layer: "backend",
      title: "express.json reads the body",
      explanation: "`express.json` turns the JSON text into `req.body`.",
      dataShape: {
        language: "js",
        code: 'req.body = { email: "you@example.com", password: "my-password-123" };',
        fileName: "backend/src/app.js",
      },
    },
    {
      id: "match-route",
      symbolId: "route:POST /api/auth/register",
      layer: "backend",
      title: "Express matches the register route",
      explanation:
        '`authRoutes.post("/register", …)` under `/api/auth` matches. No login is needed to create an account.',
      relationshipId:
        "route:POST /api/auth/register->receives->http-request:POST /api/auth/register",
      dataShape: {
        language: "js",
        code: 'authRoutes.post("/register", authController.register);',
        fileName: "backend/src/routes/auth.js",
      },
    },
    {
      id: "controller",
      symbolId: "controller:authController.register",
      layer: "backend",
      title: "register runs",
      explanation:
        "The controller checks the input, hashes the password and stores the account.",
      relationshipId:
        "route:POST /api/auth/register->calls->controller:authController.register",
      dataShape: {
        language: "js",
        code: "export async function register(req, res) {",
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "check-input",
      symbolId: "fn:readCredentials",
      layer: "backend",
      title: "The email and password are checked",
      explanation:
        "The email is trimmed and lowercased, then checked for an `@`; the password must be at least 8 characters. Either problem gets a `400` with a message the form shows.",
      relationshipId:
        "controller:authController.register->calls->fn:readCredentials",
      dataShape: {
        language: "js",
        code: 'readCredentials(req.body); // { email: "you@example.com", password: "my-password-123" }\n// no "@":  400 { "error": "Please enter a valid email address" }\n// too short: 400 { "error": "Password must be at least 8 characters" }',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "hash-password",
      symbolId: "external:bcrypt",
      layer: "backend",
      title: "bcrypt hashes the password",
      explanation:
        "The password itself is never stored. `bcrypt.hash` mixes in a random salt (so equal passwords get different hashes) and is deliberately slow (cost 12), so guessing passwords from a stolen database would take years.",
      relationshipId:
        "controller:authController.register->calls->external:bcrypt",
      dataShape: {
        language: "js",
        code: 'const passwordHash = await bcrypt.hash("my-password-123", 12);\n// "$2b$12$Xk3vN9…" (shortened; a new random salt makes it different every time)',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "insert-user",
      symbolId: "query:insertUser",
      layer: "backend",
      title: "The account is stored",
      explanation:
        "A parameterized INSERT stores the email and the hash, never the password, and returns the new id and email.",
      relationshipId:
        "controller:authController.register->calls->query:insertUser",
      dataShape: {
        language: "js",
        code: 'await pool.query(\n  "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",\n  ["you@example.com", passwordHash],\n);',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "users-row",
      symbolId: "table:users",
      layer: "database",
      title: "PostgreSQL adds the row",
      explanation:
        "The `email` column is `UNIQUE`, so the database itself refuses a second account with the same email. The controller turns that into `409 Email already registered`, and two sign-ups at the same moment can't both succeed.",
      relationshipId: "query:insertUser->queries->table:users",
      dataShape: {
        language: "sql",
        code: "email TEXT NOT NULL UNIQUE,\npassword_hash TEXT NOT NULL,\n\n-- the new row: id 2 | you@example.com | $2b$12$…",
        fileName: "database/schema.sql",
      },
    },
    {
      id: "answer",
      symbolId: "controller:authController.register",
      layer: "backend",
      title: "The controller answers 201 Created",
      explanation:
        "The account exists, so the controller answers `201` with the id and email. There is no cookie yet: registering doesn't log you in by itself.",
      relationshipId:
        "controller:authController.register->returns->http-request:POST /api/auth/register",
      dataShape: {
        language: "js",
        code: 'res.status(201).json(result.rows[0]); // { id: 2, email: "you@example.com" }',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "response",
      symbolId: "http-request:POST /api/auth/register",
      layer: "network",
      title: "The answer travels back",
      explanation: "A plain JSON answer: the new account, without its hash.",
      dataShape: {
        language: "http",
        code: 'HTTP/1.1 201 Created\nContent-Type: application/json; charset=utf-8\n\n{"id":2,"email":"you@example.com"}',
      },
    },
    {
      id: "read-response",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() returns the new account",
      explanation:
        "`response.ok` is true for 201, so `register()` resolves and `handleSubmit` carries on.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: '{ id: 2, email: "you@example.com" }',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "log-in",
      symbolId: "fn:authApi.login",
      layer: "frontend",
      title: "It logs in straight away",
      explanation:
        "With the account created, `handleSubmit` calls `login` with the same email and password. That request gets the httpOnly login cookie; the Log in flow shows every step of it.",
      relationshipId: "fn:register.handleSubmit->calls->fn:authApi.login",
      dataShape: {
        language: "js",
        code: "const user = await login({ email, password });\nonLoggedIn(user);",
        fileName: "frontend/src/pages/Register.jsx",
      },
    },
  ],
};
