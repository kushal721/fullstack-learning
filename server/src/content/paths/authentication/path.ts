import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const loginScene: Scene = {
  id: "logging-in",
  title: "Logging in, step by step",
  actors: [
    { id: "browser", label: "The browser", sub: "Login page" },
    { id: "api", label: "The API", sub: "login()" },
    { id: "database", label: "Database", sub: "users table" },
    { id: "bcrypt", label: "bcrypt", sub: "slow hash" },
  ],
  steps: [
    {
      from: "browser",
      to: "api",
      message: "POST /api/auth/login",
      caption:
        "The email and password go to the API in the request body, over HTTPS.",
      detail:
        "The password is only ever sent here, never stored in the browser.",
    },
    {
      from: "api",
      to: "database",
      message: "find the user by email",
      caption:
        "The API looks up the account. The database holds a hash, never the password itself.",
      detail: "SELECT id, email, password_hash … WHERE email = $1",
    },
    {
      from: "api",
      to: "bcrypt",
      message: "compare(password, hash)",
      caption:
        "bcrypt hashes the typed password with the stored salt and compares. Slow on purpose.",
      detail: "No user, or no match: the same “Invalid email or password”.",
    },
    {
      from: "api",
      to: "api",
      message: "sign a token",
      caption:
        "It matches, so the API signs a token saying “this is user 7”, valid for 7 days.",
      detail: 'jwt.sign({ sub: 7 }, JWT_SECRET, { expiresIn: "7d" })',
    },
    {
      from: "api",
      to: "browser",
      message: "Set-Cookie: token=…",
      caption:
        "The token goes back in an httpOnly cookie: page scripts can't read it.",
      detail: "Also sameSite lax, and secure in production.",
    },
    {
      from: "browser",
      to: "api",
      message: "GET /api/notes + cookie",
      caption:
        "Every later request carries the cookie; the API checks the token and knows who's asking.",
      detail: "requireAuth verifies it and sets req.user.",
    },
  ],
};

// Authentication: every step is a module. Counts and numbering are in the
// level files.
export const authenticationPath: TopicPath = {
  topicId: "authentication",
  summary: {
    what: "Authentication proves who someone is, such as logging in with a password; authorization decides what they may do.",
    does: "It lets the Notes App show you your own notes and nobody else's, and keeps strangers out.",
    how: "Passwords are stored as slow salted hashes. After login, a session or signed token in a cookie identifies you, and the server checks it on every request.",
  },
  overviewSceneId: "logging-in",
  scenes: [loginScene],
  levels: { basic, intermediate, advanced },
};
