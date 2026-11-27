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

// The toy hash the exercises use: small, plain JavaScript, NOT secure.
const toyHash = [
  "function hash(text) {",
  "  let h = 7;",
  "  for (const ch of text)",
  "    h = (h * 31 + ch.charCodeAt(0)) % 9973;",
  "  return h;",
  "}",
];

// Hashing passwords: hash functions, why fast hashes are wrong for
// passwords, salts step by step, a bcrypt hash taken apart, the work
// factor, hash at sign-up and compare at login in the Notes App,
// constant-time comparison, Argon2, rehashing with a higher cost,
// mistakes, practice and a recap.
export const hashingModule = moduleLesson(
  "hashing",
  "Hashing passwords",
  50,
  [
    "Explain what a hash function is and why a fast one is wrong for passwords.",
    "Explain how a salt gives equal passwords different hashes.",
    "Read a bcrypt hash: version, cost, salt and hash.",
    "Hash a password at sign-up with bcrypt.hash and check it at login with bcrypt.compare.",
    "Choose a work factor, compare secrets in constant time, and rehash when the cost goes up.",
  ],

  part(
    "hash-functions",
    "Hash functions: one way only",
    explain(
      "A [[hash-function|hash function]] turns any input into a fixed-size fingerprint. The same input always gives the same output, a tiny change gives a completely different one, and there's no way to run it backwards. So a server can check a password by hashing what was typed and comparing, without keeping the password.",
    ),
    code(
      "js",
      "SHA-256 in Node.js",
      [
        'import crypto from "node:crypto";',
        "const sha256 = (text) => crypto",
        '  .createHash("sha256")',
        '  .update(text).digest("hex");',
        'sha256("hello"); // "2cf24dba5f…"',
        'sha256("hello"); // "2cf24dba5f…" again',
        'sha256("hellp"); // "fdd7585e08…"',
      ],
      {
        5: "64 hex characters; only the start shown",
        6: "same input, same output, every time",
        7: "one letter changed: nothing alike",
      },
    ),
    analogy(
      "Like a fingerprint: easy to take from a person, it identifies them, but you can't rebuild the person from it.",
    ),
  ),

  part(
    "fast-is-wrong",
    "Why a fast hash is wrong for passwords",
    explain(
      "SHA-256 was built to be fast, for checking files. That's exactly wrong for passwords. If your users table leaks, an attacker hashes guess after guess and compares, offline. A graphics card can try billions of SHA-256 guesses a second. [[password-hashing|Password hashing]] uses functions that are slow on purpose, so each guess costs real time.",
    ),
    diagram([
      ["Leaked hash", "from the users table"],
      ["Guess", 'hash("sunshine1")'],
      ["Compare", "equal? cracked"],
    ]),
    keyPoints(
      "Fast hashes (MD5, SHA-1, SHA-256): fine for files, wrong for passwords.",
      "Password hashes (bcrypt, Argon2) are slow on purpose.",
      "Slow means a quarter second per login, but years for billions of guesses.",
    ),
  ),

  part(
    "salting",
    "Salt: same password, different hashes",
    explain(
      "Without a salt, everyone using `sunshine1` gets the same hash. Attackers keep huge precomputed tables of hash → password (rainbow tables), so cracking is one lookup, and every match cracks many accounts at once. A [[salting|salt]] is a random value stored with each hash and mixed in before hashing. It isn't secret; it just makes every hash unique.",
    ),
    trace(
      "The same password with two salts (a toy hash)",
      [
        ...toyHash,
        'const pw = "sunshine1";',
        "console.log(hash(pw));",
        'const a = hash("x7" + pw);',
        'const b = hash("q2" + pw);',
        "console.log(a, b);",
      ],
      [
        {
          line: 7,
          note: "A toy hash function (not secure, just small) and a password two users both chose.",
          vars: [
            ["hash", "function"],
            ["pw", '"sunshine1"'],
          ],
        },
        {
          line: 8,
          note: "Unsalted, both users store 487. Crack one and you've cracked both.",
          vars: [
            ["hash", "function"],
            ["pw", '"sunshine1"'],
          ],
          output: "487",
        },
        {
          line: 9,
          note: 'User A\'s random salt is "x7". The hash of "x7sunshine1" is 3407.',
          vars: [
            ["hash", "function"],
            ["pw", '"sunshine1"'],
            ["a", "3407"],
          ],
        },
        {
          line: 10,
          note: 'User B\'s salt is "q2": a completely different hash for the same password.',
          vars: [
            ["hash", "function"],
            ["pw", '"sunshine1"'],
            ["a", "3407"],
            ["b", "1592"],
          ],
        },
        {
          line: 11,
          note: "Equal passwords no longer look equal, and a ready-made table is useless.",
          vars: [
            ["hash", "function"],
            ["pw", '"sunshine1"'],
            ["a", "3407"],
            ["b", "1592"],
          ],
          output: "3407 1592",
        },
      ],
    ),
  ),

  part(
    "bcrypt",
    "A bcrypt hash, taken apart",
    explain(
      "[[bcrypt]] is a password hash that makes a fresh random salt for you and is slow on purpose. Its result is a 60-character string holding everything needed to check a login later: the version, the cost, the salt and the hash. Here's the demo user's from the Notes App's `seed.sql`, split into its pieces.",
    ),
    anatomy(
      "The demo user's hash, one piece per line",
      [
        "$2b$",
        "12$",
        "O7mKyRkPczpSxhgK2rD7Qu",
        "ZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO",
      ],
      [
        ["$2b$", "version", "2b is the current bcrypt version."],
        [
          "12$",
          "cost",
          "The work factor: 2¹² = 4,096 rounds of the slow part.",
        ],
        [
          "O7mKyRkPczpSxhgK2rD7Qu",
          "salt",
          "22 characters: a random salt made at sign-up.",
        ],
        [
          "ZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO",
          "hash",
          "31 characters: the result for salt + password.",
        ],
      ],
    ),
    keyPoints(
      "One column holds it all: no separate salt column needed.",
      "bcrypt.compare reads the cost and salt back out of the string.",
      "bcrypt only uses a password's first 72 bytes; longer ones are cut.",
    ),
  ),

  part(
    "work-factor",
    "The work factor",
    explain(
      "The [[work-factor|work factor]] (bcrypt's cost) sets how slow each hash is. Each step up doubles the work. Pick a cost that takes about a quarter of a second on your server: nobody notices at login, but an attacker's billions of guesses become thousands. As computers get faster, you raise it.",
    ),
    reference("bcrypt cost, roughly, on a typical server", [
      ["10", "About 60 ms per hash.", "bcrypt.hash(pw, 10)"],
      ["12", "About 250 ms: the Notes App's choice.", "bcrypt.hash(pw, 12)"],
      ["14", "About 1 second: slow for people.", "bcrypt.hash(pw, 14)"],
    ]),
    yourTurn({
      title: "How much slower?",
      task: "Write `slowdown(costFrom, costTo)`: how many times slower a bcrypt hash gets when the cost goes from `costFrom` to `costTo`. Each step doubles the work.",
      starter: [
        "function slowdown(costFrom, costTo) {",
        "  return costTo - costFrom;",
        "}",
      ],
      tests: [
        ["slowdown(10, 12)", "4"],
        ["slowdown(12, 12)", "1"],
        ["slowdown(12, 15)", "8"],
        ["slowdown(4, 12)", "256"],
      ],
      hint: "Doubling n times is 2 ** n.",
      solution: [
        "function slowdown(costFrom, costTo) {",
        "  return 2 ** (costTo - costFrom);",
        "}",
      ],
    }),
  ),

  part(
    "hash-and-compare",
    "Hash at sign-up, compare at login",
    explain(
      "Two calls do all of it. At sign-up, `bcrypt.hash(password, 12)` makes a salt, hashes and returns the string to store. At login, `bcrypt.compare(password, storedHash)` takes the cost and salt from the stored string, hashes the typed password the same way, and says if they match. Both return promises, so `await` them.",
    ),
    code(
      "js",
      "The two bcrypt calls in authController.js",
      [
        "// register()",
        "const passwordHash = await bcrypt.hash(",
        "  password, BCRYPT_COST);",
        "// INSERT … (email, password_hash)",
        "",
        "// login()",
        "const passwordMatches = user &&",
        "  (await bcrypt.compare(",
        "    password, user.password_hash));",
        "if (!passwordMatches) {",
        "  return res.status(401).json(…);",
        "}",
      ],
      {
        3: "BCRYPT_COST is 12",
        4: "only the hash is stored",
        8: "re-hashes with the stored salt and cost",
        11: '"Invalid email or password"',
      },
    ),
    inTheNotesApp(
      'register() hashes with `BCRYPT_COST = 12`; login() compares. The seed.sql demo user\'s hash is bcrypt, cost 12, of "demo-password".',
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "constant-time",
    "Comparing in constant time",
    explain(
      "An ordinary `===` on strings stops at the first different character. With very careful timing, an attacker can notice that a guess with a right first character takes a tiny bit longer, and learn a secret one character at a time. A [[timing-safe-comparison|constant-time comparison]] always checks every character. `bcrypt.compare` already does this for you.",
    ),
    code(
      "js",
      "Comparing a secret token yourself",
      [
        'import crypto from "node:crypto";',
        "const a = Buffer.from(given);",
        "const b = Buffer.from(expected);",
        "const same = a.length === b.length &&",
        "  crypto.timingSafeEqual(a, b);",
      ],
      {
        4: "timingSafeEqual throws if lengths differ",
        5: "looks at every byte, every time",
      },
    ),
    quickCheck(
      "Where does the Notes App need its own constant-time comparison for passwords?",
      [
        "In login(), around the === on the hashes",
        "Nowhere: bcrypt.compare already compares safely",
        "In requireAuth, on the cookie",
      ],
      1,
      "login() never compares hashes itself; bcrypt.compare does the hashing and the comparison safely. You'd only reach for crypto.timingSafeEqual when comparing a secret yourself, such as an API key.",
    ),
  ),

  part(
    "argon2",
    "Argon2, the modern alternative",
    explain(
      "Argon2 (its argon2id version) won a password-hashing competition in 2015 and is today's first recommendation. Besides being slow, it uses lots of memory, which makes the graphics cards attackers use far less effective. bcrypt at cost 12 or more is still fine; the Notes App uses bcrypt. The calls look almost the same.",
    ),
    code(
      "js",
      "The same job with the argon2 package",
      [
        'import argon2 from "argon2";',
        "const hash = await argon2.hash(password);",
        '// "$argon2id$v=19$m=65536,t=3,p=4$…"',
        "const ok = await argon2.verify(",
        "  hash, password);",
      ],
      {
        3: "m: 64 MB of memory, t: 3 passes",
        4: "note the order: hash first",
      },
    ),
  ),

  part(
    "rehash",
    "Raising the cost later",
    explain(
      "You can't rehash stored hashes on your own: you don't have the passwords. But at login you do, for a moment. So after a successful compare, check the stored hash's cost; if it's lower than today's, hash again and save the new one. Over time every active user moves up. The Notes App doesn't do this yet.",
    ),
    code(
      "js",
      "Upgrade the hash after a good login",
      [
        "if (passwordMatches &&",
        "    bcrypt.getRounds(user.password_hash)",
        "      < BCRYPT_COST) {",
        "  const newHash = await bcrypt.hash(",
        "    password, BCRYPT_COST);",
        "  await pool.query(",
        '    "UPDATE users SET password_hash = $1" +',
        '    " WHERE id = $2", [newHash, user.id]);',
        "}",
      ],
      {
        2: "reads the cost out of the stored hash",
        4: "the password is right, and still in hand",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "SHA-256 for passwords",
      wrong: [
        "const hash = crypto",
        '  .createHash("sha256")',
        '  .update(password).digest("hex");',
      ],
      problem:
        "No salt and very fast: a leaked table is cracked at billions of guesses a second.",
      right: ["const hash = await bcrypt.hash(", "  password, 12);"],
      why: "bcrypt salts every password and is slow on purpose.",
    }),
    mistake({
      title: "Hashing again and comparing with ===",
      wrong: [
        "const h = await bcrypt.hash(password, 12);",
        "if (h === user.password_hash) { … }",
      ],
      problem:
        "Every bcrypt.hash makes a new random salt, so the two strings never match, even for the right password.",
      right: [
        "const ok = await bcrypt.compare(",
        "  password, user.password_hash);",
      ],
      why: "compare reuses the stored salt and cost, and compares in constant time.",
    }),
    mistake({
      title: "Forgetting await",
      wrong: ["if (bcrypt.compare(password, hash)) {", "  // logged in!", "}"],
      problem:
        "compare returns a promise, and a promise is always truthy. Every password works.",
      right: [
        "if (await bcrypt.compare(password, hash)) {",
        "  // logged in",
        "}",
      ],
      why: "await gives the real true or false.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Salted records",
      task: "The starter gives a toy `hash(text)`. Write `makeRecord(password, salt)` returning `{ salt, hash }` where hash is `hash(salt + password)`, and `verify(record, password)` returning whether the password matches the record.",
      starter: [
        ...toyHash,
        "function makeRecord(password, salt) {",
        "  return { salt, hash: hash(password) };",
        "}",
        "function verify(record, password) {",
        "  return false;",
        "}",
      ],
      tests: [
        ['makeRecord("sunshine1", "x7")', '{ salt: "x7", hash: 3407 }'],
        ['verify(makeRecord("sunshine1", "x7"), "sunshine1")', "true"],
        ['verify(makeRecord("sunshine1", "x7"), "sunshine2")', "false"],
        ['verify({ salt: "q2", hash: 1592 }, "sunshine1")', "true"],
      ],
      hint: "verify hashes `record.salt + password` and compares the result with `record.hash`.",
      solution: [
        ...toyHash,
        "function makeRecord(password, salt) {",
        "  return { salt, hash: hash(salt + password) };",
        "}",
        "function verify(record, password) {",
        "  return hash(record.salt + password)",
        "    === record.hash;",
        "}",
      ],
    }),
    yourTurn({
      title: "Read a bcrypt hash",
      task: "Write `parseBcrypt(s)` for a string like `$2b$12$` + 53 characters. Return `{ version, cost, salt, hash }`: version as a string, cost as a number, the first 22 characters after the cost as the salt and the rest as the hash.",
      starter: ["function parseBcrypt(s) {", "  return {};", "}"],
      tests: [
        [
          'parseBcrypt("$2b$12$O7mKyRkPczpSxhgK2rD7QuZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO")',
          '{ version: "2b", cost: 12, salt: "O7mKyRkPczpSxhgK2rD7Qu", hash: "ZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO" }',
        ],
        ['parseBcrypt("$2a$10$" + "s".repeat(22) + "h".repeat(31)).cost', "10"],
        [
          'parseBcrypt("$2a$10$" + "s".repeat(22) + "h".repeat(31)).version',
          '"2a"',
        ],
      ],
      hint: '`s.split("$")` gives `["", "2b", "12", "O7mK…"]`. Then `slice(0, 22)` and `slice(22)`.',
      solution: [
        "function parseBcrypt(s) {",
        '  const [, version, cost, rest] = s.split("$");',
        "  return {",
        "    version,",
        "    cost: Number(cost),",
        "    salt: rest.slice(0, 22),",
        "    hash: rest.slice(22),",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Compare every character",
      task: "Write `safeEqual(a, b)` that returns whether two strings are equal, but never stops early: if the lengths match, look at every position with `charCodeAt(i)`, even after a difference. Different lengths: return `false`.",
      starter: ["function safeEqual(a, b) {", "  return false;", "}"],
      tests: [
        ['safeEqual("tok3n", "tok3n")', "true"],
        ['safeEqual("tok3n", "tok3m")', "false"],
        ['safeEqual("tok", "tok3n")', "false"],
        [
          '(() => { const seen = []; const a = { length: 3, charCodeAt(i) { seen.push(i); return "abc".charCodeAt(i); } }; safeEqual(a, "xyz"); return seen; })()',
          "[0, 1, 2]",
        ],
      ],
      hint: "Keep `let diff = 0;` and add `diff |= a.charCodeAt(i) ^ b.charCodeAt(i);` for every i. Equal means diff is still 0.",
      solution: [
        "function safeEqual(a, b) {",
        "  if (a.length !== b.length) return false;",
        "  let diff = 0;",
        "  for (let i = 0; i < a.length; i++) {",
        "    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);",
        "  }",
        "  return diff === 0;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Hashing cheat sheet", [
      ["Hash function", "One way; same input, same output.", "SHA-256"],
      ["Fast hash", "Fine for files, wrong for passwords."],
      [
        "Salt",
        "Random, stored with the hash, not secret.",
        "22 chars in bcrypt",
      ],
      [
        "bcrypt string",
        "Version, cost, salt and hash in 60 chars.",
        "$2b$12$O7mK…",
      ],
      [
        "Work factor",
        "Each step doubles the time; aim for ~250 ms.",
        "cost 12",
      ],
      ["Sign-up", "Hash and store the result.", "await bcrypt.hash(pw, 12)"],
      [
        "Login",
        "Compare with the stored hash.",
        "await bcrypt.compare(pw, hash)",
      ],
      [
        "Constant time",
        "Look at every character; bcrypt does.",
        "crypto.timingSafeEqual",
      ],
      [
        "Argon2",
        "Modern choice: slow and memory-hungry.",
        "argon2.verify(hash, pw)",
      ],
      [
        "Rehash",
        "At login, if the stored cost is too low.",
        "bcrypt.getRounds(hash)",
      ],
    ]),
    quickCheck(
      "Two users both choose `sunshine1`. What do their bcrypt hashes look like?",
      [
        "Identical, so the server can spot shared passwords",
        "Different, because each has its own random salt",
        "Identical, unless the cost differs",
      ],
      1,
      "bcrypt makes a fresh random salt for every hash, so equal passwords give different strings. That's what makes precomputed tables useless and forces attackers to crack each account on its own.",
    ),
  ),
);
