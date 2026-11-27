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

// A toy hash for the exercises: the sandbox has no bcrypt.
const toyHash =
  'const toyHash = (pw) => "h:" + pw.split("").reverse().join("");';

// Signing up: the flow from the form to the database, readCredentials, the
// checks, hashing before the INSERT, the UNIQUE email and 409, the answer,
// a sign-up step by step, user enumeration on sign-up, what happens after
// (logging in straight away, email verification), mistakes, practice and a
// recap.
export const signingUpModule = moduleLesson(
  "signing-up",
  "Signing up",
  45,
  [
    "Follow a sign-up from the form to a new row in the users table.",
    "Clean up and check an email and password before anything is saved.",
    "Hash the password before the INSERT and never send the hash back.",
    "Let the UNIQUE email rule catch duplicates, and answer 409.",
    "Weigh what a 409 reveals about who has an account.",
  ],

  part(
    "the-flow",
    "From the form to the database",
    explain(
      "Signing up turns an email and a password into a new row in the `users` table. In the Notes App it takes four hops: the Register page, a small function in `authApi.js`, the route `POST /api/auth/register`, and the `register` controller, which checks the input, hashes the password and saves it.",
    ),
    diagram([
      ["Register.jsx", "the form"],
      ["authApi.register", "fetch"],
      ["POST /api/auth/register", "routes/auth.js"],
      ["register()", "check, hash"],
      ["users table", "INSERT"],
    ]),
    code(
      "js",
      "authApi.js: the browser's side",
      [
        "export function register(",
        "  { email, password }) {",
        '  return request("/api/auth/register", {',
        '    method: "POST",',
        "    body: { email, password },",
        "  });",
        "}",
      ],
      {
        3: "request() sends it as JSON",
        5: "the password travels once, over HTTPS",
      },
    ),
    inTheNotesApp(
      "`routes/auth.js` maps `POST /register` to `authController.register`. No `requireAuth` here: you can't be logged in before you have an account.",
      { fileId: "backend/src/routes/auth.js" },
    ),
  ),

  part(
    "read-credentials",
    "Cleaning up the input",
    explain(
      'Both register and login start with `readCredentials(req.body)`. It never trusts the body\'s shape: anything that isn\'t a string becomes `""`. The email is trimmed and lowercased, so `" Ann@Example.com "` and `"ann@example.com"` are the same account. The password is left exactly as typed: spaces and capitals are part of it.',
    ),
    anatomy(
      "readCredentials (shortened)",
      [
        'const email = typeof body?.email === "string"',
        '  ? body.email.trim().toLowerCase() : "";',
        "const password = typeof body?.password ===",
        '  "string" ? body.password : "";',
      ],
      [
        [
          "body?.email",
          "may be missing",
          "?. means a missing body gives undefined, not a crash.",
        ],
        [
          '"string"',
          "only text",
          "A number, array or object in the JSON is treated as empty.",
        ],
        [".trim()", "no stray spaces", "Spaces from copy and paste go."],
        [
          ".toLowerCase()",
          "one account per address",
          "Ann@X.io and ann@x.io must not become two users.",
        ],
        [
          "body.password",
          "as typed",
          "Never trim or lowercase a password: it would change it.",
        ],
      ],
    ),
  ),

  part(
    "checks",
    "The checks before anything is saved",
    explain(
      "Then two quick checks, each a `400` with a message the form can show. The email must contain `@`: a light check, because the only real proof an address works is an email that arrives. The password must be at least 8 characters, the Notes App's [[password-policy|password rule]]. The form's `minLength={8}` is only a convenience: anyone can send a request without the form.",
    ),
    code(
      "js",
      "The start of register (shortened)",
      [
        "const { email, password } =",
        "  readCredentials(req.body);",
        'if (!email.includes("@")) {',
        "  return res.status(400)",
        '    .json({ error: "Please enter a…" });',
        "}",
        "if (password.length < PASSWORD_MIN_LENGTH) {",
        "  return res.status(400).json({",
        "    error: `Password must be at least…`,",
        "  });",
        "}",
      ],
      {
        3: "light: has an @, nothing more",
        7: "PASSWORD_MIN_LENGTH is 8",
        8: "return: stop before hashing",
      },
    ),
    quickCheck(
      'Someone sends `{ "email": "ann@x.io", "password": 12345678 }` with curl. What happens?',
      [
        "201: the number has 8 digits",
        "400: readCredentials turns the number into an empty password",
        "500: password.length crashes on a number",
      ],
      1,
      'readCredentials only keeps strings, so the password becomes "" and the length check answers 400. Checking the type first is what stops the crash.',
    ),
  ),

  part(
    "hash-first",
    "Hash first, then INSERT",
    explain(
      "Only after the checks pass does the controller call [[bcrypt]]: `bcrypt.hash(password, 12)` makes a slow, salted hash, and that hash is what the INSERT stores. The plain password is never written anywhere: not in the table, not in a log. Hashing comes after the checks so a bad request doesn't cost a quarter of a second of work.",
    ),
    code(
      "js",
      "Hash, then save (shortened)",
      [
        "const passwordHash =",
        "  await bcrypt.hash(password, BCRYPT_COST);",
        "const result = await pool.query(",
        '  "INSERT INTO users (email, password_hash)',
        '   VALUES ($1, $2) RETURNING id, email",',
        "  [email, passwordHash],",
        ");",
      ],
      {
        2: "BCRYPT_COST is 12: slow on purpose",
        4: "the column holds the hash, never the password",
        5: "RETURNING only the safe columns",
        6: "$1, $2: values passed apart from the SQL",
      },
    ),
    keyPoints(
      "The password exists only in memory, for this one request.",
      "Hash after the cheap checks, before the INSERT.",
      "RETURNING id, email: the hash never comes back out.",
    ),
  ),

  part(
    "unique",
    "The UNIQUE email is the real check",
    explain(
      "Why not first ask “is this email taken?” and then insert? Because two sign-ups for the same email can arrive at the same moment: both ask, both hear “no”, both insert. The `UNIQUE` [[sql-constraint|constraint]] on `email` can't be raced: the database lets exactly one INSERT win, and the other fails with error code `23505`. The controller turns that into `409 Conflict`.",
    ),
    code(
      "js",
      "Catching the duplicate (shortened)",
      [
        "try {",
        "  const result = await pool.query(insert,",
        "    [email, passwordHash]);",
        "  res.status(201).json(result.rows[0]);",
        "} catch (err) {",
        '  if (err.code === "23505") {',
        "    return res.status(409).json({",
        '      error: "Email already registered",',
        "    });",
        "  }",
        "  throw err;",
        "}",
      ],
      {
        6: "UNIQUE_VIOLATION: the email is taken",
        7: "409 Conflict: the account already exists",
        11: "anything else: the error handler sends 500",
      },
    ),
    reference("Two sign-ups for ann@x.io at once", [
      [
        "Check, then insert",
        "Both checks see no row; both INSERTs run.",
        "two accounts, or a 500",
      ],
      [
        "Insert, catch 23505",
        "One INSERT wins; the other gets 23505.",
        "201 and 409",
      ],
    ]),
  ),

  part(
    "answer",
    "201, with the id and email",
    explain(
      "A new account answers `201 Created` with just the new user's id and email. The hash is never sent, even though it can't be turned back: it would let anyone who sees the response try to guess the password offline, at their own speed. Send the fewest fields the client needs.",
    ),
    code(
      "http",
      "What the browser gets back",
      [
        "HTTP/1.1 201 Created",
        "Content-Type: application/json",
        "",
        '{ "id": 7, "email": "ann@x.io" }',
      ],
      {
        1: "Created: a new row exists",
        4: "lowercased email, and no password_hash",
      },
    ),
  ),

  part(
    "step-by-step",
    "Two sign-ups, step by step",
    explain(
      "A model of the controller in plain JavaScript. The `users` Map stands in for the table, and `users.has` for the UNIQUE rule; `hash` stands for bcrypt. Follow Ann signing up twice, the second time with capitals and spaces.",
    ),
    trace(
      "register with a Map for the table",
      [
        "function register(users, body) {",
        "  const email = body.email",
        "    .trim().toLowerCase();",
        "  if (users.has(email)) {",
        "    return { status: 409 };",
        "  }",
        "  users.set(email, hash(body.password));",
        "  return { status: 201, email };",
        "}",
        "const users = new Map();",
        'const pw = "correct horse";',
        'register(users, { email: "ann@x.io",',
        "  password: pw });",
        'register(users, { email: " Ann@X.io ",',
        "  password: pw });",
      ],
      [
        {
          line: 10,
          note: "An empty table.",
          vars: [["users", "Map(0) {}"]],
        },
        {
          line: 11,
          note: "The password Ann will type.",
          vars: [
            ["users", "Map(0) {}"],
            ["pw", '"correct horse"'],
          ],
        },
        {
          line: 12,
          note: "The first sign-up.",
          vars: [
            ["users", "Map(0) {}"],
            ["pw", '"correct horse"'],
          ],
        },
        {
          line: 2,
          note: "Clean up the email. It was already clean.",
          vars: [
            ["users", "Map(0) {}"],
            ["body", '{ email: "ann@x.io", password: pw }'],
            ["email", '"ann@x.io"'],
            ["pw", '"correct horse"'],
          ],
          stack: ["register"],
        },
        {
          line: 4,
          note: "No row with that email yet, so no 409.",
          vars: [
            ["users", "Map(0) {}"],
            ["body", '{ email: "ann@x.io", password: pw }'],
            ["email", '"ann@x.io"'],
            ["pw", '"correct horse"'],
          ],
          stack: ["register"],
        },
        {
          line: 7,
          note: "Save the hash, never the password.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => "$2b$12$…" }'],
            ["body", '{ email: "ann@x.io", password: pw }'],
            ["email", '"ann@x.io"'],
            ["pw", '"correct horse"'],
          ],
          stack: ["register"],
        },
        {
          line: 8,
          note: "201 with the email. The hash stays in the table.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => "$2b$12$…" }'],
            ["body", '{ email: "ann@x.io", password: pw }'],
            ["email", '"ann@x.io"'],
            ["pw", '"correct horse"'],
          ],
          stack: ["register"],
          output: '{ status: 201, email: "ann@x.io" }',
        },
        {
          line: 14,
          note: "The second sign-up, typed differently.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => "$2b$12$…" }'],
            ["pw", '"correct horse"'],
          ],
        },
        {
          line: 2,
          note: "Trimmed and lowercased: it's the same address.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => "$2b$12$…" }'],
            ["body", '{ email: " Ann@X.io ", password: pw }'],
            ["email", '"ann@x.io"'],
            ["pw", '"correct horse"'],
          ],
          stack: ["register"],
        },
        {
          line: 5,
          note: "Taken, so 409. Without toLowerCase it would have made a second account.",
          vars: [
            ["users", 'Map(1) { "ann@x.io" => "$2b$12$…" }'],
            ["body", '{ email: " Ann@X.io ", password: pw }'],
            ["email", '"ann@x.io"'],
            ["pw", '"correct horse"'],
          ],
          stack: ["register"],
          output: "{ status: 409 }",
        },
      ],
    ),
  ),

  part(
    "enumeration",
    "What a 409 gives away",
    explain(
      "Login is careful to say the same thing for a wrong email and a wrong password. Sign-up can't be, the simple way: a `409 Email already registered` tells anyone that this email has an account. Trying a list of emails this way is [[user-enumeration]]. For a notes app that's a small leak; for a dating or medical site, the account itself is a secret.",
    ),
    explain(
      "The safer pattern always answers the same: “Check your email to finish signing up.” A new address gets a link to confirm; an existing one gets “You already have an account. Forgot your password?” Only the owner of the inbox learns which. The price: sign-up needs email sending, and it's slower for real users.",
    ),
    reference("Two ways to answer a taken email", [
      [
        "409 at once",
        "Clear and quick; reveals the account exists.",
        "Notes App",
      ],
      [
        "“Check your email”",
        "Same answer for everyone; needs email.",
        "banks, health sites",
      ],
    ]),
    keyPoints(
      "A 409 is honest and friendly, and leaks who has an account.",
      "Pick per app: how bad is it if someone learns you're a user?",
      "Limiting sign-up attempts makes enumeration slow either way.",
    ),
  ),

  part(
    "after",
    "After the 201",
    explain(
      "The register route doesn't log you in: it sets no cookie. So `Register.jsx` makes a second request. After `register()` succeeds, it calls `login()` with the same email and password, and that answer sets the login cookie. Then `onLoggedIn(user)` shows the notes. Two requests, but each route does one job.",
    ),
    code(
      "jsx",
      "Register.jsx: handleSubmit (shortened)",
      [
        "async function handleSubmit(event) {",
        "  event.preventDefault();",
        "  try {",
        "    await register({ email, password });",
        "    const user =",
        "      await login({ email, password });",
        "    onLoggedIn(user);",
        "  } catch (err) {",
        "    setError(err.message);",
        "  }",
        "}",
      ],
      {
        4: "201: the account exists, no cookie yet",
        6: "a normal login sets the cookie",
        9: '400 or 409: show "Email already registered"',
      },
    ),
    explain(
      "Many apps first verify the email: they save the account as unconfirmed, send a link with a random single-use token, and only treat the address as real once it's clicked. The Notes App doesn't do email verification; anyone can sign up with an address they don't own. That's fine for a demo, but not for an app that sends email or resets passwords by email.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Checking first, then inserting",
      wrong: [
        "const found = await findByEmail(email);",
        "if (found) return res.status(409)…;",
        "await insertUser(email, passwordHash);",
      ],
      problem:
        "Two sign-ups at the same moment both see no user and both insert. Without UNIQUE you get two accounts; with it, the loser gets a 500.",
      right: [
        "try {",
        "  await insertUser(email, passwordHash);",
        "} catch (err) {",
        '  if (err.code === "23505") return res',
        "    .status(409).json(taken);",
        "  throw err;",
        "}",
      ],
      why: "The database's UNIQUE rule is the only check that can't be raced.",
    }),
    mistake({
      title: "Sending the whole row back",
      wrong: [
        '"INSERT … RETURNING *"',
        "res.status(201).json(result.rows[0]);",
      ],
      problem:
        "RETURNING * includes password_hash, so the response hands out the hash.",
      right: [
        '"INSERT … RETURNING id, email"',
        "res.status(201).json(result.rows[0]);",
      ],
      why: "Name the columns you return; the hash never leaves the server.",
    }),
    mistake({
      title: "Forgetting to lowercase the email",
      wrong: ["const email = req.body.email;"],
      problem:
        '"Ann@x.io" and "ann@x.io" pass the UNIQUE rule as two accounts, and Ann can\'t log in with the one she didn\'t mean.',
      right: [
        'const email = String(req.body.email ?? "")',
        "  .trim().toLowerCase();",
      ],
      why: "Clean the email the same way at sign-up and at login.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "register()",
      task: 'Write `register(users, body)` returning `{ status, body }`. `users` maps email to `{ id, hash }`. Trim and lowercase the email. Answer 400 `{ error: "Invalid email" }` if it has no `@`, 400 `{ error: "Password too short" }` under 8 characters, 409 `{ error: "Email already registered" }` if taken. Else save `{ id: users.size + 1, hash: toyHash(password) }` and answer 201 `{ id, email }`.',
      starter: [
        toyHash,
        "function register(users, body) {",
        "  const { email, password } = body;",
        "  const id = users.size + 1;",
        "  users.set(email, { id, hash: password });",
        "  return { status: 201, body: { id, email } };",
        "}",
      ],
      tests: [
        [
          'register(new Map(), { email: " Ann@X.io ", password: "correct horse" })',
          '{ status: 201, body: { id: 1, email: "ann@x.io" } }',
        ],
        [
          '(() => { const users = new Map(); register(users, { email: "ann@x.io", password: "longpass1" }); return users.get("ann@x.io"); })()',
          '{ id: 1, hash: "h:1ssapgnol" }',
        ],
        [
          'register(new Map([["ann@x.io", { id: 1, hash: "h" }]]), { email: "ANN@x.io", password: "whatever99" })',
          '{ status: 409, body: { error: "Email already registered" } }',
        ],
        [
          'register(new Map(), { email: "ann", password: "longpass1" })',
          '{ status: 400, body: { error: "Invalid email" } }',
        ],
        [
          'register(new Map(), { email: "ann@x.io", password: "short" })',
          '{ status: 400, body: { error: "Password too short" } }',
        ],
      ],
      hint: "Clean the email first, then return early for each problem in order: @, length, `users.has(email)`. Save last.",
      solution: [
        toyHash,
        "function register(users, body) {",
        "  const email = body.email.trim().toLowerCase();",
        "  const fail = (status, error) =>",
        "    ({ status, body: { error } });",
        '  if (!email.includes("@"))',
        '    return fail(400, "Invalid email");',
        "  if (body.password.length < 8)",
        '    return fail(400, "Password too short");',
        "  if (users.has(email))",
        '    return fail(409, "Email already registered");',
        "  const id = users.size + 1;",
        "  users.set(email, { id, hash: toyHash(body.password) });",
        "  return { status: 201, body: { id, email } };",
        "}",
      ],
    }),
    yourTurn({
      title: "The same answer for everyone",
      task: 'Write `startSignUp(users, email, outbox)` for the “check your email” design. `users` is a Set of emails. Lowercase and trim the email. If it\'s taken, push `{ to: email, kind: "already-registered" }` to `outbox`; otherwise add it to `users` and push `{ to: email, kind: "confirm" }`. Either way, return `"Check your email to finish signing up"`.',
      starter: [
        "function startSignUp(users, email, outbox) {",
        "  if (users.has(email)) {",
        '    return "Email already registered";',
        "  }",
        "  users.add(email);",
        '  return "Check your email to finish signing up";',
        "}",
      ],
      tests: [
        [
          '(() => { const outbox = []; const msg = startSignUp(new Set(), "bob@x.io", outbox); return [msg, outbox]; })()',
          '["Check your email to finish signing up", [{ to: "bob@x.io", kind: "confirm" }]]',
        ],
        [
          '(() => { const outbox = []; const msg = startSignUp(new Set(["ann@x.io"]), " Ann@X.io", outbox); return [msg, outbox]; })()',
          '["Check your email to finish signing up", [{ to: "ann@x.io", kind: "already-registered" }]]',
        ],
        [
          '(() => { const users = new Set(); startSignUp(users, "Bob@x.io", []); return [...users]; })()',
          '["bob@x.io"]',
        ],
      ],
      hint: "Only the email that's sent differs. Build the message once and return it at the end.",
      solution: [
        "function startSignUp(users, email, outbox) {",
        "  const to = email.trim().toLowerCase();",
        "  if (users.has(to)) {",
        '    outbox.push({ to, kind: "already-registered" });',
        "  } else {",
        "    users.add(to);",
        '    outbox.push({ to, kind: "confirm" });',
        "  }",
        '  return "Check your email to finish signing up";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Signing up cheat sheet", [
      [
        "The route",
        "No requireAuth: anyone may sign up.",
        "POST /api/auth/register",
      ],
      [
        "readCredentials",
        "Strings only; email trimmed and lowercased.",
        '" Ann@X.io " → "ann@x.io"',
      ],
      [
        "Light checks",
        "Has @, password ≥ 8 characters; else 400.",
        '{ "error": "Please enter…" }',
      ],
      [
        "Hash first",
        "bcrypt.hash before the INSERT; cost 12.",
        "await bcrypt.hash(pw, 12)",
      ],
      [
        "UNIQUE email",
        "The real duplicate check; can't be raced.",
        "23505 → 409",
      ],
      [
        "The answer",
        "201 with id and email, never the hash.",
        '{ "id": 7, "email": "ann@x.io" }',
      ],
      [
        "Enumeration",
        "A 409 reveals the account exists.",
        "“Check your email” instead",
      ],
      [
        "Then log in",
        "Register.jsx calls login() after the 201.",
        "register → login → onLoggedIn",
      ],
    ]),
    quickCheck(
      "Two people sign up as `bob@x.io` in the same millisecond. What makes sure only one account is made?",
      [
        "The controller checks for the email before inserting",
        "The UNIQUE rule on users.email",
        "The form's required attribute",
      ],
      1,
      "A check-then-insert can be raced: both checks see no row. The database's UNIQUE rule lets exactly one INSERT win; the other fails with 23505 and gets a 409.",
    ),
  ),
);
