import type { Concept } from "@fsl/shared";

export const safeErrorMessages: Concept = {
  id: "safe-error-messages",
  slug: "safe-error-messages",
  title: "Safe error messages",
  topicId: "security",
  summary:
    "Tell users enough to fix what they can fix, keep the technical details in the server's logs, and never let an error answer reveal something an attacker could use.",
  basics: [
    "Things go wrong in every app: a user types an invalid title, a password is wrong, the database is briefly unreachable, a bug throws an exception.",
    "When something fails, the server still has to send an answer: a status code and, usually, a message the frontend can show.",
    "Errors contain a lot of information. A raw database error can include table and column names, the SQL text and file paths on the server; a stack trace lists the code that ran. Developers need that information. Visitors, including attackers, shouldn't get it.",
  ],
  what: [
    "A safe error message is written for the person using the app: short, honest about what they can do, and free of internal details. The details go to the server's log, where only the team can read them.",
    'It also means giving the same answer in cases an attacker would like to tell apart: "wrong password" and "no such email", "not your note" and "no such note".',
  ],
  why: [
    'Internal details are a map for attackers. A message like `column "pasword_hash" does not exist` or a stack trace tells them which database, libraries and file layout the app uses, and where to probe next.',
    'Different answers leak facts. If login said "no account with that email", anyone could check which emails are registered, a useful first step for guessing passwords or for phishing.',
    "Users can't do anything with a stack trace anyway. \"Title is required\" helps them; `TypeError: Cannot read properties of undefined (reading 'trim')` doesn't.",
  ],
  howItWorks: [
    "Expected problems are answered on purpose, with a status code and a clear message: `400 Title is required`, `401 Please log in`, `404 Note not found`, `409 Email already registered`.",
    "Unexpected errors, anything thrown and not handled, travel to Express's error handler, a middleware function with four parameters `(err, req, res, next)` added after the routes. Express 5 also forwards errors from `async` route functions there.",
    "The Notes App's handler logs the full error with `console.error(err)`, so the team can see it, and answers with only `500 Something went wrong`. One known case, a body that isn't valid JSON, gets `400 Invalid JSON`.",
    "Without such a handler, Express's built-in one answers instead, and outside production it sends the full stack trace to the browser.",
  ],
  basicExample: {
    language: "js",
    code: `// UNSAFE: sends the raw error to whoever made the request
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
  // → "relation \\"notes\\" does not exist", file paths, library versions…
});

// SAFE (the Notes App): log the details, tell the user less
app.use((err, req, res, next) => {
  console.error(err); // full details, in the server's log only
  if (res.headersSent) return next(err);
  if (err.status === 400) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  res.status(500).json({ error: "Something went wrong" });
});`,
    caption:
      "The same error, two audiences: the developer reads the log, the user reads the response.",
    highlightLines: [3, 9, 14],
  },
  internals: [
    "Express recognises an error handler only by its four parameters. Leaving out `next`, even if unused, turns it into ordinary middleware that never receives errors.",
    "It must be added after all routes: Express passes errors forward to the next error handler in the order they were added.",
    "`if (res.headersSent) return next(err)` covers errors that happen after the answer has started: a second answer is impossible, so Express's default handler closes the connection.",
    "Equal messages are only part of hiding a difference. A noticeably faster answer for an unknown email could also give it away. The Notes App skips the password check when the email is unknown, which is a small timing difference; some apps hash a dummy password to even this out.",
    'In a bigger app, logs go to a logging service and each error gets an id. The user sees "Something went wrong (error 7f3a)", and support can find the details by that id.',
  ],
  howToCreate: [
    {
      text: "Create an Express app with one route that fails the way a database error would.",
      code: {
        language: "bash",
        code: `mkdir errors-demo && cd errors-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js`. The `/boom` route throws an error full of internal details; the error handler at the end keeps them out of the response.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.get("/boom", async () => {
  throw new Error('relation "notes" does not exist (at /srv/app/src/db.js:12)');
});

// Comment out this handler to see what Express sends without it.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(3001, () => console.log("http://localhost:3001"));`,
      },
    },
    {
      text: 'Run `node server.js` and request `/boom`. The response is only `{"error":"Something went wrong"}`, while the terminal running the server shows the full error and stack trace. Comment out the handler, restart and try again: Express\'s default page now shows the message and stack trace to anyone.',
      code: { language: "bash", code: "curl -i localhost:3001/boom" },
    },
  ],
  whereUsed: [
    "Every API's error handler and every login, registration and password-reset form.",
    "Frontends, which show the server's safe message and never the raw error object.",
    "Logs and monitoring, where the full details belong.",
  ],
  connectsTo: [
    "HTTP status codes, which carry the kind of error.",
    "Express middleware: the error handler is middleware with four parameters.",
    "JavaScript error handling: `throw`, `try`/`catch` and async errors.",
    "Authentication vs authorization: the Notes App's `404` for other users' notes is a safe error too.",
  ],
  projectUsage: [
    {
      explanation:
        "The app's error handler logs every unexpected error and answers `500 Something went wrong`. Its comment sums it up: log the details, tell the user less.",
      fileId: "backend/src/app.js",
      match:
        "// errors from async functions). Log the details, tell the user less.",
    },
    {
      explanation:
        "Login gives the same `401 Invalid email or password` whether the email is unknown or the password is wrong.",
      fileId: "backend/src/controllers/authController.js",
      match:
        'return res.status(401).json({ error: "Invalid email or password" });',
    },
    {
      explanation:
        "A note that belongs to someone else gets the same `404 Note not found` as one that doesn't exist, as the comment explains.",
      fileId: "backend/src/controllers/notesController.js",
      match: "// the same answer, so nobody can find out which note ids exist.",
    },
    {
      explanation:
        "The frontend's `request` shows the server's `error` message, or a generic one if there isn't any, never the raw response.",
      fileId: "frontend/src/services/request.js",
      match: 'throw new Error(data?.error ?? "Something went wrong");',
    },
  ],
  commonMistakes: [
    'Sending `err.message` or `err.stack` to the client "to help debugging". Debug from the logs.',
    "Writing the error handler with three parameters, or before the routes, so it never runs.",
    'Different messages for "unknown email" and "wrong password".',
    "Swallowing errors without logging them, so the user sees a polite message and the team sees nothing.",
  ],
  relatedConcepts: [
    "http-status-codes",
    "express-middleware",
    "js-error-handling",
    "authentication-vs-authorization",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["add-security"],
};
