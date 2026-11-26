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

// Rate limits: why limit, who gets counted, three ways to count, a token
// bucket step by step, the 429 answer, headers that say what's left, a
// client that waits, stricter limits on login, the Notes App, mistakes,
// practice and a recap.
export const rateLimitsModule = moduleLesson(
  "rate-limits",
  "Rate limits: slow down",
  50,
  [
    "Explain why APIs limit requests: overload, abuse, fairness and cost.",
    "Choose what to count by: IP address, user or API key.",
    "Compare fixed windows, sliding windows and token buckets.",
    "Answer 429 with Retry-After and RateLimit headers, and respect them as a client.",
    "Put a stricter limit on login to slow down password guessing.",
  ],

  part(
    "why",
    "Why limit requests",
    explain(
      "A [[rate-limit]] caps how many requests one client may send in a period. Over the cap, the server stops doing the work and answers `429 Too Many Requests`. Turning one client away is better than letting it slow the API down for everyone.",
    ),
    keyPoints(
      "Overload: a buggy loop shouldn't take the server down.",
      "Abuse: scraping, spam and password guessing get slow and costly.",
      "Fairness: one heavy user can't use up everyone's share.",
      "Cost: every request uses CPU, database time and money.",
    ),
  ),

  part(
    "who",
    "Who gets counted",
    explain(
      "A limit needs a key to count by. Before login, all you have is the IP address. After login, count per user, so people sharing one office or school IP aren't punished together. Programs calling with an [[api-key]] are counted per key, often with limits that depend on what they pay for.",
    ),
    reference("Count by", [
      [
        "IP address",
        "Works before login. Shared IPs share a limit.",
        "100 per 15 min per IP",
      ],
      ["User id", "Fair per person. Needs a login.", "1,000 per hour per user"],
      [
        "API key",
        "Per program; limits can follow the plan.",
        "Free: 60/min, Pro: 600/min",
      ],
      [
        "Route",
        "Expensive or risky routes get less.",
        "POST /login: 5 per 15 min",
      ],
    ]),
  ),

  part(
    "counting",
    "Three ways to count",
    explain(
      "A fixed window keeps a counter per minute and resets it on the minute: simple, but a client can send a full minute's worth at 0:59 and again at 1:00. A sliding window counts the last 60 seconds from now, so that double burst can't happen. A [[token-bucket]] allows short bursts but holds the long-run rate steady.",
    ),
    reference("Rate-limit methods", [
      [
        "Fixed window",
        "Count per clock minute, reset at :00.",
        "100 in 12:00–12:01",
      ],
      [
        "Sliding window",
        "Count the last N seconds, whenever you look.",
        "100 in the last 60s",
      ],
      [
        "Token bucket",
        "Size = burst; refill rate = steady limit.",
        "Size 10, 1 token per second",
      ],
    ]),
    quickCheck(
      "A fixed window allows 100 requests a minute. What's the most a client can send in the two seconds around 12:01:00?",
      ["100", "200: 100 at 12:00:59 and 100 at 12:01:00", "50"],
      1,
      "The counter resets at 12:01:00, so a full minute's allowance fits on each side of the edge. Sliding windows and token buckets avoid this.",
    ),
  ),

  part(
    "bucket-step",
    "A token bucket, step by step",
    explain(
      "This bucket holds 2 tokens and refills 1 per second. Each request takes a token; with less than one left, it's refused. The time `now` is passed in, in milliseconds, so it's easy to test.",
    ),
    trace(
      "Four requests in 1.5 seconds",
      [
        "let tokens = 2; // the bucket is full",
        "let last = 0;",
        "function take(now) {",
        "  const add = (now - last) / 1000;",
        "  tokens = Math.min(2, tokens + add);",
        "  last = now;",
        "  if (tokens < 1) return false;",
        "  tokens -= 1;",
        "  return true;",
        "}",
        "take(0);",
        "take(100);",
        "take(200);",
        "take(1500);",
      ],
      [
        {
          line: 11,
          note: "The first request, at time 0. The bucket is full.",
          vars: [
            ["tokens", "2"],
            ["last", "0"],
          ],
        },
        {
          line: 9,
          note: "Nothing to add yet. One token taken: allowed.",
          vars: [
            ["tokens", "1"],
            ["last", "0"],
            ["now", "0"],
            ["add", "0"],
          ],
          stack: ["take"],
          output: "true",
        },
        {
          line: 5,
          note: "100ms later: a tenth of a token has dripped back in.",
          vars: [
            ["tokens", "1.1"],
            ["last", "0"],
            ["now", "100"],
            ["add", "0.1"],
          ],
          stack: ["take"],
        },
        {
          line: 9,
          note: "One token taken again: allowed. That was a burst of two.",
          vars: [
            ["tokens", "0.1"],
            ["last", "100"],
            ["now", "100"],
            ["add", "0.1"],
          ],
          stack: ["take"],
          output: "true",
        },
        {
          line: 7,
          note: "At 200ms there are only 0.2 tokens. Refused: the server answers 429.",
          vars: [
            ["tokens", "0.2"],
            ["last", "200"],
            ["now", "200"],
            ["add", "0.1"],
          ],
          stack: ["take"],
          output: "false",
        },
        {
          line: 5,
          note: "1.3 seconds later, 1.3 tokens have come back.",
          vars: [
            ["tokens", "1.5"],
            ["last", "200"],
            ["now", "1500"],
            ["add", "1.3"],
          ],
          stack: ["take"],
        },
        {
          line: 9,
          note: "Allowed again. In the long run, one request per second gets through.",
          vars: [
            ["tokens", "0.5"],
            ["last", "1500"],
            ["now", "1500"],
            ["add", "1.3"],
          ],
          stack: ["take"],
          output: "true",
        },
      ],
    ),
  ),

  part(
    "429",
    "The answer: 429 and Retry-After",
    explain(
      "Over the limit, answer `429 Too Many Requests` without doing the work. Add [[retry-after|Retry-After]] to say how long to wait: a number of seconds, or a date. A `503 Service Unavailable` can carry it too, when the whole server needs a break.",
    ),
    code(
      "http",
      "A refused request",
      [
        "GET /api/notes HTTP/1.1",
        "",
        "HTTP/1.1 429 Too Many Requests",
        "Retry-After: 30",
        "Content-Type: application/json",
        "",
        '{ "error": "Too many requests" }',
      ],
      {
        3: "4xx: the client is sending too much",
        4: "wait 30 seconds before trying again",
        7: "a message people can read",
      },
    ),
  ),

  part(
    "headers",
    "Headers that say what's left",
    explain(
      "Good APIs tell clients how close they are to the limit on every response, not just the refused one. A draft standard uses `RateLimit-Policy` for the rule and `RateLimit` for what's left. Many APIs still send the older `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`.",
    ),
    anatomy(
      "RateLimit headers on a normal response",
      [
        "HTTP/1.1 200 OK",
        'RateLimit-Policy: "api";q=100;w=900',
        'RateLimit: "api";r=42;t=310',
        "X-RateLimit-Remaining: 42",
      ],
      [
        ["200 OK", "allowed", "This one got through."],
        [
          "q=100;w=900",
          "the policy",
          "Quota 100 requests per window of 900 seconds (15 minutes).",
        ],
        ["r=42", "remaining", "42 requests are left in this window."],
        ["t=310", "reset", "The window resets in 310 seconds."],
        [
          "X-RateLimit-Remaining",
          "the old style",
          "Not a standard, but common. Same meaning as r.",
        ],
      ],
    ),
  ),

  part(
    "client",
    "A client that waits",
    explain(
      "When a 429 comes back, wait at least as long as `Retry-After` says, then try again. Only fall back on your own backoff when the header is missing. Retrying sooner just earns another 429, and some APIs block clients that keep doing it.",
    ),
    code(
      "js",
      "Respecting Retry-After",
      [
        "async function politely(send, tries = 3) {",
        "  for (let i = 1; ; i++) {",
        "    const res = await send();",
        "    if (res.status !== 429 || i === tries)",
        "      return res;",
        "    const after = res.headers.get(",
        '      "Retry-After",',
        "    );",
        "    const secs = Number(after) || 2 ** i;",
        "    await sleep(secs * 1000);",
        "  }",
        "}",
      ],
      {
        4: "not limited, or out of tries: done",
        9: "seconds from the server, else 2, 4…",
        10: "wait, then loop round and send again",
      },
    ),
    keyPoints(
      "Retry-After can be a date too: `Date.parse` it and subtract now.",
      "Show a message if the wait is long, instead of hanging.",
      "Watch RateLimit headers to slow down before you're refused.",
    ),
  ),

  part(
    "login",
    "Stricter limits on login",
    explain(
      "A login route is where attackers guess passwords, so it gets a much lower limit than the rest of the API: a handful of tries per IP (and per email) every 15 minutes. A person who mistypes their password twice won't notice; a script trying a million passwords is slowed to a crawl. In Express, the express-rate-limit package is a common choice.",
    ),
    code(
      "js",
      "A login limit with express-rate-limit",
      [
        'import { rateLimit } from "express-rate-limit";',
        "",
        "const loginLimit = rateLimit({",
        "  windowMs: 15 * 60 * 1000,",
        "  limit: 5,",
        '  standardHeaders: "draft-8",',
        "});",
        "",
        "authRoutes.post(",
        '  "/login",',
        "  loginLimit,",
        "  authController.login,",
        ");",
      ],
      {
        4: "a 15-minute window",
        5: "5 tries per IP in that window",
        6: "send RateLimit and RateLimit-Policy",
        11: "runs before the login code",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App",
    explain(
      "The Notes App has no rate limit: its login and notes routes accept as many requests as anyone sends. This learning platform's own server does limit its API, per IP address, to a number of requests per 15 minutes set by its `RATE_LIMIT_API` setting (300 by default). For the Notes App, a limit would go in `app.js`, before the routes.",
    ),
    inTheNotesApp(
      "`createApp` adds the JSON parser, cookies and the routes; there is no rate limiter among them.",
      { fileId: "backend/src/app.js" },
    ),
    code(
      "js",
      "Adding limits (not in the Notes App)",
      [
        "const apiLimit = rateLimit({",
        "  windowMs: 15 * 60 * 1000,",
        "  limit: 300,",
        "});",
        "",
        'app.use("/api", apiLimit);',
        'app.use("/api/auth/login", loginLimit);',
      ],
      {
        6: "every API route: 300 per IP per 15 min",
        7: "login: far fewer",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Retrying a 429 at once",
      wrong: ["if (res.status === 429) return send();"],
      problem:
        "The client is still over the limit, so it gets another 429, and keeps the server busy refusing it.",
      right: [
        "if (res.status === 429) {",
        '  const after = res.headers.get("Retry-After");',
        "  await sleep((Number(after) || 5) * 1000);",
        "}",
      ],
      why: "Retry-After tells you exactly how long to wait: wait at least that long.",
    }),
    mistake({
      title: "Counting the proxy, not the client",
      wrong: ["// behind a load balancer", "limit by req.ip"],
      problem:
        "Every request seems to come from the proxy's IP, so all users share one limit and get 429s together.",
      right: [
        "// trust the proxy's X-Forwarded-For",
        'app.set("trust proxy", 1);',
      ],
      why: "Tell the server how many proxies are in front, so it reads the real client IP.",
    }),
    mistake({
      title: "Counters in one server's memory",
      wrong: ["// 3 servers, each with its own Map", "limit: 100"],
      problem:
        "Each server counts separately, so a client really gets 300 requests, and a restart forgets every count.",
      right: ["// one shared store, e.g. Redis", "limit: 100"],
      why: "With several servers, keep the counts in a store they all share.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A token bucket",
      task: "Write `createBucket(size, perSecond)`. It starts full, at time 0. Its `take(now)` (now in ms) first adds `perSecond` tokens per second since the last call, never above `size`, then takes one token and returns `true`, or returns `false` if less than one is left.",
      starter: [
        "function createBucket(size, perSecond) {",
        "  let tokens = size;",
        "  let last = 0;",
        "  return {",
        "    take(now) {",
        "      return true;",
        "    },",
        "  };",
        "}",
      ],
      tests: [
        [
          "(() => { const b = createBucket(2, 1); return [b.take(0), b.take(0), b.take(0)]; })()",
          "[true, true, false]",
        ],
        [
          "(() => { const b = createBucket(2, 1); b.take(0); b.take(0); return b.take(1000); })()",
          "true",
        ],
        [
          "(() => { const b = createBucket(2, 1); return [b.take(0), b.take(60000), b.take(60000), b.take(60000)]; })()",
          "[true, true, true, false]",
        ],
      ],
      hint: "Add `(now - last) / 1000 * perSecond`, cap with `Math.min(size, …)`, set `last = now`, then check `tokens < 1`.",
      solution: [
        "function createBucket(size, perSecond) {",
        "  let tokens = size;",
        "  let last = 0;",
        "  return {",
        "    take(now) {",
        "      const add = ((now - last) / 1000) * perSecond;",
        "      tokens = Math.min(size, tokens + add);",
        "      last = now;",
        "      if (tokens < 1) return false;",
        "      tokens -= 1;",
        "      return true;",
        "    },",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Read Retry-After",
      task: 'Write `retryAfterMs(value, now)`. `value` is a Retry-After header: whole seconds like `"30"`, or an HTTP date. Return how many milliseconds to wait (never below 0), or `null` if it\'s neither.',
      starter: ["function retryAfterMs(value, now) {", "  return null;", "}"],
      tests: [
        ['retryAfterMs("30", 0)', "30000"],
        [
          'retryAfterMs("Wed, 21 Oct 2026 07:28:00 GMT", Date.parse("Wed, 21 Oct 2026 07:27:00 GMT"))',
          "60000",
        ],
        [
          'retryAfterMs("Wed, 21 Oct 2026 07:28:00 GMT", Date.parse("Wed, 21 Oct 2026 08:00:00 GMT"))',
          "0",
        ],
        ['retryAfterMs("soon", 0)', "null"],
      ],
      hint: "Test seconds with `/^\\d+$/`. Otherwise `Date.parse(value)`: NaN means null, else `Math.max(0, date - now)`.",
      solution: [
        "function retryAfterMs(value, now) {",
        "  if (/^\\d+$/.test(value)) {",
        "    return Number(value) * 1000;",
        "  }",
        "  const date = Date.parse(value);",
        "  if (Number.isNaN(date)) return null;",
        "  return Math.max(0, date - now);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Rate limits cheat sheet", [
      ["429", "Too Many Requests: over the limit.", "HTTP/1.1 429"],
      ["Retry-After", "Seconds (or a date) to wait.", "Retry-After: 30"],
      [
        "RateLimit-Policy",
        "The rule: quota and window.",
        'RateLimit-Policy: "api";q=100;w=900',
      ],
      [
        "RateLimit",
        "What's left, and when it resets.",
        'RateLimit: "api";r=42;t=310',
      ],
      [
        "X-RateLimit-*",
        "The older, non-standard style.",
        "X-RateLimit-Remaining: 42",
      ],
      ["Fixed window", "Resets on the clock; double bursts.", "100 per minute"],
      ["Sliding window", "The last N seconds from now.", "100 in the last 60s"],
      [
        "Token bucket",
        "Bursts up to size; steady refill.",
        "Size 10, 1/second",
      ],
      ["Login", "Much stricter, per IP and email.", "5 per 15 minutes"],
    ]),
    quickCheck(
      "A 429 response says `Retry-After: 20`. Your backoff would wait 2 seconds. How long should you wait?",
      [
        "2 seconds",
        "At least 20 seconds",
        "Don't wait, the next request may get through",
      ],
      1,
      "The server knows when the limit resets. Retry-After overrides your own guess; retrying sooner only earns another 429.",
    ),
  ),
);
