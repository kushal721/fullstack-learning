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

// Safe password reset: a second way in, the request (same answer every
// time), a random token stored as a hash and the link taken apart,
// verifying and setting the new password, single use and expiry step by
// step, ending other sessions, rate limits and security questions,
// changing a password while logged in, the Notes App, mistakes, practice
// and a recap.
export const passwordResetModule = moduleLesson(
  "password-reset",
  "Safe password reset",
  50,
  [
    "Explain why a reset link is a way into the account and must be as safe as the login.",
    "Answer a reset request the same way whether or not the email has an account.",
    "Make a random reset token, store only its hash with a 30-minute expiry, and use it once.",
    "Set the new password, end the user's other sessions and tell them it changed.",
    "Rate-limit reset requests and ask for the current password to change it while logged in.",
  ],

  part(
    "why",
    "Forgot password: a second way in",
    explain(
      '"Forgot password" lets someone into an account without the password. So it\'s a login too, and it must be as hard to abuse as the real one. The safe pattern: email a link with a [[reset-token|reset token]] that is random, short-lived and single-use. Whoever can read that inbox can set a new password, and nobody else.',
    ),
    diagram([
      ["request", "type your email"],
      ["email", "link with a token"],
      ["verify", "unexpired, unused"],
      ["new password", "hashed, token gone"],
    ]),
    analogy(
      "A locksmith who only opens the door after posting a one-time key to the address on file. The key is no use to anyone else, and only works today.",
    ),
  ),

  part(
    "request",
    "Step 1: the request, same answer every time",
    explain(
      "The user types an email. If you answer \"No account with that email\", anyone can test which emails are registered: that's [[user-enumeration|user enumeration]]. So always answer the same thing, with the same status, and only send the email if the account exists. Send the email after answering, so the time taken doesn't give it away either.",
    ),
    code(
      "js",
      "POST /api/auth/forgot",
      [
        "export async function forgot(req, res) {",
        '  const email = String(req.body.email ?? "")',
        "    .trim().toLowerCase();",
        "  res.json({ message:",
        '    "If that email has an account, " +',
        '    "a reset link is on its way." });',
        "  const user = await findUserByEmail(email);",
        "  if (user) await sendResetEmail(user);",
        "}",
      ],
      {
        4: "answer first: same message, same speed",
        8: "the email only goes to a real account",
      },
    ),
  ),

  part(
    "token",
    "Step 2: a random token, stored as a hash",
    explain(
      "Make the token with a secure random generator, 32 bytes, never `Math.random()` or anything built from the user id or the time. Store only its SHA-256 hash, with the user id and an expiry 30 minutes ahead. Then someone who reads the database can't use the links. Email the token itself, in a link to your reset page.",
    ),
    code(
      "js",
      "Making the token",
      [
        "const token = crypto.randomBytes(32)",
        '  .toString("base64url");',
        "await pool.query(",
        '  "INSERT INTO password_resets " +',
        '  "(user_id, token_hash, expires_at) " +',
        "  \"VALUES ($1, $2, now() + interval '30 min')\",",
        "  [user.id, sha256(token)]);",
        "const link = `${APP_URL}/reset?token=${token}`;",
      ],
      {
        1: "256 random bits: can't be guessed",
        7: "only the hash is stored",
        8: "the token itself goes in the email only",
      },
    ),
    anatomy(
      "The link in the email",
      ["https://notes.example/reset", "?token=Qm9vb2sxZ3Jhc3NoaW5n…"],
      [
        [
          "https://",
          "HTTPS only",
          "The token must never travel in plain text.",
        ],
        [
          "/reset",
          "your page",
          "A page with a new-password form, not an API route.",
        ],
        [
          "token=",
          "the secret",
          "Random, 30 minutes, works once. The page POSTs it with the new password.",
        ],
      ],
    ),
  ),

  part(
    "verify",
    "Steps 3 and 4: verify, then set the password",
    explain(
      "The reset page sends the token and the new password. Hash the token, and use it up in the same statement that finds it: a DELETE that only matches an unexpired row and returns its user id. Two clicks at once can't both succeed, because only one DELETE gets the row. Then check the new password's rules, hash it with bcrypt and save it.",
    ),
    code(
      "sql",
      "Find and use up the token in one go",
      [
        "DELETE FROM password_resets",
        " WHERE token_hash = $1",
        "   AND expires_at > now()",
        "RETURNING user_id;",
      ],
      {
        2: "$1 is sha256 of the token from the form",
        3: "expired rows don't match",
        4: "no row back: invalid or used, answer 400",
      },
    ),
    code(
      "js",
      "Setting the new password",
      [
        "const hash = await bcrypt.hash(password, 12);",
        "await pool.query(",
        '  "UPDATE users SET password_hash = $1" +',
        '  " WHERE id = $2", [hash, userId]);',
        "await pool.query(",
        '  "DELETE FROM password_resets" +',
        '  " WHERE user_id = $1", [userId]);',
      ],
      {
        1: "the same cost as at sign-up",
        6: "any other reset links stop working too",
      },
    ),
  ),

  part(
    "single-use",
    "Expiry and single use, step by step",
    explain(
      "Here's the store in plain JavaScript, with time passed in. The link is used after 10 minutes, then clicked again a minute later.",
    ),
    trace(
      "One token, used twice",
      [
        "const resets = new Map(); // hash → row",
        "const MIN = 60000, TTL = 30 * MIN;",
        "function request(user, token, now) {",
        "  resets.set(token, { user, exp: now + TTL });",
        "}",
        "function consume(token, now) {",
        "  const row = resets.get(token);",
        "  resets.delete(token);",
        "  if (!row || row.exp <= now) return null;",
        "  return row.user;",
        "}",
        'request(7, "k3", 0);',
        'console.log(consume("k3", 10 * MIN));',
        'console.log(consume("k3", 11 * MIN));',
      ],
      [
        {
          line: 12,
          note: "User 7 asks for a reset at time 0. The token expires at 30 minutes.",
          vars: [
            ["resets", "Map(0) {}"],
            ["MIN", "60000"],
            ["TTL", "1800000"],
          ],
        },
        {
          line: 4,
          note: "One row, keyed by the token (a real store keys it by the token's hash).",
          vars: [
            ["resets", 'Map(1) { "k3" => { user: 7, exp: 1800000 } }'],
            ["MIN", "60000"],
            ["TTL", "1800000"],
            ["user", "7"],
            ["token", '"k3"'],
            ["now", "0"],
          ],
          stack: ["request"],
        },
        {
          line: 7,
          note: "10 minutes later the user clicks the link. The row is found.",
          vars: [
            ["resets", 'Map(1) { "k3" => { user: 7, exp: 1800000 } }'],
            ["MIN", "60000"],
            ["TTL", "1800000"],
            ["token", '"k3"'],
            ["now", "600000"],
            ["row", "{ user: 7, exp: 1800000 }"],
          ],
          stack: ["consume"],
        },
        {
          line: 8,
          note: "Delete it straight away: this token never works again.",
          vars: [
            ["resets", "Map(0) {}"],
            ["MIN", "60000"],
            ["TTL", "1800000"],
            ["token", '"k3"'],
            ["now", "600000"],
            ["row", "{ user: 7, exp: 1800000 }"],
          ],
          stack: ["consume"],
        },
        {
          line: 10,
          note: "Not expired, so it's user 7. Their new password can be saved.",
          vars: [
            ["resets", "Map(0) {}"],
            ["MIN", "60000"],
            ["TTL", "1800000"],
            ["token", '"k3"'],
            ["now", "600000"],
            ["row", "{ user: 7, exp: 1800000 }"],
          ],
          stack: ["consume"],
          output: "7",
        },
        {
          line: 14,
          note: "A minute later the same link is clicked again.",
          vars: [
            ["resets", "Map(0) {}"],
            ["MIN", "60000"],
            ["TTL", "1800000"],
          ],
        },
        {
          line: 9,
          note: "No row any more: refused. The answer would be the same for an expired link.",
          vars: [
            ["resets", "Map(0) {}"],
            ["MIN", "60000"],
            ["TTL", "1800000"],
            ["token", '"k3"'],
            ["now", "660000"],
            ["row", "undefined"],
          ],
          stack: ["consume"],
          output: "null",
        },
      ],
    ),
  ),

  part(
    "after",
    "Step 5: end other sessions, tell the user",
    explain(
      'Someone may have reset the password because their account was taken over. So after a reset, [[token-revocation|revoke]] every existing login: delete their refresh tokens, or bump a token version stored on the user that every JWT must match. Then email the user: "Your password was changed. Not you? Contact us." Send them to the login page to sign in fresh.',
    ),
    keyPoints(
      "Delete every reset token for the user, not just this one.",
      "Revoke other sessions: the old ones may be the attacker's.",
      "Email a notice to the account's address.",
      "Send them to log in with the new password.",
    ),
  ),

  part(
    "limits",
    "Rate limits, and no security questions",
    explain(
      "Each request sends an email, so limit them with a [[rate-limit|rate limit]]: a few per email address per hour and more per IP address, answering 429 when exceeded. And don't offer security questions such as \"Your first pet's name?\" instead: the answers are often public, guessable or the same on every site, which makes them a weak password nobody can change.",
    ),
    keyPoints(
      "Limit per email (say 3 an hour) and per IP.",
      "Over the limit: 429, still with no hint about the account.",
      "Security questions are guessable: use the email link.",
      "Also limit the reset page's token attempts.",
    ),
  ),

  part(
    "change",
    "Changing a password while logged in",
    explain(
      'A logged-in user changing their password must type the current one too. Otherwise anyone who finds a laptop left logged in can lock the owner out. If the current password is wrong, answer 403, not 401: a 401 tells the front end "you\'re logged out". Afterwards, revoke other sessions just like after a reset.',
    ),
    code(
      "js",
      "POST /api/auth/password (logged in)",
      [
        "const user = await findUserById(req.user.id);",
        "const ok = await bcrypt.compare(",
        "  req.body.current, user.password_hash);",
        "if (!ok) {",
        "  return res.status(403)",
        '    .json({ error: "Wrong password" });',
        "}",
        "const hash = await bcrypt.hash(",
        "  req.body.next, 12);",
        "await setPasswordHash(user.id, hash);",
        "await revokeOtherSessions(user.id);",
      ],
      {
        2: "prove it's really the owner",
        5: "403: logged in, but not allowed",
        11: "other devices log in again",
      },
    ),
  ),

  part(
    "notes-app",
    "In the Notes App",
    explain(
      "The Notes App has no password reset and no way to change a password: if you forget it, you register again. Adding it would need a password_resets table, `POST /api/auth/forgot` and `POST /api/auth/reset` routes, a reset page, and a service to send email. Its JWTs can't be revoked either, so it would also need a token version on users.",
    ),
    inTheNotesApp(
      "The auth router has exactly four routes: register, login, logout and me. Forgot and reset routes would sit next to them.",
      { fileId: "backend/src/routes/auth.js" },
    ),
    quickCheck(
      "Someone requests a reset for an email that has no account. What does the API answer?",
      [
        '404 "No account with that email"',
        "The same 200 message it gives for real accounts",
        '400 "Invalid email"',
      ],
      1,
      "A different answer would tell anyone which emails are registered. The same message and status every time, and the email only goes out for real accounts.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A guessable token",
      wrong: ['const token = user.id + "-" + Date.now();'],
      problem:
        "An attacker who knows the user id and roughly when the reset was asked for can work the token out.",
      right: [
        "const token = crypto.randomBytes(32)",
        '  .toString("base64url");',
      ],
      why: "Only a secure random generator makes tokens nobody can predict.",
    }),
    mistake({
      title: "The token in the logs",
      wrong: ["console.log(`Reset link for ${email}: ${link}`);"],
      problem:
        "Anyone who can read the logs, or the log service, can reset that user's password.",
      right: ['logger.info("reset requested", { userId });'],
      why: "Treat a reset token like a password: never log it.",
    }),
    mistake({
      title: "A token that never expires",
      language: "sql",
      wrong: ["SELECT user_id FROM password_resets", " WHERE token_hash = $1;"],
      problem:
        "A link found in an old email, months later, still resets the password, and can be used again and again.",
      right: [
        "DELETE FROM password_resets",
        " WHERE token_hash = $1",
        "   AND expires_at > now()",
        "RETURNING user_id;",
      ],
      why: "Check the expiry and use the token up in the same statement.",
    }),
    mistake({
      title: "Telling who has an account",
      wrong: [
        "if (!user) return res.status(404)",
        '  .json({ error: "No such account" });',
      ],
      problem:
        "The reset form becomes a tool for checking which emails are registered.",
      right: [
        "res.json({ message: SAME_MESSAGE });",
        "if (user) await sendResetEmail(user);",
      ],
      why: "Same answer, same status, every time.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A reset-token store",
      task: "Finish `createResetStore(now)`. `now()` returns milliseconds. `verify(token)` returns the user id if the token exists and hasn't expired (`exp > now()`), otherwise `null`, and doesn't use it up. `consume(token)` does the same check but deletes the token, so it works once.",
      starter: [
        "function createResetStore(now) {",
        "  const rows = new Map();",
        "  const request = (userId, token) => {",
        "    rows.set(token, { userId, exp: now() + 30 * 60000 });",
        "  };",
        "  const verify = (token) => rows.get(token)?.userId ?? null;",
        "  const consume = (token) => verify(token);",
        "  return { request, verify, consume };",
        "}",
      ],
      tests: [
        [
          '(() => { let t = 0; const s = createResetStore(() => t); s.request(7, "k3"); t = 29 * 60000; return [s.verify("k3"), s.consume("k3"), s.consume("k3")]; })()',
          "[7, 7, null]",
        ],
        [
          '(() => { let t = 0; const s = createResetStore(() => t); s.request(7, "k3"); t = 31 * 60000; return [s.verify("k3"), s.consume("k3")]; })()',
          "[null, null]",
        ],
        [
          '(() => { const s = createResetStore(() => 0); s.request(7, "k3"); return [s.verify("k3"), s.verify("k3")]; })()',
          "[7, 7]",
        ],
        ['createResetStore(() => 0).consume("nope")', "null"],
      ],
      hint: "In verify, compare `rows.get(token)?.exp > now()`. In consume, call verify, then `rows.delete(token)`, then return the id.",
      solution: [
        "function createResetStore(now) {",
        "  const rows = new Map();",
        "  const request = (userId, token) => {",
        "    rows.set(token, { userId, exp: now() + 30 * 60000 });",
        "  };",
        "  const verify = (token) =>",
        "    rows.get(token)?.exp > now() ? rows.get(token).userId : null;",
        "  const consume = (token) => {",
        "    const id = verify(token);",
        "    rows.delete(token);",
        "    return id;",
        "  };",
        "  return { request, verify, consume };",
        "}",
      ],
    }),
    yourTurn({
      title: "Same answer for everyone",
      task: "Fix `forgot(req, res, deps)`. Trim and lower-case `req.body.email`, look it up with `deps.findUser(email)`, call `deps.sendReset(user.id)` only if a user was found, and always answer `res.status(200).json({ message: MSG })`.",
      starter: [
        'const MSG = "If that email has an account, a link is on its way.";',
        "function forgot(req, res, deps) {",
        "  const user = deps.findUser(req.body.email);",
        "  if (!user) {",
        '    return res.status(404).json({ error: "No account" });',
        "  }",
        "  deps.sendReset(user.id);",
        "  res.status(200).json({ message: MSG });",
        "}",
      ],
      tests: [
        [
          '(() => { const sent = []; const res = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; forgot({ body: { email: "nobody@x.com" } }, res, { findUser: () => null, sendReset: (id) => sent.push(id) }); return [res.statusCode, res.body, sent]; })()',
          "[200, { message: MSG }, []]",
        ],
        [
          '(() => { const sent = []; const res = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; forgot({ body: { email: " Ada@Example.com " } }, res, { findUser: (e) => (e === "ada@example.com" ? { id: 7 } : null), sendReset: (id) => sent.push(id) }); return [res.statusCode, res.body, sent]; })()',
          "[200, { message: MSG }, [7]]",
        ],
      ],
      hint: "`const email = req.body.email.trim().toLowerCase();` then `if (user) deps.sendReset(user.id);` and one 200 answer at the end.",
      solution: [
        'const MSG = "If that email has an account, a link is on its way.";',
        "function forgot(req, res, deps) {",
        "  const email = req.body.email.trim().toLowerCase();",
        "  const user = deps.findUser(email);",
        "  if (user) deps.sendReset(user.id);",
        "  res.status(200).json({ message: MSG });",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Password reset cheat sheet", [
      [
        "Same answer",
        "Identical message and status whether or not the email exists.",
        '200 "If that email has an account…"',
      ],
      [
        "Random token",
        "32 bytes from a secure generator.",
        'crypto.randomBytes(32)\n  .toString("base64url")',
      ],
      [
        "Store a hash",
        "SHA-256 of the token, user id, expiry.",
        "token_hash, expires_at",
      ],
      ["Short life", "About 30 minutes.", "now() + interval '30 min'"],
      [
        "Single use",
        "Find and delete in one statement.",
        "DELETE … AND expires_at > now()\nRETURNING user_id;",
      ],
      [
        "New password",
        "Check the rules, hash with bcrypt, save.",
        "bcrypt.hash(password, 12)",
      ],
      [
        "Afterwards",
        "Delete all reset tokens, revoke sessions, email the user.",
      ],
      ["Rate limit", "A few requests per email and per IP; 429 beyond."],
      ["Never", "Log tokens, use guessable ones, or use security questions."],
      ["Change while logged in", "Ask for the current password; wrong is 403."],
    ]),
    quickCheck(
      "Why store only a hash of the reset token?",
      [
        "Hashes are shorter to store",
        "So someone who reads the database can't use the reset links",
        "So the email can contain the hash",
      ],
      1,
      "The emailed token is what proves the right to reset. If the table held the tokens themselves, a database leak would hand out working reset links for every pending request.",
    ),
  ),
);
