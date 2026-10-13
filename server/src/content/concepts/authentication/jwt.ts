import type { Concept } from "@fsl/shared";

export const jwt: Concept = {
  id: "jwt",
  slug: "jwt",
  title: "JSON Web Tokens (JWT)",
  topicId: "authentication",
  summary:
    "A small piece of signed text that says who a user is. Anyone can read it, but nobody can change it or make a new one without the server's secret key, so the server can trust it on every request.",
  basics: [
    "HTTP has no memory: every request arrives on its own, and the server doesn't automatically know that this request comes from the person who logged in a minute ago.",
    "So after a successful login the server gives the browser something to show on every later request, a bit like a wristband at a festival: you show your ticket once at the gate and the wristband after that.",
    "That proof must be impossible to forge. If it just said `user 1`, anyone could write `user 2` instead.",
    "A signature solves this. The server combines the data with a secret key that only it knows and gets a short code. Changing even one character of the data gives a completely different code, and without the key nobody can compute the right one.",
  ],
  what: [
    'A JSON Web Token, JWT (often pronounced "jot"), is a standard format for such signed proof. It is three parts joined by dots: `header.payload.signature`.',
    'The header says how it is signed, the payload holds the data (called claims) and the signature proves that both were made by someone with the key. In the Notes App the payload is `{ "sub": 1, "iat": …, "exp": … }`: the user id (sub, for subject), when it was issued and when it expires.',
  ],
  why: [
    "The server can check a JWT without storing anything: it recomputes the signature with its secret and compares. That keeps the backend simple, and any copy of the backend can check any token.",
    "Because the signature covers the payload, the server can trust the user id inside it. That is what lets `requireAuth` set `req.user` without asking the database who you are on every request.",
    "An expiry date (`exp`) limits the damage if a token is ever stolen: after 7 days in the Notes App, it stops working by itself.",
  ],
  howItWorks: [
    'Login: after the password matches, `jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })` builds the header and payload, encodes each as Base64URL text, signs them with HMAC-SHA256 using `JWT_SECRET` and joins the three parts with dots.',
    "The token goes to the browser in an httpOnly cookie, and the browser sends it back with every request.",
    "Every protected request: `jwt.verify(token, process.env.JWT_SECRET)` splits the token, recomputes the signature and compares. If it matches and `exp` hasn't passed, it returns the payload; otherwise it throws, and `requireAuth` answers `401`.",
  ],
  basicExample: {
    language: "js",
    code: `import jwt from "jsonwebtoken";

const token = jwt.sign({ sub: 1 }, "server-secret", { expiresIn: "7d" });
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6….Qd3x…"

jwt.verify(token, "server-secret"); // { sub: 1, iat: …, exp: … }

// Someone edits the payload to say sub: 2 → the signature no longer fits
jwt.verify(forgedToken, "server-secret"); // throws "invalid signature"`,
    caption:
      "Signing creates the token at login; verifying checks it on every request.",
    highlightLines: [3, 6, 9],
  },
  internals: [
    "Base64URL is an encoding, not encryption. Anyone holding a JWT can decode the header and payload and read them, for example on jwt.io. Never put secrets such as passwords in a payload.",
    "The Notes App's tokens use HS256: HMAC with SHA-256. The same secret signs and verifies, so `JWT_SECRET` must be long, random and known only to the backend. Anyone who knows it can make a valid token for any user.",
    "A JWT stays valid until it expires, even after logout. Logging out deletes the cookie from the browser, but a copy someone stole earlier would keep working until `exp`. That is one reason to keep the lifetime short and the token in an httpOnly cookie, out of reach of scripts.",
    "Because the token is checked without the database, it can't notice that a user was deleted. The Notes App's `GET /api/auth/me` looks the user up anyway, and answers `401` if the account is gone.",
  ],
  howToCreate: [
    {
      text: "Create a project with the `jsonwebtoken` library, the same one the Notes App uses.",
      code: {
        language: "bash",
        code: `mkdir jwt-demo && cd jwt-demo
npm init -y
npm pkg set type=module
npm install jsonwebtoken`,
      },
    },
    {
      text: "Create `token.js`. It signs a token, decodes the payload without any key, verifies it, then tries a forged copy and an expired one.",
      code: {
        language: "js",
        fileName: "token.js",
        code: `import jwt from "jsonwebtoken";

const SECRET = "a-long-random-secret-only-the-server-knows";
const token = jwt.sign({ sub: 1 }, SECRET, { expiresIn: "7d" });
console.log("token:", token);

const [header, payload] = token.split(".");
console.log("anyone can read:", JSON.parse(Buffer.from(payload, "base64url")));

console.log("verify:", jwt.verify(token, SECRET));

// Forge: change the payload to user 2, keep the old signature
const fake = Buffer.from(JSON.stringify({ sub: 2 })).toString("base64url");
const forged = [header, fake, token.split(".")[2]].join(".");
try {
  jwt.verify(forged, SECRET);
} catch (err) {
  console.log("forged:", err.message);
}

const old = jwt.sign({ sub: 1, exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
try {
  jwt.verify(old, SECRET);
} catch (err) {
  console.log("expired:", err.message);
}`,
      },
    },
    {
      text: "Run it. The payload is readable without the secret, `verify` returns it, the forged token fails with `invalid signature` and the old one with `jwt expired`.",
      code: { language: "bash", code: "node token.js" },
    },
  ],
  whereUsed: [
    "Login sessions in web and mobile apps, usually in a cookie or an `Authorization: Bearer …` header.",
    'Signing in with another service ("Log in with Google"), where the provider sends a signed token about the user.',
    "Short-lived links, such as password-reset or email-confirmation links.",
  ],
  connectsTo: [
    "Secure cookies, which carry the token between browser and server.",
    "Express middleware: `requireAuth` verifies the token before every notes route.",
    "Environment variables: `JWT_SECRET` must never be in the code.",
    "Authentication vs authorization: the token answers who; the queries answer what.",
  ],
  projectUsage: [
    {
      explanation:
        "`login` signs a token with the user's id as `sub` and a 7-day expiry, using `JWT_SECRET` from the environment.",
      fileId: "backend/src/controllers/authController.js",
      match:
        "const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {",
    },
    {
      explanation:
        "`requireAuth` verifies the signature and expiry on every protected request; any failure becomes `401`.",
      fileId: "backend/src/middleware/authMiddleware.js",
      match: "const payload = jwt.verify(token, process.env.JWT_SECRET);",
    },
    {
      explanation:
        "`.env.example` explains that `JWT_SECRET` signs the tokens and must be a long random string in production.",
      fileId: "backend/.env.example",
      match: "JWT_SECRET=change-me-to-a-long-random-string",
    },
    {
      explanation:
        "`currentUser` looks the user up even though the token is valid, because a token can't know that the account was deleted.",
      fileId: "backend/src/controllers/authController.js",
      match:
        'const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [',
    },
  ],
  commonMistakes: [
    "Thinking a JWT is encrypted and putting private data in it. Anyone can read the payload.",
    "Using a short or guessable secret such as `secret`. HS256 secrets can be guessed offline from a single token, just like passwords.",
    "Using `jwt.decode` instead of `jwt.verify` to read the user. `decode` doesn't check the signature, so it accepts forged tokens.",
    "Giving tokens no expiry, or a very long one. A stolen token then works forever.",
  ],
  relatedConcepts: [
    "secure-cookies",
    "authentication-vs-authorization",
    "secrets-env-vars",
    "express-middleware",
    "json",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
