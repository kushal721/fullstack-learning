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

// Logging out: what logging out means, clearCookie taken apart, the same
// options and maxAge: undefined, handleLogout in App.jsx, what logout doesn't
// do to a signed token, ways to revoke a token, a token version step by
// step, logging out everywhere, sessions, clearing client state, mistakes,
// practice and a recap.
export const loggingOutModule = moduleLesson(
  "logging-out",
  "Logging out",
  45,
  [
    "Follow the Notes App's logout from the button to the cleared cookie and back.",
    "Clear a cookie with the same options it was set with, and say why maxAge is left out.",
    "Explain why a copied JWT still works after logout, until it expires.",
    "Revoke tokens with a denylist, a token version or short-lived tokens.",
    "Log a user out everywhere, and clear what the browser remembers.",
  ],

  part(
    "what-it-means",
    "What logging out means",
    explain(
      "Logging out has two halves. The server tells the browser to throw away the login cookie, and the front end forgets the user it was showing. In the Notes App that's one request, `POST /api/auth/logout`, answered `204 No Content`, then a switch back to the login page.",
    ),
    diagram([
      ["Log out button", "Navbar"],
      ["POST /logout", "authApi.logout()"],
      ["clearCookie", "token emptied"],
      ["204", "no body"],
      ["Login page", "user = null"],
    ]),
    inTheNotesApp(
      "`logout` in authController.js is two lines: clear the cookie, answer 204. It needs no requireAuth: logging out when you're already logged out is harmless.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "clear-cookie",
    "clearCookie, taken apart",
    explain(
      "The server can't reach into the browser and delete a cookie. It sends a new `Set-Cookie` for the same cookie with an empty value and a date in the past, and the browser drops it. Express's `res.clearCookie` writes that header for you.",
    ),
    anatomy(
      "The Notes App's logout, in authController.js",
      [
        'res.clearCookie("token", {',
        "  ...cookieOptions, maxAge: undefined,",
        "});",
        "res.status(204).end();",
      ],
      [
        [
          "res.clearCookie",
          "expire it",
          "Sets the cookie to an empty value that expired in 1970.",
        ],
        ['"token"', "which cookie", "The same name login used in res.cookie."],
        [
          "...cookieOptions",
          "same options",
          "httpOnly, sameSite and secure, exactly as at login.",
        ],
        [
          "maxAge: undefined",
          "no lifetime",
          "Login's 7-day maxAge must not come along. More in the next part.",
        ],
        [
          "res.status(204).end()",
          "done, no body",
          "204 No Content: it worked and there's nothing to send.",
        ],
      ],
    ),
    code(
      "http",
      "The response the browser gets",
      [
        "HTTP/1.1 204 No Content",
        "Set-Cookie: token=; Path=/;",
        "  Expires=Thu, 01 Jan 1970 00:00:00 GMT;",
        "  HttpOnly; SameSite=Lax",
      ],
      {
        2: "empty value, same name and path",
        3: "in the past: the browser deletes it",
      },
    ),
  ),

  part(
    "same-options",
    "The same options, and maxAge: undefined",
    explain(
      "The browser only replaces a cookie whose name, domain and path match. Reusing `cookieOptions` keeps them identical to login, so you never end up with a second `token` cookie beside the old one. `maxAge` is the exception: it would give the cleared cookie a fresh lifetime. Express 5 drops it inside clearCookie anyway; in Express 4 it could override the past date.",
    ),
    keyPoints(
      "Clear a cookie with the options it was set with.",
      "A different path or domain leaves the old cookie in place.",
      "No maxAge or expires of your own: clearCookie sets the past date.",
    ),
    quickCheck(
      'Login set the cookie with `path: "/api"`. Logout calls `res.clearCookie("token")` with no options. What happens?',
      [
        "The cookie is deleted",
        "The old cookie stays: the path doesn't match",
        "Express throws an error",
      ],
      1,
      "clearCookie defaults to path /, so it expires a different cookie. The browser keeps sending the /api one, and the user is still logged in.",
    ),
  ),

  part(
    "front-end",
    "handleLogout in App.jsx",
    explain(
      "The Navbar's Log out button calls `handleLogout`. It waits for the server to clear the cookie, then forgets the user and shows the login page. The cookie is httpOnly, so the front end can't delete it itself: it has to ask the server. `request()` turns the 204 into `null`, since there's no body to read.",
    ),
    code(
      "jsx",
      "App.jsx",
      [
        "async function handleLogout() {",
        "  await logout();",
        "  setUser(null);",
        '  setPage("login");',
        "}",
        "",
        "<Navbar user={user}",
        "  onLogout={handleLogout} />",
      ],
      {
        2: "POST /api/auth/logout: the cookie goes",
        3: "Navbar hides the email and button",
        4: "Dashboard unmounts: its notes go with it",
      },
    ),
    inTheNotesApp(
      'authApi.js\'s `logout()` is one call: `request("/api/auth/logout", { method: "POST" })`.',
      { fileId: "frontend/src/services/authApi.js" },
    ),
  ),

  part(
    "what-it-doesnt",
    "What logout doesn't do",
    explain(
      "Clearing the cookie removes the browser's copy of the token. The token itself is still a correctly signed note that says “user 3, valid until exp”. If someone copied it earlier, from a shared computer, a log or malware, it keeps working until it expires: 7 days in the Notes App. The server never wrote it down, so it has nothing to cross off.",
    ),
    code(
      "bash",
      "After logout, a copied token still works",
      [
        "# the user clicked Log out an hour ago",
        "curl https://notes.example/api/notes \\",
        '  -H "Cookie: token=eyJhbGci…(copied)"',
        "",
        '# 200 OK  [{ "id": 7, "title": … }]',
      ],
      { 3: "signature fine, exp in the future" },
    ),
    quickCheck(
      "A Notes App user logs out. Someone had copied their token yesterday. What happens when that person uses it?",
      [
        "401: logout cancelled it",
        "200: it works until its exp",
        "403: the cookie was cleared",
      ],
      1,
      "jwt.verify only checks the signature and exp. Logout removed one copy from one browser; the copied token is still valid until it expires.",
    ),
  ),

  part(
    "revocation",
    "Ways to revoke a token",
    explain(
      "To make a token stop working early, the server has to remember something again. That's [[token-revocation|revoking a token]]. Each way gives back a little of the “no lookup” advantage of JWTs, so pick the lightest one that does the job. The Notes App does none of these: it relies on the 7-day expiry.",
    ),
    reference("Three ways to revoke", [
      [
        "Denylist by jti",
        "Give each token an id (jti); at logout store it until its exp.",
        "revoked.has(payload.jti)",
      ],
      [
        "Token version",
        "A token_version column; tokens carry it; bump it to kill them all.",
        "payload.ver === user.token_version",
      ],
      [
        "Short-lived tokens",
        "15-minute access tokens plus a refresh token the server can delete.",
        'expiresIn: "15m"',
      ],
    ]),
    code(
      "js",
      "A token with its own id, for a denylist",
      [
        'import { randomUUID } from "node:crypto";',
        "",
        "jwt.sign(",
        "  { sub: user.id, jti: randomUUID() },",
        "  process.env.JWT_SECRET,",
        '  { expiresIn: "7d" },',
        ");",
      ],
      { 4: "jti: a unique id for this one token" },
    ),
    keyPoints(
      "A denylist only needs entries until each token's exp.",
      "Short-lived [[access-token|access tokens]] limit the damage without any list.",
      "A [[refresh-token|refresh token]] lives on the server, so logout can delete it.",
    ),
  ),

  part(
    "step-by-step",
    "A token version, step by step",
    explain(
      "With a token version, each token carries the version that was current when it was signed. requireAuth compares it with the user's row. Bumping the number makes every older token fail at once. Here, `copied` is a stolen token and `user` is the row from the database.",
    ),
    trace(
      "Bumping the version",
      [
        "const user = { id: 3, tokenVersion: 1 };",
        "function check(claims) {",
        "  if (claims.ver !== user.tokenVersion) {",
        "    return 401;",
        "  }",
        "  return 200;",
        "}",
        "const copied = { sub: 3, ver: 1 };",
        "console.log(check(copied));",
        "user.tokenVersion += 1;",
        "console.log(check(copied));",
      ],
      [
        {
          line: 1,
          note: "User 3's row: version 1.",
          vars: [["user", "{ id: 3, tokenVersion: 1 }"]],
        },
        {
          line: 8,
          note: "A token signed while the version was 1. Someone has a copy.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 1 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
          ],
        },
        {
          line: 3,
          note: "1 === 1: the versions match.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 1 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
            ["claims", "{ sub: 3, ver: 1 }"],
          ],
          stack: ["check"],
        },
        {
          line: 9,
          note: "The copied token works.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 1 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
          ],
          output: "200",
        },
        {
          line: 10,
          note: "Log out everywhere: UPDATE users SET token_version = token_version + 1.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 2 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
          ],
        },
        {
          line: 3,
          note: "1 !== 2: the token is from before the bump.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 2 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
            ["claims", "{ sub: 3, ver: 1 }"],
          ],
          stack: ["check"],
        },
        {
          line: 4,
          note: "Refused, though the signature and exp are fine.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 2 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
            ["claims", "{ sub: 3, ver: 1 }"],
          ],
          stack: ["check"],
        },
        {
          line: 11,
          note: "The same token now gets 401.",
          vars: [
            ["user", "{ id: 3, tokenVersion: 2 }"],
            ["copied", "{ sub: 3, ver: 1 }"],
          ],
          output: "401",
        },
      ],
    ),
  ),

  part(
    "everywhere",
    "Logging out everywhere",
    explain(
      "“Log out of all devices” is one UPDATE with a token version. Do the same when a password changes, so a thief using an old token is thrown out too. The cost: requireAuth now reads the user's row on every request, much like a session lookup. That's often fine; just know you've traded away part of what made JWTs cheap.",
    ),
    code(
      "sql",
      "The column, and the bump (not in the Notes App)",
      [
        "ALTER TABLE users ADD COLUMN",
        "  token_version INTEGER NOT NULL",
        "  DEFAULT 0;",
        "",
        "UPDATE users",
        "   SET token_version = token_version + 1",
        " WHERE id = $1;",
      ],
      {
        6: "every token signed before now fails",
        7: "$1 is req.user.id",
      },
    ),
    keyPoints(
      "Sign with { sub: user.id, ver: user.token_version }.",
      "requireAuth compares payload.ver with the row's version.",
      "Bump it on “log out everywhere” and on a password change.",
    ),
  ),

  part(
    "sessions",
    "With sessions, logout is one delete",
    explain(
      "With a [[server-session|server-side session]], the cookie holds only a random id, and the server keeps the login in a store. Logging out deletes that entry, and the id stops working at once, on every copy. Logging out everywhere deletes all of the user's entries. That simplicity is the main reason many websites still choose sessions.",
    ),
    code(
      "sql",
      "Logging out with a sessions table",
      [
        "-- this device",
        "DELETE FROM sessions WHERE id = $1;",
        "",
        "-- every device",
        "DELETE FROM sessions WHERE user_id = $1;",
      ],
      { 2: "$1: the session id from the cookie" },
    ),
  ),

  part(
    "client-state",
    "Clearing what the browser remembers",
    explain(
      "After logout, nothing of the last user should stay on screen or in storage, especially on a shared computer. Reset the user in state, drop cached data, and clear anything you saved in `localStorage`, such as drafts. In the Notes App the notes live in the Dashboard's `useNotes` hook, so switching to the login page unmounts it and they're gone.",
    ),
    keyPoints(
      "setUser(null): the Navbar and every check see “nobody”.",
      "Cached lists and drafts belong to the old user: drop them.",
      "Other open tabs still show old data until they ask the server.",
      "The server is the real logout; the client just catches up.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Logging out only in the front end",
      language: "jsx",
      wrong: ["function handleLogout() {", "  setUser(null);", "}"],
      problem:
        "The page shows the login form, but the httpOnly cookie is still there. A reload logs the user straight back in.",
      right: [
        "async function handleLogout() {",
        "  await logout();",
        "  setUser(null);",
        "}",
      ],
      why: "Only the server can clear an httpOnly cookie, so logout must call it.",
    }),
    mistake({
      title: "Clearing with different options",
      wrong: [
        'res.cookie("token", t, { path: "/api" });',
        "// later, in logout",
        'res.clearCookie("token");',
      ],
      problem:
        "clearCookie uses path /, which doesn't match, so the browser keeps the /api cookie.",
      right: [
        'res.cookie("token", t, cookieOptions);',
        "// later, in logout",
        'res.clearCookie("token", {',
        "  ...cookieOptions, maxAge: undefined,",
        "});",
      ],
      why: "One shared options object keeps login and logout in step.",
    }),
    mistake({
      title: "Logout on a GET link",
      wrong: ['authRoutes.get("/logout", logout);'],
      problem:
        "Anything that just loads the URL logs you out: a link someone sends, or a browser or extension prefetching links.",
      right: ['authRoutes.post("/logout", logout);'],
      why: "Logout changes state, so it's a POST, like in the Notes App.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A token denylist",
      task: "Write `createDenylist()`. It returns an object with `revoke(jti, exp)`, which remembers a token id until `exp`, `isRevoked(jti)`, which returns `true` or `false`, and `prune(now)`, which forgets every entry whose `exp` is at or before `now` and returns how many are left.",
      starter: [
        "function createDenylist() {",
        "  return {",
        "    revoke(jti, exp) {},",
        "    isRevoked(jti) { return false; },",
        "    prune(now) { return 0; },",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const d = createDenylist(); d.revoke("a1", 100); return [d.isRevoked("a1"), d.isRevoked("b2")]; })()',
          "[true, false]",
        ],
        [
          '(() => { const d = createDenylist(); d.revoke("a1", 100); d.revoke("b2", 300); return [d.prune(100), d.isRevoked("a1"), d.isRevoked("b2")]; })()',
          "[1, false, true]",
        ],
        [
          '(() => { const d = createDenylist(); return [d.prune(0), d.isRevoked("x")]; })()',
          "[0, false]",
        ],
      ],
      hint: "Keep a `Map` from jti to exp. In prune, loop over its entries and `delete` the ones with `exp <= now`, then return `map.size`.",
      solution: [
        "function createDenylist() {",
        "  const revoked = new Map();",
        "  return {",
        "    revoke(jti, exp) { revoked.set(jti, exp); },",
        "    isRevoked(jti) { return revoked.has(jti); },",
        "    prune(now) {",
        "      for (const [jti, exp] of revoked) {",
        "        if (exp <= now) revoked.delete(jti);",
        "      }",
        "      return revoked.size;",
        "    },",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Is this token still current?",
      task: "Write `isValid(claims, user)`. `claims` is a verified payload like `{ sub: 3, ver: 1 }`; `user` is that user's row, or `null` if it was deleted. Return `true` only if the user exists, `claims.sub` is the user's `id` and `claims.ver` equals `user.tokenVersion`.",
      starter: [
        "function isValid(claims, user) {",
        "  return claims.sub === user.id;",
        "}",
      ],
      tests: [
        ["isValid({ sub: 3, ver: 1 }, { id: 3, tokenVersion: 1 })", "true"],
        ["isValid({ sub: 3, ver: 1 }, { id: 3, tokenVersion: 2 })", "false"],
        ["isValid({ sub: 3, ver: 1 }, null)", "false"],
        ["isValid({ sub: 3, ver: 1 }, { id: 4, tokenVersion: 1 })", "false"],
      ],
      hint: "Return false for a missing user first, then check both `sub === id` and `ver === tokenVersion`.",
      solution: [
        "function isValid(claims, user) {",
        "  if (!user) return false;",
        "  return claims.sub === user.id &&",
        "    claims.ver === user.tokenVersion;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Logging out cheat sheet", [
      [
        "Logout route",
        "POST, open to anyone, answers 204.",
        'authRoutes.post("/logout", logout)',
      ],
      [
        "clearCookie",
        "Empty value, date in the past.",
        'res.clearCookie("token", opts)',
      ],
      [
        "Same options",
        "Same name, path and domain as at login.",
        "{ ...cookieOptions, maxAge: undefined }",
      ],
      [
        "Front end",
        "Ask the server, then forget the user.",
        "await logout(); setUser(null);",
      ],
      [
        "A copied JWT",
        "Still valid until exp after logout.",
        "7 days in the Notes App",
      ],
      [
        "Denylist",
        "Store revoked jti values until their exp.",
        "revoked.has(payload.jti)",
      ],
      [
        "Token version",
        "Bump it to end every token at once.",
        "token_version + 1",
      ],
      [
        "Short-lived tokens",
        "Less time for a stolen token to work.",
        'expiresIn: "15m"',
      ],
      [
        "Sessions",
        "Delete the row; it ends at once.",
        "DELETE FROM sessions WHERE id = $1",
      ],
      [
        "Client state",
        "Drop the user, cached notes and drafts.",
        "setUser(null)",
      ],
    ]),
    quickCheck(
      "Which change lets a Notes App user end every login on every device at once?",
      [
        "Call res.clearCookie with more options",
        "A token_version column, checked in requireAuth and bumped",
        "Shorten the cookie's maxAge to 1 day",
      ],
      1,
      "clearCookie only affects the browser that sent the request, and a shorter maxAge still leaves copied tokens working. Bumping a version that requireAuth checks makes every older token fail at once.",
    ),
  ),
);
