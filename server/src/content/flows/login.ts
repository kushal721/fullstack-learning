import type { Flow } from "@fsl/shared";
import { httpExchanges } from "./http-exchanges.js";

// Logging in: where authentication happens. Explains why HTTPS, why
// passwords are hashed and why the token lives in an httpOnly cookie.
export const loginFlow: Flow = {
  id: "login",
  title: "Log in",
  summary:
    "Follow a login from the form to the password check and the signed cookie, and see why each protection is there.",
  group: "security",
  direction: "round-trip",
  http: httpExchanges["http-request:POST /api/auth/login"],
  steps: [
    {
      id: "type-credentials",
      symbolId: "component:Login",
      layer: "user",
      title: "The user types an email and password",
      explanation:
        'The fields are controlled inputs, so the typed email and password live in Login\'s state. The password field has `type="password"`, which hides the characters on screen; it does nothing to protect them on the way to the server.',
      dataShape: {
        language: "jsx",
        code: 'const [email, setEmail] = useState("");       // "you@example.com"\nconst [password, setPassword] = useState(""); // "my-password-123"',
        fileName: "frontend/src/pages/Login.jsx",
      },
    },
    {
      id: "submit",
      symbolId: "event:login.submit",
      layer: "frontend",
      title: "The form is submitted",
      explanation:
        "Pressing Log in submits the form. React calls the `onSubmit` handler instead of letting the browser reload the page.",
      dataShape: {
        language: "jsx",
        code: "<form onSubmit={handleSubmit}>",
        fileName: "frontend/src/pages/Login.jsx",
      },
    },
    {
      id: "handle-submit",
      symbolId: "fn:login.handleSubmit",
      layer: "frontend",
      title: "handleSubmit takes over",
      explanation:
        "`event.preventDefault()` keeps the page from reloading, an old error is cleared, and the login request starts. If it fails, the server's message is shown in the form.",
      relationshipId: "fn:login.handleSubmit->handles->event:login.submit",
      dataShape: {
        language: "js",
        code: "event.preventDefault();\nsetError(null);\nconst user = await login({ email, password });",
        fileName: "frontend/src/pages/Login.jsx",
      },
    },
    {
      id: "auth-api",
      symbolId: "fn:authApi.login",
      layer: "frontend",
      title: "login() asks the API",
      explanation:
        "The auth service knows the URL: it sends the email and password as the body of a POST to `/api/auth/login`.",
      relationshipId: "fn:login.handleSubmit->calls->fn:authApi.login",
      dataShape: {
        language: "js",
        code: 'request("/api/auth/login", {\n  method: "POST",\n  body: { email: "you@example.com", password: "my-password-123" },\n});',
        fileName: "frontend/src/services/authApi.js",
      },
    },
    {
      id: "request",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() prepares it",
      explanation:
        'As for every call, `request` turns the body into JSON text and sets the `Content-Type` header. There is no login cookie yet, but `credentials: "include"` lets the browser keep the one the answer will set.',
      relationshipId: "fn:authApi.login->calls->fn:request",
      dataShape: {
        language: "js",
        code: 'fetch("/api/auth/login", {\n  method: "POST",\n  credentials: "include",\n  headers: { "Content-Type": "application/json" },\n  body: \'{"email":"you@example.com","password":"my-password-123"}\',\n});',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "fetch",
      symbolId: "external:fetch",
      layer: "frontend",
      title: "fetch sends it",
      explanation:
        "The browser's `fetch` sends the request and waits for the answer without freezing the page.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'await fetch("/api/auth/login", { method: "POST", … });',
      },
    },
    {
      id: "https",
      symbolId: "http-request:POST /api/auth/login",
      layer: "network",
      title: "The password crosses the network",
      explanation:
        "The password is in the body of this request. In production the site is served over HTTPS, so everything in the request (body, headers and cookie) is encrypted between the browser and the server and nobody on the network can read it. In development it only travels inside your own computer, to `localhost`, over plain HTTP.",
      relationshipId:
        "external:fetch->sends->http-request:POST /api/auth/login",
      dataShape: {
        language: "http",
        code: 'POST /api/auth/login HTTP/1.1\nHost: localhost:5173\nContent-Type: application/json\n\n{"email":"you@example.com","password":"my-password-123"}',
        caption: "Over HTTPS this whole message is encrypted on the way.",
      },
    },
    {
      id: "parse-json",
      symbolId: "middleware:express.json",
      layer: "backend",
      title: "express.json reads the body",
      explanation:
        "Before any route runs, `express.json` turns the JSON text into `req.body`.",
      dataShape: {
        language: "js",
        code: 'req.body = { email: "you@example.com", password: "my-password-123" };',
        fileName: "backend/src/app.js",
      },
    },
    {
      id: "match-route",
      symbolId: "route:POST /api/auth/login",
      layer: "backend",
      title: "Express matches the login route",
      explanation:
        '`authRoutes.post("/login", …)` under `/api/auth` matches. This route has no `requireAuth`: you can\'t need to be logged in to log in.',
      relationshipId:
        "route:POST /api/auth/login->receives->http-request:POST /api/auth/login",
      dataShape: {
        language: "js",
        code: 'authRoutes.post("/login", authController.login);',
        fileName: "backend/src/routes/auth.js",
      },
    },
    {
      id: "controller",
      symbolId: "controller:authController.login",
      layer: "backend",
      title: "login runs",
      explanation:
        "The controller will check the password and, only if it matches, give the browser a login token.",
      relationshipId:
        "route:POST /api/auth/login->calls->controller:authController.login",
      dataShape: {
        language: "js",
        code: "export async function login(req, res) {",
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "read-credentials",
      symbolId: "fn:readCredentials",
      layer: "backend",
      title: "The credentials are read carefully",
      explanation:
        "`readCredentials` trims the email and lowercases it, so `You@Example.com ` finds the same account, and uses empty text for anything missing. With an empty email or password the controller answers `400` at once.",
      relationshipId:
        "controller:authController.login->calls->fn:readCredentials",
      dataShape: {
        language: "js",
        code: 'readCredentials(req.body);\n// → { email: "you@example.com", password: "my-password-123" }\n// missing either: 400 { "error": "Email and password are required" }',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "find-user",
      symbolId: "query:selectUserByEmail",
      layer: "backend",
      title: "The account is looked up by email",
      explanation:
        "A parameterized SELECT finds the account with that email, including its password hash, which only the server ever sees.",
      relationshipId:
        "controller:authController.login->calls->query:selectUserByEmail",
      dataShape: {
        language: "js",
        code: 'await pool.query(\n  "SELECT id, email, password_hash FROM users WHERE email = $1",\n  ["you@example.com"],\n);',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "user-row",
      symbolId: "table:users",
      layer: "database",
      title: "PostgreSQL returns the user's row",
      explanation:
        "The `users` table stores no passwords at all, only a bcrypt hash of each. Even someone who copies the whole database can't read anyone's password from it.",
      relationshipId: "query:selectUserByEmail->queries->table:users",
      dataShape: {
        language: "js",
        code: 'result.rows[0] = {\n  id: 2,\n  email: "you@example.com",\n  password_hash: "$2b$12$Xk3vN9…",\n};',
        caption: "$2b$ is bcrypt, 12 is the cost, then the salt and the hash.",
      },
    },
    {
      id: "verify-password",
      symbolId: "external:bcrypt",
      layer: "backend",
      title: "bcrypt checks the password",
      explanation:
        "Hashing can't be reversed, so the server hashes the typed password the same way (using the salt stored in the hash) and compares. A wrong password and an unknown email get the same `401` answer, so nobody can find out which emails have accounts.",
      relationshipId: "controller:authController.login->calls->external:bcrypt",
      dataShape: {
        language: "js",
        code: 'const passwordMatches =\n  user && (await bcrypt.compare(password, user.password_hash));\n// true → carry on\n// false → 401 { "error": "Invalid email or password" }',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "sign-token",
      symbolId: "external:jsonwebtoken",
      layer: "backend",
      title: "A signed login token is created",
      explanation:
        "`jwt.sign` writes the user's id into a token and signs it with `JWT_SECRET`. Anyone can read a JWT, but nobody can change it or make one without the secret, so the server can trust the id in it on every later request.",
      relationshipId:
        "controller:authController.login->calls->external:jsonwebtoken",
      dataShape: {
        language: "js",
        code: 'const token = jwt.sign({ sub: 2 }, process.env.JWT_SECRET, {\n  expiresIn: "7d",\n});\n// "eyJhbGciOiJIUzI1NiIs…"',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "set-cookie",
      symbolId: "controller:authController.login",
      layer: "backend",
      title: "The token goes into an httpOnly cookie",
      explanation:
        '`res.cookie` puts the token in a `Set-Cookie` header. `httpOnly` means JavaScript in the page can never read it, so even an XSS bug can\'t steal it; `sameSite: "lax"` stops other websites from making the browser send it; `secure` (in production) only sends it over HTTPS.',
      relationshipId:
        "controller:authController.login->returns->http-request:POST /api/auth/login",
      dataShape: {
        language: "js",
        code: 'res.cookie("token", token, {\n  httpOnly: true,\n  sameSite: "lax",\n  secure: process.env.NODE_ENV === "production",\n  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days\n});\nres.json({ id: 2, email: "you@example.com" });',
        fileName: "backend/src/controllers/authController.js",
      },
    },
    {
      id: "response",
      symbolId: "http-request:POST /api/auth/login",
      layer: "network",
      title: "The answer brings the cookie",
      explanation:
        "The response carries the cookie in a header and the user in the body. The browser stores the cookie and from now on sends it with every request to this site, automatically.",
      dataShape: {
        language: "http",
        code: 'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nSet-Cookie: token=eyJhbGciOiJIUzI1NiIs…; Max-Age=604800; Path=/; Expires=…; HttpOnly; SameSite=Lax\n\n{"id":2,"email":"you@example.com"}',
      },
    },
    {
      id: "read-response",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() returns the user",
      explanation:
        "`response.ok` is true, so `request` returns `{ id, email }`. The page never sees the token itself; only the browser keeps it.",
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: '// returned to login() and handleSubmit:\n{ id: 2, email: "you@example.com" }',
        fileName: "frontend/src/services/request.js",
      },
    },
    {
      id: "logged-in",
      symbolId: "fn:login.handleSubmit",
      layer: "frontend",
      title: "handleSubmit reports the login",
      explanation:
        "`await login(…)` now has the user, and `handleSubmit` passes it up with `onLoggedIn(user)`.",
      relationshipId: "fn:login.handleSubmit->calls->fn:authApi.login",
      dataShape: {
        language: "js",
        code: "const user = await login({ email, password });\nonLoggedIn(user);",
        fileName: "frontend/src/pages/Login.jsx",
      },
    },
    {
      id: "app-switches",
      symbolId: "component:App",
      layer: "frontend",
      title: "App switches to the Dashboard",
      explanation:
        "`onLoggedIn` is App's `handleLoggedIn`. It stores the user, so the Navbar can show their email, and sets `page` to the Dashboard. Changing state is all it takes to switch pages.",
      relationshipId: "component:App->renders->component:Login",
      dataShape: {
        language: "js",
        code: 'function handleLoggedIn(loggedInUser) {\n  setUser(loggedInUser);   // { id: 2, email: "you@example.com" }\n  setPage("dashboard");\n}',
        fileName: "frontend/src/App.jsx",
      },
    },
    {
      id: "dashboard",
      symbolId: "component:Dashboard",
      layer: "user",
      title: "The user sees their notes",
      explanation:
        "The Dashboard appears and loads the notes; that request now carries the login cookie, so the backend knows whose notes to send (see the Load your notes flow).",
      relationshipId: "component:App->renders->component:Dashboard",
      dataShape: {
        language: "jsx",
        code: '{page === "dashboard" && <Dashboard />}',
        fileName: "frontend/src/App.jsx",
      },
    },
  ],
};
