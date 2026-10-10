# The Notes App — example project specification

The Notes App is the application learners build on this platform. It is a
**teaching artifact**: small enough to understand completely, but real
enough to show every layer of a full-stack web application — React in the
browser, an Express API, a PostgreSQL database, authentication, validation,
tests and deployment.

Every concept, build step, file explanation, relationship and request flow
on the platform points at this design. If the code and this document
disagree, fix one of them so they match again.

## Goals

- A beginner can read every file and understand why it exists.
- Each layer is visible: no framework hides how a request reaches the
  database.
- **No extra layers.** No repository or service layer on the backend, no
  state-management library or router on the frontend. Routes → controllers
  → SQL; components → hooks → `fetch`. Add a layer only when the code
  actually repeats (spec §10, §27).
- **Representative, coherent source.** For the MVP the code does not have to
  be deployed by the platform, but it must be correct and consistent enough
  to run with `npm install` and a PostgreSQL database.

## Features

| Feature          | What the user can do                                              |
| ---------------- | ----------------------------------------------------------------- |
| Register         | Create an account with an email address and a password            |
| Log in / log out | Start and end a session; the browser keeps a login cookie         |
| List notes       | See their own notes, newest first                                 |
| Create a note    | Save a title and some content                                     |
| Edit a note      | Change a note's title or content                                  |
| Delete a note    | Remove a note                                                     |
| Private notes    | Never see, change or delete another user's notes                  |
| Validation       | Get a clear message when input is missing or too long             |
| Error handling   | Get a friendly message when something fails; details stay in logs |

## Stack — and why

| Layer     | Choice                                               | Why                                                                                                  |
| --------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Frontend  | React 19 + Vite, **plain JavaScript (JSX)**          | Components and state are the core ideas; TypeScript would add a second new language at the same time |
| Styling   | Plain CSS in one `index.css`                         | Teaches selectors, box model, flexbox and media queries directly, without a framework's vocabulary   |
| Backend   | Node.js 22 + Express 5, ES modules                   | Same language as the frontend; Express is small enough to see every step of a request                |
| Database  | PostgreSQL 16 with the `pg` driver                   | A real relational database; raw, parameterized SQL makes queries and injection safety visible        |
| Passwords | `bcrypt`                                             | The standard way to store passwords as slow, salted hashes                                           |
| Sessions  | JWT in an `httpOnly`, `SameSite=Lax` cookie          | The browser sends it automatically, JavaScript cannot read it, other sites cannot send it            |
| Config    | `node --env-file=.env` (Node 22)                     | No `dotenv` package needed; `.env.example` documents every variable                                  |
| Tests     | Vitest, Supertest, React Testing Library, Playwright | One test runner for unit and integration tests; a real browser for the end-to-end journey            |

## Repository layout

```text
notes-app/
├── frontend/          React + Vite (runs in the browser)
├── backend/           Express API (runs on the server)
├── database/          SQL schema and demo data
├── e2e/               Playwright end-to-end test
└── compose.yaml       Local stack: frontend, backend, postgres
```

### Files and their purpose

Every file has one job. The platform's file explorer shows these purposes
(and a longer "why it exists" for each, added in `server/src/content/files.ts`).

**Frontend — `frontend/`**

| File                               | Purpose                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                     | Frontend dependencies (`react`, `react-dom`; dev: `vite`, `vitest`, Testing Library, `jsdom`) and scripts `dev`, `build`, `preview`, `test` |
| `package-lock.json`                | Exact installed versions of every package, so `npm ci` installs the same everywhere                                                         |
| `index.html`                       | The single HTML page; contains `<div id="root">` and loads `src/main.jsx`                                                                   |
| `vite.config.js`                   | Vite setup; in development forwards `/api` to the backend on port 3000; test settings (jsdom)                                               |
| `src/main.jsx`                     | Starts React: `createRoot(document.getElementById("root")).render(<App />)`                                                                 |
| `src/App.jsx`                      | Knows who is logged in and shows `Navbar` plus the current page (Login, Register or Dashboard)                                              |
| `src/index.css`                    | All styles: `.navbar`, `.notes-grid`, `.note-card`, `.form-field`, `.button`; mobile-first                                                  |
| `src/components/Button.jsx`        | Reusable button (`children`, `variant`, other props passed through) used across the app                                                     |
| `src/components/Input.jsx`         | Reusable labelled input (`label`, `id`, other props) for every form field                                                                   |
| `src/components/NoteCard.jsx`      | Shows one note as an `<article>`; Edit switches to inputs (saves with `updateNote()`), Delete removes it                                    |
| `src/components/NoteForm.jsx`      | Form to create a note; owns the typed title and content; calls `createNote()`                                                               |
| `src/components/Navbar.jsx`        | App name, the logged-in user's email and a Log out button                                                                                   |
| `src/pages/Login.jsx`              | Login form; calls `login()` and tells `App` who logged in                                                                                   |
| `src/pages/Register.jsx`           | Registration form; calls `register()`                                                                                                       |
| `src/pages/Dashboard.jsx`          | The logged-in home: `NoteForm` and the list of `NoteCard`s, using `useNotes()`                                                              |
| `src/hooks/useNotes.js`            | Custom hook that loads the notes and keeps them in state (`addNote`, `removeNote`)                                                          |
| `src/services/notesApi.js`         | The only place the frontend calls the notes API: `getNotes`, `createNote`, `updateNote`, `deleteNote`                                       |
| `src/services/request.js`          | Shared `request()` used by both API files: sends the cookie and JSON, throws the server's `error` message                                   |
| `src/services/authApi.js`          | The only place the frontend calls the auth API: `register`, `login`, `logout`, `getCurrentUser`                                             |
| `src/test-setup.js`                | Test setup: jest-dom matchers, and cleanup between tests                                                                                    |
| `src/components/NoteForm.test.jsx` | Component test: typing and submitting calls `createNote` and clears the form                                                                |

