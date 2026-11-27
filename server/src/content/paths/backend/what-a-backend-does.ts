import {
  analogy,
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// What a backend does: why rules and data live on a server, a backend's
// jobs, front end and back end in the Notes App, the backend's folders,
// the trust boundary, requests that stand alone, one request's journey
// (step by step), checking on both sides, mistakes, practice and a recap.
export const whatABackendDoesModule = moduleLesson(
  "what-a-backend-does",
  "What a backend does",
  40,
  [
    "Explain why rules and data must live on a server and not in the browser.",
    "Name a backend's jobs: receive, check, apply the rules, store and respond.",
    "Find the front end and the back end of the Notes App, and say what each backend folder is for.",
    "Explain the trust boundary, and why the server checks every request again.",
    "Follow one request through the backend, from arrival to response.",
  ],

  part(
    "why",
    "Why a server at all?",
    explain(
      "The JavaScript in the browser runs on the user's computer, so the user controls it. They can open DevTools and change it, or skip the page and send requests with `curl`. So anything that must hold, such as “only you can see your notes” or “a title is required”, can't live there. It lives on a server you control: the backend.",
    ),
    analogy(
      "A shop's website lets you type any price into the basket. The till at checkout still charges the real price: the till is the backend.",
    ),
    keyPoints(
      "Browser code belongs to the user: they can read and change it.",
      "Requests can be sent without a browser, with any content.",
      "Rules that matter and the shared data live on the server.",
      "The front end is for showing things and being quick to use.",
    ),
  ),

  part(
    "jobs",
    "A backend's jobs",
    explain(
      "Almost every request a backend gets goes through the same jobs. It receives the request, checks it (who is asking, is the data sensible), applies the app's rules, stores or reads data in the database, and sends a response with a status code. You already know the outside of this from HTTP; this topic is about writing the inside.",
    ),
    diagram([
      ["Receive", "method, path, body"],
      ["Check", "login, input"],
      ["Apply rules", "your notes only"],
      ["Store", "database"],
      ["Respond", "status + JSON"],
    ]),
    keyPoints(
      "Receive: read the method, URL, headers and body.",
      "Check: who is asking, and is the input valid?",
      "Rules and storage: do the work, save or load data.",
      "Respond: exactly one answer, with the right status code.",
    ),
  ),

  part(
    "two-halves",
    "Front end and back end in the Notes App",
    explain(
      "The Notes App is two programs. `frontend/` is the React app: it runs in the browser and draws the screen. `backend/src` is a Node.js server that runs on a machine you control and talks to the database. They only meet over HTTP: the front end sends `fetch` requests to `/api/...`, and the backend answers with JSON.",
    ),
    diagram(
      [
        ["frontend/", "React, in the browser"],
        ["HTTP + JSON", "/api/notes"],
        ["backend/src", "Node.js, on a server"],
        ["Database", "PostgreSQL"],
      ],
      true,
    ),
    inTheNotesApp(
      "Every front-end call goes through `request()`, which sends `fetch` to the backend and reads its JSON.",
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "folders",
    "The backend's folders",
    explain(
      "The backend is a small [[express|Express]] app, split so each file has one job. `server.js` starts it, `app.js` builds it, routes map URLs to functions, a [[controller]] handles one kind of request, middleware runs before the routes, validation checks input and `db.js` talks to the database. You'll write each kind in this topic.",
    ),
    code(
      "bash",
      "backend/ in the Notes App",
      [
        "backend/",
        "  package.json      # packages, scripts",
        "  src/",
        "    server.js       # starts listening",
        "    app.js          # builds the app",
        "    db.js           # database pool",
        "    routes/         # URL → function",
        "    controllers/    # handle a request",
        "    middleware/     # runs first",
        "    validation/     # checks input",
      ],
      {
        4: "the only file that opens a port",
        7: "notes.js, auth.js",
        8: "notesController.js: listNotes, createNote…",
        9: "authMiddleware.js: who is logged in?",
      },
    ),
    keyPoints(
      "One job per folder, so you know where to look.",
      "Routes are short; controllers do the work.",
      "Only server.js starts the server.",
    ),
  ),

  part(
    "trust",
    "The trust boundary",
    explain(
      "Everything that arrives from outside, the body, the URL, headers and cookies, could have been written by anyone. The line between that and your own code is the [[trust-boundary|trust boundary]]. The browser's checks are a convenience for honest users; the server checks everything again, every time. A `curl` command doesn't run your React form's checks.",
    ),
    code(
      "bash",
      "A request no form would ever send",
      [
        "curl -X POST localhost:3000/api/notes \\",
        "  -H 'Content-Type: application/json' \\",
        "  -b 'token=…' \\",
        '  -d \'{"title": ""}\'',
      ],
      {
        3: "a login cookie copied from the browser",
        4: "an empty title: the form would block it",
      },
    ),
    inTheNotesApp(
      "`validateNote` says it plainly: the browser checks too, but anyone can send a request without the browser, so the server always checks again.",
      { fileId: "backend/src/validation/noteValidation.js" },
    ),
    quickCheck(
      "The React form disables Save when the title is empty. Does the server still need to check the title?",
      [
        "No: the button can't be clicked",
        "Yes: requests can be sent without the form",
        "Only in production",
      ],
      1,
      "The disabled button only stops honest clicks. DevTools, curl or a script can send any body, so the server checks every request itself.",
    ),
  ),

  part(
    "stateless",
    "Every request stands alone",
    explain(
      "HTTP is [[stateless]]: the server doesn't remember the last request. So each request carries what the server needs, such as the login cookie, and the backend checks it again every time. In the Notes App, `requireAuth` reads the cookie on every notes request and sets `req.user`; the controller then uses `req.user.id`, never an id sent in the body.",
    ),
    anatomy(
      "What one request carries",
      [
        "POST /api/notes HTTP/1.1",
        "Cookie: token=eyJhbGci…",
        "Content-Type: application/json",
        '{ "title": "Buy milk" }',
      ],
      [
        [
          "POST /api/notes",
          "what to do",
          "The method and path pick the route.",
        ],
        [
          "Cookie: token=eyJhbGci…",
          "who is asking",
          "Sent again with every request; checked again every time.",
        ],
        [
          "Content-Type: application/json",
          "the format",
          "Tells the server how to read the body.",
        ],
        [
          '{ "title": "Buy milk" }',
          "the data",
          "Untrusted input: validated before it's saved.",
        ],
      ],
    ),
    inTheNotesApp(
      "`requireAuth` checks the login cookie on every notes request, then sets `req.user`.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
  ),

  part(
    "journey",
    "One request's journey",
    explain(
      'Here is the whole idea in one small function, without Express. It gets a request and the notes stored so far, and goes through the jobs in order: check the login, check the input, apply the rule (the note belongs to the logged-in user), store, respond. Step through creating a note with the title `" Milk "`.',
    ),
    trace(
      "Creating a note, one job at a time",
      [
        "function handle(req, notes) {",
        "  if (!req.user) {",
        "    return { status: 401 };",
        "  }",
        '  const title = (req.body.title ?? "").trim();',
        "  if (!title) {",
        "    return { status: 400 };",
        "  }",
        "  const note = { id: notes.length + 1,",
        "    title, userId: req.user.id };",
        "  notes.push(note);",
        "  return { status: 201, body: note };",
        "}",
      ],
      [
        {
          line: 1,
          note: "A request arrives from user 7, with a body. No notes are stored yet.",
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", "[]"],
          ],
          stack: ["handle"],
        },
        {
          line: 2,
          note: "Check: who is asking? `req.user` is set, so carry on. Without it the answer would be 401.",
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", "[]"],
          ],
          stack: ["handle"],
        },
        {
          line: 5,
          note: 'Read the input carefully: a missing title becomes `""`, and spaces are trimmed.',
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", "[]"],
            ["title", '"Milk"'],
          ],
          stack: ["handle"],
        },
        {
          line: 6,
          note: "Check the input: the title isn't empty, so no 400.",
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", "[]"],
            ["title", '"Milk"'],
          ],
          stack: ["handle"],
        },
        {
          line: 9,
          note: "Apply the rule: the owner is `req.user.id`, from the checked login, not from the body.",
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", "[]"],
            ["title", '"Milk"'],
            ["note", '{ id: 1, title: "Milk", userId: 7 }'],
          ],
          stack: ["handle"],
        },
        {
          line: 11,
          note: "Store it. In the real app this is an INSERT into the database.",
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", '[{ id: 1, title: "Milk", userId: 7 }]'],
            ["title", '"Milk"'],
            ["note", '{ id: 1, title: "Milk", userId: 7 }'],
          ],
          stack: ["handle"],
        },
        {
          line: 12,
          note: "Respond: 201 Created with the saved note, exactly once.",
          vars: [
            ["req", '{ user: { id: 7 }, body: { title: " Milk " } }'],
            ["notes", '[{ id: 1, title: "Milk", userId: 7 }]'],
            ["title", '"Milk"'],
            ["note", '{ id: 1, title: "Milk", userId: 7 }'],
          ],
          stack: ["handle"],
          output: '{ status: 201, body: { id: 1, title: "Milk", userId: 7 } }',
        },
      ],
    ),
  ),

  part(
    "both-sides",
    "Check on both sides",
    explain(
      "Does this make front-end checks pointless? No: they have a different job. The form checks so the user hears about an empty title at once, without a round trip. The server checks so a bad note can never be saved. Same rule, two places, two reasons. The Notes App even shares its limits: `MAX_TITLE_LENGTH` is 100 in both.",
    ),
    keyPoints(
      "Browser checks: fast feedback for honest users.",
      "Server checks: the real rule, for every request.",
      "If they disagree, the server wins.",
      "Never rely on hidden fields or disabled buttons for safety.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Trusting who the body says it is",
      wrong: ["const owner = req.body.userId;"],
      problem:
        "Anyone can put any user's id in the body and create or read notes as that user.",
      right: ["const owner = req.user.id; // from the cookie"],
      why: "Who is asking comes from a login the server checked, never from data the client chose.",
    }),
    mistake({
      title: "Checking only in the browser",
      wrong: [
        "// NoteForm.jsx checks the title,",
        "// so the server just saves it",
        "await saveNote(req.body);",
      ],
      problem:
        "A request from curl or a script skips the form, so empty or huge titles get saved.",
      right: [
        "const error = validateNote(req.body);",
        "if (error) {",
        "  return res.status(400).json({ error });",
        "}",
      ],
      why: "The server is the only place a rule can't be skipped.",
    }),
    mistake({
      title: "Hiding a rule in the page",
      wrong: [
        "// only show Delete on your own notes",
        "{note.userId === me && <DeleteButton />}",
      ],
      problem:
        "Hiding the button doesn't stop `DELETE /api/notes/5` being sent for someone else's note.",
      right: ["DELETE FROM notes", " WHERE id = $1 AND user_id = $2"],
      why: "Hiding things is for a tidy screen; the server enforces who may do what.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Check a note like the server does",
      task: 'Write `checkNote(body)`. Return `"Title is required"` if `body.title` isn\'t a string or is empty after trimming, `"Title is too long"` if the trimmed title has more than 100 characters, and `null` when the note is fine. Assume `body` is always an object.',
      starter: ["function checkNote(body) {", "  return null;", "}"],
      tests: [
        ['checkNote({ title: "Milk" })', "null"],
        ['checkNote({ title: "   " })', '"Title is required"'],
        ["checkNote({ title: 42 })", '"Title is required"'],
        ["checkNote({})", '"Title is required"'],
        ['checkNote({ title: "a".repeat(101) })', '"Title is too long"'],
      ],
      hint: 'First `typeof body.title === "string"`, then `.trim()`. An empty string is falsy.',
      solution: [
        "function checkNote(body) {",
        "  const title =",
        '    typeof body.title === "string"',
        "      ? body.title.trim()",
        '      : "";',
        '  if (!title) return "Title is required";',
        '  if (title.length > 100) return "Title is too long";',
        "  return null;",
        "}",
      ],
    }),
    yourTurn({
      title: "Handle a request from start to finish",
      task: "Write `handle(req, notes)`. No `req.user`: return `{ status: 401 }`. An empty or missing `req.body.title` (after trimming): `{ status: 400 }`. Otherwise push `{ id: notes.length + 1, title, userId: req.user.id }` (trimmed title) onto `notes` and return `{ status: 201, body: note }`. Ignore any `userId` in the body.",
      starter: [
        "function handle(req, notes) {",
        "  notes.push(req.body);",
        "  return { status: 201, body: req.body };",
        "}",
      ],
      tests: [
        ['handle({ body: { title: "Hi" } }, [])', "{ status: 401 }"],
        [
          'handle({ user: { id: 7 }, body: { title: " " } }, [])',
          "{ status: 400 }",
        ],
        [
          'handle({ user: { id: 7 }, body: { title: " Milk " } }, [])',
          '{ status: 201, body: { id: 1, title: "Milk", userId: 7 } }',
        ],
        [
          'handle({ user: { id: 7 }, body: { title: "Eggs", userId: 99 } }, [{}]).body.userId',
          "7",
        ],
      ],
      hint: 'Check in the same order as the trace: `req.user` first, then `(req.body.title ?? "").trim()`. Build the note yourself instead of saving `req.body`.',
      solution: [
        "function handle(req, notes) {",
        "  if (!req.user) return { status: 401 };",
        '  const title = (req.body.title ?? "").trim();',
        "  if (!title) return { status: 400 };",
        "  const note = { id: notes.length + 1,",
        "    title, userId: req.user.id };",
        "  notes.push(note);",
        "  return { status: 201, body: note };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("What a backend does", [
      [
        "Backend",
        "The program on a server you control: rules, data, responses.",
        "backend/src",
      ],
      [
        "Front end",
        "Runs in the browser; the user controls it. Shows things.",
        "frontend/src",
      ],
      [
        "The jobs",
        "Receive, check, apply rules, store, respond.",
        "201 + the saved note",
      ],
      [
        "Trust boundary",
        "Anything from outside may be fake: check it on the server.",
        "validateNote(req.body)",
      ],
      [
        "Who is asking",
        "From a login the server checked, never from the body.",
        "req.user.id",
      ],
      [
        "Stateless",
        "Each request carries what the server needs, and is checked again.",
        "Cookie: token=…",
      ],
      ["server.js", "Starts the server listening on a port."],
      ["app.js", "Builds the Express app: middleware and routes."],
      [
        "routes/ + controllers/",
        "Which URL runs which function, and that function.",
        "notesController.createNote",
      ],
    ]),
    quickCheck(
      "Where should the rule “you can only delete your own notes” be enforced?",
      [
        "In the React component, by hiding the Delete button",
        "On the server, for every DELETE request",
        "In both, but the browser's check is the one that counts",
      ],
      1,
      "Hiding the button is fine for a tidy screen, but anyone can send `DELETE /api/notes/5` without it. Only the server's check can't be skipped.",
    ),
  ),
);
