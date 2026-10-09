import type { Concept } from "@fsl/shared";

export const controller: Concept = {
  id: "controller",
  slug: "controller",
  title: "Controllers",
  topicId: "backend",
  summary:
    "A function that does the actual work for a route: it reads the request, validates it, talks to the database and sends the response.",
  basics: [
    "In an Express server, a route connects a method and a path, such as `POST /api/notes`, to a handler function. The handler receives the request (`req`) and the response (`res`).",
    "As an app grows, the handlers grow too: they check the input, run database queries and decide what to answer. If all of that sits inside the route files, it becomes hard to see which URLs the app has at all.",
    "Splitting code by job is a common habit in programming: each file or function has one clear responsibility, so you know where to look when something needs to change.",
  ],
  what: [
    "A controller is a plain function `(req, res)` that holds the work for one action, such as `createNote` or `deleteNote`. Controllers for the same kind of data are usually kept together in one file, such as `notesController.js`.",
    'The route file then only says which URL calls which controller: `router.post("/", notesController.createNote)`. Routes answer "which URL?"; controllers answer "what do we do?".',
  ],
  why: [
    "Separating the two keeps both easy to read. You can see the whole API at a glance in the route file, and you can open one controller to understand exactly what one action does.",
    "Controllers follow the same steps for every action, so a reader always knows what to expect: read the input, validate it, call the database, choose the status code, send JSON. That repetition makes mistakes, such as a missing validation, easy to spot.",
  ],
  howItWorks: [
    "Read the input: the controller takes what it needs from `req.body` (the sent data), `req.params` (values in the path, like `:id`) and `req.user` (the logged-in user, set by the auth middleware).",
    "Validate it: if something is missing or wrong, it answers `400 Bad Request` with an error message and stops with `return`.",
    "Do the work: it calls the database, usually with `await` because the query takes time.",
    "Answer: it picks the status code that describes the result (`200 OK`, `201 Created`, `204 No Content`, `404 Not Found`) and sends the data with `res.json()`. Unexpected errors are not handled here; in Express 5 they go to the error-handling middleware automatically.",
  ],
  basicExample: {
    language: "js",
    fileName: "backend/src/controllers/notesController.js",
    code: `import { pool } from "../db.js";
import { validateNote } from "../validation/noteValidation.js";

export async function createNote(req, res) {
  // 1. Read the input
  const { title, content } = req.body ?? {};

  // 2. Validate it
  const error = validateNote({ title, content });
  if (error) {
    return res.status(400).json({ error });
  }

  // 3. Save it in the database
  const result = await pool.query(
    "INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
    [req.user.id, title, content],
  );

  // 4. Answer with the right status code
  res.status(201).json(result.rows[0]);
}`,
    caption:
      "The Notes App's `createNote` controller: read, validate, save, answer with `201 Created`.",
  },
  internals: [
    "A controller is not special to Express. It is an ordinary exported function, and the router simply calls it with `req` and `res` when the route matches.",
    "Controllers are often `async` because database calls return promises. If a query fails, the promise is rejected and Express 5 forwards the error to the error-handling middleware, which answers `500`, so the controller does not need its own `try`/`catch` for unexpected errors.",
    "The `$1`, `$2`, `$3` placeholders in the SQL are filled in by the database driver from the array of values. The user's text is never pasted into the SQL itself, which protects against SQL injection.",
    "Keeping controllers thin (reading, deciding and answering, while checks like `validateNote` live in their own module) makes them easy to test: you can call a controller with a fake `req` and `res` and check the status it chose.",
  ],
  howToCreate: [
    {
      text: "Set up a project with Express (skip this if you already have one).",
      code: {
        language: "bash",
        code: `mkdir api && cd api
npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Write the controllers in their own file. An array stands in for the database here.",
      code: {
        language: "js",
        fileName: "notesController.js",
        code: `const notes = [];

export function listNotes(req, res) {
  res.status(200).json(notes);
}

export function createNote(req, res) {
  const { title, content } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  const note = { id: notes.length + 1, title, content: content ?? "" };
  notes.push(note);
  res.status(201).json(note);
}`,
      },
    },
    {
      text: "In `server.js`, connect the URLs to the controllers. This file now only says which URL calls which function.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
import * as notesController from "./notesController.js";

const app = express();
app.use(express.json());

app.get("/api/notes", notesController.listNotes);
app.post("/api/notes", notesController.createNote);

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js` and create a valid and an invalid note from a second terminal.",
      code: {
        language: "bash",
        code: `curl -i -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Shopping","content":"Milk"}'

curl -i -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{}'`,
      },
    },
    {
      text: 'The first answers `201 Created` with the note and its `id`, the second answers `400` with `{"error":"Title is required"}`. `curl -i http://localhost:3000/api/notes` then lists the saved note.',
    },
  ],
  whereUsed: [
    "Most Express APIs: one controller file per resource (notes, users, orders) with one function per action.",
    "Larger apps sometimes add another layer below the controller (often called a service) for business rules shared by several controllers.",
  ],
  connectsTo: [
    "Express routes, which decide which controller runs for each method and path.",
    "Middleware that runs first: `express.json()` fills `req.body` and the auth middleware sets `req.user`.",
    "Validation code that checks the input before it is used.",
    "The database, which the controller reads from and writes to with SQL queries.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/controllers/notesController.js` exports `listNotes`, `createNote`, `updateNote` and `deleteNote`, and `backend/src/routes/notes.js` maps each one to its method and path.",
    },
    {
      explanation:
        '`createNote` validates `req.body` with `validateNote` from `validation/noteValidation.js` (answering `400` with `{ "error": "Title is required" }` if invalid), runs a parameterized `INSERT ... RETURNING *` with `req.user.id` and replies `201` with the saved note.',
    },
    {
      explanation:
        "`updateNote` replies `200` with the changed note and `deleteNote` replies `204` with no body; both answer `404` when the note does not exist for this user. Login and registration live in `authController` in the same way.",
    },
  ],
  commonMistakes: [
    "Forgetting `return` after sending an error, so the controller carries on and tries to send a second response. Write `return res.status(400).json(...)`.",
    "Always answering `200`, even when something was created or not found. Use the code that describes the result: `201` for created, `204` for deleted, `404` when the item does not exist.",
    "Taking the user id from `req.body` instead of `req.user`. Anyone can put any id in the body; only the id set by the auth middleware from the verified login token can be trusted.",
    "Putting everything (routes, validation, SQL, response) into one giant function in `server.js`. Move the work into controllers and the checks into their own module so each piece stays small.",
  ],
  relatedConcepts: [
    "express-route",
    "request-body",
    "http-status-codes",
    "express-middleware",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
