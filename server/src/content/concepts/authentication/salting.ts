import type { Concept } from "@fsl/shared";

export const salting: Concept = {
  id: "salting",
  slug: "salting",
  title: "Salting",
  topicId: "authentication",
  summary:
    "Mixing a random value, the salt, into each password before hashing it, so equal passwords get different hashes and an attacker has to attack every account separately.",
  basics: [
    "A hash function always gives the same hash for the same input. That is what lets the server check a password: hash what was typed, compare with what was stored (see password hashing).",
    "That same property is a weakness when many hashes are stored together. If Ana and Ben both choose `sunshine2024`, plain hashing stores the same value twice, and anyone who reads the table can see they share a password.",
    "Attackers also prepare in advance. They hash millions of common passwords once and keep a big lookup table from hash to password, called a precomputed table; the best-known kind is the rainbow table. With unsalted hashes, cracking a leaked table is just looking values up.",
  ],
  what: [
    "A salt is a random value, different for every password, that is mixed into the password before hashing: the server stores `hash(salt + password)` together with the salt.",
    "The salt is not a secret. It is stored right next to the hash, and in bcrypt it is part of the same string. Its only job is to make every hash unique.",
  ],
  why: [
    "Equal passwords no longer look equal. Ana's and Ben's `sunshine2024` get different salts and therefore completely different hashes, so the table no longer reveals who shares a password.",
    "Precomputed tables become useless. A table built for unsalted hashes contains none of these values, and building one for every possible salt would take more storage than exists.",
    "Most importantly, each guess now only tests one account. Without salts, hashing the guess `sunshine2024` once checks it against every user at the same time; with salts the attacker must hash it again with each user's salt. A leak of a million accounts then takes a million times as much work to crack.",
  ],
  howItWorks: [
    "Registering: `bcrypt.hash(password, 12)` asks the operating system for 16 random bytes, the salt. It hashes the password with the salt and returns one string: `$2b$` (the version), `12$` (the cost), then 22 characters of salt followed by 31 characters of hash.",
    "Logging in: `bcrypt.compare(typedPassword, storedHash)` takes the salt from the stored string, hashes the typed password with that same salt and compares. The right password with the right salt gives the same hash.",
    "This is also why hashing the same password twice gives two different strings: each call makes a new salt. Both strings still verify the password, because each carries its own salt.",
  ],
  basicExample: {
    language: "js",
    code: `const a = await bcrypt.hash("sunshine2024", 12);
const b = await bcrypt.hash("sunshine2024", 12);

// a: "$2b$12$SVxomHL23Pelc022z3jW2OLQmTWBcFhO5Ze8Eftr57mYAusDel1VC"
// b: "$2b$12$cOs4jqIk5n5qcDxEr2CtOevKf1nXIGJgRMq/U6BYqeuyBNBIH4NzS"
// After "$2b$12$": 22 characters of salt, then 31 characters of hash.
// a's salt: "SVxomHL23Pelc022z3jW2O"

a === b; // false: different salts
await bcrypt.compare("sunshine2024", a); // true
await bcrypt.compare("sunshine2024", b); // true`,
    caption:
      "Same password, different salts, different hashes, and both still check the password correctly.",
    highlightLines: [4, 5, 9],
  },
  internals: [
    "A salt must be random and new for every password. One fixed value shared by the whole app does not give users different hashes, so it brings back the problems above. (Some apps add a secret app-wide value called a pepper, but always in addition to a per-password salt, never instead of it.)",
    "16 random bytes give 2^128 possible salts, so two users getting the same salt by chance will in practice never happen.",
    "A salt doesn't make one weak password hard to guess. If Ana's password is `sunshine2024`, an attacker who targets her account will still find it on one of their first guesses. Salting removes the shortcuts across many accounts; the slow hash and a decent password length protect each one.",
    "bcrypt writes the salt in its own Base64 alphabet (letters, digits, `.` and `/`), which is why a bcrypt string contains only those characters after the `$` signs.",
  ],
  howToCreate: [
    {
      text: "Create a project to compare unsalted and salted hashes.",
      code: {
        language: "bash",
        code: `mkdir salt-demo && cd salt-demo
npm init -y
npm pkg set type=module
npm install bcrypt`,
      },
    },
    {
      text: "Create `salt.js`. It hashes the same password for two users, first with plain SHA-256 and no salt, then with bcrypt, and splits the bcrypt string into its parts.",
      code: {
        language: "js",
        fileName: "salt.js",
        code: `import bcrypt from "bcrypt";
import crypto from "node:crypto";

const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");

console.log("Ana, no salt:", sha256("sunshine2024"));
console.log("Ben, no salt:", sha256("sunshine2024"));

for (const user of ["Ana", "Ben"]) {
  const stored = await bcrypt.hash("sunshine2024", 12);
  console.log(\`\${user}, bcrypt:\`, stored);
  console.log("  cost:", bcrypt.getRounds(stored));
  console.log("  salt:", stored.slice(7, 29));
  console.log("  hash:", stored.slice(29));
}`,
      },
    },
    {
      text: "Run it. The two unsalted hashes are identical, so a leaked table would show that Ana and Ben share a password. The two bcrypt strings, salts and hashes are all different. Run it again and the bcrypt lines change, while the SHA-256 lines stay the same.",
      code: { language: "bash", code: "node salt.js" },
    },
  ],
  whereUsed: [
    "Every password hash: bcrypt, scrypt and Argon2 all make and store a salt automatically.",
    "Anywhere many people's guessable secrets are hashed, such as security-question answers or PINs.",
  ],
  connectsTo: [
    "Password hashing, which salting makes safe to use for many users at once.",
    "bcrypt, which makes the salt for you and stores it inside the hash string.",
    "The `password_hash` column, which holds salt and hash together, so the schema needs no separate `salt` column.",
  ],
  projectUsage: [
    {
      explanation:
        "`bcrypt.hash` makes a new random salt every time it is called, so the Notes App never handles salts itself: two users with the same password still get different `password_hash` values.",
      fileId: "backend/src/controllers/authController.js",
      match: "const passwordHash = await bcrypt.hash(password, BCRYPT_COST);",
    },
    {
      explanation:
        "`bcrypt.compare` reads the salt back out of the stored `password_hash`, so login needs nothing but the stored string and the typed password.",
      fileId: "backend/src/controllers/authController.js",
      match: "user && (await bcrypt.compare(password, user.password_hash));",
    },
    {
      explanation:
        "The seed file's demo hash contains its salt too: the 22 characters after `$2b$12$`.",
      fileId: "database/seed.sql",
      match: "'$2b$12$O7mKyRkPczpSxhgK2rD7QuZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO'",
    },
  ],
  commonMistakes: [
    "Using one salt for every user, often written as a constant in the code. Then equal passwords get equal hashes again.",
    "Treating the salt as a secret and storing it separately. It isn't one; keep it with the hash, as bcrypt does.",
    "Making salts yourself with `Math.random()`, which isn't designed to be unpredictable. Let the password hashing library make them.",
    "Expecting the same hash every time and comparing with `===`. With salts, use the library's compare function.",
  ],
  relatedConcepts: [
    "password-hashing",
    "bcrypt",
    "why-never-store-plain-passwords",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
