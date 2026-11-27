import {
  anatomy,
  analogy,
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

// Who are you? Who may do what?: two different questions, the Notes App's
// examples, 401 vs 403, credentials taken apart, why every request must
// say who it is, the two halves in the Notes App, one request's identity
// journey step by step, what this topic covers, mistakes, practice and a
// recap.
export const whoAreYouModule = moduleLesson(
  "who-are-you",
  "Who are you? Who may do what?",
  45,
  [
    "Tell authentication (who are you?) from authorization (what may you do?).",
    "Choose between 401 and 403 for a refused request.",
    "Name the credentials a user can show, and what a login swaps them for.",
    "Explain why every request must say again who is asking.",
    "Point to where the Notes App checks who you are and which notes are yours.",
  ],

  part(
    "two-questions",
    "Two different questions",
    explain(
      "Every protected request raises two questions. First: who is asking? Finding that out is authentication. Second: may this person do this? Deciding that is authorization. Together they're [[authentication-vs-authorization|authentication and authorization]], often shortened to authn and authz. They're checked in that order, and always on the server.",
    ),
    diagram([
      ["Request", "GET /api/notes/7"],
      ["Authentication", "who is it? user 3"],
      ["Authorization", "is note 7 theirs?"],
      ["Answer", "the note, or no"],
    ]),
    analogy(
      "A hotel: the front desk checks your ID once (authentication). After that, your key card opens your room, not every room (authorization).",
    ),
  ),

  part(
    "notes-examples",
    "Both questions in the Notes App",
    explain(
      "In the Notes App, logging in with your email and password is authentication: the server learns you are user 3. Authorization is the rule that you may only see and change your own notes. Being logged in isn't enough to open note 8 if note 8 belongs to user 5.",
    ),
    keyPoints(
      "Authentication: logging in, and proving it on every request.",
      "Authorization: only your own notes, never anyone else's.",
      "Authentication comes first: you can't decide what an unknown user may do.",
      "Both run on the server: the browser can be changed by anyone.",
    ),
    quickCheck(
      "User 3 is logged in and asks to delete note 8, which belongs to user 5. Which check stops it?",
      [
        "Authentication",
        "Authorization",
        "Neither: logged-in users may delete",
      ],
      1,
      "Authentication already worked: the server knows it's user 3. Authorization is the check that says note 8 isn't theirs, so the delete must be refused.",
    ),
  ),

  part(
    "401-403",
    "401 or 403?",
    explain(
      "You met these two status codes in HTTP & APIs. `401 Unauthorized` really means unauthenticated: we don't know who you are, so log in. `403 Forbidden` means we know who you are, and you may not. A 401 can go away by logging in; a 403 won't change with the same account.",
    ),
    code(
      "http",
      "Not logged in, then logged in but not allowed",
      [
        "HTTP/1.1 401 Unauthorized",
        '{ "error": "Please log in" }',
        "",
        "HTTP/1.1 403 Forbidden",
        '{ "error": "Admins only" }',
      ],
      {
        1: "no cookie, or a bad or expired one",
        4: "known user, wrong permissions",
      },
    ),
    inTheNotesApp(
      'requireAuth answers 401 "Please log in". For someone else\'s note the controllers answer 404 "Note not found", not 403, so nobody can learn which note ids exist.',
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "credentials",
    "Credentials: what you show",
    explain(
      "[[credentials|Credentials]] are what you show to prove who you are: an email and password, a passkey, a token or an API key. People log in with a password once; the server then hands back something short-lived, a cookie, so the password doesn't have to travel with every request.",
    ),
    anatomy(
      "A login request",
      [
        "POST /api/auth/login HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"email":"ada@x.io","password":"s3cret!"}',
      ],
      [
        [
          "POST",
          "method",
          "A POST, so the password goes in the body, not the URL.",
        ],
        [
          "/api/auth/login",
          "the route",
          "The Notes App's login route, in routes/auth.js.",
        ],
        [
          '"email"',
          "who you say you are",
          "The email names the account. On its own it proves nothing.",
        ],
        [
          '"password"',
          "the proof",
          "Only the real user should know it. It travels over HTTPS only.",
        ],
      ],
    ),
  ),

  part(
    "stateless",
    "Why every request must say it again",
    explain(
      "HTTP is [[stateless]]: the server keeps no memory of your last request. Logging in at 9:00 doesn't mean the request at 9:01 is from you, unless it carries proof. So login hands the browser a cookie, and the browser sends it back with every later request. The server checks it each time.",
    ),
    diagram([
      ["Log in", "email + password"],
      ["Set-Cookie", "token=…"],
      ["Each request", "Cookie: token=…"],
      ["requireAuth", "checks it again"],
    ]),
    keyPoints(
      "Credentials once, at login.",
      "Then a cookie (or token) with every request.",
      "The server checks it on every request; it never just remembers you.",
    ),
  ),

  part(
    "two-halves",
    "The two halves in the Notes App",
    explain(
      "Authentication lives in two places. `login` checks the password and sets a cookie holding a signed token. `requireAuth`, a middleware in front of every notes route, reads that cookie and sets `req.user`. Authorization lives in the SQL: every notes query says `user_id = $n` with your id, so other people's notes are never even found.",
    ),
    code(
      "js",
      "requireAuth, then a query that only finds your notes",
      [
        "function requireAuth(req, res, next) {",
        "  const token = req.cookies.token;",
        "  try {",
        "    const payload = jwt.verify(token, key);",
        "    req.user = { id: payload.sub };",
        "    next();",
        "  } catch {",
        "    res.status(401).json(…);",
        "  }",
        "}",
        "// in a controller:",
        '"DELETE FROM notes WHERE id = $1',
        '   AND user_id = $2", [id, req.user.id]',
      ],
      {
        2: "the cookie the login set",
        4: "key: the JWT_SECRET setting",
        5: "authentication done: we know who it is",
        8: "no cookie, forged or expired: 401",
        13: "authorization: only rows that are yours",
      },
    ),
    inTheNotesApp(
      "requireAuth is in `middleware/authMiddleware.js`, and `routes/notes.js` runs it before every notes route with `notesRoutes.use(requireAuth)`.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
  ),

  part(
    "journey",
    "One request's identity journey",
    explain(
      "Follow `GET /api/notes` from user 3. The token map below stands in for checking the signed cookie; the filter stands in for `WHERE user_id = $1`.",
    ),
    trace(
      "From cookie to your notes",
      [
        'const req = { cookies: { token: "t1" } };',
        "const tokens = { t1: 3 }; // token → id",
        "const id = tokens[req.cookies.token];",
        'if (!id) console.log("401");',
        "req.user = { id };",
        "const notes = [",
        "  { id: 7, user_id: 3 },",
        "  { id: 8, user_id: 5 },",
        "];",
        "const mine = notes.filter(",
        "  (n) => n.user_id === req.user.id);",
        "console.log(mine.map((n) => n.id));",
      ],
      [
        {
          line: 1,
          note: "The request arrives with the cookie the login set.",
          vars: [["req", '{ cookies: { token: "t1" } }']],
        },
        {
          line: 2,
          note: "Which tokens belong to whom. The real app verifies a signature instead.",
          vars: [
            ["req", '{ cookies: { token: "t1" } }'],
            ["tokens", "{ t1: 3 }"],
          ],
        },
        {
          line: 3,
          note: "Authentication: the token says this is user 3.",
          vars: [
            ["req", '{ cookies: { token: "t1" } }'],
            ["tokens", "{ t1: 3 }"],
            ["id", "3"],
          ],
        },
        {
          line: 4,
          note: "There is an id, so no 401. Without a valid cookie the request would stop here.",
          vars: [
            ["req", '{ cookies: { token: "t1" } }'],
            ["tokens", "{ t1: 3 }"],
            ["id", "3"],
          ],
        },
        {
          line: 5,
          note: "Like requireAuth, store who it is on req for the controller.",
          vars: [
            ["req", '{ cookies: { token: "t1" }, user: { id: 3 } }'],
            ["tokens", "{ t1: 3 }"],
            ["id", "3"],
          ],
        },
        {
          line: 6,
          note: "All the notes in the table: one is user 3's, one is user 5's.",
          vars: [
            ["req", '{ cookies: { token: "t1" }, user: { id: 3 } }'],
            ["tokens", "{ t1: 3 }"],
            ["id", "3"],
            ["notes", "[{ id: 7, user_id: 3 }, { id: 8, user_id: 5 }]"],
          ],
        },
        {
          line: 10,
          note: "Authorization: keep only the rows whose user_id is req.user.id.",
          vars: [
            ["req", '{ cookies: { token: "t1" }, user: { id: 3 } }'],
            ["tokens", "{ t1: 3 }"],
            ["id", "3"],
            ["notes", "[{ id: 7, user_id: 3 }, { id: 8, user_id: 5 }]"],
            ["mine", "[{ id: 7, user_id: 3 }]"],
          ],
        },
        {
          line: 12,
          note: "User 3 gets note 7 only. Note 8 was never in the answer.",
          vars: [
            ["req", '{ cookies: { token: "t1" }, user: { id: 3 } }'],
            ["tokens", "{ t1: 3 }"],
            ["id", "3"],
            ["notes", "[{ id: 7, user_id: 3 }, { id: 8, user_id: 5 }]"],
            ["mine", "[{ id: 7, user_id: 3 }]"],
          ],
          output: "[ 7 ]",
        },
      ],
    ),
  ),

  part(
    "this-topic",
    "What's in this topic",
    explain(
      "The Notes App does the basics well: hashed passwords, one answer for a wrong email or password, a signed token in an httpOnly cookie, and your-notes-only queries. It has no roles, no two-factor login, no password reset, no refresh tokens and no login rate limit. You'll see what each would look like, and why you'd add it.",
    ),
    reference("The road ahead", [
      ["Basic", "Passwords, hashing, signing up, logging in."],
      [
        "Intermediate",
        "Sessions and cookies, JWTs, protecting routes, logging out.",
      ],
      ["Advanced", "Refresh tokens, OAuth, two-factor login, password reset."],
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Trusting a user id sent by the browser",
      wrong: [
        "const { userId } = req.body;",
        '"SELECT * FROM notes WHERE user_id = $1"',
        "  , [userId]",
      ],
      problem:
        "Anyone can send any userId in the body, and read anyone's notes. The browser is not proof of anything.",
      right: [
        "// set by requireAuth from the cookie",
        '"SELECT * FROM notes WHERE user_id = $1"',
        "  , [req.user.id]",
      ],
      why: "Only the server-checked cookie says who is asking, so the id comes from req.user.",
    }),
    mistake({
      title: "Logged in, so allowed",
      wrong: ['"DELETE FROM notes WHERE id = $1", [id]'],
      problem:
        "requireAuth ran, so the user is known, but any logged-in user can delete any note by changing the id.",
      right: [
        '"DELETE FROM notes WHERE id = $1',
        '   AND user_id = $2", [id, req.user.id]',
      ],
      why: "Authentication says who; authorization must still check that the note is theirs.",
    }),
    mistake({
      title: "Hiding the button is the only check",
      language: "jsx",
      wrong: ["{isOwner && <button>Delete</button>}"],
      problem:
        "That only hides the button. Anyone can still send DELETE /api/notes/8 with a tool like curl.",
      right: [
        "{isOwner && <button>Delete</button>}",
        "// and the server checks user_id too",
      ],
      why: "The frontend is for a tidy screen; the server is where access is decided.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "401, 403 or 200?",
      task: "Write `decide(user, note)`. `user` is `null` when nobody is logged in, otherwise `{ id }`. Return `401` if there's no user, `403` if the note's `user_id` isn't the user's id, and `200` otherwise.",
      starter: ["function decide(user, note) {", "  return 200;", "}"],
      tests: [
        ["decide(null, { id: 7, user_id: 3 })", "401"],
        ["decide({ id: 5 }, { id: 7, user_id: 3 })", "403"],
        ["decide({ id: 3 }, { id: 7, user_id: 3 })", "200"],
      ],
      hint: "Check who first (no user: 401), then what (not the owner: 403).",
      solution: [
        "function decide(user, note) {",
        "  if (!user) return 401;",
        "  if (note.user_id !== user.id) return 403;",
        "  return 200;",
        "}",
      ],
    }),
    yourTurn({
      title: "A tiny requireAuth",
      task: 'Write `requireAuth(req, res, next, tokens)`. Look up `req.cookies.token` in the `tokens` object (token → user id). If found, set `req.user = { id }` and call `next()`. If not, answer `res.status(401).json({ error: "Please log in" })` and don\'t call next.',
      starter: [
        "function requireAuth(req, res, next, tokens) {",
        "  next();",
        "}",
      ],
      tests: [
        [
          '(() => { const req = { cookies: { token: "t1" } }; let called = false; requireAuth(req, {}, () => { called = true; }, { t1: 3 }); return [called, req.user]; })()',
          "[true, { id: 3 }]",
        ],
        [
          "(() => { const res = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; let called = false; requireAuth({ cookies: {} }, res, () => { called = true; }, { t1: 3 }); return [called, res.statusCode, res.body]; })()",
          '[false, 401, { error: "Please log in" }]',
        ],
        [
          '(() => { const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json() { return this; } }; let called = false; requireAuth({ cookies: { token: "fake" } }, res, () => { called = true; }, { t1: 3 }); return [called, res.statusCode]; })()',
          "[false, 401]",
        ],
      ],
      hint: "`const id = tokens[req.cookies.token];` then an if: no id means 401 and return.",
      solution: [
        "function requireAuth(req, res, next, tokens) {",
        "  const id = tokens[req.cookies.token];",
        "  if (!id) {",
        "    return res",
        "      .status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "  req.user = { id };",
        "  next();",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Who are you? Who may do what?", [
      ["Authentication", "Who is asking? Login, then proof on every request."],
      ["Authorization", "May they do this? Checked after authentication."],
      ["401", "We don't know who you are: log in.", "no or bad cookie"],
      ["403", "We know you, and you may not.", "not an admin"],
      [
        "404 instead",
        "Hides that someone else's note exists.",
        "Note not found",
      ],
      ["Credentials", "Password, passkey, token or key.", "email + password"],
      ["Stateless", "HTTP forgets; the cookie comes with every request."],
      ["requireAuth", "Reads the cookie, sets req.user, or answers 401."],
      [
        "user_id = $n",
        "The Notes App's authorization: only your rows.",
        "AND user_id = $2",
      ],
    ]),
    quickCheck(
      "A request has a valid login cookie for user 3 and asks for note 8, owned by user 5. What should the Notes App do?",
      [
        "Answer 401: log in again",
        "Return note 8: the user is logged in",
        "Find no row, because the query also checks user_id",
      ],
      2,
      "Authentication worked, so it's not a 401. Authorization says note 8 isn't user 3's: the query's `user_id = $2` finds nothing, and the app answers 404 so nobody learns the note exists.",
    ),
  ),
);
