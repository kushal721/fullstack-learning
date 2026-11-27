import {
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

// A fake res for the exercises: records the status and the body.
const fakeRes =
  "const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };";

// Protecting routes: one check in front of many routes, requireAuth taken
// apart, a whole router or one route, requireAuth step by step, logged in is
// not enough, the IDOR bug, 404 not 403, roles with requireRole, checking on
// the server, the front end and a 401, mistakes, practice and a recap.
export const protectingRoutesModule = moduleLesson(
  "protecting-routes",
  "Protecting routes",
  50,
  [
    "Read requireAuth line by line: cookie, verify, req.user, then next() or 401.",
    "Protect a whole router with use() or a single route by listing the middleware.",
    "Check ownership in every query, and spot the IDOR bug when it's missing.",
    "Answer 404 for someone else's note, and know when 403 is right.",
    "Add a role check with requireRole, and always check on the server.",
  ],

  part(
    "the-gate",
    "One check in front of many routes",
    explain(
      "Every notes route needs to know who is asking. Instead of checking the cookie in each controller, the Notes App puts one [[express-middleware|middleware]], `requireAuth`, in front of them. It either fills in `req.user` and passes the request on, or stops it with `401`. Controllers can then trust `req.user.id` without a second thought.",
    ),
    diagram([
      ["Request", "Cookie: token=…"],
      ["requireAuth", "verify the token"],
      ["Controller", "uses req.user.id"],
      ["Response", "or 401 from requireAuth"],
    ]),
    inTheNotesApp(
      "`requireAuth` lives in authMiddleware.js and is 12 lines long. Every notes route and `GET /api/auth/me` run it first.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
  ),

  part(
    "anatomy",
    "requireAuth, taken apart",
    explain(
      "The middleware does four things: read the cookie, verify the token, remember who it is, and pass the request on. If anything goes wrong (no cookie, a changed token, an expired one), `jwt.verify` throws, and the `catch` answers 401 instead.",
    ),
    anatomy(
      "The happy path of requireAuth",
      [
        "const token = req.cookies.token;",
        "const payload = jwt.verify(token, secret);",
        "req.user = { id: payload.sub };",
        "next();",
      ],
      [
        [
          "req.cookies.token",
          "read the cookie",
          "cookie-parser fills req.cookies. No cookie means undefined.",
        ],
        [
          "jwt.verify",
          "check the token",
          "Signature and expiry. Throws on undefined, a changed token or an expired one.",
        ],
        [
          "req.user",
          "remember who",
          "Every later middleware and controller reads req.user.id.",
        ],
        [
          "next()",
          "pass it on",
          "Runs the next middleware or the controller. Without it the request hangs.",
        ],
      ],
    ),
    code(
      "js",
      "The whole middleware",
      [
        "export function requireAuth(req, res, next) {",
        "  const token = req.cookies.token;",
        "  try {",
        "    const payload = jwt.verify(token,",
        "      process.env.JWT_SECRET);",
        "    req.user = { id: payload.sub };",
        "    next();",
        "  } catch {",
        "    res.status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "}",
      ],
      {
        8: "any failure in try lands here",
        9: "401: we don't know who you are",
      },
    ),
  ),

  part(
    "applying",
    "A whole router, or one route",
    explain(
      '`router.use(requireAuth)` runs it before every route added after it on that router. Listing it in one route, `get("/me", requireAuth, handler)`, protects only that route. The Notes App uses both: all notes routes are private, but in the auth router `register`, `login` and `logout` must stay open, since you can\'t be logged in to log in.',
    ),
    code(
      "js",
      "routes/notes.js and routes/auth.js",
      [
        "notesRoutes.use(requireAuth);",
        'notesRoutes.get("/", listNotes);',
        'notesRoutes.post("/", createNote);',
        "",
        'authRoutes.post("/login", login);',
        'authRoutes.post("/logout", logout);',
        'authRoutes.get("/me", requireAuth,',
        "  currentUser);",
      ],
      {
        1: "every notes route below needs a login",
        5: "public: no requireAuth",
        7: "only this auth route is protected",
      },
    ),
    quickCheck(
      "Someone moves `notesRoutes.use(requireAuth)` below the four notes routes. What happens?",
      [
        "Nothing changes",
        "The notes routes run without a login check",
        "Express refuses to start",
      ],
      1,
      "Middleware runs in the order it's added. The routes match first and answer, so requireAuth never runs for them, and req.user is undefined in the controllers.",
    ),
  ),

  part(
    "step-by-step",
    "requireAuth, step by step",
    explain(
      'Here are two requests through `requireAuth`. `verify` is a fake that knows one good token, `"t3"`, and throws for anything else. `next` prints `next()` and the fake `res` prints its answer.',
    ),
    trace(
      "One request without a cookie, one with",
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
        "const anon = { cookies: {} };",
        "requireAuth(anon, res, next);",
        'const ana = { cookies: { token: "t3" } };',
        "requireAuth(ana, res, next);",
      ],
      [
        {
          line: 12,
          note: "A request with no login cookie: never logged in, or the cookie has expired.",
          vars: [
            ["verify", "ƒ verify(token)"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["anon", "{ cookies: {} }"],
          ],
        },
        {
          line: 2,
          note: "No token cookie, so token is undefined.",
          vars: [
            ["req", "{ cookies: {} }"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["token", "undefined"],
          ],
          stack: ["requireAuth"],
        },
        {
          line: 4,
          note: "verify throws, like jwt.verify's “jwt must be provided”. The rest of try is skipped.",
          vars: [
            ["req", "{ cookies: {} }"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["token", "undefined"],
          ],
          stack: ["requireAuth", "verify"],
        },
        {
          line: 8,
          note: "The catch answers 401. next() is never called, so no controller runs.",
          vars: [
            ["req", "{ cookies: {} }"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["token", "undefined"],
          ],
          stack: ["requireAuth"],
          output: '401 { "error": "Please log in" }',
        },
        {
          line: 15,
          note: "Now a request with a good cookie.",
          vars: [
            ["verify", "ƒ verify(token)"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["anon", "{ cookies: {} }"],
            ["ana", '{ cookies: { token: "t3" } }'],
          ],
        },
        {
          line: 4,
          note: "verify accepts it and returns the payload.",
          vars: [
            ["req", '{ cookies: { token: "t3" } }'],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["token", '"t3"'],
            ["payload", "{ sub: 3 }"],
          ],
          stack: ["requireAuth"],
        },
        {
          line: 5,
          note: "Remember who is asking, for the controller.",
          vars: [
            ["req", "{ cookies, user: { id: 3 } }"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["token", '"t3"'],
            ["payload", "{ sub: 3 }"],
          ],
          stack: ["requireAuth"],
        },
        {
          line: 6,
          note: "Pass it on: in the real app, the controller runs next.",
          vars: [
            ["req", "{ cookies, user: { id: 3 } }"],
            ["res", "{ status, json }"],
            ["next", "ƒ next()"],
            ["token", '"t3"'],
            ["payload", "{ sub: 3 }"],
          ],
          stack: ["requireAuth", "next"],
          output: "next()",
        },
      ],
    ),
  ),

  part(
    "authorization",
    "Logged in is not enough",
    explain(
      "requireAuth answers *who* is asking. It says nothing about *what* they may touch. That second question is [[authentication-vs-authorization|authorization]], and for notes it's an [[ownership-check|ownership check]]: does note 8 belong to user 3? The Notes App answers it inside every query with `user_id`, so the database only ever finds this user's rows.",
    ),
    code(
      "sql",
      "Every notes query names the owner",
      [
        "SELECT id, title FROM notes",
        " WHERE user_id = $1;",
        "",
        "UPDATE notes SET title = $1",
        " WHERE id = $3 AND user_id = $4;",
        "",
        "DELETE FROM notes",
        " WHERE id = $1 AND user_id = $2;",
      ],
      {
        2: "$1 is req.user.id",
        5: "this note, and only if it's theirs",
      },
    ),
    inTheNotesApp(
      "notesController.js passes `req.user.id` to every query and says why in its first comment.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "idor",
    "The IDOR bug",
    explain(
      "Forget `AND user_id = $n` once and any logged-in user can change the id in the URL and reach someone else's note. That is an IDOR: an insecure direct object reference. It's one of the most common bugs in real APIs, because everything looks fine when you test with your own notes.",
    ),
    code(
      "http",
      "User 3 tries note 8, which is user 5's",
      [
        "PUT /api/notes/8 HTTP/1.1",
        "Cookie: token=<user 3's token>",
        "Content-Type: application/json",
        "",
        '{ "title": "hacked" }',
      ],
      {
        1: "just a different number in the URL",
        2: "a perfectly valid login",
      },
    ),
    mistake({
      title: "Finding the note by id alone",
      language: "sql",
      wrong: ["UPDATE notes SET title = $1", " WHERE id = $2;"],
      problem:
        "requireAuth passed, so any logged-in user can rename note 8, whoever owns it.",
      right: [
        "UPDATE notes SET title = $1",
        " WHERE id = $2 AND user_id = $3;",
      ],
      why: "The owner is part of the question, so another user's note simply isn't found.",
    }),
  ),

  part(
    "not-found",
    "404, not 403",
    explain(
      "When user 3 asks for note 8 and it's user 5's, the query finds no row and the Notes App answers `404 Note not found`, the same as for a note that doesn't exist. A `403` would be honest but would leak that note 8 exists. With one answer for both, nobody can probe which ids exist. See [[unauthorized-vs-forbidden|401 vs 403]].",
    ),
    reference("Which status when", [
      ["No or bad token", "401: log in first.", '{ "error": "Please log in" }'],
      [
        "Not your note",
        "404: as if it didn't exist.",
        '{ "error": "Note not found" }',
      ],
      [
        "No such note",
        "404: the same answer.",
        '{ "error": "Note not found" }',
      ],
      [
        "Known, but not allowed",
        "403: when existence isn't a secret.",
        "a member opening /api/admin",
      ],
    ]),
    quickCheck(
      "User 3 sends `DELETE /api/notes/8`. Note 8 belongs to user 5. What does the Notes App answer?",
      ["403 Forbidden", "404 Note not found", "204 No Content"],
      1,
      "The DELETE includes AND user_id = 3, so no row matches and rowCount is 0. The controller answers 404, exactly as if note 8 didn't exist.",
    ),
  ),

  part(
    "roles",
    "Roles: requireRole",
    explain(
      "Some apps have admins who can do more. [[role-based-access|Role-based access]] stores a role on each user and checks it in a second middleware after requireAuth. The Notes App has no roles: every user is equal. Here is how it would look. Read the role from the database, not just the token: a role in the token stays valid until `exp` even after you take it away.",
    ),
    code(
      "js",
      "A requireRole middleware (not in the Notes App)",
      [
        "function requireRole(role) {",
        "  return (req, res, next) => {",
        "    if (req.user?.role !== role) {",
        "      return res.status(403)",
        '        .json({ error: "Forbidden" });',
        "    }",
        "    next();",
        "  };",
        "}",
        "",
        "adminRoutes.use(requireAuth,",
        '  requireRole("admin"));',
      ],
      {
        1: "a factory: returns a middleware",
        4: "403: we know you, and the answer is no",
        11: "order matters: who first, then what",
      },
    ),
    code("sql", "A role column it would need", [
      "ALTER TABLE users ADD COLUMN role TEXT",
      "  NOT NULL DEFAULT 'member';",
    ]),
  ),

  part(
    "server-side",
    "Hiding a button is not protection",
    explain(
      "The front end can hide the Delete button on notes that aren't yours, or hide the admin menu. That's good for people, but it protects nothing: anyone can send the request with curl or the browser's DevTools. The browser is on the other side of the [[trust-boundary|trust boundary]]. Every rule must be checked again on the server, on every request.",
    ),
    code(
      "bash",
      "No button needed",
      [
        "curl -X DELETE \\",
        "  https://notes.example/api/notes/8 \\",
        '  -H "Cookie: token=eyJhbGci…"',
      ],
      { 1: "the UI never showed this option" },
    ),
    keyPoints(
      "The UI hides what you can't do; the server refuses it.",
      "Every request is checked again, whatever came before.",
      "Never trust a user id or role sent in the body.",
    ),
  ),

  part(
    "front-end",
    "The front end and a 401",
    explain(
      "When the app loads, `getCurrentUser()` asks `GET /api/auth/me`. A 401 makes `request()` throw, `getCurrentUser` catches it and returns `null`, and App.jsx shows the login page. If the cookie expires later, a notes request gets a 401 and the dashboard shows “Please log in”. A bigger app would catch 401s in `request()` and send you back to the login page.",
    ),
    code(
      "js",
      "authApi.js: a 401 means nobody",
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
        3: "200: { id, email }",
        5: "401 (or no network): not logged in",
      },
    ),
    inTheNotesApp(
      "App.jsx calls getCurrentUser once on load and picks the dashboard or the login page from the answer.",
      { fileId: "frontend/src/App.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting next()",
      wrong: [
        "const payload = jwt.verify(token, secret);",
        "req.user = { id: payload.sub };",
      ],
      problem:
        "The token is fine, but the request never reaches the controller and the browser waits until it times out.",
      right: [
        "const payload = jwt.verify(token, secret);",
        "req.user = { id: payload.sub };",
        "next();",
      ],
      why: "Middleware either answers or calls next(). Doing neither leaves the request hanging.",
    }),
    mistake({
      title: "Trusting the id in the body",
      wrong: [
        "const { userId, title } = req.body;",
        "await pool.query(insert, [userId, title]);",
      ],
      problem:
        "Anyone can send userId: 5 and create notes in someone else's account.",
      right: [
        "const { title } = req.body;",
        "await pool.query(insert,",
        "  [req.user.id, title]);",
      ],
      why: "Who is asking comes from the verified token, through requireAuth, never from the request.",
    }),
    mistake({
      title: "Roles checked before the login",
      wrong: [
        'adminRoutes.use(requireRole("admin"));',
        "adminRoutes.use(requireAuth);",
      ],
      problem:
        "requireRole runs first, when req.user doesn't exist yet, so everyone gets 403, even admins.",
      right: [
        "adminRoutes.use(requireAuth);",
        'adminRoutes.use(requireRole("admin"));',
      ],
      why: "Authentication first (who), then authorization (what they may do).",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A requireAuth factory",
      task: 'Write `makeRequireAuth(verify)`. It returns a middleware `(req, res, next)`. Call `verify(req.cookies.token)`: it returns `{ sub }` or throws. On success set `req.user = { id: sub }` and call `next()`. If it throws, answer `res.status(401).json({ error: "Please log in" })`.',
      starter: [
        "function makeRequireAuth(verify) {",
        "  return (req, res, next) => {",
        "    next();",
        "  };",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeRes} const verify = (t) => { if (t === "t3") return { sub: 3 }; throw new Error("bad"); }; const req = { cookies: { token: "t3" } }; let called = false; makeRequireAuth(verify)(req, res, () => { called = true; }); return [called, req.user]; })()`,
          "[true, { id: 3 }]",
        ],
        [
          `(() => { ${fakeRes} const verify = () => { throw new Error("bad"); }; let called = false; makeRequireAuth(verify)({ cookies: {} }, res, () => { called = true; }); return [called, res.statusCode, res.body]; })()`,
          '[false, 401, { error: "Please log in" }]',
        ],
        [
          `(() => { ${fakeRes} const verify = (t) => { if (t === "t3") return { sub: 3 }; throw new Error("bad"); }; const req = { cookies: { token: "forged" } }; makeRequireAuth(verify)(req, res, () => {}); return [res.statusCode, req.user]; })()`,
          "[401, undefined]",
        ],
      ],
      hint: "Put the verify call, the req.user line and next() inside `try`, and the 401 inside `catch`.",
      solution: [
        "function makeRequireAuth(verify) {",
        "  return (req, res, next) => {",
        "    try {",
        "      const { sub } = verify(req.cookies.token);",
        "      req.user = { id: sub };",
        "      next();",
        "    } catch {",
        "      res.status(401)",
        '        .json({ error: "Please log in" });',
        "    }",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Can this user edit this note?",
      task: "Write `canEdit(user, note)`. Return `true` only if both exist and the note's `userId` is the user's `id`. Return `false` otherwise.",
      starter: [
        "function canEdit(user, note) {",
        "  return Boolean(user);",
        "}",
      ],
      tests: [
        ["canEdit({ id: 3 }, { id: 8, userId: 3 })", "true"],
        ["canEdit({ id: 3 }, { id: 9, userId: 5 })", "false"],
        ["canEdit(null, { id: 8, userId: 3 })", "false"],
        ["canEdit({ id: 3 }, undefined)", "false"],
      ],
      hint: "`Boolean(user && note && note.userId === user.id)`.",
      solution: [
        "function canEdit(user, note) {",
        "  if (!user || !note) return false;",
        "  return note.userId === user.id;",
        "}",
      ],
    }),
    yourTurn({
      title: "requireRole",
      task: 'Write `requireRole(role)`, returning a middleware. No `req.user`: answer `401` with `{ error: "Please log in" }`. A different role: `403` with `{ error: "Forbidden" }`. The right role: call `next()`.',
      starter: [
        "function requireRole(role) {",
        "  return (req, res, next) => next();",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeRes} let called = false; requireRole("admin")({ user: { id: 1, role: "admin" } }, res, () => { called = true; }); return called; })()`,
          "true",
        ],
        [
          `(() => { ${fakeRes} let called = false; requireRole("admin")({ user: { id: 3, role: "member" } }, res, () => { called = true; }); return [called, res.statusCode, res.body]; })()`,
          '[false, 403, { error: "Forbidden" }]',
        ],
        [
          `(() => { ${fakeRes} let called = false; requireRole("admin")({}, res, () => { called = true; }); return [called, res.statusCode]; })()`,
          "[false, 401]",
        ],
      ],
      hint: "Check `!req.user` first and return the 401, then compare `req.user.role !== role` and return the 403.",
      solution: [
        "function requireRole(role) {",
        "  return (req, res, next) => {",
        "    if (!req.user) {",
        "      return res.status(401)",
        '        .json({ error: "Please log in" });',
        "    }",
        "    if (req.user.role !== role) {",
        "      return res.status(403)",
        '        .json({ error: "Forbidden" });',
        "    }",
        "    next();",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Protecting routes cheat sheet", [
      [
        "requireAuth",
        "Cookie → verify → req.user → next(), or 401.",
        "notesRoutes.use(requireAuth)",
      ],
      [
        "Whole router",
        "use() protects every route added after it.",
        "notesRoutes.use(requireAuth)",
      ],
      [
        "One route",
        "List the middleware before the handler.",
        'get("/me", requireAuth, me)',
      ],
      [
        "Who is asking",
        "req.user.id, never the body or the URL.",
        "[req.user.id, title]",
      ],
      [
        "Ownership check",
        "The owner in every query.",
        "WHERE id = $1 AND user_id = $2",
      ],
      ["IDOR", "Finding a row by id alone: anyone's row.", "WHERE id = $1"],
      [
        "Not yours",
        "404, the same as not there.",
        '{ "error": "Note not found" }',
      ],
      [
        "Roles",
        "A second middleware after requireAuth: 403.",
        'requireRole("admin")',
      ],
      ["Server decides", "Hidden buttons protect nothing.", "curl -X DELETE …"],
      [
        "Front end",
        "A 401 means: show the login page.",
        "getCurrentUser() → null",
      ],
    ]),
    quickCheck(
      "requireAuth passes for user 3. Which query lets user 3 read only their own note 8?",
      [
        "SELECT * FROM notes WHERE id = 8",
        "SELECT * FROM notes WHERE id = 8 AND user_id = 3",
        "SELECT * FROM notes WHERE user_id = 8",
      ],
      1,
      "requireAuth only proves who is asking. The ownership check is the user_id condition, with 3 coming from req.user.id, so another user's note 8 is never found.",
    ),
  ),
);
