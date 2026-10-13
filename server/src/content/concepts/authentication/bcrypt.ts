import type { Concept } from "@fsl/shared";

export const bcrypt: Concept = {
  id: "bcrypt",
  slug: "bcrypt",
  title: "bcrypt and its cost factor",
  topicId: "authentication",
  summary:
    "A password hashing function that salts every password and is slow on purpose, with a cost factor that sets how slow, so it can keep up as computers get faster.",
  basics: [
    "Passwords are stored as hashes, and a good password hash is deliberately slow and salted, so a stolen table of hashes can only be cracked by slow guessing, one account at a time (see password hashing and salting).",
    "Writing such a function yourself is a bad idea: small mistakes are invisible and dangerous. Instead you use a well-tested one from a library.",
    "bcrypt is one of the oldest and most widely used password hashing functions. It was published in 1999, has been studied by security researchers ever since, and has libraries for almost every language. In Node.js the `bcrypt` npm package provides it.",
  ],
  what: [
    "bcrypt gives you two functions. `bcrypt.hash(password, cost)` returns a 60-character string to store. `bcrypt.compare(password, stored)` returns `true` or `false`.",
    "The cost factor, also called rounds or work factor, is the number you pass to `hash`. It decides how much work one hash takes, and so how long it takes: every step of 1 doubles the time. The Notes App uses 12.",
    "The stored string records everything: `$2b$12$SVxomHL23Pelc022z3jW2OLQmTWBcFhO5Ze8Eftr57mYAusDel1VC` is version `2b`, cost `12`, then the salt and the hash. That is why the database needs only one column for it.",
  ],
  why: [
    "Computers get faster every year. A hash that was slow enough in 1999 would be far too fast today. The cost factor lets the same algorithm keep up: when hardware gets faster, raise the number.",
    "It also lets each app choose its own balance. A higher cost makes attackers slower, but it makes every login and registration slower too, and uses the server's processor while it runs. The usual advice is to pick the highest cost that keeps one hash at about a quarter of a second or less on your server.",
    "Cost 12 takes around 0.2 seconds on a typical laptop. Unnoticeable for a person logging in once; enormous for an attacker who wants to try millions of passwords per account.",
  ],
  howItWorks: [
    "The cost is an exponent: bcrypt repeats its expensive inner step 2^cost times. Cost 10 means 1,024 repetitions, cost 12 means 4,096, cost 14 means 16,384. Each +1 doubles the work, each +2 makes it four times as slow.",
    "`bcrypt.hash` makes a random salt, runs the repeated work on the salt and the password, and writes version, cost, salt and hash into one string.",
    "`bcrypt.compare` reads version, cost and salt from the stored string and repeats exactly the same work on the typed password. Because the cost is stored with each hash, the app can raise its cost later and old hashes still verify.",
    "The `bcrypt` package does this work in native code on a background thread and returns a Promise. While one hash is running, Node.js can keep serving other requests.",
  ],
  basicExample: {
    language: "js",
    code: `import bcrypt from "bcrypt";

for (const cost of [10, 12, 14]) {
  const start = Date.now();
  await bcrypt.hash("my-password-123", cost);
  console.log(\`cost \${cost}: \${Date.now() - start} ms\`);
}
// cost 10: 51 ms
// cost 12: 199 ms
// cost 14: 859 ms`,
    caption:
      "Measured on a laptop: each +2 makes one hash about four times slower, for the attacker as much as for the server.",
    highlightLines: [5, 9],
  },
  internals: [
    "bcrypt is built on an encryption algorithm called Blowfish. Setting Blowfish up with a key is unusually slow, and bcrypt makes that setup step the repeated part, mixing in the password and the salt again and again. The result then encrypts a fixed piece of text, and that output becomes the hash.",
    "bcrypt only uses the first 72 bytes of a password and silently ignores the rest. In version 6 of the `bcrypt` package, two passwords that share their first 72 bytes still match each other. This rarely matters for typed passwords, but it is a reason to set a maximum length (some apps reject passwords longer than 72 bytes) and to never feed bcrypt long combined values.",
    "The `2b` in the string is the version of the format. `2a` and `2y` come from older or other implementations of the same algorithm.",
    "Newer password hashing functions exist. Argon2 can also be made to need lots of memory, which makes guessing on graphics cards harder. bcrypt remains a reasonable, widely supported choice, and the ideas (salt, deliberate slowness, a tunable cost) are the same in all of them.",
  ],
  howToCreate: [
    {
      text: "Create a project and install `bcrypt`. It contains native code, but the package includes ready-made builds for common systems, so usually no compiler is needed.",
      code: {
        language: "bash",
        code: `mkdir bcrypt-demo && cd bcrypt-demo
npm init -y
npm pkg set type=module
npm install bcrypt`,
      },
    },
    {
      text: "Create `auth.js` with the two functions an app needs, the same way the Notes App's `authController` uses them, plus a check of the cost stored in a hash.",
      code: {
        language: "js",
        fileName: "auth.js",
        code: `import bcrypt from "bcrypt";

const BCRYPT_COST = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function checkPassword(password, stored) {
  return bcrypt.compare(password, stored);
}

const stored = await hashPassword("my-password-123");
console.log("stored:", stored, \`(\${stored.length} characters)\`);
console.log("cost in the hash:", bcrypt.getRounds(stored));
console.log("right:", await checkPassword("my-password-123", stored));
console.log("wrong:", await checkPassword("My-password-123", stored));`,
      },
    },
    {
      text: "Run it. You get a 60-character string starting with `$2b$12$`, the cost `12` read back from it, `true` for the right password and `false` when only one letter's case differs. Change `BCRYPT_COST` to 14 and run it again: it takes noticeably longer.",
      code: { language: "bash", code: "node auth.js" },
    },
  ],
  whereUsed: [
    "Registration and login in web apps, in Node.js and many other languages.",
    "Password files on some Unix-like systems; OpenBSD, for example, uses bcrypt by default.",
    'Anywhere a library offers "hash a password": it is often bcrypt or Argon2 underneath.',
  ],
  connectsTo: [
    "Password hashing and salting, which bcrypt implements.",
    "npm packages: `bcrypt` is a dependency of the backend.",
    "`async`/`await`: both functions return Promises.",
    "The `password_hash` column, which stores bcrypt's 60-character string.",
  ],
  projectUsage: [
    {
      explanation:
        "The cost factor is a named constant at the top of the controller, so changing it later is one edit.",
      fileId: "backend/src/controllers/authController.js",
      match: "const BCRYPT_COST = 12;",
    },
    {
      explanation: "`register` stores `bcrypt.hash(password, BCRYPT_COST)`.",
      fileId: "backend/src/controllers/authController.js",
      match: "const passwordHash = await bcrypt.hash(password, BCRYPT_COST);",
    },
    {
      explanation:
        "`login` checks the typed password with `bcrypt.compare`, which reads the cost and salt from the stored hash.",
      fileId: "backend/src/controllers/authController.js",
      match: "user && (await bcrypt.compare(password, user.password_hash));",
    },
    {
      explanation:
        "The backend's `package.json` lists `bcrypt` as a dependency.",
      fileId: "backend/package.json",
      match: '"bcrypt": "^6.0.0",',
    },
    {
      explanation:
        "The demo account in the seed file is a bcrypt hash with cost 12, created the same way.",
      fileId: "database/seed.sql",
      match: "'$2b$12$O7mKyRkPczpSxhgK2rD7QuZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO'",
    },
  ],
  commonMistakes: [
    "Choosing a cost by copying an old tutorial. Cost 8 or 10 was common years ago; measure on your own server and aim for roughly a quarter of a second or less.",
    "Going too high. Cost 16 or more can take seconds per login and makes the login route an easy way to overload the server with requests.",
    "Comparing with `===` instead of `bcrypt.compare`. A new hash of the same password has a new salt, so it never equals the stored one.",
    "Forgetting the 72-byte limit and hashing something long, such as a password joined with another value. Everything after byte 72 is ignored.",
  ],
  relatedConcepts: [
    "password-hashing",
    "salting",
    "why-never-store-plain-passwords",
    "npm-packages",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
