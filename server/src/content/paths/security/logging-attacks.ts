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

// Logging attacks: noticing an attack, an audit entry taken apart, what to
// audit, writing audit lines, log injection, log injection step by step,
// redaction, what attacks look like in logs, alerts, the Notes App, mistakes,
// practice and a recap.
export const loggingAttacksModule = moduleLesson(
  "logging-attacks",
  "Logging and spotting attacks",
  50,
  [
    "Write an audit log entry with who, what, when, the target and the outcome.",
    "Explain log injection and stop it with structured JSON logs.",
    "Redact passwords, tokens and cookies before anything is logged.",
    "Recognise what brute force, credential stuffing and probing look like in logs.",
    "Turn a few clear signals into alerts that reach a person.",
  ],

  part(
    "why",
    "You can't stop what you can't see",
    explain(
      "Every defence so far stops an attack. This step is about noticing one: a burst of failed logins, someone walking through note ids, a deleted note nobody admits to. Logs record what happened; alerts make sure a person hears about it while it's happening, not months later.",
    ),
    diagram([
      ["Something happens", "a failed login"],
      ["A log line", "who, what, when"],
      ["A rule", "50 failures in 5 min?"],
      ["A person", "looks now"],
    ]),
    keyPoints(
      "Logs answer: what happened, and to whom?",
      "Alerts answer: is something happening right now?",
      "Neither helps if it leaks secrets or can be forged.",
    ),
  ),

  part(
    "audit-entry",
    "An audit entry, taken apart",
    explain(
      "An [[audit-log|audit log]] records actions that matter, one entry each, always with the same fields. It's the defence against repudiation from STRIDE: when a note disappears, the log says who deleted it, when, and from where. Write it as [[structured-logging|structured]] JSON so tools can search it.",
    ),
    anatomy(
      "One audit entry",
      [
        '{ time: "2026-11-27T09:14:02Z",',
        '  userId: 3, action: "note.delete",',
        '  target: "note:8", outcome: "ok",',
        '  ip: "203.0.113.7", reqId: "r7" }',
      ],
      [
        ["time:", "when", "UTC, to the second. Every server's clock agrees."],
        ["userId: 3", "who", "From req.user, never from the request body."],
        [
          'action: "note.delete"',
          "what",
          "A fixed name per action, easy to search and count.",
        ],
        ['target: "note:8"', "to what", "The thing the action touched."],
        [
          'outcome: "ok"',
          "did it work",
          "ok, denied or failed. Failures matter as much as successes.",
        ],
        [
          'reqId: "r7"',
          "which request",
          "A request id ties this entry to the request's other log lines.",
        ],
      ],
    ),
  ),

  part(
    "what-to-audit",
    "What to audit",
    explain(
      "Audit what you'd need to answer \"who did this?\" after an incident: logins and failed logins, account changes, deletes, and refusals. Not every read: that's noise. Keep the audit log apart from debug output, send it off the server so an intruder can't quietly edit it, and keep it for a set time.",
    ),
    reference("Audit these", [
      [
        "login.ok / login.failed",
        "Every login attempt, with the email tried.",
        'action: "login.failed", email',
      ],
      ["logout", "Ends a session.", 'action: "logout", userId: 3'],
      [
        "register",
        "A new account: spot mass sign-ups.",
        'action: "register", userId: 12',
      ],
      [
        "password.change",
        "The first thing an account thief does.",
        'action: "password.change"',
      ],
      ["note.delete", "Can't be undone.", 'target: "note:8"'],
      ["denied", "401s, and 404s for others' notes.", 'outcome: "denied"'],
      ["rate.limited", "Someone hit a limit.", 'action: "rate.limited", ip'],
    ]),
  ),

  part(
    "writing",
    "Writing audit lines",
    explain(
      "One small function keeps every entry the same shape. It takes who and where from `req` and the rest from the caller, and writes one JSON line. In a real app a logger such as pino would send it to a log service; `console.log` of JSON is the simplest version of the same idea.",
    ),
    code(
      "js",
      "An audit helper (not in the Notes App)",
      [
        "function audit(req, action, fields) {",
        "  console.log(JSON.stringify({",
        '    type: "audit",',
        "    time: new Date().toISOString(),",
        "    reqId: req.id,",
        "    userId: req.user?.id ?? null,",
        "    ip: req.ip,",
        "    action,",
        "    ...fields,",
        "  }));",
        "}",
        'audit(req, "login.failed", { email });',
      ],
      {
        2: "one JSON line per entry",
        6: "null before login",
        9: "target, outcome, email…",
        12: "in login, after a wrong password",
      },
    ),
  ),

  part(
    "log-injection",
    "Log injection",
    explain(
      "If you build log lines by gluing text, input can forge lines. [[log-injection|Log injection]] puts a newline in a field, so the rest becomes a new, fake entry. The Notes App's login only checks that an email was sent, so `x@y\\nINFO login ok admin` gets through. A JSON logger writes the newline as `\\n` inside the string, so it can never start a new line.",
    ),
    code(
      "bash",
      "A plain-text log, after one attack",
      [
        "WARN login failed x@y",
        "INFO login ok admin@notes.app",
        "WARN login failed x@y",
      ],
      {
        1: "the real line",
        2: "forged: it was part of the email",
      },
    ),
  ),

  part(
    "injection-step",
    "Log injection, step by step",
    explain(
      "Here the same attacker's email is logged twice: once glued into a sentence, once as a JSON field. Watch what each one prints.",
    ),
    trace(
      "Glued text vs JSON",
      [
        'const email = "x@y\\nINFO login ok admin";',
        'const plain = "WARN login failed " + email;',
        "const safe = JSON.stringify({",
        '  level: "warn",',
        '  msg: "login failed",',
        "  email,",
        "});",
        "console.log(plain);",
        "console.log(safe);",
      ],
      [
        {
          line: 1,
          note: "The attacker typed a real newline into the email field.",
          vars: [["email", '"x@y\\nINFO login ok admin"']],
        },
        {
          line: 2,
          note: "Glued into a sentence, the newline is still a real newline.",
          vars: [
            ["email", '"x@y\\nINFO login ok admin"'],
            ["plain", '"WARN login failed x@y\\nINFO…"'],
          ],
        },
        {
          line: 3,
          note: "JSON.stringify turns the newline into the two characters \\ and n.",
          vars: [
            ["email", '"x@y\\nINFO login ok admin"'],
            ["plain", '"WARN login failed x@y\\nINFO…"'],
            ["safe", '\'{"level":"warn",…}\''],
          ],
        },
        {
          line: 8,
          note: "Two lines come out. The second looks exactly like a real success.",
          vars: [
            ["email", '"x@y\\nINFO login ok admin"'],
            ["plain", '"WARN login failed x@y\\nINFO…"'],
            ["safe", '\'{"level":"warn",…}\''],
          ],
          output: "WARN login failed x@y\nINFO login ok admin",
        },
        {
          line: 9,
          note: "One line. The fake entry is stuck inside the email field, plain to see.",
          vars: [
            ["email", '"x@y\\nINFO login ok admin"'],
            ["plain", '"WARN login failed x@y\\nINFO…"'],
            ["safe", '\'{"level":"warn",…}\''],
          ],
          output:
            'WARN login failed x@y\nINFO login ok admin\n{"level":"warn","msg":"login failed","email":"x@y\\nINFO login ok admin"}',
        },
      ],
    ),
  ),

  part(
    "redaction",
    "Redact before you log",
    explain(
      "Logs are read by more people and kept longer than your database. Anything in them leaks with them. [[log-redaction|Log redaction]] removes secrets before a line is written: passwords, tokens, cookies, the Authorization header. Do it in the logger's settings, so one forgotten field can't slip through. Keep personal data to what you need.",
    ),
    code(
      "js",
      "pino blanks named fields everywhere",
      [
        "const logger = pino({",
        "  redact: {",
        "    paths: [",
        '      "req.headers.cookie",',
        '      "req.headers.authorization",',
        '      "*.password",',
        "    ],",
        '    censor: "[REDACTED]",',
        "  },",
        "});",
      ],
      {
        4: "the login cookie",
        6: "body.password, or any x.password",
        8: "what's written instead",
      },
    ),
    keyPoints(
      "Never: passwords, tokens, cookies, API keys.",
      "Careful: emails and IPs are personal data.",
      "Never log whole request bodies on auth routes.",
    ),
  ),

  part(
    "signals",
    "What attacks look like",
    explain(
      "Most attacks are loud in the logs if you know the shape. Brute force is many failures for one email. [[credential-stuffing|Credential stuffing]] is failures spread across many emails and IPs, with a few successes mixed in. Someone walking through note ids gets a run of 404s. Injection attempts leave quotes and angle brackets in rejected input.",
    ),
    reference("Attack shapes in logs", [
      [
        "Brute force",
        "Many login.failed for one email.",
        "200 failures for ana@… in 10 min",
      ],
      [
        "Credential stuffing",
        "Failures across many emails and IPs; a few ok.",
        "3,000 emails, 900 IPs, 12 successes",
      ],
      [
        "Id probing",
        "One user, a run of 404s on other ids.",
        "GET /api/notes/1, /2, /3 … all 404",
      ],
      ["Injection probing", "400s with odd input.", 'title: "\' OR 1=1--"'],
      [
        "Scanning",
        "404s for files that don't exist.",
        "GET /.env, /wp-admin, /.git/config",
      ],
      ["Error burst", "Many 500s at once.", "120 × 500 in one minute"],
    ]),
  ),

  part(
    "alerts",
    "Alerts that reach a person",
    explain(
      "Logs nobody reads stop no one. A [[security-alert|security alert]] watches for a few clear signals and messages a person: a chat channel, email or a pager. Pick thresholds well above normal, or people learn to ignore the noise. Start with failed-login spikes, 401 and 404 bursts from one IP, and 500 bursts.",
    ),
    code(
      "js",
      "A failed-login alert (not in the Notes App)",
      [
        "const FIVE_MIN = 5 * 60 * 1000;",
        "function checkLogins(events, now) {",
        "  const failed = events.filter((e) =>",
        '    e.action === "login.failed" &&',
        "    e.time > now - FIVE_MIN);",
        "  if (failed.length >= 50) {",
        "    notify(`${failed.length} failed",
        "      logins in 5 minutes`);",
        "  }",
        "}",
      ],
      {
        3: "only failures in the last 5 minutes",
        6: "far above a normal day",
        7: "chat, email or pager: a person",
      },
    ),
    quickCheck(
      "Your team gets an alert for every single 401. After a week they mute the channel. What went wrong?",
      [
        "Alerts are pointless",
        "The threshold was too low: it alerted on normal traffic",
        "401s should be 500s",
      ],
      1,
      "People mistype passwords all day, so one 401 is normal. Alert on clear outliers, such as 50 failures in 5 minutes, so every alert is worth looking at.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App",
    explain(
      'The Notes App logs one thing: the error handler\'s `console.error(err)`, which keeps details on the server and tells the user only "Something went wrong". It has no audit log, no request log and no alerts, so a password-guessing run or a deleted note leaves no trace. The audit calls would go in the controllers, right where each outcome is known.',
    ),
    code(
      "js",
      "login with audit lines (not in the Notes App)",
      [
        "if (!passwordMatches) {",
        '  audit(req, "login.failed", { email });',
        "  return res.status(401).json({",
        '    error: "Invalid email or password",',
        "  });",
        "}",
        "// … sign the token, set the cookie",
        'audit(req, "login.ok", { userId: user.id });',
      ],
      {
        2: "the email tried, never the password",
        8: "req.user isn't set yet on login",
      },
    ),
    inTheNotesApp(
      "The error handler at the end of createApp is the only place the Notes App logs anything.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Logging the login body",
      wrong: ['console.log("login", req.body);'],
      problem:
        "Every password anyone types, right or wrong, is written to the logs in plain text.",
      right: ['audit(req, "login.failed",', "  { email: req.body.email });"],
      why: "Log only the fields you need, and redact secrets in the logger's settings too.",
    }),
    mistake({
      title: "Gluing input into a log line",
      wrong: ['console.log("login failed " + email);'],
      problem:
        "A newline in the email forges a whole new log entry, such as a fake successful login.",
      right: [
        "console.log(JSON.stringify(",
        '  { msg: "login failed", email }));',
      ],
      why: "JSON escapes newlines, so input stays inside its field.",
    }),
    mistake({
      title: "Alerting on every failure",
      wrong: ['if (e.action === "login.failed")', "  notify(e);"],
      problem:
        "Typos happen all day. The channel fills up, people mute it, and the real attack is missed.",
      right: ["if (failedLast5Min >= 50)", "  notify(summary);"],
      why: "Alert on clear outliers only, so every message deserves a look.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Redact before logging",
      task: 'Write `redact(entry, secrets)`. Return a copy of the object where every key named in `secrets` (ignoring case, at any depth of nested objects) has the value `"[REDACTED]"`. Don\'t change the original.',
      starter: ["function redact(entry, secrets) {", "  return entry;", "}"],
      tests: [
        [
          'redact({ email: "a@x.com", password: "pw" }, ["password"])',
          '{ email: "a@x.com", password: "[REDACTED]" }',
        ],
        [
          'redact({ headers: { cookie: "token=abc", host: "x" } }, ["cookie"])',
          '{ headers: { cookie: "[REDACTED]", host: "x" } }',
        ],
        [
          'redact({ Authorization: "Bearer t" }, ["authorization"])',
          '{ Authorization: "[REDACTED]" }',
        ],
        [
          '(() => { const e = { password: "pw" }; redact(e, ["password"]); return e.password; })()',
          '"pw"',
        ],
      ],
      hint: 'Build a new object with a loop over `Object.entries`. If `secrets` includes `key.toLowerCase()`, use `"[REDACTED]"`; if the value is an object, call `redact` on it; otherwise copy it.',
      solution: [
        "function redact(entry, secrets) {",
        "  const out = {};",
        "  for (const [k, v] of Object.entries(entry)) {",
        "    if (secrets.includes(k.toLowerCase())) {",
        '      out[k] = "[REDACTED]";',
        '    } else if (v && typeof v === "object") {',
        "      out[k] = redact(v, secrets);",
        "    } else {",
        "      out[k] = v;",
        "    }",
        "  }",
        "  return out;",
        "}",
      ],
    }),
    yourTurn({
      title: "Make text safe for a plain log",
      task: "Some old systems only take plain-text logs. Write `cleanForLog(text)`: replace every carriage return with the two characters `\\r` and every newline with the two characters `\\n`, so input can never start a new line.",
      starter: ["function cleanForLog(text) {", "  return text;", "}"],
      tests: [
        ['cleanForLog("ana@example.com")', '"ana@example.com"'],
        ['cleanForLog("x@y\\nINFO login ok")', '"x@y\\\\nINFO login ok"'],
        ['cleanForLog("a\\r\\nb\\nc")', '"a\\\\r\\\\nb\\\\nc"'],
      ],
      hint: 'Two `replaceAll` calls: `"\\r"` with `"\\\\r"`, then `"\\n"` with `"\\\\n"`.',
      solution: [
        "function cleanForLog(text) {",
        "  return text",
        '    .replaceAll("\\r", "\\\\r")',
        '    .replaceAll("\\n", "\\\\n");',
        "}",
      ],
    }),
    yourTurn({
      title: "Should we alert?",
      task: 'Write `shouldAlert(events, now, limit)`. Count events whose `action` is `"login.failed"` and whose `time` is greater than `now - 300000` (the last 5 minutes). Return `true` if the count is at least `limit`.',
      starter: [
        "function shouldAlert(events, now, limit) {",
        "  return events.length >= limit;",
        "}",
      ],
      tests: [
        [
          'shouldAlert([{ action: "login.failed", time: 900000 }, { action: "login.failed", time: 950000 }], 1000000, 2)',
          "true",
        ],
        [
          'shouldAlert([{ action: "login.ok", time: 900000 }, { action: "login.failed", time: 950000 }], 1000000, 2)',
          "false",
        ],
        [
          'shouldAlert([{ action: "login.failed", time: 100000 }, { action: "login.failed", time: 950000 }], 1000000, 2)',
          "false",
        ],
        ["shouldAlert([], 1000000, 1)", "false"],
      ],
      hint: "Filter on both conditions, then compare the filtered length with `limit`.",
      solution: [
        "function shouldAlert(events, now, limit) {",
        "  const failed = events.filter((e) =>",
        '    e.action === "login.failed" &&',
        "    e.time > now - 300000);",
        "  return failed.length >= limit;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Logging attacks cheat sheet", [
      [
        "Audit log",
        "Who did what, when, to what, and the outcome.",
        '{ userId: 3, action: "note.delete" }',
      ],
      [
        "What to audit",
        "Logins, failures, account changes, deletes, denials.",
        "login.failed, password.change",
      ],
      [
        "Keep it safe",
        "Off the server, append-only, kept for a set time.",
        "a log service, not a local file",
      ],
      [
        "Log injection",
        "A newline in input forges a log line.",
        '"x@y\\nINFO login ok admin"',
      ],
      [
        "The fix",
        "Structured JSON: newlines stay inside fields.",
        "JSON.stringify({ msg, email })",
      ],
      [
        "Log redaction",
        "Blank secrets in the logger's settings.",
        'redact: ["req.headers.cookie"]',
      ],
      [
        "Never log",
        "Passwords, tokens, cookies, API keys.",
        "req.body on login",
      ],
      [
        "Attack shapes",
        "Failure spikes, 404 runs, odd input, 500 bursts.",
        "GET /api/notes/1, /2, /3 … 404",
      ],
      [
        "Alerts",
        "A few clear outliers that reach a person.",
        "50 login.failed in 5 min",
      ],
    ]),
    quickCheck(
      "Which log line is safe to write after a failed login?",
      [
        "The whole request body",
        'JSON with action "login.failed" and the email',
        "The email and the password tried",
      ],
      1,
      "A JSON entry with the action and the email tried is enough to spot attacks. The body holds the password, which must never be logged, and JSON keeps a newline in the email from forging a line.",
    ),
  ),
);
