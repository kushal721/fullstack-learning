import type { Concept } from "@fsl/shared";

export const inputValidation: Concept = {
  id: "input-validation",
  slug: "input-validation",
  title: "Input validation: browser and server",
  topicId: "security",
  summary:
    "Checking that data sent to the app has the shape and size the app expects before using it, in the browser to help the user and on the server because only the server's checks can be trusted.",
  basics: [
    "Input is any data that comes from outside your code: what a user types into a form, the `:id` in a URL, the JSON body of a request, cookies and headers.",
    "Your frontend is not the only thing that can send requests to your backend. Anyone can open the browser's developer tools and change a request, or skip the browser entirely with a tool like `curl` and send whatever they like.",
    "So the backend can't assume input looks the way the form would have made it. A title might be missing, empty, a number instead of text, or a million characters long, by accident or on purpose.",
  ],
  what: [
    "Input validation means checking every piece of input against clear rules before using it: is it there, is it the right type, is it within the allowed length or range? If not, the app refuses it with a helpful message instead of carrying on.",
    "It happens in two places with two different jobs. Browser (client-side) validation, such as `required` and `maxLength` on an input, gives the user instant feedback. Server-side validation is the real protection, because it runs on every request no matter how it was sent.",
  ],
  why: [
    "Without server-side checks, bad input reaches the database and the rest of the code. An empty title breaks the rule that every note has one, a huge note fills up storage, and a number where text is expected can crash code that calls `.trim()` on it, turning a user's mistake into a `500` error.",
    "Rejecting bad input early with `400 Bad Request` and a clear message is better for everyone: the user learns what to fix, and the code after the check can rely on the data being sensible.",
    "Browser checks alone protect nothing, because they can be switched off by anyone. But they still matter: they catch honest mistakes before a request is even sent, which is faster and friendlier.",
  ],
  howItWorks: [
    'In the browser, HTML attributes describe the rules: `required`, `maxLength={100}`, `type="email"`, `minLength={8}`. `maxLength` stops the user typing past the limit; the others are checked when the user submits, and the browser shows a message next to the field and doesn\'t send the form until they pass.',
    "On the server, a function checks the parsed body before anything else happens. In the Notes App, `validateNote(req.body)` returns an error message or nothing. The controller answers `400` with the message if there is one, and only otherwise goes on to the database.",
    "The rules should match on both sides. When they differ, the server's rules are the ones that count: the Notes App's server also limits a note's content to 10,000 characters, which the form doesn't check.",
  ],
  basicExample: {
    language: "js",
    code: `// UNSAFE: trusts that the browser checked the title
export async function createNote(req, res) {
  const { title, content } = req.body; // could be "", 42, or missing
  await pool.query("INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3)",
    [req.user.id, title.trim(), content]); // 42.trim() → TypeError → 500
}

// SAFE: the server checks every request itself
export async function createNote(req, res) {
  const error = validateNote(req.body);
  if (error) return res.status(400).json({ error }); // "Title is required"
  // …only valid notes get this far
}`,
    caption:
      "The first version works as long as everyone uses the form. The second also survives requests that don't come from it.",
    highlightLines: [6, 11],
  },
  internals: [
    'There are two styles of rule. An allowlist says what is accepted ("a whole number above 0"); a blocklist says what is refused ("no `<script>`"). Prefer allowlists: it is easy to forget one dangerous input, and impossible to forget what you expect.',
    "Validation and safe output are different jobs. Validation checks that input makes sense; it can't make text safe for every place it will be used. A title like `Bob's <b>list</b>` is perfectly valid, so the app still needs parameterized SQL (against SQL injection) and React's escaping (against XSS) when it uses that text.",
    'Some values are normalised before checking: the Notes App trims spaces off titles and lowercases emails, so `"  "` counts as an empty title and `You@Example.com` and `you@example.com` are the same account.',
    "Validation also has a limit before your code even runs: `express.json()` refuses request bodies over 100 kilobytes by default, so nobody can send a gigabyte of JSON.",
  ],
  howToCreate: [
    {
      text: "Create a tiny Express server with one route that validates its input.",
      code: {
        language: "bash",
        code: `mkdir validation-demo && cd validation-demo
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js`. `validateNote` returns a message for invalid input and nothing for valid input, like the Notes App's.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

function validateNote(body) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return "Title is required";
  if (title.length > 100) return "Title must be at most 100 characters";
}

const app = express();
app.use(express.json());
app.post("/notes", (req, res) => {
  const error = validateNote(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json({ title: req.body.title.trim() });
});
app.listen(3001, () => console.log("http://localhost:3001"));`,
      },
    },
    {
      text: "Run it with `node server.js`, then in a second terminal send requests without any browser or form, the way an attacker would. A good title gets `201`; an empty one, a number and a missing title all get `400` with a message, and the server keeps running.",
      code: {
        language: "bash",
        code: `curl -i -X POST localhost:3001/notes -H "Content-Type: application/json" -d '{"title":"Shopping"}'
curl -i -X POST localhost:3001/notes -H "Content-Type: application/json" -d '{"title":"   "}'
curl -i -X POST localhost:3001/notes -H "Content-Type: application/json" -d '{"title":42}'
curl -i -X POST localhost:3001/notes -H "Content-Type: application/json" -d '{}'`,
      },
    },
  ],
  whereUsed: [
    "Every route that accepts a body: registering, logging in, creating and updating notes.",
    "URL parameters and query strings, such as the `:id` in `/api/notes/:id`, which must be a positive whole number.",
    'Forms in the browser, with HTML attributes such as `required`, `minLength`, `maxLength` and `type="email"`.',
  ],
  connectsTo: [
    "HTML forms and inputs, whose attributes do the browser-side checks.",
    "Controllers, which call the validation before doing any work.",
    "HTTP status codes: `400 Bad Request` means the client sent something invalid.",
    "SQL injection and XSS, which validation alone can't prevent; parameters and escaping do that.",
  ],
  projectUsage: [
    {
      explanation:
        "`validateNote` is the server's check for every note: the title must be text, not blank after trimming and at most 100 characters; the content must be text of at most 10,000 characters. Its comment explains why the server checks again.",
      fileId: "backend/src/validation/noteValidation.js",
      match: "export function validateNote(body) {",
    },
    {
      explanation:
        "`createNote` calls it first and answers `400` with the message, so invalid notes never reach the INSERT.",
      fileId: "backend/src/controllers/notesController.js",
      match: "if (error) return res.status(400).json({ error });",
    },
    {
      explanation:
        "The note form's title input has `maxLength={100}` and `required`, the same rules the server applies, so most mistakes are caught before a request is sent.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "maxLength={100}",
    },
    {
      explanation:
        "`noteId` validates the id in the URL: anything that isn't a positive whole number is answered `404` before the database is asked.",
      fileId: "backend/src/controllers/notesController.js",
      match: "return Number.isInteger(id) && id > 0 ? id : null;",
    },
    {
      explanation:
        'Registration checks the email and the password length on the server too, even though the form has `type="email"` and `minLength={8}`.',
      fileId: "backend/src/controllers/authController.js",
      match: "if (password.length < PASSWORD_MIN_LENGTH) {",
    },
  ],
  commonMistakes: [
    "Validating only in the browser. It feels done when you test with the form, but any request sent another way skips it.",
    "Adding a new field to the form and the database but not to the server's validation function. Every new field needs a server rule.",
    "Using validation instead of parameterized queries or escaping. Validation checks meaning; it doesn't make text safe to put into SQL or HTML.",
    "Sending back a vague `400` with no message, or a `500` because invalid input crashed the code. Say which rule failed, so the user can fix it.",
  ],
  relatedConcepts: [
    "sql-injection",
    "xss",
    "html-form",
    "html-input",
    "controller",
    "http-status-codes",
    "request-body",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
