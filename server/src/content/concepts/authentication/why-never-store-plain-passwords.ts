import type { Concept } from "@fsl/shared";

export const whyNeverStorePlainPasswords: Concept = {
  id: "why-never-store-plain-passwords",
  slug: "why-never-store-plain-passwords",
  title: "Why passwords are never stored as they are typed",
  topicId: "authentication",
  summary:
    "A server must be able to check a password without keeping a copy of it, because any copy can leak, and a leaked password unlocks far more than your app.",
  basics: [
    "To log in, a user types an email and a password. The server has to remember something about each password, or it could never tell a right one from a wrong one.",
    "The obvious way is to save the password itself in the database, in a column such as `password`, exactly as typed. Text saved exactly as typed is called plain text.",
    "Databases leak more often than you would think: a backup left on a public server, a stolen laptop, an SQL injection bug, a former employee who kept access. Big companies have lost millions of accounts this way.",
    "People reuse passwords. Many use the same password, or a small variation of it, on several sites, often including their email and their bank.",
  ],
  what: [
    "The rule is simple: the server never stores a password, not in the database, not in a log file, not in an error message. It stores a password hash instead: a scrambled value made from the password that can't be turned back into it.",
    "To check a login, the server scrambles the typed password the same way and compares the results. Equal results mean the password was right, so the server can check passwords without knowing any of them.",
  ],
  why: [
    "With plain-text passwords, one leak hands an attacker every account in the app at once, with no work at all. Because people reuse passwords, the attacker then tries the same email and password on email providers, banks and shops. This is called credential stuffing, and it is how a small site's leak hurts people far beyond it.",
    "Storing hashes changes what a leak means. The attacker gets scrambled values and has to guess each password, one guess at a time, and a good hash function makes every guess slow. Strong passwords then stay safe even after a leak, and users have time to change the others.",
    "It also protects users from the people running the app. Developers, database administrators and support staff can read the `users` table, and none of them should ever be able to read a password.",
  ],
  howItWorks: [
    "Register: the browser sends the password over HTTPS. The server hashes it and stores only the hash with the email. The typed password exists only in memory for the moment it takes to hash it, then it is gone.",
    "Log in: the browser sends the typed password again. The server reads the stored hash for that email, hashes the typed password the same way and compares. The answer is only yes or no; nothing is ever decrypted.",
    "Forgotten password: because nobody can read the stored password, not even the app, it can't be sent back to the user. The only option is to let them set a new one. A site that can email you your old password is storing it in a readable form, and that is a warning sign.",
  ],
  basicExample: {
    language: "js",
    code: `// UNSAFE: the password itself goes into the database
await pool.query(
  "INSERT INTO users (email, password) VALUES ($1, $2)",
  [email, password], // "my-password-123", readable by anyone who sees the table
);

// SAFE: only a bcrypt hash is stored
const passwordHash = await bcrypt.hash(password, 12);
await pool.query(
  "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
  [email, passwordHash], // "$2b$12$TAaMlztn3x0Plic7uNWJDO…"
);`,
    caption:
      "Both versions work for logging in. Only the second one keeps users safe when the database leaks.",
    highlightLines: [4, 8, 11],
  },
  internals: [
    "Hashing is not encryption. Encrypted data can be decrypted with the right key, so an attacker who steals the database and the key, which often sits on the same server, gets every password back. A hash has no key and no way back; the only attack left is guessing.",
    "Guessing works by hashing candidate passwords, from lists of millions of real leaked passwords, and looking for a matching hash. That is why the hash function must be slow and every password must get its own random salt: both make each guess cost far more (see password hashing, salting and bcrypt).",
    "Plain-text passwords leak through more than the database. Logging `req.body` on the login route, sending the request body to an error-tracking service or printing it while debugging all write passwords to places nobody thinks of as sensitive. Never log a request body that can contain a password.",
    "A hash only protects what is stored. While the password travels from the browser to the server it is still plain text inside the request, which is why login pages must use HTTPS.",
  ],
  howToCreate: [
    {
      text: "Create a small Node.js project. It needs no database: an array plays the role of the `users` table.",
      code: {
        language: "bash",
        code: `mkdir plain-vs-hash && cd plain-vs-hash
npm init -y
npm pkg set type=module
npm install bcrypt`,
      },
    },
    {
      text: "Create `leak.js`. It stores the same two accounts both ways and prints what an attacker who copied each table would see.",
      code: {
        language: "js",
        fileName: "leak.js",
        code: `import bcrypt from "bcrypt";

const accounts = [
  { email: "ana@example.com", password: "sunshine2024" },
  { email: "ben@example.com", password: "sunshine2024" },
];

const plainTable = accounts.map(({ email, password }) => ({ email, password }));
const hashedTable = [];
for (const { email, password } of accounts) {
  hashedTable.push({ email, password_hash: await bcrypt.hash(password, 12) });
}

console.log("Leaked plain table:", plainTable);
console.log("Leaked hashed table:", hashedTable);

// Logging in still works with only the hash:
const row = hashedTable[0];
console.log("right password:", await bcrypt.compare("sunshine2024", row.password_hash));
console.log("wrong password:", await bcrypt.compare("sunshine2025", row.password_hash));`,
      },
    },
    {
      text: "Run it. The plain table shows both passwords, and that Ana and Ben use the same one. The hashed table shows two different 60-character values, and logging in still prints `true` for the right password and `false` for the wrong one.",
      code: { language: "bash", code: "node leak.js" },
    },
  ],
  whereUsed: [
    "Every app with its own login: the registration route stores a hash, the login route compares against it.",
    "Changing a password: the new password is hashed and replaces the old hash, and the old password is never needed in readable form.",
    "Anywhere a secret only has to be checked, never shown, such as API keys that a service checks on each request.",
  ],
  connectsTo: [
    "Password hashing and bcrypt, which turn the password into the stored value.",
    "Salting, which stops two users with the same password from getting the same hash.",
    "HTTPS, which protects the password on its way to the server, where hashing can't help yet.",
    "The `users` table, whose `password_hash` column holds the hash.",
  ],
  projectUsage: [
    {
      explanation:
        "The `users` table has no `password` column at all, only `password_hash`, so there is nowhere a readable password could be stored by mistake.",
      fileId: "database/schema.sql",
      match: "password_hash TEXT NOT NULL,",
    },
    {
      explanation:
        "`register` hashes the password before anything is stored. The comment above it states the rule.",
      fileId: "backend/src/controllers/authController.js",
      match:
        "// Never store the password itself: bcrypt makes a slow, salted hash.",
    },
    {
      explanation:
        "The INSERT stores the email and `passwordHash`, never `password`. The typed password is only in memory while the request runs.",
      fileId: "backend/src/controllers/authController.js",
      match: "[email, passwordHash],",
    },
    {
      explanation:
        "Even the demo account in the seed file is stored as a hash, with a comment that real passwords never belong in a seed file.",
      fileId: "database/seed.sql",
      match:
        '-- (The hash below is bcrypt, cost 12, of "demo-password". Never put real',
    },
  ],
  commonMistakes: [
    "Encrypting passwords instead of hashing them. Whoever has the key, including an attacker who finds it on the same server, can decrypt every password.",
    "Logging the login request body while debugging, or in an error handler. The passwords end up in log files that many people can read.",
    'Building a "send me my password" feature. If the app can send it, it is storing it readably; build "set a new password" instead.',
    "Thinking a hash makes HTTPS unnecessary. The password still travels as plain text inside the request.",
  ],
  relatedConcepts: [
    "password-hashing",
    "salting",
    "bcrypt",
    "parameterized-query",
    "sql-insert",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
