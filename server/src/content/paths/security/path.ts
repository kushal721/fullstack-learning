import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const attackScene: Scene = {
  id: "an-attack",
  title: "An attack, and what stops it",
  actors: [
    { id: "attacker", label: "The attacker", sub: "Their browser" },
    { id: "api", label: "The API", sub: "Express" },
    { id: "database", label: "Database", sub: "notes table" },
    { id: "victim", label: "Your browser", sub: "Logged in" },
  ],
  steps: [
    {
      from: "attacker",
      to: "api",
      message: "POST /api/notes",
      caption:
        "The attacker saves a note whose title is HTML with a hidden script in it.",
      detail: 'title: "<img src=x onerror=steal()>"',
    },
    {
      from: "api",
      to: "api",
      message: "validate the body",
      caption:
        "The API checks the shape: a string, 1 to 100 characters. It passes: it's only text.",
      detail: "Validation checks shape; it can't spot every attack.",
    },
    {
      from: "api",
      to: "database",
      message: "INSERT … VALUES ($1, $2)",
      caption:
        "A parameterized query stores the title as a value, so it can never change the SQL.",
      detail: "Typing ' OR 1=1 -- would be stored as text too.",
    },
    {
      from: "victim",
      to: "api",
      message: "GET /api/notes",
      caption:
        "Later, the note is shown to someone. The API sends it back as JSON, as it was saved.",
      detail: "The data is never trusted, wherever it came from.",
    },
    {
      from: "victim",
      to: "victim",
      message: "React renders {note.title}",
      caption:
        "React inserts the title as text, so the tags are shown, not run. No script, no XSS.",
      detail: "innerHTML would have run it.",
    },
    {
      from: "attacker",
      to: "victim",
      message: "a page with a hidden form",
      caption:
        "The attacker tries again: their site makes your browser post to the API.",
      detail: "Cross-site request forgery (CSRF).",
    },
    {
      from: "victim",
      to: "api",
      message: "POST /api/notes, no cookie",
      caption:
        "The login cookie is SameSite, so the browser leaves it off. The API answers 401.",
      detail: "Each layer stopped one attack: defence in depth.",
    },
  ],
};

// Security: every step is a module. Counts and numbering are in the level
// files.
export const securityPath: TopicPath = {
  topicId: "security",
  summary: {
    what: "Security is building an app so attackers can't read, change or break what isn't theirs.",
    does: "It keeps the Notes App's notes and accounts safe from scripts hidden in input, forged requests, leaked secrets and guessing.",
    how: "Treat all input as untrusted, check it on the server, keep data separate from code, limit what each part may do, and watch for attacks.",
  },
  overviewSceneId: "an-attack",
  scenes: [attackScene],
  levels: { basic, intermediate, advanced },
};
