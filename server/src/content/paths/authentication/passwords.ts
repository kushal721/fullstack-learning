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

// Passwords: what to ask for: what a password is up against, what makes
// one strong, modern password rules, the Notes App's rule taken apart,
// reuse and credential stuffing, guessing online and offline, slowing
// guesses down step by step, never sending or logging passwords, never
// storing them, mistakes, practice and a recap.
export const passwordsModule = moduleLesson(
  "passwords",
  "Passwords: what to ask for",
  45,
  [
    "Explain why length and unpredictability make a password strong.",
    "Write modern password rules: a minimum length, long passphrases, no forced symbols or expiry.",
    "Describe credential stuffing and why refusing breached passwords helps.",
    "Tell online guessing from offline guessing, and how rate limits slow the first.",
    "Keep passwords out of URLs, logs and the database.",
  ],

  part(
    "why",
    "The most attacked thing you store",
    explain(
      "A password is a secret only the real user should know. It's still the most common way to log in, and the most attacked: people pick guessable ones, reuse them across sites, and sites leak them. Your job as a developer is to ask for good ones, slow down guessing, and never keep a copy that could leak.",
    ),
    analogy(
      "A password is like a house key. A long, odd key is hard to copy, but it's no use if the same key opens your car, office and gym locker too.",
    ),
    diagram([
      ["Pick", "long, unique"],
      ["Send", "HTTPS, in the body"],
      ["Check", "rate-limited"],
      ["Store", "only a hash"],
    ]),
  ),

  part(
    "strong",
    "What makes a password strong",
    explain(
      "Strength is how many guesses it takes. Two things matter: length and unpredictability. Each extra character multiplies the possibilities, so length beats a sprinkle of symbols. But `password123` is long and still guessed at once: attackers try common passwords, words and patterns first. Four random words are both long and unpredictable.",
    ),
    code(
      "js",
      "How many guesses, at worst",
      [
        "26 ** 8   // 8 lowercase letters",
        "// ≈ 2 × 10^11",
        "95 ** 8   // 8 of any key on a keyboard",
        "// ≈ 7 × 10^15",
        "7776 ** 4 // 4 random words from 7776",
        "// ≈ 4 × 10^15",
        "26 ** 16  // 16 lowercase letters",
        "// ≈ 4 × 10^22",
      ],
      {
        3: "symbols help a little",
        5: "easy to remember, as strong as random keys",
        7: "length helps far more",
      },
    ),
    keyPoints(
      "Length multiplies the guesses needed.",
      "Unpredictable: not a word, a name, a date or a keyboard pattern.",
      "A passphrase of random words is long and memorable.",
    ),
  ),

  part(
    "rules",
    "Modern password rules",
    explain(
      "Old rules (a capital, a digit, a symbol, change it every 90 days) made people write `Summer2024!` and then `Autumn2024!`. Today's [[password-policy|password rules]], such as NIST's, are simpler: ask for at least 8 characters (better 12 or more), allow long passphrases and every character, and refuse passwords known to be breached.",
    ),
    reference("Ask for, and don't ask for", [
      ["Minimum length", "At least 8; better 12 or more.", "length >= 12"],
      ["Allow long ones", "At least 64 characters, so passphrases fit."],
      [
        "Allow any character",
        "Spaces, emoji, accents: all fine.",
        "correct horse battery",
      ],
      [
        "Refuse breached ones",
        "Check a list of leaked passwords.",
        "123456, qwerty",
      ],
      ["No forced symbols", "People add a ! at the end; it barely helps."],
      ["No forced expiry", "Change it only when it may have leaked."],
      ["Allow paste", "So password managers work."],
    ]),
    quickCheck(
      "Which rule makes passwords stronger in practice?",
      [
        "Must contain a symbol and a digit",
        "Must be changed every 90 days",
        "At least 12 characters, and not a known-breached password",
      ],
      2,
      "Forced symbols and regular changes lead to predictable patterns like `Summer2024!`. Length and refusing leaked passwords make guessing far harder.",
    ),
  ),

  part(
    "notes-app-rule",
    "The Notes App's rule",
    explain(
      "The Notes App's `register` keeps it simple: 8 characters or more, any characters, no upper limit it checks. The Register page also has `minLength={8}` on its password input, which helps people see the rule before they send, but anyone can skip the page, so the server's check is the one that counts.",
    ),
    anatomy(
      "The password rule in register(), shortened",
      [
        "const PASSWORD_MIN_LENGTH = 8;",
        "if (password.length < PASSWORD_MIN_LENGTH)",
        "  return res.status(400).json({",
        '    error: "Password must be at least 8…" });',
      ],
      [
        [
          "PASSWORD_MIN_LENGTH = 8",
          "the rule",
          "One named constant, used in the check and the message.",
        ],
        [
          "password.length <",
          "length only",
          "No forced symbols, capitals or digits.",
        ],
        [
          "400",
          "bad input",
          "The request is wrong; the user can fix it and retry.",
        ],
        ["error", "a clear message", "Says exactly what to change."],
      ],
    ),
    inTheNotesApp(
      "register() in `authController.js` checks the length. It doesn't refuse breached passwords; that would be a good next step.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "reuse",
    "Reuse and credential stuffing",
    explain(
      "When a site leaks, attackers get millions of email and password pairs. They then try those same pairs on other sites: [[credential-stuffing|credential stuffing]]. It works because people reuse passwords. A password manager fixes that for users: it makes and remembers a different long random password for every site.",
    ),
    explain(
      "Your part: refuse breached passwords at sign-up. Have I Been Pwned's Pwned Passwords service lets you check one without sending it: you send the first 5 characters of its SHA-1 hash and compare the list that comes back. Limiting login attempts and offering two-factor login help too.",
    ),
    keyPoints(
      "One leak exposes every site where that password is reused.",
      "Password managers: unique, long, random, and pasted in.",
      "Refuse known-breached passwords at sign-up.",
    ),
  ),

  part(
    "guessing",
    "Guessing online and offline",
    explain(
      "A [[brute-force-attack|brute-force attack]] tries guess after guess. Online, each guess is a request to your login route, so you can slow it down: a rate limit, as in HTTP & APIs, answers 429 after a few failures. Offline, the attacker has stolen your database and guesses on their own computers, as fast as the hash allows. Only a slow hash helps there.",
    ),
    reference("Two kinds of guessing", [
      [
        "Online",
        "Through your login route. Slowed by rate limits.",
        "~5 tries per 15 min",
      ],
      [
        "Offline",
        "Against stolen hashes. Slowed only by a slow hash.",
        "billions/s for SHA-256",
      ],
    ]),
    code(
      "js",
      "A login rate limit (the Notes App has none)",
      [
        'import rateLimit from "express-rate-limit";',
        "const loginLimiter = rateLimit({",
        "  windowMs: 15 * 60 * 1000,",
        "  limit: 5,",
        "});",
        'authRoutes.post("/login", loginLimiter,',
        "  authController.login);",
      ],
      {
        3: "a 15-minute window",
        4: "the 6th try in it gets 429",
        6: "only on the login route",
      },
    ),
  ),

  part(
    "slowing",
    "Slowing guesses down, step by step",
    explain(
      "Here's an attacker trying common passwords against one account, with a limit of 3 tries. A real limiter counts per IP address or email in a time window; this one just counts.",
    ),
    trace(
      "Three tries, then 429",
      [
        'const guesses = ["123456", "password",',
        '  "qwerty", "letmein"];',
        "const limit = 3;",
        "let tries = 0;",
        "for (const guess of guesses) {",
        "  tries++;",
        "  if (tries > limit) {",
        '    console.log("429 Too Many Requests");',
        "    break;",
        "  }",
        '  console.log("401 wrong:", guess);',
        "}",
      ],
      [
        {
          line: 1,
          note: "The attacker's list: the most common passwords first.",
          vars: [["guesses", '["123456", "password", "qwerty", "letmein"]']],
        },
        {
          line: 4,
          note: "The limit is 3, and no tries yet.",
          vars: [
            ["guesses", '["123456", "password", "qwerty", "letmein"]'],
            ["limit", "3"],
            ["tries", "0"],
          ],
        },
        {
          line: 11,
          note: "Try 1 is under the limit, so the password is checked: wrong, 401.",
          vars: [
            ["guesses", '["123456", "password", "qwerty", "letmein"]'],
            ["limit", "3"],
            ["tries", "1"],
            ["guess", '"123456"'],
          ],
          output: "401 wrong: 123456",
        },
        {
          line: 11,
          note: "Try 2: checked, wrong.",
          vars: [
            ["guesses", '["123456", "password", "qwerty", "letmein"]'],
            ["limit", "3"],
            ["tries", "2"],
            ["guess", '"password"'],
          ],
          output: "401 wrong: password",
        },
        {
          line: 11,
          note: "Try 3: checked, wrong. That was the last allowed one.",
          vars: [
            ["guesses", '["123456", "password", "qwerty", "letmein"]'],
            ["limit", "3"],
            ["tries", "3"],
            ["guess", '"qwerty"'],
          ],
          output: "401 wrong: qwerty",
        },
        {
          line: 7,
          note: "Try 4 is over the limit. The password isn't even checked.",
          vars: [
            ["guesses", '["123456", "password", "qwerty", "letmein"]'],
            ["limit", "3"],
            ["tries", "4"],
            ["guess", '"letmein"'],
          ],
        },
        {
          line: 8,
          note: "The server answers 429 and stops. The attacker must wait for the window to end.",
          vars: [
            ["guesses", '["123456", "password", "qwerty", "letmein"]'],
            ["limit", "3"],
            ["tries", "4"],
            ["guess", '"letmein"'],
          ],
          output: "429 Too Many Requests",
        },
      ],
    ),
  ),

  part(
    "never-log",
    "Never send or log a password",
    explain(
      "A password should exist in as few places as possible. It travels once, at login or sign-up, in a POST body over HTTPS. Never in a URL: URLs end up in browser history, server logs and analytics. And never in your own logs: whoever can read the logs could then log in as anyone.",
    ),
    code(
      "js",
      "Log what happened, not what was typed",
      [
        "// never:",
        'console.log("login", req.body);',
        "// fine:",
        'console.log("login failed", email);',
      ],
      {
        2: "the body holds the password",
        4: "no password, no hash",
      },
    ),
    inTheNotesApp(
      "The error handler in `app.js` logs the error, never `req.body`, and the login form sends a POST with a JSON body.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "never-store",
    "Never store it as typed",
    explain(
      "If the users table held passwords as typed, one leaked backup or one SQL injection bug would hand out every password, and because of reuse, many email accounts and banks too. That's [[why-never-store-plain-passwords|why you never store plain passwords]]. The server keeps a scrambled value it can check a login against but can't turn back. That's hashing, the next step.",
    ),
    code(
      "sql",
      "The users table keeps a hash, not the password",
      [
        "CREATE TABLE users (",
        "  id SERIAL PRIMARY KEY,",
        "  email TEXT NOT NULL UNIQUE,",
        "  password_hash TEXT NOT NULL",
        ");",
      ],
      { 4: "a bcrypt hash; there is no password column" },
    ),
    keyPoints(
      "No password column, ever: only password_hash.",
      "Not encrypted either: anything that can be decrypted can leak.",
      "Not even support staff should be able to see a password.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Rules that make passwords weaker",
      wrong: [
        "if (!/[A-Z]/.test(pw) || !/[!@#]/.test(pw))",
        '  return "Add a capital and a symbol";',
        "if (pw.length > 16)",
        '  return "At most 16 characters";',
      ],
      problem:
        "People add a capital and ! to a word, and passphrases are refused. Passwords get shorter and more predictable.",
      right: [
        "if (pw.length < 12)",
        '  return "Use at least 12 characters";',
        "if (breached.has(pw))",
        '  return "That password has leaked";',
      ],
      why: "Length and refusing leaked passwords are what actually slow guessing down.",
    }),
    mistake({
      title: "The password in the URL",
      wrong: ["fetch(`/api/auth/login?password=${pw}`)"],
      problem:
        "The URL is saved in browser history and server logs, where anyone who reads them sees the password.",
      right: [
        'fetch("/api/auth/login", {',
        '  method: "POST",',
        "  body: JSON.stringify({ email, password }),",
        "})",
      ],
      why: "A POST body over HTTPS isn't written into URLs or access logs.",
    }),
    mistake({
      title: "Only the browser checks the rule",
      language: "jsx",
      wrong: [
        '<input type="password" minLength={8} />',
        "// and no check on the server",
      ],
      problem:
        "Anyone can send a request with curl and skip the page, so a 1-character password gets in.",
      right: [
        '<input type="password" minLength={8} />',
        "// and register() checks length too",
      ],
      why: "The browser check is a friendly hint; the server's check is the rule.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Check a new password",
      task: 'Write `checkPassword(pw, breached)`. `breached` is an array of leaked passwords. Return `"Use at least 8 characters"` if `pw` is shorter than 8, `"That password has appeared in a data breach"` if it\'s in `breached`, and `null` if it\'s fine.',
      starter: [
        "function checkPassword(pw, breached) {",
        "  return null;",
        "}",
      ],
      tests: [
        ['checkPassword("cat", [])', '"Use at least 8 characters"'],
        [
          'checkPassword("password123", ["123456", "password123"])',
          '"That password has appeared in a data breach"',
        ],
        ['checkPassword("purple tractor river", ["123456"])', "null"],
        [
          'checkPassword("12345678", ["12345678"])',
          '"That password has appeared in a data breach"',
        ],
      ],
      hint: "Check the length first, then `breached.includes(pw)`.",
      solution: [
        "function checkPassword(pw, breached) {",
        "  if (pw.length < 8) {",
        '    return "Use at least 8 characters";',
        "  }",
        "  if (breached.includes(pw)) {",
        '    return "That password has appeared in a data breach";',
        "  }",
        "  return null;",
        "}",
      ],
    }),
    yourTurn({
      title: "A simple strength meter",
      task: 'Write `strength(pw)`. Return `"weak"` if it\'s under 8 characters or has fewer than 5 different characters, `"ok"` for 8 to 11 characters, and `"strong"` for 12 or more.',
      starter: ["function strength(pw) {", '  return "strong";', "}"],
      tests: [
        ['strength("abc")', '"weak"'],
        ['strength("aaaaaaaaaaaaaa")', '"weak"'],
        ['strength("tulip42x")', '"ok"'],
        ['strength("purple tractor river")', '"strong"'],
      ],
      hint: "`new Set(pw).size` counts the different characters.",
      solution: [
        "function strength(pw) {",
        "  const different = new Set(pw).size;",
        '  if (pw.length < 8 || different < 5) return "weak";',
        '  if (pw.length < 12) return "ok";',
        '  return "strong";',
        "}",
      ],
    }),
    yourTurn({
      title: "A login limiter",
      task: "Write `makeLimiter(limit)`. It returns a function `attempt(email)` that returns `true` for the first `limit` attempts for that email and `false` after that. Each email is counted on its own.",
      starter: [
        "function makeLimiter(limit) {",
        "  return function attempt(email) {",
        "    return true;",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const attempt = makeLimiter(2); return [attempt("a@x.io"), attempt("a@x.io"), attempt("a@x.io")]; })()',
          "[true, true, false]",
        ],
        [
          '(() => { const attempt = makeLimiter(1); return [attempt("a@x.io"), attempt("b@x.io"), attempt("a@x.io")]; })()',
          "[true, true, false]",
        ],
      ],
      hint: "Keep a `Map` from email to count outside the inner function. Add one, then compare with `limit`.",
      solution: [
        "function makeLimiter(limit) {",
        "  const tries = new Map();",
        "  return function attempt(email) {",
        "    const n = (tries.get(email) ?? 0) + 1;",
        "    tries.set(email, n);",
        "    return n <= limit;",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Passwords cheat sheet", [
      ["Strength", "Length and unpredictability.", "four random words"],
      ["Minimum", "At least 8; better 12 or more.", "Notes App: 8"],
      ["Allow", "Long passphrases, any character, paste."],
      ["Don't force", "Symbols, capitals, or changes every 90 days."],
      [
        "Refuse breached",
        "Leaked passwords are tried first.",
        "123456, password1",
      ],
      [
        "Credential stuffing",
        "Leaked pairs tried on other sites; reuse makes it work.",
      ],
      ["Password manager", "A unique random password for every site."],
      [
        "Online guessing",
        "Slowed by a rate limit on login.",
        "429 after 5 tries",
      ],
      [
        "Offline guessing",
        "Against stolen hashes; slowed only by a slow hash.",
      ],
      ["Never", "In a URL, in a log, or stored as typed."],
    ]),
    quickCheck(
      "An attacker has stolen a copy of your users table. Which defence still slows them down?",
      [
        "The rate limit on the login route",
        "A deliberately slow password hash",
        "minLength={8} on the Register page",
      ],
      1,
      "With a stolen copy, guessing happens offline on the attacker's own computers, so your rate limit never sees it. Only a slow hash makes each guess expensive. That's the next step.",
    ),
  ),
);
