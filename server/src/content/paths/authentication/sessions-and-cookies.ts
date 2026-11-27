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

// Sessions and cookies: staying logged in, two designs, server-side
// sessions with express-session, the trade-offs, good session ids and
// fixation, a session store step by step, the login cookie's attributes,
// credentials in fetch, idle and absolute timeouts, mistakes, practice and a
// recap.
export const sessionsAndCookiesModule = moduleLesson(
  "sessions-and-cookies",
  "Sessions and cookies",
  50,
  [
    "Explain how a cookie keeps you logged in across requests.",
    "Compare server-side sessions with a signed token in a cookie.",
    "Make session ids that can't be guessed, and renew them at login.",
    "Choose HttpOnly, Secure, SameSite, Max-Age, Path and Domain for a login cookie.",
    "Tell idle timeouts from absolute ones and check both.",
  ],

  part(
    "staying-logged-in",
    "Staying logged in",
    explain(
      "HTTP forgets you between requests. After login, the server sets a [[cookie]] and the browser attaches it to every later request to that site, by itself. So the login check runs once, and each request after it only has to answer: whose cookie is this? There are two common answers, and the next part compares them.",
    ),
    diagram([
      ["Login", "POST, once"],
      ["Set-Cookie", "in the answer"],
      ["Browser keeps it", "until it expires"],
      ["Cookie: …", "on every request"],
      ["Server", "whose is it?"],
    ]),
    keyPoints(
      "The password travels once; the cookie travels every time.",
      "Whoever holds the cookie is logged in as you.",
      "So the cookie must be hard to guess, hard to steal and short-lived.",
    ),
  ),

  part(
    "two-designs",
    "Two designs",
    explain(
      "A [[server-session]] keeps the login on the server: a store maps a random [[session-id]] to the user, and the cookie holds only that id. A signed token keeps it in the cookie itself: the server signs “this is user 7, until next week”, and on each request checks the signature instead of looking anything up. The Notes App uses the second: a [[jwt]] in a cookie named `token`.",
    ),
    diagram([
      ["Cookie: sid=Xq7…", "just an id"],
      ["Session store", "Xq7… → user 7"],
      ["req.user", "found by lookup"],
    ]),
    diagram([
      ["Cookie: token=eyJ…", "signed claims"],
      ["jwt.verify", "check signature, expiry"],
      ["req.user", "read from the token"],
    ]),
    inTheNotesApp(
      "`requireAuth` reads `req.cookies.token`, verifies it with `JWT_SECRET` and sets `req.user = { id: payload.sub }`. No store, no lookup.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
  ),

  part(
    "express-session",
    "A server-side session in Express",
    explain(
      "The `express-session` package does the store work for you. It makes the id, sets the cookie, and before your routes run it loads the session into `req.session`. Logging in means writing the user's id into it; logging out means destroying it. The default store lives in memory and is lost on restart, so real apps plug in Redis or a database table.",
    ),
    code(
      "js",
      "Sessions with express-session (not in the Notes App)",
      [
        'import session from "express-session";',
        "app.use(session({",
        "  secret: process.env.SESSION_SECRET,",
        "  resave: false,",
        "  saveUninitialized: false,",
        '  cookie: { httpOnly: true, sameSite: "lax",',
        "    secure: true, maxAge: 7 * 864e5 },",
        "  store, // e.g. Redis or Postgres",
        "}));",
        "// in a route",
        "req.session.userId = user.id; // login",
        "const id = req.session.userId; // later",
        "req.session.destroy(() => {}); // logout",
      ],
      {
        3: "signs the id in the cookie",
        5: "no session (and no cookie) until login",
        7: "864e5 ms is one day",
        13: "gone from the store: logged out everywhere",
      },
    ),
  ),

  part(
    "trade-offs",
    "Which one when",
    explain(
      "Neither is “the secure one”. A session can be ended at once by deleting it, but every request needs a lookup in a store all your servers share. A signed token needs no lookup and no store, but the server can't take it back: it works until it expires. That's why the Notes App's logout only clears the browser's copy; the Logging out module covers what that means.",
    ),
    reference("Server-side session vs signed token", [
      [
        "Cookie holds",
        "Session: a random id. Token: signed claims.",
        "sid=Xq7… / token=eyJ…",
      ],
      [
        "Each request",
        "Session: a store lookup. Token: a signature check.",
        "store.get(sid) / jwt.verify",
      ],
      [
        "Log out",
        "Session: delete it, done everywhere. Token: works until exp.",
        "destroy() / clearCookie",
      ],
      [
        "Many servers",
        "Session: they share a store. Token: they share the secret.",
        "Redis / JWT_SECRET",
      ],
      ["Size", "Session: tiny cookie. Token: a few hundred bytes."],
    ]),
    quickCheck(
      "A user's laptop is stolen and they want every login ended right now. Which design makes that easy?",
      [
        "A signed token, because it has an expiry",
        "Server-side sessions: delete the user's sessions from the store",
        "Neither: cookies can't be ended early",
      ],
      1,
      "A session exists only while its store entry does, so deleting it ends it at once. A signed token stays valid until it expires unless you add extra machinery to revoke it.",
    ),
  ),

  part(
    "good-ids",
    "Good session ids, and fixation",
    explain(
      "A session id is as good as a password while it lasts, so it must be impossible to guess: at least 128 random bits from a secure generator, never a counter, a timestamp or `Math.random()`. It must also be new at every login. Otherwise an attacker can plant an id in your browser before you log in and use it after: [[session-fixation]].",
    ),
    code(
      "js",
      "A strong id, and a fresh one at login",
      [
        'import crypto from "node:crypto";',
        "const sid = crypto.randomBytes(32)",
        '  .toString("base64url");',
        "",
        "// express-session, after a login",
        "req.session.regenerate((err) => {",
        "  if (err) return next(err);",
        "  req.session.userId = user.id;",
        "  res.json({ id: user.id });",
        "});",
      ],
      {
        2: "256 random bits: nobody will guess it",
        3: "letters, digits, - and _: safe in a cookie",
        6: "throw the old id away, issue a new one",
      },
    ),
    keyPoints(
      "The Notes App signs a brand-new token at every login, so fixation can't happen.",
      "Renew the id whenever privileges change too, such as becoming an admin.",
      "Never put a session id in a URL: it ends up in logs and history.",
    ),
  ),

  part(
    "step-by-step",
    "A session store, step by step",
    explain(
      "The core of a session store is a Map from id to data. Here `randomId` returns a fixed string so you can follow along; a real one calls the secure generator. Follow a login, a request, and a logout.",
    ),
    trace(
      "A tiny session store",
      [
        "const store = new Map();",
        'const randomId = () => "Xq7f2";',
        "function createSession(userId) {",
        "  const id = randomId();",
        "  store.set(id, { userId });",
        "  return id;",
        "}",
        "function whoIs(id) {",
        "  return store.get(id)?.userId ?? null;",
        "}",
        "const sid = createSession(7);",
        "whoIs(sid);",
        "store.delete(sid);",
        "whoIs(sid);",
      ],
      [
        {
          line: 1,
          note: "An empty store: nobody is logged in.",
          vars: [["store", "Map(0) {}"]],
        },
        {
          line: 2,
          note: "Stands in for crypto.randomBytes.",
          vars: [
            ["store", "Map(0) {}"],
            ["randomId", "() => …"],
          ],
        },
        {
          line: 11,
          note: "User 7's password matched: start a session.",
          vars: [
            ["store", "Map(0) {}"],
            ["randomId", "() => …"],
          ],
        },
        {
          line: 4,
          note: "A new id for this login.",
          vars: [
            ["store", "Map(0) {}"],
            ["randomId", "() => …"],
            ["userId", "7"],
            ["id", '"Xq7f2"'],
          ],
          stack: ["createSession"],
        },
        {
          line: 5,
          note: "The store remembers who the id belongs to.",
          vars: [
            ["store", 'Map(1) { "Xq7f2" => { userId: 7 } }'],
            ["randomId", "() => …"],
            ["userId", "7"],
            ["id", '"Xq7f2"'],
          ],
          stack: ["createSession"],
        },
        {
          line: 11,
          note: "The id goes back in Set-Cookie: sid=Xq7f2.",
          vars: [
            ["store", 'Map(1) { "Xq7f2" => { userId: 7 } }'],
            ["randomId", "() => …"],
            ["sid", '"Xq7f2"'],
          ],
        },
        {
          line: 9,
          note: "A later request brings the cookie. Look it up: user 7.",
          vars: [
            ["store", 'Map(1) { "Xq7f2" => { userId: 7 } }'],
            ["randomId", "() => …"],
            ["sid", '"Xq7f2"'],
            ["id", '"Xq7f2"'],
          ],
          stack: ["whoIs"],
          output: "7",
        },
        {
          line: 13,
          note: "Logout deletes the entry. The cookie may still exist, but it now names nothing.",
          vars: [
            ["store", "Map(0) {}"],
            ["randomId", "() => …"],
            ["sid", '"Xq7f2"'],
          ],
        },
        {
          line: 9,
          note: "The same cookie again: no entry, so nobody. The route answers 401.",
          vars: [
            ["store", "Map(0) {}"],
            ["randomId", "() => …"],
            ["sid", '"Xq7f2"'],
            ["id", '"Xq7f2"'],
          ],
          stack: ["whoIs"],
          output: "null",
        },
      ],
    ),
  ),

  part(
    "attributes",
    "The login cookie's attributes",
    explain(
      "You met [[cookie-attributes|cookie attributes]] in How the Web Works. Here is what each means for a login cookie, using the one the Notes App sends in production. Express turns `cookieOptions` into this header; `maxAge` in milliseconds becomes `Max-Age` in seconds.",
    ),
    anatomy(
      "The Notes App's cookie in production (one line, wrapped here)",
      [
        "Set-Cookie: token=eyJhbGci…;",
        "  Max-Age=604800; Path=/;",
        "  HttpOnly; Secure;",
        "  SameSite=Lax",
      ],
      [
        [
          "token=eyJhbGci…",
          "name=value",
          "The signed token. The browser just stores it.",
        ],
        [
          "Max-Age=604800",
          "7 days",
          "In seconds. Without it, gone when the browser closes.",
        ],
        ["Path=/", "every path", "Sent to /api/notes and /api/auth alike."],
        [
          "HttpOnly",
          "no scripts",
          "document.cookie can't see it, so injected JS can't steal it.",
        ],
        [
          "Secure",
          "HTTPS only",
          "Never sent over plain http, where it could be read.",
        ],
        [
          "SameSite=Lax",
          "own site",
          "Not sent on other sites' POSTs; sent when you follow a link.",
        ],
      ],
    ),
    reference("SameSite, Domain and Expires", [
      [
        "SameSite=Strict",
        "Only requests your own site starts. Arriving by a link, you look logged out.",
      ],
      [
        "SameSite=Lax",
        "Also top-level links from other sites. The usual choice.",
        "Notes App",
      ],
      [
        "SameSite=None",
        "Sent everywhere; must also be Secure. Only for cross-site APIs.",
        "SameSite=None; Secure",
      ],
      [
        "No Domain",
        "Only the exact host that set it. Safest.",
        "notes.app only",
      ],
      ["Domain=notes.app", "Also every subdomain, such as blog.notes.app."],
      [
        "Expires",
        "A date instead of Max-Age. If both, Max-Age wins.",
        "Expires=Thu, 03 Dec 2026…",
      ],
    ]),
  ),

  part(
    "credentials",
    "Sending the cookie with fetch",
    explain(
      'The browser decides when a cookie goes with a `fetch`. By default (`credentials: "same-origin"`) it\'s sent only to the page\'s own origin. The Notes App\'s `request()` says `"include"`, which also sends it to another origin. In development the Vite proxy makes the API the same origin as the page anyway, so both would work; `include` keeps working if the API moves to its own domain.',
    ),
    code(
      "js",
      "request.js (shortened)",
      [
        "const response = await fetch(path, {",
        "  method,",
        '  credentials: "include",',
        "  headers,",
        "  body,",
        "});",
      ],
      { 3: "send the login cookie, even cross-origin" },
    ),
    keyPoints(
      "One request() function, so no call can forget the cookie.",
      'A cross-origin API must also allow credentials, and SameSite may need "None".',
      "The token never touches JavaScript: the browser carries it.",
    ),
  ),

  part(
    "timeouts",
    "Idle and absolute timeouts",
    explain(
      "An idle timeout ends a session after a stretch with no requests, say 30 minutes: good for a shared computer someone walked away from. An absolute timeout ends it a fixed time after login however busy it is, say 8 hours: a stolen session can't be kept alive forever. Banks use both. The Notes App has only an absolute one: the token and the cookie end 7 days after login.",
    ),
    code(
      "js",
      "Checking both on each request",
      [
        "const now = Date.now();",
        "const idle = now - session.lastSeenAt;",
        "const age = now - session.createdAt;",
        "if (idle > 30 * 60e3 || age > 8 * 3600e3) {",
        "  store.delete(sid);",
        "  return res.status(401).json(pleaseLogIn);",
        "}",
        "session.lastSeenAt = now;",
      ],
      {
        4: "30 minutes idle, or 8 hours old",
        5: "end it on the server",
        8: "busy: push the idle deadline back",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Guessable session ids",
      wrong: ["const sid = String(nextId++);"],
      problem:
        "Ids 1, 2, 3… let anyone try the neighbours and use someone else's session. Math.random() and timestamps are guessable too.",
      right: [
        "const sid = crypto.randomBytes(32)",
        '  .toString("base64url");',
      ],
      why: "A secure random generator with 128 bits or more can't be guessed.",
    }),
    mistake({
      title: "Keeping the old session at login",
      wrong: ["req.session.userId = user.id;"],
      problem:
        "The id from before login stays valid, now logged in. If an attacker planted it, they're logged in as you: session fixation.",
      right: [
        "req.session.regenerate(() => {",
        "  req.session.userId = user.id;",
        "});",
      ],
      why: "A new id at login makes any id known beforehand useless.",
    }),
    mistake({
      title: "A login cookie scripts can read",
      wrong: ['res.cookie("token", token);'],
      problem:
        "No HttpOnly, SameSite or Secure: any script injected into the page can read document.cookie and send the token away.",
      right: [
        'res.cookie("token", token, {',
        '  httpOnly: true, sameSite: "lax",',
        "  secure: true, maxAge: weekMs,",
        "});",
      ],
      why: "Set every attribute on a login cookie, every time.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build a Set-Cookie value",
      task: 'Write `cookieHeader(name, value, opts)`. Start with `name=value`, then add, in this order and only when given: `Max-Age=<opts.maxAge>` (seconds, and 0 counts), `Path=<opts.path>`, `HttpOnly`, `Secure`, `SameSite=<opts.sameSite>`. Join the pieces with `"; "`.',
      starter: [
        "function cookieHeader(name, value, opts) {",
        '  return name + "=" + value;',
        "}",
      ],
      tests: [
        [
          'cookieHeader("token", "abc", { maxAge: 604800, path: "/", httpOnly: true, secure: true, sameSite: "Lax" })',
          '"token=abc; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax"',
        ],
        ['cookieHeader("token", "abc", {})', '"token=abc"'],
        [
          'cookieHeader("sid", "x", { httpOnly: true, sameSite: "Strict" })',
          '"sid=x; HttpOnly; SameSite=Strict"',
        ],
        ['cookieHeader("token", "", { maxAge: 0 })', '"token=; Max-Age=0"'],
      ],
      hint: 'Push pieces onto an array and `join("; ")`. Use `opts.maxAge !== undefined`, since 0 is falsy.',
      solution: [
        "function cookieHeader(name, value, opts) {",
        '  const parts = [name + "=" + value];',
        "  if (opts.maxAge !== undefined)",
        '    parts.push("Max-Age=" + opts.maxAge);',
        '  if (opts.path) parts.push("Path=" + opts.path);',
        '  if (opts.httpOnly) parts.push("HttpOnly");',
        '  if (opts.secure) parts.push("Secure");',
        "  if (opts.sameSite)",
        '    parts.push("SameSite=" + opts.sameSite);',
        '  return parts.join("; ");',
        "}",
      ],
    }),
    yourTurn({
      title: "A session store",
      task: "Write `createSessions(randomId)`. It returns `{ create(userId), get(id), destroy(id) }`. `create` makes a new id with `randomId()`, remembers the user under it and returns the id. `get` returns the user id, or `null` if there's no such session. `destroy` forgets it.",
      starter: [
        "function createSessions(randomId) {",
        "  const store = new Map();",
        "  return {",
        "    create(userId) {",
        "      store.set(userId, userId);",
        "      return userId;",
        "    },",
        "    get(id) { return store.get(id); },",
        "    destroy(id) {},",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { let n = 0; const s = createSessions(() => "id" + ++n); const a = s.create(7); const b = s.create(7); return [a, b, s.get(a), s.get(b)]; })()',
          '["id1", "id2", 7, 7]',
        ],
        [
          '(() => { const s = createSessions(() => "k"); return s.get("nope"); })()',
          "null",
        ],
        [
          '(() => { const s = createSessions(() => "k"); const id = s.create(3); s.destroy(id); return s.get(id); })()',
          "null",
        ],
      ],
      hint: "Key the Map by the random id, not the user id: one user can have several sessions. `store.get(id) ?? null`.",
      solution: [
        "function createSessions(randomId) {",
        "  const store = new Map();",
        "  return {",
        "    create(userId) {",
        "      const id = randomId();",
        "      store.set(id, userId);",
        "      return id;",
        "    },",
        "    get(id) { return store.get(id) ?? null; },",
        "    destroy(id) { store.delete(id); },",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Idle and absolute timeouts",
      task: "Write `isExpired(session, now, idleMs, absoluteMs)`. `session` is `{ createdAt, lastSeenAt }` in milliseconds. Return `true` if more than `idleMs` have passed since `lastSeenAt`, or more than `absoluteMs` since `createdAt`.",
      starter: [
        "function isExpired(session, now, idleMs, absoluteMs) {",
        "  return now - session.lastSeenAt > idleMs;",
        "}",
      ],
      tests: [
        [
          "isExpired({ createdAt: 0, lastSeenAt: 0 }, 60000, 1800000, 28800000)",
          "false",
        ],
        [
          "isExpired({ createdAt: 0, lastSeenAt: 0 }, 1860000, 1800000, 28800000)",
          "true",
        ],
        [
          "isExpired({ createdAt: 0, lastSeenAt: 32000000 }, 32400000, 1800000, 28800000)",
          "true",
        ],
        [
          "isExpired({ createdAt: 0, lastSeenAt: 3600000 }, 3660000, 1800000, 28800000)",
          "false",
        ],
      ],
      hint: "Two conditions joined with `||`: one for idle time, one for total age.",
      solution: [
        "function isExpired(session, now, idleMs, absoluteMs) {",
        "  const idle = now - session.lastSeenAt;",
        "  const age = now - session.createdAt;",
        "  return idle > idleMs || age > absoluteMs;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Sessions and cookies cheat sheet", [
      [
        "Server-side session",
        "Random id in the cookie; the user in a store.",
        "express-session + Redis",
      ],
      [
        "Signed token",
        "Claims in the cookie; checked by signature.",
        "Notes App: token=eyJ…",
      ],
      [
        "Session id",
        "128+ random bits, new at every login.",
        'randomBytes(32).toString("base64url")',
      ],
      [
        "Session fixation",
        "Planted id used after login. Fix: regenerate.",
        "req.session.regenerate()",
      ],
      ["HttpOnly", "Page scripts can't read it.", "httpOnly: true"],
      ["Secure", "Only over HTTPS.", "secure: true"],
      [
        "SameSite",
        "Lax for login cookies; None needs Secure.",
        'sameSite: "lax"',
      ],
      [
        "Max-Age / Expires",
        "How long it's kept; Express takes ms.",
        "maxAge: 7 * 864e5",
      ],
      [
        "Path / Domain",
        "Path=/; leave Domain out for this host only.",
        "Path=/",
      ],
      ["credentials", "Makes fetch send the cookie.", 'credentials: "include"'],
      ["Timeouts", "Idle: no activity. Absolute: since login.", "30 min / 8 h"],
    ]),
    quickCheck(
      "Which cookie attribute stops an injected script from reading the login cookie?",
      ["Secure", "HttpOnly", "SameSite=Lax", "Path=/"],
      1,
      "HttpOnly hides the cookie from document.cookie. Secure keeps it off plain HTTP, SameSite controls which requests carry it, and Path where it's sent; none of those stop a script reading it.",
    ),
  ),
);