**Backend — `backend/`**

| File                                    | Purpose                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                          | `"type": "module"`; dependencies `express`, `pg`, `bcrypt`, `jsonwebtoken`, `cookie-parser`; scripts `dev`, `start`, `test` |
| `.env.example`                          | Every environment variable with a safe example value; copied to the git-ignored `.env`                                      |
| `package-lock.json`                     | Exact installed versions (needed by `npm ci` in the Dockerfile)                                                             |
| `.dockerignore`                         | Keeps `node_modules`, `.env` and tests out of the image                                                                     |
| `Dockerfile`                            | Builds the production image of the API (`node:22-alpine`, non-root, health check)                                           |
| `src/server.js`                         | Checks required environment variables, then starts the app from `app.js` on `PORT`                                          |
| `src/app.js`                            | Builds the Express app (middleware, routes, error handler) without starting it, so tests can use it                         |
| `src/db.js`                             | Creates the one shared PostgreSQL connection pool from `DATABASE_URL`                                                       |
| `src/routes/auth.js`                    | Maps `/api/auth/*` URLs to `authController` functions                                                                       |
| `src/routes/notes.js`                   | Requires login for every notes route and maps `/api/notes` URLs to `notesController`                                        |
| `src/controllers/authController.js`     | Register, log in, log out, current user: validation, bcrypt, JWT cookie, SQL                                                |
| `src/controllers/notesController.js`    | List, create, update, delete notes: validation, ownership check, SQL, status codes                                          |
| `src/middleware/authMiddleware.js`      | `requireAuth`: reads and verifies the login cookie and sets `req.user`, or answers 401                                      |
| `src/validation/noteValidation.js`      | `validateNote(body)`: returns an error message, or nothing when the note is valid                                           |
| `src/validation/noteValidation.test.js` | Unit tests for `validateNote`                                                                                               |
| `src/routes/notes.test.js`              | Integration tests for the notes API against a test database (`notes_test`)                                                  |

**Database — `database/`**

| File         | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `schema.sql` | Creates the `users` and `notes` tables and the index |
| `seed.sql`   | One demo user and two notes for local development    |

**Root**

| File                | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `compose.yaml`      | Runs `frontend`, `backend` and `postgres` together for local development |
| `e2e/notes.spec.js` | Playwright test: register → log in → create a note → see it in the list  |
| `.gitignore`        | Keeps `node_modules/`, `dist/` and `.env` out of Git                     |

## API

All endpoints are under `/api`, send and receive JSON, and return errors as
`{ "error": "message" }`. "Login" means the request carries a valid `token`
cookie; otherwise the notes endpoints answer `401 { "error": "Please log in" }`.

