import type { Concept } from "@fsl/shared";

export const authenticationVsAuthorization: Concept = {
  id: "authentication-vs-authorization",
  slug: "authentication-vs-authorization",
  title: "Authentication vs authorization",
  topicId: "authentication",
  summary:
    "Authentication finds out who is making a request; authorization decides what that person is allowed to do. An app needs both, checked on the server, for every request.",
  basics: [
    "Every request that reaches a backend comes from somewhere, and the backend has to decide whether to do what it asks.",
    "Think of an office building. At the front desk you show an ID card, and the guard checks it is really you. That only proves who you are. Whether your key card opens a particular room is a separate question with a separate answer.",
    'Web apps ask the same two questions, and the words for them look alike, which is why they are often mixed up: authentication ("auth-N", who are you?) and authorization ("auth-Z", are you allowed to do this?).',
  ],
  what: [
    "Authentication proves identity. In the Notes App it happens once at login (email and password) and is then repeated on every request by checking the signed login cookie. Its result is a user id, `req.user.id`.",
    "Authorization uses that identity to decide whether an action is allowed. In the Notes App the rule is simple: you may only read, change and delete your own notes. Every notes query enforces it with `user_id = …`.",
  ],
  why: [
    "Authentication alone is not enough. If the app only checked that someone is logged in, any user could change the number in `/api/notes/7` and edit someone else's note. This is one of the most common real-world API bugs, called an insecure direct object reference (IDOR).",
    "Authorization alone is impossible: you can't decide what someone may do without knowing who they are. So authentication always comes first.",
    'Keeping them separate in your head (and in your code) makes each easier to check: one place answers "who?", and every data access answers "may they?".',
  ],
  howItWorks: [
    'Authentication, step 1: `requireAuth` runs before every notes route. It reads the `token` cookie and verifies it. No valid token: it answers `401 Unauthorized` (which, despite the name, means "not authenticated"). Valid token: it sets `req.user = { id }`.',
    "Authorization, step 2: the controller puts `req.user.id` into every query: `WHERE user_id = $1` to list, `WHERE id = $3 AND user_id = $4` to update. A note that belongs to someone else simply doesn't match, so the answer is `404 Not Found`.",
    "Many apps answer `403 Forbidden` when a logged-in user isn't allowed to do something. The Notes App answers `404` instead, so nobody can even find out that another user's note exists.",
  ],
  basicExample: {
    language: "js",
    code: `// Authentication only: any logged-in user can change ANY note
notesRoutes.use(requireAuth); // who are you? → req.user
await pool.query(
  "UPDATE notes SET title = $1 WHERE id = $2",
  [title, req.params.id], // user 2 can change user 1's note 7
);

// Authentication + authorization (the Notes App)
notesRoutes.use(requireAuth);
await pool.query(
  "UPDATE notes SET title = $1 WHERE id = $2 AND user_id = $3",
  [title, id, req.user.id], // only the owner's row can match
);`,
    caption:
      "Both versions require a login. Only the second one checks that the note belongs to the person logged in.",
    highlightLines: [4, 11],
  },
  internals: [
    'The status codes follow the two questions: `401` means "I don\'t know who you are, log in", `403` means "I know who you are, and you may not do this". Using `404` for someone else\'s data is a deliberate choice to reveal less.',
    "Authorization must happen on the server. Hiding an Edit button in the frontend is only for convenience: anyone can send the request without the button.",
    "Bigger apps have richer rules, for example roles (an admin may delete any comment) or sharing (a note shared with you may be read but not changed). The idea stays the same: each action checks the rule for this user and this piece of data.",
    "Putting the check inside the query, as the Notes App does, means it can't be forgotten between a separate check and the actual change, and it costs no extra query.",
  ],
  howToCreate: [
    {
      text: "Create a small Express app where the user is chosen by a header. That is only for this demo; a real app gets the user from a verified login.",
      code: {
        language: "bash",
        code: `mkdir authz-demo && cd authz-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js` with two notes and two ways of reading one: authenticated only, and authenticated plus authorized.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const notes = [
  { id: 1, userId: 1, title: "Ana's diary" },
  { id: 2, userId: 2, title: "Ben's diary" },
];

const app = express();

// Authentication (demo only): who is asking?
app.use((req, res, next) => {
  const id = Number(req.get("X-User"));
  if (!id) return res.status(401).json({ error: "Please log in" });
  req.user = { id };
  next();
});

// Authentication only
app.get("/unsafe/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  note ? res.json(note) : res.status(404).json({ error: "Note not found" });
});

// Authentication + authorization
app.get("/notes/:id", (req, res) => {
  const note = notes.find(
    (n) => n.id === Number(req.params.id) && n.userId === req.user.id,
  );
  note ? res.json(note) : res.status(404).json({ error: "Note not found" });
});

app.listen(3001, () => console.log("http://localhost:3001"));`,
      },
    },
    {
      text: "Run `node server.js` and, in a second terminal, ask for Ben's note as Ana (user 1). Without a user you get `401`. The unsafe route hands over Ben's diary; the authorized route answers `404`.",
      code: {
        language: "bash",
        code: `curl -i localhost:3001/notes/2
curl -i -H "X-User: 1" localhost:3001/unsafe/notes/2
curl -i -H "X-User: 1" localhost:3001/notes/2`,
      },
    },
  ],
  whereUsed: [
    "Every API that has users: authentication in middleware in front of the routes, authorization in each route or query that touches someone's data.",
    "Admin pages and roles, where the authorization rule depends on what kind of user is asking.",
    "Sharing features, where the rule depends on both the user and the specific item.",
  ],
  connectsTo: [
    "JWTs and secure cookies, which carry the proof of identity between requests.",
    "Express middleware, where `requireAuth` does the authentication.",
    "SQL `WHERE` clauses and parameterized queries, where the Notes App does the authorization.",
    "HTTP status codes `401`, `403` and `404`.",
  ],
  projectUsage: [
    {
      explanation:
        "Authentication: `notesRoutes.use(requireAuth)` runs the login check before every notes route.",
      fileId: "backend/src/routes/notes.js",
      match: "notesRoutes.use(requireAuth);",
    },
    {
      explanation:
        "`requireAuth` verifies the token and records who is asking in `req.user`, or answers `401`.",
      fileId: "backend/src/middleware/authMiddleware.js",
      match: "req.user = { id: payload.sub };",
    },
    {
      explanation:
        "Authorization: the comment at the top of the notes controller states the rule, and every query below it includes `user_id = $n`.",
      fileId: "backend/src/controllers/notesController.js",
      match:
        "// Every query includes `user_id = $n` with the logged-in user's id, so a",
    },
    {
      explanation:
        "Updating a note only matches the owner's row; another user's note gets the same `404` as a missing one.",
      fileId: "backend/src/controllers/notesController.js",
      match: "WHERE id = $3 AND user_id = $4",
    },
    {
      explanation:
        "A backend test logs in as one user and checks that another user's notes can't be listed, changed or deleted.",
      fileId: "backend/src/routes/notes.test.js",
      match: 'it("never shows or changes another user\'s notes", async () => {',
    },
  ],
  commonMistakes: [
    "Checking only that the user is logged in, and forgetting to check that the item belongs to them.",
    "Taking the user id from the request body or the URL (`req.body.userId`) instead of from the verified login. Anyone can type any id.",
    "Enforcing permissions only in the frontend, by hiding buttons or links.",
    "Checking ownership when reading but not when updating or deleting. Every query that touches a user's data needs the check.",
  ],
  relatedConcepts: [
    "jwt",
    "secure-cookies",
    "express-middleware",
    "http-status-codes",
    "sql-update-delete",
    "least-privilege",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["add-security"],
};
