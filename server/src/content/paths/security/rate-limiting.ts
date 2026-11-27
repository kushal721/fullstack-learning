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
  trace,
  yourTurn,
} from "../blocks.js";

// Rate limiting: beyond the 429, a fixed window taken apart, a fixed window
// step by step, the edge burst, a sliding window, what to count on login,
// account lockout and growing delays, the real client IP behind a proxy,
// limiting the Notes App's login, mistakes, practice and a recap.
export const rateLimitingModule = moduleLesson(
  "rate-limiting",
  "Rate limiting and lockouts",
  50,
  [
    "Build a fixed-window limiter and see the burst it allows at the window's edge.",
    "Build a sliding-window limiter that has no edge to exploit.",
    "Choose what to count on login: the IP address, the email, or both.",
    "Weigh account lockout against growing delays, and avoid locking real users out.",
    "Find the real client IP behind a proxy without trusting a forged header.",
  ],

  part(
    "beyond-429",
    "Beyond the 429",
    explain(
      "In HTTP & APIs you met the [[rate-limit|rate limit]]: over the cap, answer `429` with `Retry-After`, and a [[token-bucket|token bucket]] is one way to count. Here you build the counters yourself, then turn them against attackers: a [[brute-force-attack|brute-force attack]] on one account, and [[credential-stuffing|credential stuffing]] across many.",
    ),
    keyPoints(
      "A limiter answers one question: allow this request, yes or no?",
      "It counts per key: an IP address, an email, a user id.",
      "On login, the goal is to make guessing slow, not to stop people.",
    ),
  ),

  part(
    "fixed-window",
    "A fixed window, taken apart",
    explain(
      "A [[fixed-window|fixed window]] keeps one counter per key per clock window, such as per minute. Each request adds one; over the limit, refuse. When the next minute starts, a new counter starts at zero. It's cheap: one number per key.",
    ),
    anatomy(
      "The heart of a fixed-window limiter",
      [
        "const win = Math.floor(now / 60000);",
        'const id = key + ":" + win;',
        "const n = (counts.get(id) ?? 0) + 1;",
        "return n <= 5;",
      ],
      [
        [
          "Math.floor(now / 60000)",
          "which minute",
          "now in milliseconds. Every time in the same minute gives the same number.",
        ],
        [
          'key + ":" + win',
          "whose counter",
          'One counter per key per minute, like "1.2.3.4:29000000".',
        ],
        [
          "(counts.get(id) ?? 0) + 1",
          "count this one",
          "The count so far, starting at 0, plus this request.",
        ],
        [
          "n <= 5",
          "the limit",
          "Five a minute are allowed; the sixth gets false, and a 429.",
        ],
      ],
    ),
  ),

  part(
    "fixed-step",
    "A fixed window, step by step",
    explain(
      "This limiter allows 2 requests a minute. Four requests arrive from one IP in just over a second, across the moment one minute ends and the next begins. `now` is passed in, so you can see exactly what happens.",
    ),
    trace(
      "Four requests around the minute's edge",
      [
        "const counts = new Map();",
        "function allow(key, now) {",
        "  const win = Math.floor(now / 60000);",
        '  const id = key + ":" + win;',
        "  const n = (counts.get(id) ?? 0) + 1;",
        "  counts.set(id, n);",
        "  return n <= 2;",
        "}",
        'const a = allow("1.2.3.4", 59000);',
        'const b = allow("1.2.3.4", 59500);',
        'const c = allow("1.2.3.4", 59900);',
        'const d = allow("1.2.3.4", 60100);',
        "console.log(a, b, c, d);",
      ],
      [
        {
          line: 6,
          note: "59 seconds in: window 0. The first request makes the count 1.",
          vars: [
            ["key", '"1.2.3.4"'],
            ["now", "59000"],
            ["win", "0"],
            ["id", '"1.2.3.4:0"'],
            ["n", "1"],
          ],
          stack: ["allow"],
        },
        {
          line: 10,
          note: "Two requests, both allowed.",
          vars: [
            ["counts", 'Map(1) { "1.2.3.4:0" => 2 }'],
            ["allow", "ƒ allow(key, now)"],
            ["a", "true"],
            ["b", "true"],
          ],
        },
        {
          line: 7,
          note: "The third in the same minute: n is 3, over the limit.",
          vars: [
            ["key", '"1.2.3.4"'],
            ["now", "59900"],
            ["win", "0"],
            ["id", '"1.2.3.4:0"'],
            ["n", "3"],
          ],
          stack: ["allow"],
        },
        {
          line: 11,
          note: "Refused: the server answers 429.",
          vars: [
            ["counts", 'Map(1) { "1.2.3.4:0" => 3 }'],
            ["allow", "ƒ allow(key, now)"],
            ["a", "true"],
            ["b", "true"],
            ["c", "false"],
          ],
        },
        {
          line: 5,
          note: "60.1 seconds: window 1. A new counter, with nothing in it yet.",
          vars: [
            ["key", '"1.2.3.4"'],
            ["now", "60100"],
            ["win", "1"],
            ["id", '"1.2.3.4:1"'],
            ["n", "1"],
          ],
          stack: ["allow"],
        },
        {
          line: 13,
          note: "Allowed again, only 0.2 seconds after a refusal. That's the edge.",
          vars: [
            ["counts", "Map(2) { … => 3, … => 1 }"],
            ["allow", "ƒ allow(key, now)"],
            ["a", "true"],
            ["b", "true"],
            ["c", "false"],
            ["d", "true"],
          ],
          output: "true true false true",
        },
      ],
    ),
  ),

  part(
    "edge",
    "The edge burst",
    explain(
      "A fixed window forgets everything at the boundary. A script that waits for the end of a minute can send a full allowance just before it and another just after. For a login limit of 5 a minute that's 10 guesses in two seconds: twice what you meant, but still slow over an hour. For most login limits that's fine. When it isn't, use a sliding window.",
    ),
    quickCheck(
      "Login allows 5 tries per IP per fixed minute. How many guesses can one IP make between 12:00:59 and 12:01:01?",
      ["5", "10", "Unlimited"],
      1,
      "5 fit in the last second of the 12:00 window, and the counter resets at 12:01:00, so 5 more fit straight after. Over a whole hour it's still at most 300.",
    ),
  ),

  part(
    "sliding-window",
    "A sliding window",
    explain(
      "A [[sliding-window|sliding window]] asks: how many requests in the last 60 seconds, counting back from now? There's no boundary, so no edge burst. This version keeps each key's recent times and drops the old ones. It costs one number per request, so big APIs use a cheaper estimate that weighs the previous window's count.",
    ),
    code(
      "js",
      "A sliding-window log",
      [
        "const log = new Map();",
        "function allow(key, now) {",
        "  const recent = (log.get(key) ?? [])",
        "    .filter((t) => t > now - 60000);",
        "  if (recent.length >= 5) {",
        "    log.set(key, recent);",
        "    return false;",
        "  }",
        "  log.set(key, [...recent, now]);",
        "  return true;",
        "}",
      ],
      {
        4: "keep only the last 60 seconds",
        5: "5 already: refuse",
        6: "save the trimmed list anyway",
        9: "remember this request",
      },
    ),
    keyPoints(
      "Fixed window: one counter, an edge to exploit.",
      "Sliding log: exact, but a time per request.",
      "Token bucket: bursts allowed, steady rate overall.",
    ),
  ),

  part(
    "keys",
    "What to count on login",
    explain(
      "Per IP stops one machine guessing many passwords. But a botnet uses thousands of IPs on one account, so also count per email. Credential stuffing tries each leaked pair once, from many IPs: per-key limits barely see it. Watch the total failure rate too, and refuse breached passwords at sign-up.",
    ),
    reference("Login limits by key", [
      ["Per IP", "One machine, many guesses.", "10 failures per IP per 15 min"],
      [
        "Per email",
        "Many machines, one account.",
        "5 failures per email per 15 min",
      ],
      [
        "Global",
        "Many machines, many accounts: stuffing.",
        "alert at 10× the normal failure rate",
      ],
    ]),
    code(
      "js",
      "Two limiters on login (not in the Notes App)",
      [
        "const loginByIp = rateLimit({",
        "  windowMs: 15 * 60 * 1000,",
        "  limit: 10,",
        "});",
        "const loginByEmail = rateLimit({",
        "  windowMs: 15 * 60 * 1000,",
        "  limit: 5,",
        "  keyGenerator: (req) =>",
        '    String(req.body?.email ?? "")',
        "      .trim().toLowerCase(),",
        "});",
      ],
      {
        1: "express-rate-limit: by IP by default",
        8: "count by the email typed instead",
        10: "Ana@x.com and ana@x.com are one key",
      },
    ),
  ),

  part(
    "lockout",
    "Lockouts and growing delays",
    explain(
      "[[account-lockout|Account lockout]] blocks an account after a few wrong passwords. It stops guessing, but anyone who knows your email can now lock you out on purpose. A gentler fix is a delay that doubles with each failure and resets when you log in. Count failures by email even when no such account exists, so the answers don't reveal which emails are registered.",
    ),
    code(
      "js",
      "A growing delay per email",
      [
        "function delaySeconds(failures) {",
        "  if (failures < 3) return 0;",
        "  return Math.min(60,",
        "    2 ** (failures - 3));",
        "}",
        "// 3 → 1s, 4 → 2s, 5 → 4s … max 60s",
      ],
      {
        2: "a few typos cost nothing",
        3: "never more than a minute",
        4: "each failure doubles the wait",
      },
    ),
    keyPoints(
      "Lockout: stops guessing, but lets attackers lock users out.",
      "Growing delays: guessing gets slow, real users get in.",
      "Reset on a successful login.",
      "Same answer for known and unknown emails.",
    ),
  ),

  part(
    "proxy",
    "The real client IP",
    explain(
      "Behind a [[reverse-proxy|reverse proxy]], `req.ip` is the proxy's address until you set `trust proxy`, as HTTP & APIs showed. Set it to the number of proxies, not `true`. With `true`, Express believes the leftmost `X-Forwarded-For` address, which the client writes itself: a script sends a new fake IP with every request and never hits a limit.",
    ),
    code(
      "http",
      "A request that picks its own IP",
      [
        "POST /api/auth/login HTTP/1.1",
        "X-Forwarded-For: 10.0.0.73",
        "Content-Type: application/json",
        "",
        '{ "email": "ana@example.com",',
        '  "password": "guess-73" }',
      ],
      { 2: "made up, and different every time" },
    ),
    code(
      "js",
      "Trust exactly one proxy",
      ['app.set("trust proxy", 1);', "", "// never: trust proxy true"],
      { 1: "use the address the proxy itself saw" },
    ),
    quickCheck(
      'An API behind one proxy sets `app.set("trust proxy", true)`. What can a guessing script do?',
      [
        "Nothing: the proxy blocks it",
        "Send a fake X-Forwarded-For to dodge per-IP limits",
        "Read other users' cookies",
      ],
      1,
      "With true, Express takes the client-supplied leftmost address as req.ip. A new fake address each time means a fresh counter each time. Trusting exactly one proxy makes req.ip the address that proxy actually saw.",
    ),
  ),

  part(
    "notes-app",
    "Limiting the Notes App's login",
    explain(
      "The Notes App has no rate limiting and no lockout: a script can try passwords against `/api/auth/login` as fast as bcrypt answers. The limiters belong on that one route, before the controller. Counters in memory vanish on restart and aren't shared between servers, so a real deployment keeps them in a shared store like Redis.",
    ),
    code(
      "js",
      "routes/auth.js with limits (not in the Notes App)",
      [
        'authRoutes.post("/login",',
        "  loginByIp,",
        "  loginByEmail,",
        "  authController.login,",
        ");",
      ],
      {
        2: "429 before any database or bcrypt work",
        3: "needs req.body: express.json() runs first",
      },
    ),
    inTheNotesApp(
      "The login route goes straight to the controller, with nothing in between.",
      { fileId: "backend/src/routes/auth.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Trusting every proxy",
      wrong: ['app.set("trust proxy", true);'],
      problem:
        "Clients write their own X-Forwarded-For, so each request can claim a new IP and a fresh limit.",
      right: ['app.set("trust proxy", 1);'],
      why: "Trust only the proxies you run, so req.ip is the address your proxy saw.",
    }),
    mistake({
      title: "Locking the account for a day",
      wrong: ["if (failures >= 5) lockFor(24 * 3600);"],
      problem:
        "Anyone can lock a real user out for a day by typing five wrong passwords for their email.",
      right: ["await wait(delaySeconds(failures));"],
      why: "Growing delays make guessing slow without handing attackers a way to lock people out.",
    }),
    mistake({
      title: "Limiting login by IP only",
      wrong: ['authRoutes.post("/login",', "  loginByIp, login);"],
      problem:
        "A botnet spreads guesses for one account over thousands of IPs, each under the limit.",
      right: [
        'authRoutes.post("/login",',
        "  loginByIp, loginByEmail, login);",
      ],
      why: "Count by IP and by email, so both one machine and one account are protected.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A fixed-window limiter",
      task: "Write `makeFixedWindow(limit, windowMs)`. It returns `hit(key, now)`, which returns `true` if this request is allowed and `false` if the key has already made `limit` requests in the current window (`Math.floor(now / windowMs)`). Each key has its own count.",
      starter: [
        "function makeFixedWindow(limit, windowMs) {",
        "  return (key, now) => true;",
        "}",
      ],
      tests: [
        [
          '(() => { const hit = makeFixedWindow(2, 1000); return [hit("a", 0), hit("a", 10), hit("a", 20), hit("b", 30), hit("a", 1000)]; })()',
          "[true, true, false, true, true]",
        ],
        [
          '(() => { const hit = makeFixedWindow(1, 1000); return [hit("x", 999), hit("x", 1000), hit("x", 1500)]; })()',
          "[true, true, false]",
        ],
      ],
      hint: 'Keep a Map inside the outer function. Build the id from `key + ":" + Math.floor(now / windowMs)`, add one, save it, and return `n <= limit`.',
      solution: [
        "function makeFixedWindow(limit, windowMs) {",
        "  const counts = new Map();",
        "  return (key, now) => {",
        "    const win = Math.floor(now / windowMs);",
        '    const id = key + ":" + win;',
        "    const n = (counts.get(id) ?? 0) + 1;",
        "    counts.set(id, n);",
        "    return n <= limit;",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "A sliding-window limiter",
      task: "Write `makeSlidingWindow(limit, windowMs)`. It returns `hit(key, now)`. Count only the key's allowed requests with a time greater than `now - windowMs`. If there are already `limit` of them, return `false`; otherwise remember `now` and return `true`.",
      starter: [
        "function makeSlidingWindow(limit, windowMs) {",
        "  return (key, now) => true;",
        "}",
      ],
      tests: [
        [
          '(() => { const hit = makeSlidingWindow(2, 1000); return [hit("a", 900), hit("a", 950), hit("a", 1100), hit("a", 1950), hit("a", 1960)]; })()',
          "[true, true, false, true, true]",
        ],
        [
          '(() => { const hit = makeSlidingWindow(1, 1000); return [hit("a", 0), hit("b", 0), hit("a", 999), hit("a", 1000)]; })()',
          "[true, true, false, true]",
        ],
      ],
      hint: "Keep a Map of key → array of times. Filter it to `t > now - windowMs`, compare its length with the limit, and save the new array.",
      solution: [
        "function makeSlidingWindow(limit, windowMs) {",
        "  const log = new Map();",
        "  return (key, now) => {",
        "    const recent = (log.get(key) ?? [])",
        "      .filter((t) => t > now - windowMs);",
        "    if (recent.length >= limit) {",
        "      log.set(key, recent);",
        "      return false;",
        "    }",
        "    log.set(key, [...recent, now]);",
        "    return true;",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "A growing delay",
      task: "Write `delaySeconds(failures)`. Fewer than 3 failures: `0`. From 3 on, the delay doubles each time: 3 → 1, 4 → 2, 5 → 4, and so on, but never more than 60.",
      starter: [
        "function delaySeconds(failures) {",
        "  return failures >= 3 ? 1 : 0;",
        "}",
      ],
      tests: [
        ["delaySeconds(2)", "0"],
        ["delaySeconds(3)", "1"],
        ["delaySeconds(5)", "4"],
        ["delaySeconds(20)", "60"],
      ],
      hint: "`2 ** (failures - 3)` gives 1, 2, 4 …; wrap it in `Math.min(60, …)`.",
      solution: [
        "function delaySeconds(failures) {",
        "  if (failures < 3) return 0;",
        "  return Math.min(60, 2 ** (failures - 3));",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Rate limiting cheat sheet", [
      [
        "Fixed window",
        "One counter per key per clock window.",
        "Math.floor(now / 60000)",
      ],
      [
        "Edge burst",
        "A full allowance on each side of the reset.",
        "5 at 12:00:59, 5 at 12:01:00",
      ],
      [
        "Sliding window",
        "Count the last N seconds from now.",
        "times.filter((t) => t > now - 60000)",
      ],
      ["Per IP", "One machine, many guesses.", "10 per IP per 15 min"],
      ["Per email", "Many machines, one account.", "keyGenerator: email"],
      [
        "Credential stuffing",
        "One try per pair: watch total failures.",
        "alert on a failure spike",
      ],
      [
        "Account lockout",
        "Stops guessing; lets attackers lock users out.",
        "prefer growing delays",
      ],
      [
        "Growing delay",
        "Doubles per failure, capped, reset on success.",
        "1s, 2s, 4s … 60s",
      ],
      [
        "trust proxy",
        "The number of your proxies, never true.",
        'app.set("trust proxy", 1)',
      ],
      [
        "Shared store",
        "Counts survive restarts and add up across servers.",
        "Redis",
      ],
    ]),
    quickCheck(
      "Which login protection slows guessing without letting attackers lock real users out?",
      [
        "Lock the account for 24 hours after 5 failures",
        "A delay that doubles per failure, reset on success",
        "No limit, since bcrypt is slow",
      ],
      1,
      "Growing delays make thousands of guesses take forever, while someone who typed their password wrong twice barely notices. A long lockout can be triggered by anyone who knows the email.",
    ),
  ),
);
