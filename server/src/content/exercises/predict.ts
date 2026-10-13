import type { PredictExercise } from "@fsl/shared";

// What happens when…? One outcome is right; the others are common guesses.
export const predictExercises: PredictExercise[] = [
  {
    id: "predict-blank-title",
    mode: "predict",
    title: "A title of only spaces",
    prompt:
      "In the note form, the user types three spaces as the title and clicks Save. What happens?",
    code: {
      language: "jsx",
      code: '<Input\n  id="note-title"\n  label="Title"\n  value={title}\n  onChange={(event) => setTitle(event.target.value)}\n  maxLength={100}\n  required\n/>',
      fileName: "frontend/src/components/NoteForm.jsx",
    },
    choices: [
      {
        id: "browser-blocks",
        text: "The browser refuses to submit the form, because the input is `required`.",
      },
      {
        id: "saved-blank",
        text: "The note is saved with a blank title.",
      },
      {
        id: "server-400",
        text: "The request is sent, the server answers `400 Title is required`, and the form shows that message.",
      },
      {
        id: "crash-500",
        text: "The server crashes and answers `500 Something went wrong`.",
      },
    ],
    correctChoiceId: "server-400",
    conceptIds: ["input-validation", "react-controlled-form"],
    buildStepId: "add-security",
    hints: [
      "For `required`, does a field containing spaces count as empty?",
      "Look at the first line of `validateNote`: what does it do to the title before checking it?",
    ],
    explanation:
      "`required` only stops an empty field, and three spaces aren't empty, so the browser sends the request. On the server, `validateNote` trims the title first, finds nothing left and returns `Title is required`. The controller answers `400` with it, `request()` turns that into an `Error`, and `handleSave` catches it and shows the message under the form. This is why the server always checks again.",
  },
  {
    id: "predict-click-save",
    mode: "predict",
    title: "Clicking Save",
    prompt:
      "The user types a title and a note and clicks Save. Saving works. What does the user see?",
    code: {
      language: "jsx",
      code: 'async function handleSave(event) {\n  event.preventDefault();\n  setIsSaving(true);\n  setError(null);\n  try {\n    const note = await createNote({ title, content });\n    onSaved(note);\n    setTitle("");\n    setContent("");\n  } catch (err) {\n    setError(err.message);\n  } finally {\n    setIsSaving(false);\n  }\n}',
      fileName: "frontend/src/components/NoteForm.jsx",
    },
    choices: [
      {
        id: "reload",
        text: "The page reloads and the new note is in the list.",
      },
      {
        id: "top-no-reload",
        text: "The button shows Saving…, then the new card appears at the top of the list and the form is emptied, without a page reload.",
      },
      {
        id: "bottom",
        text: "The new card appears at the bottom of the list.",
      },
      {
        id: "before-server",
        text: "The card appears instantly, before the server has answered.",
      },
    ],
    correctChoiceId: "top-no-reload",
    conceptIds: ["js-event", "js-async-await", "react-state"],
    buildStepId: "add-api-communication",
    hints: [
      "What does `event.preventDefault()` stop?",
      "`onSaved` is `addNote` from `useNotes`. Where does it put the new note in the array?",
    ],
    explanation:
      "`event.preventDefault()` stops the browser's normal form submission, so the page never reloads. `isSaving` makes the button show Saving…. `await createNote(…)` waits for the server, so nothing appears until the note is saved and has its real `id`. Then `onSaved(note)`, which is `addNote`, builds a new array with the note first (`[note, ...current]`), React re-renders the list with the new card at the top, and both fields are cleared.",
  },
  {
    id: "predict-read-cookie",
    mode: "predict",
    title: "Reading the login cookie",
    prompt:
      "A user is logged in to the Notes App. A script running in the page executes `document.cookie`. What does it get?",
    choices: [
      {
        id: "token",
        text: "`token=eyJhbGciOiJIUzI1NiIs…`: the login token.",
      },
      {
        id: "empty",
        text: "An empty string: the login cookie isn't visible to page scripts.",
      },
      {
        id: "encrypted",
        text: "The token, but encrypted so the script can't use it.",
      },
      {
        id: "error",
        text: "An error, because reading cookies isn't allowed on HTTPS pages.",
      },
    ],
    correctChoiceId: "empty",
    conceptIds: ["secure-cookies", "xss"],
    buildStepId: "add-authentication",
    hints: [
      "Look at the options the server uses when it sets the cookie.",
      "Which cookie option is about JavaScript?",
    ],
    explanation:
      "The server sets the cookie with `httpOnly: true`, so the browser keeps it out of `document.cookie`. The Notes App sets no other cookies, so the script gets an empty string. The browser still sends the cookie with every request to the API, which is all the app needs. That is also why the frontend asks `GET /api/auth/me` who is logged in instead of reading the token.",
  },
  {
    id: "predict-other-users-note",
    mode: "predict",
    title: "Someone else's note",
    prompt:
      "Note 7 belongs to user 1. User 2 is logged in and sends `PUT /api/notes/7` with a new title. What does the API answer?",
    code: {
      language: "js",
      code: "UPDATE notes\n   SET title = $1, content = $2, updated_at = now()\n WHERE id = $3 AND user_id = $4\n RETURNING id, title, content, created_at, updated_at",
      fileName: "backend/src/controllers/notesController.js",
    },
    choices: [
      { id: "200", text: "`200 OK`: the title of note 7 is changed." },
      { id: "401", text: "`401 Please log in`." },
      { id: "403", text: "`403 Forbidden`: it isn't your note." },
      { id: "404", text: "`404 Note not found`." },
    ],
    correctChoiceId: "404",
    conceptIds: ["authentication-vs-authorization", "http-status-codes"],
    buildStepId: "add-security",
    hints: [
      "User 2 is logged in, so `requireAuth` lets the request through.",
      "With `$3 = 7` and `$4 = 2`, which rows match the `WHERE`?",
    ],
    explanation:
      "User 2 has a valid login cookie, so it isn't a `401`. The UPDATE only changes a row where `id = 7 AND user_id = 2`; note 7 has `user_id = 1`, so no row matches, `rowCount` is 0 and the controller answers `404 Note not found`. The app deliberately doesn't answer `403`: that would tell user 2 that note 7 exists. A missing note and someone else's note get exactly the same answer.",
  },
  {
    id: "predict-unknown-email",
    mode: "predict",
    title: "Logging in with an unknown email",
    prompt:
      "Someone tries to log in with `nobody@example.com`, which has no account. What does the API answer?",
    choices: [
      { id: "404", text: "`404 No account with that email`." },
      { id: "401-same", text: "`401 Invalid email or password`." },
      {
        id: "400",
        text: "`400 Email and password are required`.",
      },
      {
        id: "500",
        text: "`500 Something went wrong`, because the query finds no row.",
      },
    ],
    correctChoiceId: "401-same",
    conceptIds: ["safe-error-messages", "password-hashing"],
    buildStepId: "add-authentication",
    hints: [
      "Would it be a good idea to tell a stranger whether an email has an account?",
      "Look at the comment above the `401` in `login`.",
    ],
    explanation:
      "The SELECT finds no user, so `passwordMatches` is false, exactly as it is for a wrong password, and `login` answers `401 Invalid email or password`. Giving the same answer in both cases stops anyone from using the login form to find out which emails are registered. An empty result is a normal outcome, not an error, so there is no `500`; and `400` is only for a missing email or password.",
  },
  {
    id: "predict-missing-secret",
    mode: "predict",
    title: "Starting without JWT_SECRET",
    prompt:
      "A developer starts the backend without setting `JWT_SECRET`. What happens?",
    code: {
      language: "js",
      code: 'const required = ["DATABASE_URL", "JWT_SECRET"];\nconst missing = required.filter((name) => !process.env[name]);\nif (missing.length > 0) {\n  console.error(`Missing environment variables: ${missing.join(", ")}`);\n  console.error("Copy .env.example to .env and fill it in.");\n  process.exit(1);\n}',
      fileName: "backend/src/server.js",
    },
    choices: [
      {
        id: "starts-500",
        text: "The server starts, and every login fails later with `500`.",
      },
      {
        id: "stops",
        text: "The server stops at once with `Missing environment variables: JWT_SECRET` and a hint to fill in `.env`.",
      },
      {
        id: "default",
        text: "The server starts and uses a built-in default secret.",
      },
      {
        id: "empty-secret",
        text: "The server starts and signs tokens with an empty secret.",
      },
    ],
    correctChoiceId: "stops",
    conceptIds: ["secrets-env-vars", "environment-variables"],
    buildStepId: "add-security",
    hints: ["This check runs before `listen` is ever called."],
    explanation:
      "`server.js` checks the required variables before it starts listening. `JWT_SECRET` is missing, so it prints which one and how to fix it, then exits with code 1. Failing at startup is deliberate: the alternative is a server that seems to work and then fails on the first login, or worse, signs tokens with a weak secret. There is no default secret, because a default would be the same, public value everywhere.",
  },
  {
    id: "predict-reload-logged-in",
    mode: "predict",
    title: "Reloading while logged in",
    prompt:
      "A logged-in user reloads the page. React's state starts empty again. How does the app know who is logged in?",
    code: {
      language: "jsx",
      code: 'const [user, setUser] = useState(null);\nconst [page, setPage] = useState("loading");\n\nuseEffect(() => {\n  getCurrentUser().then((current) => {\n    setUser(current);\n    setPage(current ? "dashboard" : "login");\n  });\n}, []);',
      fileName: "frontend/src/App.jsx",
    },
    choices: [
      {
        id: "read-cookie",
        text: "App reads the token from the cookie and decodes the user id from it.",
      },
      {
        id: "local-storage",
        text: "App reads the user saved in `localStorage` at login.",
      },
      {
        id: "ask-api",
        text: "App shows Loading…, asks `GET /api/auth/me` (the browser sends the cookie), and shows the Dashboard when the API answers with the user.",
      },
      {
        id: "login-again",
        text: "It doesn't: the user has to log in again after every reload.",
      },
    ],
    correctChoiceId: "ask-api",
    conceptIds: ["react-useeffect", "secure-cookies", "jwt"],
    buildStepId: "add-authentication",
    hints: [
      "Can JavaScript read the login cookie?",
      "What does `getCurrentUser` call?",
    ],
    explanation:
      'The cookie is `httpOnly`, so App can\'t read it, and the app never stores the user in `localStorage`. Instead, `page` starts as `"loading"`, and the effect runs once after the first render: `getCurrentUser()` calls `GET /api/auth/me`. The browser sends the cookie automatically, `requireAuth` verifies it and the API answers with the user, so App switches to the Dashboard. Without a valid cookie the API answers `401`, `getCurrentUser` returns `null`, and App shows the login page.',
  },
];
