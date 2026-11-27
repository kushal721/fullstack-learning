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

// Refresh tokens: long tokens or short ones, two tokens with two jobs, the
// refresh endpoint taken apart, storing refresh tokens, rotation and reuse
// step by step, revoking on logout and password change, the client's retry
// after a 401, the Notes App's single 7-day token, mistakes, practice and a
// recap.
export const refreshTokensModule = moduleLesson(
  "refresh-tokens",
  "Refresh tokens",
  50,
  [
    "Explain why one long-lived token is risky and one short-lived token is annoying.",
    "Split login into a short access token and a long refresh token, each with one job.",
    "Store refresh tokens hashed in a table, in an httpOnly cookie with a narrow Path.",
    "Rotate refresh tokens, detect reuse and revoke them on logout and password change.",
    "Retry a request once after a 401 by refreshing, without looping.",
  ],

  part(
    "problem",
    "Long tokens or short ones?",
    explain(
      "A signed token is checked without a database lookup, so it can't be taken back before it expires. A token that lasts 7 days is a 7-day key for whoever steals it. A token that lasts 15 minutes is safer, but then people have to log in again every 15 minutes. Neither is good on its own.",
    ),
    diagram([
      ["7-day token", "comfy, risky"],
      ["15-min token", "safe, annoying"],
      ["both", "access + refresh"],
    ]),
    analogy(
      "A day pass for the gym and a membership card at the desk. You flash the day pass at every door; when it runs out, the desk checks your card and prints a new one.",
    ),
  ),

  part(
    "two-tokens",
    "Two tokens, two jobs",
    explain(
      "Login hands out two tokens. The [[access-token|access token]] is short-lived (say 15 minutes) and goes with every API request, checked without a lookup like the Notes App's JWT. The [[refresh-token|refresh token]] lives long (say 30 days), goes to one endpoint only, and is stored on the server, so it can be checked and revoked.",
    ),
    reference("Access token vs refresh token", [
      [
        "Access token",
        "Proves who's calling. Short life, no lookup.",
        "JWT, 15 minutes",
      ],
      [
        "Refresh token",
        "Gets a new access token. Long life, looked up.",
        "random string, 30 days",
      ],
      [
        "Sent to",
        "Access: every API route. Refresh: only /api/auth.",
        "Path=/api/auth",
      ],
      [
        "If stolen",
        "Access: works until it expires. Refresh: you can revoke it.",
      ],
    ]),
    quickCheck(
      "Why is the access token kept short-lived?",
      [
        "It's checked without a lookup, so it can't easily be revoked",
        "Short tokens are faster to send",
        "Browsers delete long cookies",
      ],
      0,
      "The server trusts a valid signature without asking the database. If the token leaks, the only thing that stops it is its expiry, so you keep that short.",
    ),
  ),

  part(
    "endpoint",
    "The refresh endpoint",
    explain(
      "When the access token expires, the client calls `POST /api/auth/refresh`. The browser sends the refresh cookie by itself. The server hashes it, finds it in the table, checks it isn't expired or used, and answers with a fresh access token and a fresh refresh token.",
    ),
    anatomy(
      "One refresh, taken apart",
      [
        "POST /api/auth/refresh",
        "Cookie: refresh=Qm9vb2s…",
        "204 No Content",
        "Set-Cookie: token=eyJ…; refresh=Zx81…",
      ],
      [
        [
          "POST",
          "one route",
          "The only route that ever sees the refresh token.",
        ],
        [
          "refresh=Qm9vb2s…",
          "the long token",
          "Sent by the browser from an httpOnly cookie. No body needed.",
        ],
        ["204", "it's valid", "Found in the table, not expired, not used."],
        [
          "token=eyJ…",
          "new access",
          "A new 15-minute JWT, in the usual login cookie.",
        ],
        [
          "refresh=Zx81…",
          "new refresh",
          "The old one is now spent: that's rotation.",
        ],
      ],
    ),
    code(
      "js",
      "The controller, in short",
      [
        "export async function refresh(req, res) {",
        "  const old = req.cookies.refresh;",
        "  const row = await findRefresh(sha256(old));",
        "  if (!row || row.expires_at < new Date()) {",
        "    return res.status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "  if (row.used) {",
        "    await revokeFamily(row.family_id);",
        "    return res.status(401)",
        '      .json({ error: "Please log in" });',
        "  }",
        "  await issueTokens(res, row); // rotates",
        "  res.status(204).end();",
        "}",
      ],
      {
        3: "look it up by its hash, never the token itself",
        8: "already used: someone copied it",
        13: "mark the old one used, set both new cookies",
      },
    ),
  ),

  part(
    "storing",
    "Storing refresh tokens",
    explain(
      "Treat a refresh token like a password: store only its hash. Because it's a long random string, a fast SHA-256 hash is enough (nobody can guess 256 random bits), and it lets you look the row up by hash. In the browser it lives in an httpOnly cookie whose Path is `/api/auth`, so it's never sent with `/api/notes` requests.",
    ),
    code(
      "sql",
      "A table for refresh tokens",
      [
        "CREATE TABLE refresh_tokens (",
        "  id SERIAL PRIMARY KEY,",
        "  user_id INTEGER NOT NULL",
        "    REFERENCES users(id) ON DELETE CASCADE,",
        "  token_hash TEXT NOT NULL UNIQUE,",
        "  family_id TEXT NOT NULL,",
        "  used BOOLEAN NOT NULL DEFAULT false,",
        "  expires_at TIMESTAMPTZ NOT NULL",
        ");",
      ],
      {
        5: "the hash, never the token",
        6: "every token from one login shares this",
      },
    ),
    code(
      "js",
      "Making one and setting the cookie",
      [
        "const token = crypto.randomBytes(32)",
        '  .toString("base64url");',
        "await saveRefresh(userId, sha256(token));",
        'res.cookie("refresh", token, {',
        "  httpOnly: true,",
        '  secure: true, sameSite: "strict",',
        '  path: "/api/auth",',
        "  maxAge: 30 * 24 * 60 * 60 * 1000,",
        "});",
      ],
      {
        1: "32 random bytes from a secure generator",
        7: "only refresh and logout ever receive it",
      },
    ),
  ),

  part(
    "rotation",
    "Rotation and reuse, step by step",
    explain(
      "With [[token-rotation|rotation]], every refresh spends the old refresh token and hands out a new one. The real user always holds the newest. So if a spent token ever comes back, someone copied it. The server can't tell who is the thief, so it revokes the whole family: every token from that login. Both must log in again.",
    ),
    trace(
      "A thief reuses a spent token",
      [
        "const used = new Set();",
        "let next = 2;",
        "function rotate(token) {",
        '  if (used.has(token)) return "REUSE";',
        "  used.add(token);",
        '  return "r" + next++;',
        "}",
        'const a = rotate("r1"); // the user',
        "const b = rotate(a); // the user again",
        'const c = rotate("r1"); // a copy of r1',
        "console.log(a, b, c);",
      ],
      [
        {
          line: 1,
          note: "No token has been spent yet. The user holds r1 from login.",
          vars: [["used", "Set(0) {}"]],
        },
        {
          line: 8,
          note: "The access token expired, so the user's browser refreshes with r1.",
          vars: [
            ["used", "Set(0) {}"],
            ["next", "2"],
          ],
        },
        {
          line: 4,
          note: "r1 hasn't been spent, so carry on.",
          vars: [
            ["used", "Set(0) {}"],
            ["next", "2"],
            ["token", '"r1"'],
          ],
          stack: ["rotate"],
        },
        {
          line: 5,
          note: "Mark r1 as spent.",
          vars: [
            ["used", 'Set(1) { "r1" }'],
            ["next", "2"],
            ["token", '"r1"'],
          ],
          stack: ["rotate"],
        },
        {
          line: 6,
          note: "Hand back the new refresh token r2.",
          vars: [
            ["used", 'Set(1) { "r1" }'],
            ["next", "3"],
            ["token", '"r1"'],
          ],
          stack: ["rotate"],
        },
        {
          line: 9,
          note: "Later the user refreshes with r2: it's spent too, and r3 comes back.",
          vars: [
            ["used", 'Set(2) { "r1", "r2" }'],
            ["next", "4"],
            ["a", '"r2"'],
            ["b", '"r3"'],
          ],
        },
        {
          line: 10,
          note: "Someone else sends r1, copied before the first refresh.",
          vars: [
            ["used", 'Set(2) { "r1", "r2" }'],
            ["next", "4"],
            ["a", '"r2"'],
            ["b", '"r3"'],
          ],
        },
        {
          line: 4,
          note: "r1 is already spent. That's reuse: revoke the whole family.",
          vars: [
            ["used", 'Set(2) { "r1", "r2" }'],
            ["next", "4"],
            ["token", '"r1"'],
          ],
          stack: ["rotate"],
        },
        {
          line: 11,
          note: "The copy got nothing. A real server would now also revoke r3.",
          vars: [
            ["used", 'Set(2) { "r1", "r2" }'],
            ["next", "4"],
            ["a", '"r2"'],
            ["b", '"r3"'],
            ["c", '"REUSE"'],
          ],
          output: "r2 r3 REUSE",
        },
      ],
    ),
  ),

  part(
    "revoking",
    "Revoking: logout and password change",
    explain(
      'Because refresh tokens live in a table, [[token-revocation|revoking]] them is a DELETE. Logout deletes this device\'s token and clears both cookies. A password change, or "log out everywhere", deletes every token the user has. The access token still works until it expires, which is why it stays short: 15 minutes at most.',
    ),
    code(
      "sql",
      "Two ways to revoke",
      [
        "-- logout: this device only",
        "DELETE FROM refresh_tokens",
        " WHERE token_hash = $1;",
        "",
        "-- password change: every device",
        "DELETE FROM refresh_tokens",
        " WHERE user_id = $1;",
      ],
      {
        3: "$1 is sha256 of the cookie's value",
        7: "the user logs in again everywhere",
      },
    ),
    keyPoints(
      "Logout: delete the row, then clear both cookies.",
      "Password change or reset: delete all the user's rows.",
      "Reuse detected: delete the whole family.",
      "Access tokens left over die on their own within minutes.",
    ),
  ),

  part(
    "client",
    "The client: retry once after a 401",
    explain(
      "The client doesn't check expiry times itself. It sends the request; if the answer is 401, it calls the refresh endpoint once, then repeats the original request once. If the refresh fails too, the user really is logged out: show the login page. Never refresh after a 401 from the refresh route itself, or it loops forever.",
    ),
    code(
      "js",
      "request() with one refresh",
      [
        "async function request(path, options) {",
        "  let res = await send(path, options);",
        "  if (res.status !== 401 ||",
        '    path.startsWith("/api/auth/")) {',
        "    return res;",
        "  }",
        "  const r = await send(",
        '    "/api/auth/refresh", { method: "POST" });',
        "  if (!r.ok) return res; // logged out",
        "  return send(path, options); // once",
        "}",
      ],
      {
        4: "never refresh for the auth routes: no loop",
        9: "refresh failed: hand back the first 401",
        10: "one retry; a second 401 is returned as is",
      },
    ),
    keyPoints(
      "One refresh, one retry, then give up.",
      "Skip the retry for /api/auth/ routes.",
      "Many requests at once: share one refresh promise.",
      "Refresh failed: send the user to the login page.",
    ),
  ),

  part(
    "notes-app",
    "In the Notes App",
    explain(
      "The Notes App has no refresh tokens. Login signs one JWT that lasts 7 days and puts it in an httpOnly cookie. There's no refresh route, no refresh_tokens table and no revocation: logout only clears the cookie. It's the simpler choice: one token, no lookups, fine for a learning app. The cost: a stolen token works for up to 7 days.",
    ),
    inTheNotesApp(
      '`login` signs `{ sub: user.id }` with `expiresIn: "7d"` and `cookieOptions` sets a 7-day maxAge. `logout` calls `res.clearCookie("token")`; the token itself stays valid.',
      { fileId: "backend/src/controllers/authController.js" },
    ),
    quickCheck(
      "If the Notes App added refresh tokens, which request would carry the refresh cookie?",
      [
        "Every request, like the login cookie",
        "Only requests to /api/auth, such as refresh and logout",
        "Only GET /api/notes",
      ],
      1,
      'With `path: "/api/auth"`, the browser sends the refresh cookie only to the auth routes. Notes requests carry the short access token instead.',
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Storing the refresh token itself",
      language: "sql",
      wrong: [
        "INSERT INTO refresh_tokens (user_id, token)",
        "VALUES ($1, $2);",
      ],
      problem:
        "Anyone who reads the table or a backup gets working 30-day logins for every user.",
      right: [
        "INSERT INTO refresh_tokens",
        "  (user_id, token_hash, family_id,",
        "   expires_at) VALUES ($1, $2, $3, $4);",
      ],
      why: "Store sha256(token). A leaked hash can't be sent back as a cookie.",
    }),
    mistake({
      title: "Refreshing in a loop",
      wrong: [
        "if (res.status === 401) {",
        '  await send("/api/auth/refresh");',
        "  return request(path, options);",
        "}",
      ],
      problem:
        "If the refresh also answers 401, request calls itself again and again, hammering the server.",
      right: [
        "if (res.status === 401 &&",
        '  !path.startsWith("/api/auth/")) {',
        '  await send("/api/auth/refresh");',
        "  return send(path, options); // once",
        "}",
      ],
      why: "Retry exactly once, and never for the refresh route itself.",
    }),
    mistake({
      title: "A refresh cookie sent everywhere",
      wrong: ['res.cookie("refresh", token, {', "  httpOnly: true,", "});"],
      problem:
        "With the default Path of /, the long-lived token travels with every request, including ones that end up in logs.",
      right: [
        'res.cookie("refresh", token, {',
        '  httpOnly: true, path: "/api/auth",',
        '  secure: true, sameSite: "strict",',
        "});",
      ],
      why: "A narrow Path keeps the refresh token on the one route that needs it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Refresh a little early",
      task: "Write `shouldRefresh(accessExp, now, margin)`. All three are seconds. Return `true` when the access token has expired or will expire within `margin` seconds, otherwise `false`.",
      starter: [
        "function shouldRefresh(accessExp, now, margin) {",
        "  return now > accessExp;",
        "}",
      ],
      tests: [
        ["shouldRefresh(1000, 950, 60)", "true"],
        ["shouldRefresh(1000, 900, 60)", "false"],
        ["shouldRefresh(1000, 1200, 60)", "true"],
        ["shouldRefresh(1000, 1000, 0)", "true"],
      ],
      hint: "Refresh from the moment `now` reaches `accessExp - margin`.",
      solution: [
        "function shouldRefresh(accessExp, now, margin) {",
        "  return now >= accessExp - margin;",
        "}",
      ],
    }),
    yourTurn({
      title: "Rotate, and catch reuse",
      task: "`tokens` is a Map from token to `{ userId, family, used }`. Write `rotate(tokens, old, newId)`: unknown token → `null`. Already used → delete every token in its family and return `null`. Otherwise mark it used, add `newId` with the same userId and family (not used) and return `newId`.",
      starter: [
        "function rotate(tokens, old, newId) {",
        "  const row = tokens.get(old);",
        "  if (!row) return null;",
        "  tokens.set(newId, { ...row });",
        "  return newId;",
        "}",
      ],
      tests: [
        [
          '(() => { const t = new Map([["a", { userId: 7, family: "f1", used: false }]]); const r = rotate(t, "a", "b"); return [r, t.get("a").used, t.get("b")]; })()',
          '["b", true, { userId: 7, family: "f1", used: false }]',
        ],
        [
          '(() => { const t = new Map([["a", { userId: 7, family: "f1", used: false }], ["x", { userId: 9, family: "f2", used: false }]]); rotate(t, "a", "b"); const r = rotate(t, "a", "c"); return [r, [...t.keys()]]; })()',
          '[null, ["x"]]',
        ],
        ['rotate(new Map(), "zz", "b")', "null"],
      ],
      hint: "If `row.used`, loop over `tokens` with `for (const [id, r] of tokens)` and delete those whose `r.family === row.family`.",
      solution: [
        "function rotate(tokens, old, newId) {",
        "  const row = tokens.get(old);",
        "  if (!row) return null;",
        "  if (row.used) {",
        "    for (const [id, r] of tokens) {",
        "      if (r.family === row.family) tokens.delete(id);",
        "    }",
        "    return null;",
        "  }",
        "  row.used = true;",
        "  tokens.set(newId, { ...row, used: false });",
        "  return newId;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Refresh tokens cheat sheet", [
      [
        "Access token",
        "Short-lived proof on every request, no lookup.",
        "JWT, 15 minutes",
      ],
      [
        "Refresh token",
        "Long-lived, only for getting new access tokens.",
        "random, 30 days",
      ],
      [
        "Refresh endpoint",
        "Checks the refresh cookie, sets new tokens.",
        "POST /api/auth/refresh",
      ],
      [
        "Store a hash",
        "SHA-256 of the token, in a table, looked up by hash.",
        "token_hash TEXT UNIQUE",
      ],
      [
        "Narrow cookie",
        "httpOnly, secure, sent only to the auth routes.",
        'path: "/api/auth"',
      ],
      ["Rotation", "Each refresh spends the old token, gives a new one."],
      [
        "Reuse detection",
        "A spent token comes back: revoke the whole family.",
        "DELETE … WHERE family_id = $1",
      ],
      [
        "Revoke",
        "Logout: this row. Password change: all the user's rows.",
        "DELETE … WHERE user_id = $1",
      ],
      ["Client retry", "401 → refresh once → retry once → else log in."],
    ]),
    quickCheck(
      "A refresh token that was already used arrives at the refresh endpoint. What should the server do?",
      [
        "Accept it: it's still before its expiry",
        "Answer 401 but keep the other tokens",
        "Answer 401 and revoke every token in its family",
      ],
      2,
      "A spent token coming back means it was copied. The server can't tell the thief from the user, so it revokes the whole family and both log in again.",
    ),
  ),
);