| Method   | Path                 | Login | Request body              | Success                                         | Errors                                                                                                    |
| -------- | -------------------- | ----- | ------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/health`        | no    | —                         | `200 { "status": "ok" }`                        | —                                                                                                         |
| `POST`   | `/api/auth/register` | no    | `{ "email", "password" }` | `201 { "id", "email" }`                         | `400` invalid email or password shorter than 8 characters · `409 { "error": "Email already registered" }` |
| `POST`   | `/api/auth/login`    | no    | `{ "email", "password" }` | `200 { "id", "email" }` + `Set-Cookie: token=…` | `400` missing fields · `401 { "error": "Invalid email or password" }`                                     |
| `POST`   | `/api/auth/logout`   | no    | —                         | `204` (cookie cleared)                          | —                                                                                                         |
| `GET`    | `/api/auth/me`       | yes   | —                         | `200 { "id", "email" }`                         | `401`                                                                                                     |
| `GET`    | `/api/notes`         | yes   | —                         | `200 [ note, … ]` newest first                  | `401`                                                                                                     |
| `POST`   | `/api/notes`         | yes   | `{ "title", "content" }`  | `201 note`                                      | `400 { "error": "Title is required" }` or a length message · `401`                                        |
| `PUT`    | `/api/notes/:id`     | yes   | `{ "title", "content" }`  | `200 note`                                      | `400` · `401` · `404 { "error": "Note not found" }` (missing **or another user's**)                       |
| `DELETE` | `/api/notes/:id`     | yes   | —                         | `204`                                           | `401` · `404 { "error": "Note not found" }`                                                               |

A note in JSON: `{ "id": 42, "title": "Shopping", "content": "Milk", "created_at": "…", "updated_at": "…" }`.

Another user's note answers `404`, not `403`, so the API does not reveal
which note ids exist.

### Validation rules

| Field      | Rule                                               | Message                                                      |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `title`    | required, trimmed, at most 100 characters          | `Title is required` / `Title must be at most 100 characters` |
| `content`  | optional (empty string), at most 10,000 characters | `Content must be at most 10000 characters`                   |
| `email`    | required, contains `@`, stored lower-case          | `Please enter a valid email address`                         |
| `password` | at least 8 characters                              | `Password must be at least 8 characters`                     |

The frontend shows the same messages, but the **backend always validates
again** — anyone can send a request without the frontend.

## Authentication and security

1. **Register:** `authController.register` validates, hashes the password with
   `bcrypt.hash(password, 12)` and runs
   `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`.
   A duplicate email violates `UNIQUE` (PostgreSQL code `23505`) → `409`.
2. **Log in:** finds the user by email, compares with `bcrypt.compare`. Wrong
   email and wrong password give the **same** `401` message, so attackers
   cannot find out which emails are registered.
3. **Session cookie:** on success the backend signs a JWT `{ sub: user.id }`
   with `JWT_SECRET`, valid for 7 days, and sets it as cookie `token` with
   `httpOnly`, `sameSite: "lax"`, `secure` in production, `maxAge` 7 days.
4. **Every protected request:** `requireAuth` (via `cookie-parser`) reads
   `req.cookies.token`, verifies it with `jwt.verify`, sets
   `req.user = { id }` and calls `next()`, or answers `401`.
5. **Authorization:** every notes query includes `user_id = $n` with
   `req.user.id`, so a user can only ever see or change their own rows.
6. **Log out:** `res.clearCookie("token")` → `204`.

Other protections: all SQL is parameterized; React escapes text it
displays; secrets come only from environment variables; the error handler
logs the real error but answers `500 { "error": "Something went wrong" }`.

## Database

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notes_user_id_idx ON notes (user_id);
```

One user has many notes (`notes.user_id` → `users.id`). Deleting a user
deletes their notes (`ON DELETE CASCADE`).

Queries in `notesController` (always through `pool.query(text, values)`):

| Action | SQL                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| List   | `SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC` |
| Create | `INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`                              |
| Update | `UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 AND user_id = $4 RETURNING *` |
| Delete | `DELETE FROM notes WHERE id = $1 AND user_id = $2` (`rowCount` 0 → `404`)                                  |

## Frontend structure

```text
App (user state; which page)
├── Navbar (email, Log out)
└── Login | Register | Dashboard
                         ├── NoteForm  ──createNote()──► POST /api/notes
                         │     └── onSaved(note) ─► addNote (useNotes)
                         └── NoteCard × n
                               ├── onDelete(id) ─► removeNote (useNotes) ─► DELETE /api/notes/:id
                               └── updateNote() ─► PUT /api/notes/:id ─► onUpdated(note) ─► replaceNote (useNotes)
```

- **`App`** keeps `user` and `page` in state. On first load it calls
  `getCurrentUser()` (`GET /api/auth/me`): a user → Dashboard, `401` → Login.
  No router: three pages are simpler as state, and that keeps one concept
  fewer for beginners.
- **Props down, callbacks up:** data flows down as props; events flow up
  through callback props; shared state lives in the closest common parent
  (`Dashboard`, through `useNotes`).
- **`NoteForm({ onSaved })`**: controlled `title`/`content` (`useState("")`).
  `handleSave(event)` → `event.preventDefault()` → `const note = await createNote({ title, content })`
  → `onSaved(note)` → clear both fields. On failure it shows the error
  message; the Save button is disabled while saving.
