import type { Concept } from "@fsl/shared";

export const passwordHashing: Concept = {
  id: "password-hashing",
  slug: "password-hashing",
  title: "Password hashing",
  topicId: "authentication",
  summary:
    "Turning a password into a fixed-length scrambled value that can't be turned back, so the server can check a password later without ever storing it.",
  basics: [
    "A function takes an input and gives back an output. `Math.max(3, 7)` takes two numbers and gives `7`.",
    "A hash function is a function that takes any text, short or long, and gives back a value of a fixed length that looks random, called a hash. The same input always gives the same hash.",
    "Hash functions are built to be one-way: computing the hash from the text is easy, but there is no calculation that goes from the hash back to the text. Changing a single character of the input gives a completely different hash.",
    "Because the same password always gives the same hash, a server can store the hash, hash whatever is typed at login, and compare the two. It never needs the password itself (see why passwords are never stored as they are typed).",
  ],
  what: [
    "Password hashing means storing `hash(password)` instead of the password. In the Notes App the stored value looks like `$2b$12$TAaMlztn3x0Plic7uNWJDOBNKTg3CoePrCAp8Br0z3pT2G3OGhbZe` and lives in the `password_hash` column.",
    "Not every hash function is right for passwords. Functions like SHA-256 are designed to be fast, for checking that a downloaded file is intact. A password hashing function, such as bcrypt, scrypt or Argon2, is designed to be slow on purpose and to mix in a random salt.",
  ],
  why: [
    "Without hashing, a leaked database is a list of passwords. With hashing, it is a list of scrambled values, and the attacker can only guess: pick a likely password, hash it, and see whether the result appears in the table.",
    "That guessing is the real threat, and speed decides how dangerous it is. One CPU core can compute around two million SHA-256 hashes a second, and a gaming graphics card billions, so every common password would be found almost at once. A slow password hash that takes a fifth of a second brings that down to a few guesses a second per processor.",
    "The slowness is unnoticeable for real users: one login costs one hash, and a fifth of a second is nothing next to the time it takes to type a password.",
  ],
  howItWorks: [
    "Registering: `bcrypt.hash(password, 12)` makes a new random salt, runs the slow hash on the salt and the password, and returns one string holding everything needed to check it later: the algorithm, the cost, the salt and the hash. The server stores that string.",
    "Logging in: `bcrypt.compare(typedPassword, storedHash)` reads the algorithm, cost and salt out of the stored string, hashes the typed password with exactly those settings and compares the result with the stored hash. It returns `true` or `false`.",
    "Both functions return Promises. The work runs outside JavaScript's main thread, so a server waiting for a hash can keep answering other requests in the meantime.",
  ],
  basicExample: {
    language: "js",
    code: `import bcrypt from "bcrypt";

// Register: store only this string
const stored = await bcrypt.hash("my-password-123", 12);
// "$2b$12$TAaMlztn3x0Plic7uNWJDOBNKTg3CoePrCAp8Br0z3pT2G3OGhbZe"

// Log in: hash the typed password the same way and compare
await bcrypt.compare("my-password-123", stored); // true
await bcrypt.compare("my-password-124", stored); // false`,
    caption:
      "The stored string is all the server keeps. One changed character in the typed password gives `false`.",
    highlightLines: [4, 8, 9],
  },
  internals: [
    '"Can\'t be turned back" means there is no shortcut, not that it is impossible to find a password. If the password is `sunshine`, an attacker who hashes `sunshine` finds it. Hashing protects strong passwords well and weak ones only a little, which is why apps also ask for a minimum length.',
    "Comparing the hash takes the same time whether the first character differs or the last. `bcrypt.compare` checks this way on purpose, because a comparison that stops at the first difference can leak, through its timing, how much of a guess was right.",
    "The stored string carries its own settings, so they can change over time. If the app raises the cost from 12 to 13, old hashes still verify with cost 12, and the app can re-hash a user's password with the new cost the next time they log in successfully, because only then does it have the password.",
    "Fast general-purpose hashes are still the right tool elsewhere: checking file downloads, Git commit ids, and signing tokens (the Notes App's JWTs use HMAC with SHA-256, which is fine because the secret key is long and random, not something a person chose).",
  ],
  howToCreate: [
    {
      text: "Create a project with Node's built-in `crypto` module, which needs no install, and `bcrypt`.",
      code: {
        language: "bash",
        code: `mkdir hashing-demo && cd hashing-demo
npm init -y
npm pkg set type=module
npm install bcrypt`,
      },
    },
    {
      text: "Create `speed.js`. It counts how many fast SHA-256 hashes and how many bcrypt hashes this computer can make in one second, which is exactly the rate an attacker could guess at.",
      code: {
        language: "js",
        fileName: "speed.js",
        code: `import bcrypt from "bcrypt";
import crypto from "node:crypto";

let start = Date.now();
let fast = 0;
while (Date.now() - start < 1000) {
  crypto.createHash("sha256").update("guess" + fast).digest("hex");
  fast++;
}
console.log("SHA-256 guesses per second:", fast);

start = Date.now();
let slow = 0;
while (Date.now() - start < 1000) {
  await bcrypt.hash("guess" + slow, 12);
  slow++;
}
console.log("bcrypt (cost 12) guesses per second:", slow);`,
      },
    },
    {
      text: "Run it. The first number is in the millions, the second is a small number, around 5 on a typical laptop. A list of ten million leaked passwords would take seconds to try with SHA-256 and weeks with bcrypt on this computer, for every single account.",
      code: { language: "bash", code: "node speed.js" },
    },
  ],
  whereUsed: [
    "Registration and password changes, where the new password is hashed before it is stored.",
    "Login, where the typed password is compared with the stored hash.",
    "Any secret that people choose and the server only has to check, such as a PIN.",
  ],
  connectsTo: [
    "Salting, the random value mixed into every password hash.",
    "bcrypt, the password hashing function the Notes App uses, and its cost factor.",
    "The `users` table's `password_hash` column, which holds the result.",
    "`async`/`await`, because hashing takes time and returns a Promise.",
  ],
  projectUsage: [
    {
      explanation:
        "`register` hashes the new password with `bcrypt.hash` before the INSERT, so only the hash ever reaches the database.",
      fileId: "backend/src/controllers/authController.js",
      match: "const passwordHash = await bcrypt.hash(password, BCRYPT_COST);",
    },
    {
      explanation:
        "`login` checks the typed password with `bcrypt.compare` against the stored `password_hash`. It only runs when an account with that email exists, and a mismatch gets the same `401` as an unknown email.",
      fileId: "backend/src/controllers/authController.js",
      match: "user && (await bcrypt.compare(password, user.password_hash));",
    },
    {
      explanation:
        "Both functions come from the `bcrypt` library, which `authController` imports at the top. Hashing well is hard, so the app uses a well-tested library instead of its own code.",
      fileId: "backend/src/controllers/authController.js",
      match: 'import bcrypt from "bcrypt";',
    },
  ],
  commonMistakes: [
    "Using a fast hash such as MD5, SHA-1 or SHA-256 for passwords. They were built for speed, which is exactly what an attacker wants. Use bcrypt, scrypt or Argon2.",
    "Comparing hashes yourself with `===` after hashing the typed password again. With bcrypt that fails every time, because a new hash gets a new salt. Always use `bcrypt.compare`.",
    "Forgetting `await`. `bcrypt.hash(...)` without it returns a Promise, and storing that stores the text `[object Promise]`, so nobody can ever log in.",
    "Inventing your own scheme, such as hashing twice or adding a fixed secret word. Home-made schemes are easy to get subtly wrong; a well-tested password hashing function already does everything needed.",
  ],
  relatedConcepts: [
    "why-never-store-plain-passwords",
    "salting",
    "bcrypt",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
