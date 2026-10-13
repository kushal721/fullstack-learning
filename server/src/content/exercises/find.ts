import type { FindExercise } from "@fsl/shared";

// Where is it? Pick the file or symbol in the project.
export const findExercises: FindExercise[] = [
  {
    id: "find-note-validation",
    mode: "find",
    title: "Where are notes checked?",
    prompt:
      "Which file defines the function that checks a note's title and content on the server before it is saved?",
    target: "file",
    acceptedIds: ["backend/src/validation/noteValidation.js"],
    conceptIds: ["input-validation"],
    buildStepId: "add-security",
    hints: [
      "It runs on the server, so it is somewhere under `backend/`.",
      "The controller calls it, but it lives in its own folder so it can be tested on its own.",
    ],
    explanation:
      "`validateNote` lives in `backend/src/validation/noteValidation.js`. Keeping it out of the controller means it has its own unit tests (`noteValidation.test.js`), and both `createNote` and `updateNote` can use the same rules.",
  },
  {
    id: "find-create-note-function",
    mode: "find",
    title: "Which createNote?",
    prompt:
      "When the user clicks Save, the frontend calls `createNote({ title, content })`. Which file defines the function it calls?",
    target: "file",
    acceptedIds: ["frontend/src/services/notesApi.js"],
    conceptIds: ["js-module-import-export", "js-fetch"],
    buildStepId: "add-api-communication",
    hints: [
      "Two files define a `createNote`. Which one can code in the browser call?",
      "Look at the `import` at the top of `NoteForm.jsx`.",
    ],
    explanation:
      "`NoteForm.jsx` imports `createNote` from `../services/notesApi.js`, the frontend's file of API functions, which sends `POST /api/notes`. The backend's `notesController.js` also has a `createNote`, but it runs on the server: the browser can never call it directly, only send a request that Express routes to it. Same name, different programs, connected only by HTTP.",
  },
  {
    id: "find-login-check",
    mode: "find",
    title: "Who checks the login?",
    prompt:
      "Every notes request must come from a logged-in user. Which function checks the login cookie before any notes controller runs?",
    target: "symbol",
    acceptedIds: ["middleware:requireAuth"],
    conceptIds: ["express-middleware", "jwt"],
    buildStepId: "add-authentication",
    hints: [
      "It's middleware, so it lives in its own folder on the backend.",
      "It verifies a JWT and sets `req.user`.",
    ],
    explanation:
      "`requireAuth` in `backend/src/middleware/authMiddleware.js` reads `req.cookies.token`, verifies it with `jwt.verify` and sets `req.user`, or answers `401`. `routes/notes.js` puts it in front of every notes route with `notesRoutes.use(requireAuth)`, so the controllers never have to check the login themselves.",
  },
  {
    id: "find-unique-email",
    mode: "find",
    title: "One account per email",
    prompt:
      "Two people can never register with the same email address, even if they press Register at the same moment. Which file holds the rule that guarantees it?",
    target: "file",
    acceptedIds: ["database/schema.sql"],
    conceptIds: ["sql-table", "http-status-codes"],
    buildStepId: "add-authentication",
    hints: [
      'A check in JavaScript ("does this email exist yet?") can be beaten by two requests at once. Who sees every insert?',
      "Look for `UNIQUE`.",
    ],
    explanation:
      "`database/schema.sql` declares `email TEXT NOT NULL UNIQUE`, so PostgreSQL itself refuses a second row with the same email, however many requests arrive at once. The register controller relies on that rule: it catches the database's unique-violation error and answers `409 Email already registered`, instead of checking first and racing another request.",
  },
  {
    id: "find-register-hash",
    mode: "find",
    title: "Where passwords are hashed",
    prompt:
      "Passwords are never stored as typed. Which function hashes a new user's password before it is saved?",
    target: "symbol",
    acceptedIds: ["controller:authController.register"],
    conceptIds: ["password-hashing", "bcrypt"],
    buildStepId: "add-authentication",
    hints: [
      "It happens on the server, when an account is created.",
      "Look in the auth controller.",
    ],
    explanation:
      "The `register` controller in `backend/src/controllers/authController.js` calls `bcrypt.hash(password, BCRYPT_COST)` and stores only the result in `password_hash`. The browser never hashes anything: it sends the password over HTTPS, and the server decides how it is stored. Login uses `bcrypt.compare` in the same file to check a typed password against the hash.",
  },
  {
    id: "find-dev-proxy",
    mode: "find",
    title: "How /api reaches the backend",
    prompt:
      "In development, the React app runs on port 5173 and the API on port 3000, yet the frontend simply fetches `/api/notes`. Which file makes that work?",
    target: "file",
    acceptedIds: ["frontend/vite.config.js"],
    conceptIds: ["vite", "cors"],
    buildStepId: "add-api-communication",
    hints: [
      "The request goes to port 5173 first. Which program is listening there?",
      "It's a configuration file, not application code.",
    ],
    explanation:
      "`frontend/vite.config.js` tells Vite's development server to forward every request under `/api` to `http://localhost:3000`. The browser only ever talks to port 5173, so it sees one website: relative URLs work, the login cookie is sent normally, and no CORS setup is needed. In production, a rewrite rule on the host does the same job.",
  },
  {
    id: "find-error-handler",
    mode: "find",
    title: "The last-resort error handler",
    prompt:
      "When something unexpected fails on the backend, the user gets `500 Something went wrong` while the details are logged. Which file holds the code that does that?",
    target: "file",
    acceptedIds: ["backend/src/app.js"],
    conceptIds: ["safe-error-messages", "express-middleware"],
    buildStepId: "add-security",
    hints: [
      "Express error handlers are middleware with four parameters, added after all routes.",
      "Which file adds the middleware and the routes to the app?",
    ],
    explanation:
      "`backend/src/app.js` builds the Express app: `express.json()` and `cookieParser()` first, then the routes, and last an error handler `(err, req, res, next)`. Express sends every unhandled error there; it logs the details with `console.error` and answers `500 Something went wrong`, or `400 Invalid JSON` for a body that isn't JSON.",
  },
];