- **`useNotes()`**: `notes`, `isLoading`, `error` state; `useEffect(…, [])`
  loads with `getNotes()`; `addNote(note)` → `setNotes((current) => [note, ...current])` (newest first, like the API's order);
  `replaceNote(note)` swaps in an edited note by id; `removeNote(id)` →
  `await deleteNote(id)` then filters it out. Returns
  `{ notes, isLoading, error, addNote, replaceNote, removeNote }`.
- **`Dashboard`**: `<NoteForm onSaved={addNote} />` and
  `notes.map((note) => <NoteCard key={note.id} note={note} onUpdated={replaceNote} onDelete={removeNote} />)`.
- **`NoteCard({ note, onUpdated, onDelete })`**: shows the note; **Edit**
  switches the card to two controlled inputs; **Save** calls
  `updateNote(note.id, { title, content })` (`PUT /api/notes/:id`) and then
  `onUpdated(updatedNote)`; **Cancel** restores the view; **Delete** calls
  `onDelete(note.id)`.
- **API services** (`notesApi.js`, `authApi.js`) call one shared `request()`
  in `request.js`, which runs `fetch("/api/…", { credentials: "include", … })`,
  checks `response.ok`, throws `new Error(body.error)` otherwise, and returns
  the JSON (nothing for `204`). The fetch logic is written once instead of in
  every function.

## Configuration

`backend/.env.example`:

```bash
PORT=3000
DATABASE_URL=postgres://postgres:dev@localhost:5432/notes
JWT_SECRET=change-me-to-a-long-random-string
NODE_ENV=development
```

Start the backend with `node --env-file=.env src/server.js` (`npm run dev`
adds `--watch`). The frontend needs no variables: in development Vite
proxies `/api` to `http://localhost:3000`; in production the frontend and
API share one origin.

## Request lifecycle — creating a note

This is the path the platform's flow tracer follows end to end:

```text
User clicks Save
  → <form> submit event → NoteForm.handleSave(event)
  → event.preventDefault()
  → notesApi.createNote({ title, content })
  → fetch POST /api/notes  (JSON body, token cookie)
  → Express: express.json() → cookieParser() → router /api/notes
  → requireAuth: verify JWT → req.user = { id }
  → notesController.createNote: validateNote(req.body)
  → pool.query(INSERT … RETURNING *, [req.user.id, title, content])
  → PostgreSQL stores the row → returns it
  → 201 Created + note JSON
  → createNote resolves → onSaved(note) → useNotes.addNote(note)
  → setNotes([...]) → React re-renders Dashboard → the new NoteCard appears
```

## Symbol ids (for relationship and flow data)

The platform describes connections between pieces of code with ids of the
form `<kind>:<name>`. Use these exact forms so content can reference them:

| Kind          | Form                        | Examples                                               |
| ------------- | --------------------------- | ------------------------------------------------------ |
| Component     | `component:<Name>`          | `component:NoteForm`, `component:Button`               |
| Hook          | `hook:<name>`               | `hook:useNotes`                                        |
| Function      | `fn:<name>`                 | `fn:handleSave`, `fn:createNote`, `fn:validateNote`    |
| Event         | `event:<component>.<event>` | `event:noteForm.submit`                                |
| Route         | `route:<METHOD> <path>`     | `route:POST /api/notes`, `route:DELETE /api/notes/:id` |
| Middleware    | `middleware:<name>`         | `middleware:requireAuth`, `middleware:express.json`    |
| Controller fn | `controller:<file>.<fn>`    | `controller:notesController.createNote`                |
| Table         | `table:<name>`              | `table:notes`, `table:users`                           |
| External      | `external:<name>`           | `external:fetch`, `external:bcrypt`                    |

Where a name is ambiguous (two functions with the same name in different
files), prefix the file: `fn:notesApi.createNote` vs
`controller:notesController.createNote`.

## Assumptions

Decisions this document makes that the original issue did not state:

- `GET /api/auth/me` exists so the frontend can tell, on first load, whether
  someone is logged in (the cookie is `httpOnly`, so JavaScript cannot read
  it).
- `GET /api/health` exists for health checks and deploy smoke tests.
- No router in the frontend; `App` switches between three pages with state.
- Validation limits: title ≤ 100, content ≤ 10,000 characters, password ≥ 8.
- JWT and cookie lifetime: 7 days. `bcrypt` cost 12.
- Another user's note answers `404`, not `403`.
- Notes are edited in place on their card; `useNotes` gains `replaceNote` for that (two concept texts were updated to match).
