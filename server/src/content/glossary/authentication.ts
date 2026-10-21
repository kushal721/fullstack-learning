import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "Authentication" topic.
export const authenticationGlossary: GlossaryEntry[] = [
  {
    id: "authentication-vs-authorization",
    topicId: "authentication",
    term: "Authentication vs authorization",
    aliases: ["authentication", "authorization", "authn", "authz", "login"],
    kind: "concept",
    short:
      "Authentication finds out who is asking; authorization decides what they may do. Both are checked on the server.",
    body: "At login you prove who you are, and every later request proves it again with a signed [[secure-cookies|cookie]]. Then authorization asks: may this user do this? In the Notes App you may only touch your own notes. A wrong login is `401`, a forbidden action `403`.",
    analogy:
      "A hotel: the front desk checks your ID (authentication), your key card opens only your room (authorization).",
    conceptPageId: "authentication-vs-authorization",
  },
  {
    id: "why-never-store-plain-passwords",
    topicId: "authentication",
    term: "Never store plain passwords",
    aliases: ["plain text passwords", "password storage", "plaintext"],
    kind: "concept",
    short:
      "A server checks passwords without keeping a copy, because any copy can leak and unlock other sites too.",
    body: "The server stores only a [[password-hashing|password hash]]: a scrambled value that can't be turned back. At login it scrambles the typed password the same way and compares. Equal results mean the password was right, without the server ever knowing it.",
    conceptPageId: "why-never-store-plain-passwords",
  },
  {
    id: "password-hashing",
    topicId: "authentication",
    term: "Password hashing",
    aliases: ["hash", "hashing", "password hash"],
    kind: "concept",
    short:
      "Turning a password into a scrambled value that can't be turned back, so it can be checked without being stored.",
    body: "The server stores `hash(password)`. Fast hashes like SHA-256 are wrong for this; password hashes like [[bcrypt]] are slow on purpose and mix in a [[salting|salt]], so guessing millions of passwords takes far too long.",
    conceptPageId: "password-hashing",
  },
  {
    id: "salting",
    topicId: "authentication",
    term: "Salt",
    aliases: ["salting", "salted hash"],
    kind: "concept",
    short:
      "A random value mixed into each password before hashing, so equal passwords get different hashes.",
    body: "The server stores `hash(salt + password)` and the salt itself, which isn't secret. Its job is to make every hash unique, so an attacker can't use a ready-made table of hashes and must attack each account on its own. [[bcrypt]] adds one for you.",
    conceptPageId: "salting",
  },
  {
    id: "bcrypt",
    topicId: "authentication",
    term: "bcrypt",
    aliases: ["cost factor", "rounds", "work factor"],
    kind: "concept",
    short:
      "A password hashing function that salts every password and is slow on purpose, with a cost factor for how slow.",
    body: "`bcrypt.hash(password, 12)` returns a 60-character string to store; `bcrypt.compare(password, stored)` says if a login matches. Each step of the cost factor doubles the work, so it can be raised as computers get faster. See [[password-hashing|password hashing]].",
    conceptPageId: "bcrypt",
  },
  {
    id: "jwt",
    topicId: "authentication",
    term: "JWT",
    aliases: ["json web token", "token", "jot", "bearer token"],
    kind: "concept",
    short:
      "A small piece of signed text saying who a user is. Anyone can read it; nobody can forge it without the server's key.",
    body: "It is `header.payload.signature`. The payload holds claims like the user id and an expiry; the signature proves the server made it, using a secret key kept in an [[secrets-env-vars|environment variable]]. The Notes App keeps it in a [[secure-cookies|secure cookie]].",
    conceptPageId: "jwt",
  },
  {
    id: "secure-cookies",
    topicId: "authentication",
    term: "Secure cookies",
    aliases: ["cookie", "cookies", "httponly", "samesite", "secure"],
    kind: "concept",
    short:
      "Cookie settings that decide who can read a login cookie and when the browser sends it.",
    body: "`HttpOnly`: page JavaScript can't read it, which blunts [[xss|XSS]]. `Secure`: only sent over [[https|HTTPS]]. `SameSite`: not sent with requests other sites start (`Lax` still sends it when you follow a link), which blocks most [[csrf|CSRF]]. The server sets them in the `Set-Cookie` header.",
    conceptPageId: "secure-cookies",
  },
];
