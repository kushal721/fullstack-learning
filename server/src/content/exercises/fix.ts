import type { FixExercise } from "@fsl/shared";

// What's wrong with this code? Each snippet has one real bug.
export const fixExercises: FixExercise[] = [
  {
    id: "fix-delete-any-note",
    mode: "fix",
    title: "Deleting someone else's note",
    prompt:
      "With this version of `deleteNote`, any logged-in user can delete any note by changing the id in the URL. Which change fixes it?",
    snippet: {
      language: "js",
      code: 'export async function deleteNote(req, res) {\n  const id = noteId(req);\n  if (!id) return res.status(404).json({ error: "Note not found" });\n  const result = await pool.query("DELETE FROM notes WHERE id = $1", [id]);\n  if (result.rowCount === 0) {\n    return res.status(404).json({ error: "Note not found" });\n  }\n  res.status(204).end();\n}',
      fileName: "backend/src/controllers/notesController.js",
      highlightLines: [4],
    },
    choices: [
      {
        id: "add-user-filter",
        text: 'Add the owner to the condition: `"DELETE FROM notes WHERE id = $1 AND user_id = $2", [id, req.user.id]`.',
      },
      {
        id: "check-number",
        text: "Check that the id is a number before deleting.",
      },
      {
        id: "hide-button",
        text: "Only show the Delete button on the user's own notes.",
      },
      {
        id: "try-catch",
        text: "Wrap the query in `try`/`catch` and answer `500` when it fails.",
      },
    ],
    correctChoiceId: "add-user-filter",
    conceptIds: ["authentication-vs-authorization", "sql-update-delete"],
    buildStepId: "add-security",
    hints: [
      "The user is logged in, so authentication works. Which question is never asked?",
      "Which value says who is asking, and where is it missing?",
    ],
    explanation:
      "The query only matches the id, so it deletes whichever note has it. Adding `AND user_id = $2` with `req.user.id`, the id from the verified login, means the row is only deleted if it belongs to the person asking; anyone else's note gives `rowCount` 0 and `404`. `noteId` already checks the number, hiding the button doesn't stop a request sent without it, and `try`/`catch` doesn't change which rows match.",
  },
  {
    id: "fix-wrong-endpoint",
    mode: "fix",
    title: "Editing always fails",
    prompt:
      'Saving an edited note always shows "Something went wrong" on the card. In the browser\'s Network tab, the request is `PUT /api/note/7` and the answer is `404`. Which change fixes it?',
    snippet: {
      language: "js",
      code: 'export function updateNote(id, { title, content }) {\n  return request(`/api/note/${id}`, {\n    method: "PUT",\n    body: { title, content },\n  });\n}',
      fileName: "frontend/src/services/notesApi.js",
      highlightLines: [2],
    },
    choices: [
      {
        id: "fix-path",
        text: "Change the path to `/api/notes/${id}`, the URL the backend's notes router is mounted at.",
      },
      {
        id: "post",
        text: "Change the method to `POST`.",
      },
      {
        id: "new-route",
        text: "Add a second backend route for `PUT /api/note/:id`.",
      },
      {
        id: "credentials",
        text: 'Add `credentials: "include"` so the login cookie is sent.',
      },
    ],
    correctChoiceId: "fix-path",
    conceptIds: ["rest-endpoint", "http-status-codes"],
    buildStepId: "add-api-communication",
    hints: [
      'A `404` means no route matched the method and path. Compare the path with `app.use("/api/notes", notesRoutes)`.',
    ],
    explanation:
      'The backend mounts the notes router at `/api/notes`, so `PUT /api/note/7` (singular) matches nothing and Express answers `404 Cannot PUT /api/note/7` as an HTML page. `request()` can\'t read that as JSON, so it throws its generic "Something went wrong". Fixing the path to `/api/notes/${id}` is the whole fix. A second backend route would hide the typo and leave two URLs for one thing; `POST` is for creating; and the cookie is already sent by `request()`, and a missing login would be `401`, not `404`.',
  },
  {
    id: "fix-missing-await",
    mode: "fix",
    title: "A blank card appears",
    prompt:
      "After this change to `handleSave`, clicking Save adds an empty card to the top of the list. After a reload the note is there and looks fine. Which change fixes it?",
    snippet: {
      language: "jsx",
      code: 'async function handleSave(event) {\n  event.preventDefault();\n  setIsSaving(true);\n  setError(null);\n  try {\n    const note = createNote({ title, content });\n    onSaved(note);\n    setTitle("");\n    setContent("");\n  } catch (err) {\n    setError(err.message);\n  } finally {\n    setIsSaving(false);\n  }\n}',
      fileName: "frontend/src/components/NoteForm.jsx",
      highlightLines: [6],
    },
    choices: [
      {
        id: "await",
        text: "Write `const note = await createNote({ title, content });`.",
      },
      {
        id: "reload",
        text: "Reload the notes from the server after every save.",
      },
      {
        id: "json",
        text: "Call `JSON.parse(note)` before `onSaved(note)`.",
      },
      {
        id: "remove-try",
        text: "Remove the `try`/`catch`, which hides the error.",
      },
    ],
    correctChoiceId: "await",
    conceptIds: ["js-async-await", "js-promise"],
    buildStepId: "add-api-communication",
    hints: [
      "What does an `async` function like `createNote` return straight away?",
      "The reload shows the note was saved. So the request works; what reached `onSaved`?",
    ],
    explanation:
      "`createNote` returns a Promise immediately; the saved note only arrives later. Without `await`, `note` is the Promise itself, so `onSaved` puts a Promise into the list and the card has no `title` or `content` to show. The request still finishes in the background, which is why the note is there after a reload. With `await`, `handleSave` waits for the saved note. It also makes the `catch` work: without `await`, a failed request rejects after the `try` has finished, so the error is never caught.",
  },
  {
    id: "fix-unhashed-password",
    mode: "fix",
    title: "New accounts can't log in",
    prompt:
      "After this change to `register`, creating an account answers `201`, but the automatic login right after fails with `401 Invalid email or password`, every time. Which change fixes it?",
    snippet: {
      language: "js",
      code: 'export async function register(req, res) {\n  const { email, password } = readCredentials(req.body);\n  // …email and length checks…\n  const result = await pool.query(\n    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",\n    [email, password],\n  );\n  res.status(201).json(result.rows[0]);\n}',
      fileName: "backend/src/controllers/authController.js",
      highlightLines: [6],
    },
    choices: [
      {
        id: "bcrypt",
        text: "Store `await bcrypt.hash(password, BCRYPT_COST)` instead of `password`.",
      },
      {
        id: "compare-plain",
        text: "Change `login` to compare the typed password with `password_hash` using `===`.",
      },
      {
        id: "sha256",
        text: "Store a SHA-256 hash of the password, which is faster.",
      },
      {
        id: "encrypt",
        text: "Encrypt the password with `JWT_SECRET` before storing it.",
      },
    ],
    correctChoiceId: "bcrypt",
    conceptIds: ["why-never-store-plain-passwords", "bcrypt"],
    buildStepId: "add-authentication",
    hints: [
      "What does `login` do with `password_hash`?",
      "Login failing is the visible bug. Is there a worse, invisible one?",
    ],
    explanation:
      "The code stores the typed password itself in `password_hash`. `login` checks with `bcrypt.compare`, which expects a bcrypt hash and returns `false` for plain text, so every new account fails to log in. That is the visible bug; the invisible one is worse: anyone who sees the database would read every password. Hashing with `bcrypt.hash` fixes both. Comparing with `===` would make login work and keep the passwords readable; SHA-256 is far too fast to resist guessing; encryption can be undone by anyone who has the key.",
  },
  {
    id: "fix-hidden-delete-error",
    mode: "fix",
    title: "Delete fails silently",
    prompt:
      'With the backend stopped, clicking Delete on a card does nothing: the card stays, no message appears, and the console shows "Uncaught (in promise) Error". This is how the Notes App works today. Which change lets the user know?',
    snippet: {
      language: "jsx",
      code: '// hooks/useNotes.js\nasync function removeNote(id) {\n  await deleteNote(id);\n  setNotes((current) => current.filter((note) => note.id !== id));\n}\n\n// components/NoteCard.jsx (not editing)\n<Button type="button" variant="danger" onClick={() => onDelete(note.id)}>\n  Delete\n</Button>',
      fileName: "frontend/src/components/NoteCard.jsx",
      highlightLines: [8],
    },
    choices: [
      {
        id: "catch-and-show",
        text: "In NoteCard, `await onDelete(note.id)` inside `try`/`catch`, and show the caught `err.message` on the card.",
      },
      {
        id: "remove-first",
        text: "Remove the card from the list first, then call the API.",
      },
      {
        id: "retry",
        text: "Retry the request until it works.",
      },
      {
        id: "effect",
        text: "Call `deleteNote` inside a `useEffect` instead of the click handler.",
      },
    ],
    correctChoiceId: "catch-and-show",
    conceptIds: ["js-error-handling", "js-promise"],
    buildStepId: "add-state",
    hints: [
      "`removeNote` is `async`. What happens to its rejected Promise in `onClick={() => onDelete(note.id)}`?",
      "Where in NoteCard can a message already be shown, and when?",
    ],
    explanation:
      "`removeNote` throws when `deleteNote` fails, so it returns a rejected Promise. The click handler ignores that Promise, so nobody catches the error: the card stays (correctly, because nothing was deleted), but the user is told nothing, and the browser reports an uncaught rejection. Awaiting `onDelete` in a `try`/`catch` in NoteCard catches it, and setting the card's `error` state shows the server's message; today that message only appears while editing, so it also needs to be shown on the normal card. Removing the card first would lie about a delete that never happened, endless retries hammer a server that is down, and an effect doesn't change who handles the error.",
  },
];
