import {
  analogy,
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Auth headers: proof on every request, the Authorization header taken
// apart, Basic briefly, API keys for programs, cookies or headers, 401, 403
// or 404 step by step, the Notes App's cookie, a 401 on the client,
// mistakes, practice and a recap.
export const authHeadersModule = moduleLesson(
  "auth-headers",
  "Proving who's calling",
  45,
  [
    "Send credentials in the Authorization header, and read its scheme and credentials.",
    "Use API keys for programs, and keep them on the server, never in front-end code.",
    "Choose between a cookie and the Authorization header to prove who is calling.",
    "Answer 401, 403 or 404 correctly, with WWW-Authenticate on a 401.",
    "Keep tokens and keys out of URLs.",
  ],

  part(
    "proof",
    "Proof on every request",
    explain(
      "HTTP forgets everything between requests, so each request that needs a logged-in user carries its own proof. It goes in one of two places: a cookie, which the browser adds by itself, or the [[authorization-header|Authorization header]], which your code adds. The server checks it every time and works out who's calling, or answers 401.",
    ),
    analogy(
      "A festival wristband: you show it at every tent, not just once at the gate. Whoever wears it gets in, so don't hand it around.",
    ),
    keyPoints(
      "No memory between requests: every request brings proof.",
      "Cookie: the browser sends it. Header: your code sends it.",
      "The server checks it on every request.",
      "Only ever over HTTPS: anyone on plain HTTP can read it.",
    ),
  ),

  part(
    "authorization",
    "The Authorization header",
    explain(
      "Its value is a scheme, a space, then the credentials. The scheme says how to read the rest. With a [[bearer-token|bearer token]], the token is the proof: the server checks it and finds out who it belongs to. It might be a random string looked up in a database, or a signed token such as a JWT. How tokens are made is for the Authentication topic.",
    ),
    anatomy(
      "A request with a bearer token",
      ["GET /api/notes HTTP/1.1", "Authorization: Bearer eyJhbGciOi…"],
      [
        [
          "Authorization:",
          "the header",
          "The standard place for credentials. (Its name says authorization, but it's about who you are.)",
        ],
        [
          "Bearer",
          "the scheme",
          "How to read what follows. Case doesn't matter: bearer works too.",
        ],
        [
          "eyJhbGciOi…",
          "credentials",
          "Here a token. Whoever holds (bears) it is let in, so it should expire.",
        ],
      ],
    ),
  ),

  part(
    "basic",
    "Basic auth, briefly",
    explain(
      "The `Basic` scheme sends a username and password, joined by a colon and base64-encoded. Base64 is not encryption: anyone who sees the header decodes it in one line. So it's only for HTTPS, and mostly for scripts and internal tools. People using a web app log in once and get a cookie or token instead of sending their password every time.",
    ),
    code(
      "js",
      "Base64 hides nothing",
      [
        'const creds = btoa("ana:secret123");',
        '// "YW5hOnNlY3JldDEyMw=="',
        'fetch("/api/report", {',
        "  headers: {",
        "    Authorization: `Basic ${creds}`,",
        "  },",
        "});",
        "",
        'atob("YW5hOnNlY3JldDEyMw==");',
        '// "ana:secret123"',
      ],
      {
        1: "username:password, encoded",
        5: "scheme, space, credentials",
        9: "anyone can decode it back",
      },
    ),
  ),

  part(
    "api-keys",
    "API keys for programs",
    explain(
      "When a program calls an API, not a person (your server asking a weather API, say), it uses an [[api-key|API key]]: a long secret tied to that program. It goes in a header, often `Authorization: Bearer sk_…` or `X-API-Key`. Keep keys on your server. Anything in front-end code, even a value baked into the bundle at build time, can be read in DevTools.",
    ),
    diagram([
      ["Browser", "no key"],
      ["Your server", "adds the key"],
      ["Weather API", "checks it"],
    ]),
    code(
      "js",
      "The key never leaves your server",
      [
        "async function weather(req, res) {",
        "  const r = await fetch(WEATHER_URL, {",
        "    headers: {",
        "      Authorization:",
        "        `Bearer ${process.env.WEATHER_KEY}`,",
        "    },",
        "  });",
        "  res.json(await r.json());",
        "}",
      ],
      {
        1: "your API's route, called by the browser",
        5: "read from the server's environment",
        8: "the browser only sees the result",
      },
    ),
  ),

  part(
    "cookie-or-header",
    "A cookie or the Authorization header?",
    explain(
      "A browser app often uses a cookie: the browser sends it by itself, and an httpOnly one can't be read by JavaScript, so an injected script can't steal it. Cross-origin `fetch` only sends it with `credentials: \"include\"`. A header suits everything else: phone apps, scripts and servers. But the token must then live somewhere your code can read it.",
    ),
    reference("Two places for the proof", [
      [
        "Cookie",
        "The browser sends it by itself; httpOnly hides it from scripts.",
        "Cookie: token=eyJ…",
      ],
      [
        "Authorization",
        "Your code adds it; works for any client.",
        "Authorization: Bearer eyJ…",
      ],
      [
        'credentials: "include"',
        "Lets fetch send cookies to another origin.",
        'fetch(url, { credentials: "include" })',
      ],
    ]),
    quickCheck(
      "Why can't the Notes App's own JavaScript read its login token?",
      [
        "The token is encrypted",
        "It's in an httpOnly cookie",
        "It's sent in the Authorization header",
      ],
      1,
      "httpOnly cookies are sent with requests but hidden from `document.cookie`, so even a script injected into the page can't read them.",
    ),
  ),

  part(
    "status",
    "401, 403 or 404, step by step",
    explain(
      "[[unauthorized-vs-forbidden|401 and 403]] answer different questions. 401 means “I don't know who you are”: no credentials, or bad or expired ones; log in and retry. It should come with a `WWW-Authenticate` header naming the scheme, such as `Bearer`. 403 means “I know who you are, and you may not”. To hide that something exists at all, answer 404.",
    ),
    trace(
      "Who may read note 1?",
      [
        "function access(user, note) {",
        "  if (!user) return 401;",
        "  if (note.ownerId === user.id) return 200;",
        '  if (user.role === "admin") return 200;',
        "  return 403;",
        "}",
        "access(null, { ownerId: 1 });",
        "access({ id: 2 }, { ownerId: 1 });",
      ],
      [
        {
          line: 7,
          note: "A request with no valid token: nobody is logged in.",
        },
        {
          line: 2,
          note: "No user, so: who are you? 401, with `WWW-Authenticate: Bearer`.",
          vars: [
            ["user", "null"],
            ["note", "{ ownerId: 1 }"],
          ],
          stack: ["access"],
          output: "401",
        },
        {
          line: 8,
          note: "Now Ben (user 2) is logged in and asks for Ana's note.",
        },
        {
          line: 3,
          note: "We know who he is. But the note's owner is 1, not 2.",
          vars: [
            ["user", "{ id: 2 }"],
            ["note", "{ ownerId: 1 }"],
          ],
          stack: ["access"],
        },
        {
          line: 4,
          note: "And he isn't an admin.",
          vars: [
            ["user", "{ id: 2 }"],
            ["note", "{ ownerId: 1 }"],
          ],
          stack: ["access"],
        },
        {
          line: 5,
          note: "Known, but not allowed: 403. Logging in again won't help. The Notes App answers 404 here, so nobody learns the note exists.",
          vars: [
            ["user", "{ id: 2 }"],
            ["note", "{ ownerId: 1 }"],
          ],
          stack: ["access"],
          output: "403",
        },
      ],
    ),
  ),

  part(
    "notes-app",
    "The Notes App: a cookie",
    explain(
      'The Notes App uses a cookie, not the Authorization header. Logging in sets an httpOnly cookie named `token`, and `request.js` sends it with `credentials: "include"`. `requireAuth` reads `req.cookies.token` and checks it: it sets `req.user`, or answers `401 { error: "Please log in" }`. It has no API keys and never answers 403: someone else\'s note is a 404.',
    ),
    code(
      "js",
      "requireAuth, shortened",
      [
        "function requireAuth(req, res, next) {",
        "  const token = req.cookies.token;",
        "  try {",
        "    const payload = verify(token);",
        "    req.user = { id: payload.sub };",
        "    next();",
        "  } catch {",
        "    res.status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "}",
      ],
      {
        2: "from the cookie, not a header",
        4: "a missing, forged or expired token throws",
        8: "who are you? log in",
      },
    ),
    inTheNotesApp(
      "`requireAuth` runs before every notes route and answers 401 without a valid cookie.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
    inTheNotesApp(
      '`request.js` sends the cookie on every call with `credentials: "include"`.',
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "client-401",
    "When the client gets a 401",
    explain(
      "On the client, a 401 usually means “show the login screen”, not “show an error”. When the Notes App starts, it asks `GET /api/auth/me`. If that fails, as it does with a 401 when there's no cookie, `getCurrentUser` returns `null`: nobody is logged in. (It turns any failure into `null`, not only a 401.) A 401 later on means the login expired: send the person to log in again.",
    ),
    code(
      "js",
      "authApi.js: a failure means nobody",
      [
        "export async function getCurrentUser() {",
        "  try {",
        '    return await request("/api/auth/me");',
        "  } catch {",
        "    return null;",
        "  }",
        "}",
      ],
      {
        3: "the cookie goes along with it",
        5: "401 (or any failure): not logged in",
      },
    ),
    inTheNotesApp(
      "`getCurrentUser` asks the API who is logged in, because JavaScript can't read the cookie.",
      { fileId: "frontend/src/services/authApi.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A token in the URL",
      wrong: ["fetch(`/api/notes?token=${token}`);"],
      problem:
        "URLs are kept in browser history, server and proxy logs, analytics, and the Referer sent to other sites. The token leaks with them.",
      right: [
        'fetch("/api/notes", {',
        "  headers: {",
        "    Authorization: `Bearer ${token}`,",
        "  },",
        "});",
      ],
      why: "Headers aren't saved in history or shared in links. Keep secrets there.",
    }),
    mistake({
      title: "An API key in the front end",
      wrong: [
        'const KEY = "sk_test_123";',
        'fetch(URL, { headers: { "X-API-Key": KEY } });',
      ],
      problem:
        "Everything sent to the browser can be read in DevTools. Anyone can copy the key and spend your quota.",
      right: ['fetch("/api/weather");', "// your server adds the key"],
      why: "The browser calls your server; only your server knows the key.",
    }),
    mistake({
      title: "403 for nobody logged in",
      wrong: ["if (!req.user) {", "  return res.status(403).json({ … });", "}"],
      problem:
        "403 says “you may never do this”, so the client shows an error instead of the login screen.",
      right: ["if (!req.user) {", "  return res.status(401).json({ … });", "}"],
      why: "401: log in and try again. 403: logging in again won't help.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Read an Authorization header",
      task: 'Write `parseAuthorization(header)`. For `"Bearer abc123"` return `{ scheme: "bearer", credentials: "abc123" }`, with the scheme in lowercase (schemes ignore case). Return `null` when the header is missing or isn\'t a scheme, spaces, then credentials.',
      starter: [
        "function parseAuthorization(header) {",
        '  const [scheme, credentials] = header.split(" ");',
        "  return { scheme, credentials };",
        "}",
      ],
      tests: [
        [
          'parseAuthorization("Bearer abc123")',
          '{ scheme: "bearer", credentials: "abc123" }',
        ],
        [
          'parseAuthorization("BASIC YW5hOng=")',
          '{ scheme: "basic", credentials: "YW5hOng=" }',
        ],
        [
          'parseAuthorization("bearer   abc123")',
          '{ scheme: "bearer", credentials: "abc123" }',
        ],
        ['parseAuthorization("Bearer")', "null"],
        ["parseAuthorization(undefined)", "null"],
      ],
      hint: 'Match `header ?? ""` against `/^(\\S+) +(\\S+)$/`: two runs of non-spaces with spaces between. No match: `null`.',
      solution: [
        "function parseAuthorization(header) {",
        '  const match = /^(\\S+) +(\\S+)$/.exec(header ?? "");',
        "  if (!match) return null;",
        "  return {",
        "    scheme: match[1].toLowerCase(),",
        "    credentials: match[2],",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "401, 403, 404 or 200",
      task: 'Write `decide(user, note, method)`. No user: 401. No note: 404. The owner (`note.ownerId === user.id`) may do anything: 200. Someone in `note.sharedWith` may only `"GET"` (200); anything else is 403. Anyone else gets 404, so they can\'t tell the note exists.',
      starter: [
        "function decide(user, note, method) {",
        "  if (!user) return 401;",
        "  return 200;",
        "}",
      ],
      tests: [
        ['decide(null, { ownerId: 1, sharedWith: [] }, "GET")', "401"],
        ['decide({ id: 1 }, null, "GET")', "404"],
        ['decide({ id: 1 }, { ownerId: 1, sharedWith: [] }, "DELETE")', "200"],
        ['decide({ id: 2 }, { ownerId: 1, sharedWith: [2] }, "GET")', "200"],
        ['decide({ id: 2 }, { ownerId: 1, sharedWith: [2] }, "DELETE")', "403"],
        ['decide({ id: 3 }, { ownerId: 1, sharedWith: [2] }, "GET")', "404"],
      ],
      hint: "Check in order: user, note, owner, then `note.sharedWith.includes(user.id)`. Shared users get 200 for GET, 403 otherwise.",
      solution: [
        "function decide(user, note, method) {",
        "  if (!user) return 401;",
        "  if (!note) return 404;",
        "  if (note.ownerId === user.id) return 200;",
        "  if (!note.sharedWith.includes(user.id)) return 404;",
        '  return method === "GET" ? 200 : 403;',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Auth headers cheat sheet", [
      [
        "Authorization",
        "Scheme, space, credentials.",
        "Authorization: Bearer eyJ…",
      ],
      ["Bearer token", "Whoever holds it is let in; it should expire."],
      ["Basic", "user:password in base64. Not encrypted.", "Basic YW5hOng="],
      ["API key", "A program's secret. Server only.", "X-API-Key: sk_…"],
      ["Cookie", "Sent by the browser; httpOnly hides it.", "Cookie: token=…"],
      [
        "credentials",
        "Send cookies with a cross-origin fetch.",
        'credentials: "include"',
      ],
      ["401", "Who are you? Log in.", "WWW-Authenticate: Bearer"],
      ["403", "Known, but not allowed."],
      ["404 instead", "Hide that it exists at all.", "someone else's note"],
      ["Not in URLs", "URLs end up in logs and history.", "?token=… ✗"],
    ]),
    quickCheck(
      "Ana is logged in and tries to delete a note that was shared with her to read only. What should the API answer?",
      ["401 Unauthorized", "403 Forbidden", "200 OK"],
      1,
      "The API knows who she is, so it isn't 401. She can see the note but isn't allowed to delete it, and logging in again won't change that: 403.",
    ),
  ),
);
