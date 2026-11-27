import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  scene,
  trace,
  yourTurn,
} from "../blocks.js";

// Users and a toy compare for the login exercise: the sandbox has no bcrypt.
const ann =
  'const users = new Map([["ann@x.io", { id: 7, email: "ann@x.io", hash: "h:secret" }]]); const eq = (pw, h) => h === "h:" + pw;';

// The login flow: the whole flow, finding the user, bcrypt.compare, one
// message for both failures, signing a token, the cookie and the answer, a
// login step by step, the front end, timing, limiting attempts, mistakes,
// practice and a recap.
export const theLoginFlowModule = moduleLesson(
  "the-login-flow",
  "The login flow",
  50,
  [
    "Follow a login from the form to the cookie the browser keeps.",
    "Check a password with bcrypt.compare against the stored hash.",
    "Answer the same 401 for an unknown email and a wrong password.",
    "Explain what jwt.sign and each cookie option in the login answer do.",
    "Name the gaps: login attempt limits and a small timing leak.",
  ],

  part(
    "overview",
    "Logging in, end to end",
    explain(
      "Logging in swaps [[credentials]] for something short-lived. The browser sends the email and password once; the API checks them against the stored hash and, if they match, answers with a signed token in a cookie. From then on the cookie, not the password, proves who you are. Step through it below.",
    ),
    scene("logging-in"),
    inTheNotesApp(
      "`login` in `authController.js` does all of this in about twenty lines. This module takes it apart.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "find-user",
    "Finding the account",
    explain(
      "Login starts like sign-up, with `readCredentials`, so the email is trimmed and lowercased the same way. A missing email or password is a `400`: the request is incomplete, nobody has been checked yet. Then one query finds the user by email. It also fetches `password_hash`, the only place it's ever read.",
    ),
    code(
      "js",
      "The start of login (shortened)",
      [
        "const { email, password } =",
        "  readCredentials(req.body);",
        "if (!email || !password) {",
        "  return res.status(400).json({",
        '    error: "Email and password are required",',
        "  });",
        "}",
        "const result = await pool.query(",
        '  "SELECT id, email, password_hash',
        '   FROM users WHERE email = $1",',
        "  [email],",
        ");",
        "const user = result.rows[0];",
      ],
      {
        2: "the same clean-up as sign-up",
        3: "incomplete: 400, not 401",
        10: "UNIQUE email: zero or one row",
        13: "undefined if no account has that email",
      },
    ),
  ),

  part(
    "compare",
    "Checking the password",
    explain(
      "The server can't unhash the stored value, so it does the opposite: `bcrypt.compare` hashes the typed password with the salt and cost saved inside the stored hash, and checks if the result is the same. Like hashing, it's slow on purpose. If there's no user, `user && …` stops early and `passwordMatches` is `undefined`.",
    ),
    anatomy(
      "One check for both failures",
      [
        "const passwordMatches = user &&",
        "  (await bcrypt.compare(password,",
        "    user.password_hash));",
        "if (!passwordMatches) return res.status(401)…",
      ],
      [
        ["user &&", "no user: stop", "compare only runs if a row was found."],
        [
          "bcrypt.compare",
          "hash and compare",
          "Hashes the typed password the same way; true if equal.",
        ],
        [
          "user.password_hash",
          "salt inside",
          "The 60-character string holds the cost, salt and hash.",
        ],
        [
          "!passwordMatches",
          "either failure",
          "No user and wrong password take the same path.",
        ],
        ["401", "not logged in", "Your credentials didn't prove who you are."],
      ],
    ),
  ),

  part(
    "same-message",
    "One message for both failures",
    explain(
      'Both failures answer `401` with `"Invalid email or password"`. If the API said “No such user” for one and “Wrong password” for the other, anyone could test a list of emails and learn who has an account: [[user-enumeration]]. A real user who mistyped loses almost nothing: they check both fields either way.',
    ),
    code(
      "http",
      "No account, or a wrong password: the same answer",
      [
        "HTTP/1.1 401 Unauthorized",
        "Content-Type: application/json",
        "",
        '{ "error": "Invalid email or password" }',
      ],
      { 4: "nothing says which part was wrong" },
    ),
    quickCheck(
      "Why does login send the same message for an unknown email and a wrong password?",
      [
        "So the code is shorter",
        "So nobody can use login to find out which emails have accounts",
        "Because the server can't tell them apart",
      ],
      1,
      "The server knows exactly which one failed. Saying so would turn the login form into a tool for checking whether an email is registered, so both get one message.",
    ),
  ),

  part(
    "sign-token",
    "Signing a token",
    explain(
      "The password matched, so the server writes down “this is user 7” in a way nobody can forge: a [[jwt]]. `jwt.sign` puts `{ sub: 7 }` in the payload, adds an expiry 7 days away, and signs it with `JWT_SECRET`, a key only the server knows. Changing even one character breaks the signature. The Tokens module takes the JWT apart.",
    ),
    anatomy(
      "Make the token and set the cookie (shortened)",
      [
        "const token = jwt.sign({ sub: user.id },",
        "  process.env.JWT_SECRET,",
        '  { expiresIn: "7d" });',
        'res.cookie("token", token, cookieOptions);',
      ],
      [
        [
          "{ sub: user.id }",
          "who",
          "sub (subject) is the user's id. No email, no password.",
        ],
        [
          "JWT_SECRET",
          "the signing key",
          "From an environment variable, never in the code.",
        ],
        [
          'expiresIn: "7d"',
          "how long",
          "Adds exp: after 7 days verify() refuses it.",
        ],
        [
          'res.cookie("token"',
          "Set-Cookie",
          "Express adds a Set-Cookie header named token.",
        ],
        ["cookieOptions", "the rules", "Who can read it and when it's sent."],
      ],
    ),
  ),

  part(
    "cookie",
    "The cookie, and the answer",
    explain(
      "The token goes back in a [[secure-cookies|secure cookie]], so the browser stores it and sends it with every later request by itself. Each option closes a hole. Then the API answers `200` with `{ id, email }`, so the page knows who logged in without being able to see the token.",
    ),
    code(
      "js",
      "cookieOptions and the last line of login",
      [
        "const cookieOptions = {",
        "  httpOnly: true,",
        '  sameSite: "lax",',
        "  secure:",
        '    process.env.NODE_ENV === "production",',
        "  maxAge: 7 * 24 * 60 * 60 * 1000,",
        "};",
        "// …",
        "res.json({ id: user.id, email: user.email });",
      ],
      {
        2: "page JavaScript can't read it",
        3: "not sent with requests other sites start",
        5: "HTTPS only, except on localhost",
        6: "7 days, in milliseconds, like the token",
        9: "200 with who you are, never the token",
      },
    ),
    keyPoints(
      "httpOnly: a script injected into the page can't steal the token.",
      "sameSite lax: other sites can't make your browser send it with a POST.",
      "secure: never sent over plain HTTP in production.",
      "maxAge matches the token's 7 days, so both end together.",
    ),
  ),

  part(
    "step-by-step",
    "Two logins, step by step",
    explain(
      'A model of the controller: a Map is the table, `eq` stands for bcrypt.compare and the stored hash is a toy `"h:secret"`. Ann types the wrong password, then the right one.',
    ),
    trace(
      "login with a Map and a toy compare",
      [
        "function login(users, body, compare) {",
        "  const user = users.get(body.email);",
        "  const ok = user &&",
        "    compare(body.password, user.hash);",
        "  if (!ok) return { status: 401 };",
        "  return { status: 200, id: user.id };",
        "}",
        'const users = new Map([["ann@x.io",',
        '  { id: 7, hash: "h:secret" }]]);',
        'const eq = (pw, h) => h === "h:" + pw;',
        'const email = "ann@x.io";',
        "login(users,",
        '  { email, password: "oops" }, eq);',
        "login(users,",
        '  { email, password: "secret" }, eq);',
      ],
      [
        {
          line: 8,
          note: "One user, with only a hash stored.",
          vars: [["users", 'Map(1) { "ann@x.io" => { id: 7, … } }']],
        },
        {
          line: 10,
          note: "The toy compare: hash the typed password, check it's equal.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["eq", "(pw, h) => …"],
          ],
        },
        {
          line: 12,
          note: "First try, with a typo.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
        },
        {
          line: 2,
          note: "The account exists.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["body", '{ email: "ann@x.io", password: "oops" }'],
            ["compare", "eq"],
            ["user", '{ id: 7, hash: "h:secret" }'],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
          stack: ["login"],
        },
        {
          line: 3,
          note: '"h:oops" isn\'t "h:secret", so ok is false.',
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["body", '{ email: "ann@x.io", password: "oops" }'],
            ["compare", "eq"],
            ["user", '{ id: 7, hash: "h:secret" }'],
            ["ok", "false"],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
          stack: ["login"],
        },
        {
          line: 5,
          note: "401, the same answer an unknown email gets.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["body", '{ email: "ann@x.io", password: "oops" }'],
            ["compare", "eq"],
            ["user", '{ id: 7, hash: "h:secret" }'],
            ["ok", "false"],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
          stack: ["login"],
          output: "{ status: 401 }",
        },
        {
          line: 14,
          note: "Second try.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
        },
        {
          line: 3,
          note: '"h:secret" matches: ok is true.',
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["body", '{ email: "ann@x.io", password: "secret" }'],
            ["compare", "eq"],
            ["user", '{ id: 7, hash: "h:secret" }'],
            ["ok", "true"],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
          stack: ["login"],
        },
        {
          line: 6,
          note: "200 with the id. The real controller signs a token for user 7 here and sets the cookie.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => { id: 7, … } }'],
            ["body", '{ email: "ann@x.io", password: "secret" }'],
            ["compare", "eq"],
            ["user", '{ id: 7, hash: "h:secret" }'],
            ["ok", "true"],
            ["eq", "(pw, h) => …"],
            ["email", '"ann@x.io"'],
          ],
          stack: ["login"],
          output: "{ status: 200, id: 7 }",
        },
      ],
    ),
  ),

  part(
    "front-end",
    "The front end's side",
    explain(
      "`Login.jsx` sends the form with `login()` and hands the answer, `{ id, email }`, to `App.jsx`'s `handleLoggedIn`, which stores the user and shows the dashboard. The cookie is set by the browser without any code. Because it's httpOnly, the page can't look at it, so on first load `App.jsx` asks `GET /api/auth/me` who is logged in.",
    ),
    code(
      "jsx",
      "Login.jsx and App.jsx (shortened)",
      [
        "// Login.jsx",
        "const user =",
        "  await login({ email, password });",
        "onLoggedIn(user);",
        "// App.jsx",
        "function handleLoggedIn(loggedInUser) {",
        "  setUser(loggedInUser);",
        '  setPage("dashboard");',
        "}",
        "useEffect(() => {",
        "  getCurrentUser().then((current) => {",
        "    setUser(current);",
        '    setPage(current ? "dashboard" : "login");',
        "  });",
        "}, []);",
      ],
      {
        3: "the cookie arrives with this answer",
        4: "onLoggedIn is App's handleLoggedIn",
        11: "GET /api/auth/me; null if it answers 401",
      },
    ),
    inTheNotesApp(
      "`getCurrentUser` catches the 401 and returns `null`, so a visitor who isn't logged in simply sees the login page.",
      { fileId: "frontend/src/services/authApi.js" },
    ),
  ),

  part(
    "timing",
    "A small timing leak",
    explain(
      "Look again: `bcrypt.compare` only runs when a user was found. It takes about a quarter of a second, so an unknown email is answered fast and a known one slowly. The message is the same, but the time isn't, so a patient attacker can still tell. The fix: always compare, against a dummy hash when there's no user. The Notes App doesn't do this; see [[timing-safe-comparison]].",
    ),
    code(
      "js",
      "Always do the slow work (not in the Notes App)",
      [
        "// a real bcrypt hash, made once at startup",
        "const DUMMY_HASH =",
        '  await bcrypt.hash("x", 12);',
        "",
        "const user = result.rows[0];",
        "const matches = await bcrypt.compare(",
        "  password,",
        "  user ? user.password_hash : DUMMY_HASH,",
        ");",
        "if (!user || !matches) {",
        "  return res.status(401).json(invalid);",
        "}",
      ],
      {
        3: "same cost, so the same time",
        8: "no user: compare against the dummy",
        10: "still one answer for both failures",
      },
    ),
  ),

  part(
    "limits",
    "Limiting login attempts",
    explain(
      "Nothing stops a script from trying thousands of passwords against one account: a [[brute-force-attack|brute-force attack]]. Or one common password against thousands of accounts, or pairs leaked from other sites: [[credential-stuffing]]. The fix is a cap on failed attempts per email and per IP address, answered with `429 Too Many Requests`. The Notes App has no login limit.",
    ),
    code(
      "js",
      "A limiter on the login route (not in the Notes App)",
      [
        'import rateLimit from "express-rate-limit";',
        "",
        "const loginLimiter = rateLimit({",
        "  windowMs: 15 * 60 * 1000,",
        "  limit: 10,",
        "});",
        'authRoutes.post("/login", loginLimiter,',
        "  authController.login);",
      ],
      {
        4: "a 15-minute window",
        5: "10 tries per IP address, then 429",
        7: "middleware runs before the controller",
      },
    ),
    keyPoints(
      "Count per IP and per email: attackers spread out over both.",
      "Locking an account forever lets anyone lock you out; slow down instead.",
      "Two-factor login, later in this topic, makes a guessed password not enough.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Comparing the password yourself",
      wrong: [
        "if (password !== user.password_hash) {",
        "  return res.status(401).json(invalid);",
        "}",
      ],
      problem:
        "The typed password is never equal to its hash, so every login fails. Comparing to a stored plain password would mean storing it.",
      right: [
        "const ok = await bcrypt.compare(password,",
        "  user.password_hash);",
        "if (!ok) return res.status(401).json(invalid);",
      ],
      why: "bcrypt.compare hashes the typed password with the stored salt and compares safely.",
    }),
    mistake({
      title: "Telling them which part was wrong",
      wrong: [
        "if (!user) return res.status(404)",
        '  .json({ error: "No such user" });',
        "if (!ok) return res.status(401)",
        '  .json({ error: "Wrong password" });',
      ],
      problem:
        "A different status or message for each failure tells anyone which emails have accounts.",
      right: [
        "if (!user || !ok) return res.status(401)",
        '  .json({ error: "Invalid email or password" });',
      ],
      why: "One status and one message, whatever failed.",
    }),
    mistake({
      title: "Forgetting await on compare",
      wrong: [
        "const ok = bcrypt.compare(password, hash);",
        "if (!ok) return res.status(401)…;",
      ],
      problem:
        "Without await, ok is a Promise, which is always truthy, so any password logs in.",
      right: ["const ok = await bcrypt.compare(password,", "  hash);"],
      why: "bcrypt.compare returns a promise; await it to get true or false.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "login()",
      task: 'Write `login(users, body, compare)` returning `{ status, body }`. `users` maps email to `{ id, email, hash }`. Trim and lowercase the email. Missing email or password: 400 `{ error: "Email and password are required" }`. Call `compare(password, hash)` once every time, with `DUMMY_HASH` if there\'s no user. Either failure: 401 `{ error: "Invalid email or password" }`. Else 200 `{ id, email }`.',
      starter: [
        'const DUMMY_HASH = "h:dummy";',
        "function login(users, body, compare) {",
        "  const user = users.get(body.email);",
        "  if (!user) {",
        '    return { status: 401, body: { error: "No such user" } };',
        "  }",
        "  if (!compare(body.password, user.hash)) {",
        '    return { status: 401, body: { error: "Wrong password" } };',
        "  }",
        "  return { status: 200, body: user };",
        "}",
      ],
      tests: [
        [
          `(() => { ${ann} return login(users, { email: " Ann@X.io", password: "secret" }, eq); })()`,
          '{ status: 200, body: { id: 7, email: "ann@x.io" } }',
        ],
        [
          `(() => { ${ann} return login(users, { email: "ann@x.io", password: "oops" }, eq); })()`,
          '{ status: 401, body: { error: "Invalid email or password" } }',
        ],
        [
          `(() => { ${ann} return login(users, { email: "zed@x.io", password: "secret" }, eq); })()`,
          '{ status: 401, body: { error: "Invalid email or password" } }',
        ],
        [
          `(() => { ${ann} const seen = []; login(users, { email: "zed@x.io", password: "pw" }, (p, h) => { seen.push(h); return false; }); return seen; })()`,
          '["h:dummy"]',
        ],
        [
          `(() => { ${ann} return login(users, { email: "ann@x.io" }, eq); })()`,
          '{ status: 400, body: { error: "Email and password are required" } }',
        ],
      ],
      hint: 'Clean the email with `(body.email ?? "")`. Then `compare(password, user ? user.hash : DUMMY_HASH)`, and one `if (!user || !ok)`.',
      solution: [
        'const DUMMY_HASH = "h:dummy";',
        "function login(users, body, compare) {",
        '  const email = (body.email ?? "").trim().toLowerCase();',
        '  const password = body.password ?? "";',
        "  if (!email || !password) return { status: 400,",
        '    body: { error: "Email and password are required" } };',
        "  const user = users.get(email);",
        "  const ok = compare(password,",
        "    user ? user.hash : DUMMY_HASH);",
        "  if (!user || !ok) return { status: 401,",
        '    body: { error: "Invalid email or password" } };',
        "  return { status: 200, body: { id: user.id, email } };",
        "}",
      ],
    }),
    yourTurn({
      title: "Counting failed logins",
      task: "Write `createLimiter(max)`. It returns an object with three methods: `fail(email)` counts a failed login, `succeed(email)` resets that email's count to 0, and `blocked(email)` is `true` once the email has `max` or more failures.",
      starter: [
        "function createLimiter(max) {",
        "  return {",
        "    fail(email) {},",
        "    succeed(email) {},",
        "    blocked(email) { return false; },",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const l = createLimiter(3); l.fail("a"); l.fail("a"); return l.blocked("a"); })()',
          "false",
        ],
        [
          '(() => { const l = createLimiter(3); l.fail("a"); l.fail("a"); l.fail("a"); return [l.blocked("a"), l.blocked("b")]; })()',
          "[true, false]",
        ],
        [
          '(() => { const l = createLimiter(3); l.fail("a"); l.fail("a"); l.succeed("a"); l.fail("a"); l.fail("a"); return l.blocked("a"); })()',
          "false",
        ],
      ],
      hint: "Keep a `Map` from email to a count. `(counts.get(email) ?? 0) + 1` adds one.",
      solution: [
        "function createLimiter(max) {",
        "  const counts = new Map();",
        "  return {",
        "    fail(email) {",
        "      counts.set(email, (counts.get(email) ?? 0) + 1);",
        "    },",
        "    succeed(email) {",
        "      counts.set(email, 0);",
        "    },",
        "    blocked(email) {",
        "      return (counts.get(email) ?? 0) >= max;",
        "    },",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Login cheat sheet", [
      [
        "The route",
        "No requireAuth: you're not logged in yet.",
        "POST /api/auth/login",
      ],
      [
        "Missing field",
        "400: the request is incomplete.",
        '{ "error": "Email and password…" }',
      ],
      [
        "Find the user",
        "By the cleaned email; also fetch the hash.",
        "SELECT … WHERE email = $1",
      ],
      [
        "Check the password",
        "bcrypt.compare, awaited.",
        "await bcrypt.compare(pw, hash)",
      ],
      [
        "Either failure",
        "401, the same message.",
        '{ "error": "Invalid email or password" }',
      ],
      [
        "Sign a token",
        "Who, signed with the secret, 7 days.",
        "jwt.sign({ sub: 7 }, secret, …)",
      ],
      [
        "The cookie",
        "httpOnly, sameSite lax, secure, 7 days.",
        'res.cookie("token", token, opts)',
      ],
      [
        "The answer",
        "200 with id and email.",
        '{ "id": 7, "email": "ann@x.io" }',
      ],
      [
        "On page load",
        "Ask the API; JS can't read the cookie.",
        "GET /api/auth/me",
      ],
      [
        "Not in the Notes App",
        "Attempt limits; compare with a dummy hash.",
        "429; DUMMY_HASH",
      ],
    ]),
    quickCheck(
      "After a page refresh, how does the Notes App front end know you're still logged in?",
      [
        "It reads the token from document.cookie",
        "It asks GET /api/auth/me, and the browser sends the cookie with it",
        "It keeps the password in localStorage and logs in again",
      ],
      1,
      "The cookie is httpOnly, so page scripts can't read it. The browser still sends it, so App.jsx asks /api/auth/me and gets the user, or a 401 that means nobody is logged in.",
    ),
  ),
);
