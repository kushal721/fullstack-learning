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

// APIs: an API as a contract, the two sides of it (server code and client
// code), the Notes App's endpoints, what a request and a response carry,
// calling it through one request function, a call step by step, trying an
// API with curl and the Network tab, mistakes, practice and a recap.
export const apisModule = moduleLesson(
  "apis",
  "APIs: programs talking over HTTP",
  45,
  [
    "Explain a web API as a contract between two programs: what you may ask, and what you get back.",
    "Read an API as a table of endpoints, using the Notes App's.",
    "Name what a request and a response carry, from a programmer's point of view.",
    "Call an API from JavaScript through one shared request function.",
    "Try an API by hand with curl and the browser's Network tab.",
  ],

  part(
    "contract",
    "An API is a contract",
    explain(
      "In How the Web Works you saw the browser ask a server for data. Now look at it as a programmer. A web API is a **contract** between two programs: the server promises “send me *this* request and I'll answer with *that*”, and the client relies on it. Neither side needs to know how the other is written, only the contract.",
    ),
    analogy(
      "Like a restaurant menu: it lists what you can order and what arrives. You don't need to see the kitchen, and the cook can change the stove without reprinting the menu.",
    ),
    keyPoints(
      "API: Application Programming Interface, a way for programs to talk.",
      "A web API speaks HTTP: requests in, responses out.",
      "The contract is the methods, URLs, bodies and status codes.",
      "Change the code freely; change the contract carefully.",
    ),
  ),

  part(
    "two-sides",
    "Two programs, one contract",
    explain(
      "Every API has two sides, and as a full-stack developer you write both. The **server** code says which requests it answers and what it sends back. The **client** code, in the browser, builds requests and reads the answers. They usually live in different folders, run on different machines, and meet only through HTTP.",
    ),
    diagram(
      [
        ["React app", "client code"],
        ["HTTP", "the contract"],
        ["Node server", "server code"],
      ],
      true,
    ),
    code(
      "js",
      "The same endpoint, from both sides",
      [
        "// server: backend/src/routes/notes.js",
        'notesRoutes.get("/", listNotes);',
        "",
        "// client: frontend/src/services",
        "export function getNotes() {",
        '  return request("/api/notes");',
        "}",
      ],
      {
        2: "mounted at /api/notes: answers GET /api/notes",
        6: "sends GET /api/notes and returns the data",
      },
    ),
  ),

  part(
    "endpoints",
    "The Notes App's API, as a table",
    explain(
      "An API is easiest to read as a table of [[rest-endpoint|endpoints]]: a method plus a path, what it does and what comes back. This is the Notes App's whole contract. The notes endpoints need you logged in; `/me` does too. Learn to write a table like this before writing any code.",
    ),
    reference("Every Notes App endpoint", [
      ["GET /api/health", "Is the server up?", '200 {"status":"ok"}'],
      ["POST /api/auth/register", "Make an account.", "201, 400 or 409"],
      ["POST /api/auth/login", "Log in; sets a cookie.", "200 or 401"],
      ["POST /api/auth/logout", "Log out.", "204"],
      ["GET /api/auth/me", "Who is logged in?", "200 or 401"],
      ["GET /api/notes", "Your notes, newest first.", "200 + list"],
      ["POST /api/notes", "Make a note.", "201 or 400"],
      ["PUT /api/notes/:id", "Replace a note.", "200, 400 or 404"],
      ["DELETE /api/notes/:id", "Delete a note.", "204 or 404"],
    ]),
    inTheNotesApp(
      "`auth.js` lists the account endpoints: three POSTs and one GET that needs you logged in.",
      { fileId: "backend/src/routes/auth.js" },
    ),
    inTheNotesApp(
      "`notes.js` lists the four notes endpoints, all behind a login check.",
      { fileId: "backend/src/routes/notes.js" },
    ),
  ),

  part(
    "messages",
    "What a request and a response carry",
    explain(
      "Every call is one [[http-request-response|request and one response]]. The request carries a method (what to do), a URL (to what), headers (details such as the body's format) and sometimes a body (the data). The response carries a status code (how it went), headers and usually a body. The next modules take each piece in turn.",
    ),
    anatomy(
      "A call, as it travels",
      [
        "PUT /api/notes/8",
        "Content-Type: application/json",
        '{"title":"Oat milk","content":""}',
        '→ 200 OK  {"id":8,"title":"Oat milk"…}',
      ],
      [
        ["PUT", "method", "What to do: replace. Module 2."],
        ["/api/notes/8", "URL", "What to do it to: note 8. Module 6."],
        [
          "Content-Type: application/json",
          "header",
          "Details about the message. Module 4.",
        ],
        [
          '{"title":"Oat milk","content":""}',
          "body",
          "The data, as JSON. Module 5.",
        ],
        ["200 OK", "status", "How it went. Module 3."],
        ['{"id":8', "response body", "The saved note, as JSON."],
      ],
    ),
  ),

  part(
    "request-function",
    "One function for every call",
    explain(
      "You could write `fetch` by hand in every component, repeating the same headers, JSON and error checks. The Notes App puts them in **one** function, `request(path, options)`, and every API call goes through it. Then `notesApi.js` is just a list of tiny functions, one per endpoint, and components never touch `fetch` at all.",
    ),
    code(
      "js",
      "request.js, shortened",
      [
        "async function request(path, opts = {}) {",
        '  const { method = "GET", body } = opts;',
        "  const res = await fetch(path, {",
        "    method,",
        '    credentials: "include",',
        "    body: body && JSON.stringify(body),",
        "  });",
        "  if (res.status === 204) return null;",
        "  const data = await res.json();",
        "  if (!res.ok) throw new Error(data.error);",
        "  return data;",
        "}",
      ],
      {
        2: "GET unless told otherwise",
        5: "send the login cookie",
        6: "objects go out as JSON text",
        8: "success with no body",
        10: "turn an error status into a thrown error",
      },
    ),
    inTheNotesApp(
      "`request.js` is the one place that talks to `fetch`. It also sets `Content-Type` when there is a body.",
      { fileId: "frontend/src/services/request.js" },
    ),
    inTheNotesApp(
      "`notesApi.js` has one small function per notes endpoint, each a single call to `request`.",
      { fileId: "frontend/src/services/notesApi.js" },
    ),
  ),

  part(
    "step-by-step",
    "A call, step by step",
    explain(
      "Step through deleting note 8, from the click to the list updating. Watch where the contract is used: the client picks the method and URL; the server answers with a status the client checks.",
    ),
    trace(
      "Deleting note 8",
      [
        "// notesApi.js",
        "function deleteNote(id) {",
        "  return request(`/api/notes/${id}`,",
        '    { method: "DELETE" });',
        "}",
        "// useNotes.js",
        "async function removeNote(id) {",
        "  await deleteNote(id);",
        "  setNotes((current) =>",
        "    current.filter((n) => n.id !== id));",
        "}",
      ],
      [
        {
          line: 7,
          note: "You click Delete on note 8, and the hook's `removeNote` runs.",
          vars: [["id", "8"]],
          stack: ["removeNote"],
        },
        {
          line: 8,
          note: "It calls the API function for this endpoint. Components never build URLs themselves.",
          vars: [["id", "8"]],
          stack: ["removeNote", "deleteNote"],
        },
        {
          line: 3,
          note: "The URL is built from the id, and the method comes from the contract: DELETE.",
          vars: [["id", "8"]],
          stack: ["removeNote", "deleteNote"],
          output: "→ DELETE /api/notes/8",
        },
        {
          line: 8,
          note: "The server answers 204 No Content. `request` sees 204 and returns `null`; `await` resumes.",
          vars: [["id", "8"]],
          stack: ["removeNote"],
          output: "← 204 No Content",
        },
        {
          line: 9,
          note: "Only now, after the server agreed, does the list drop note 8.",
          vars: [["id", "8"]],
          stack: ["removeNote"],
        },
      ],
    ),
  ),

  part(
    "curl",
    "Try it from the terminal",
    explain(
      "Before writing client code, try the endpoint by hand. `curl` sends one request from the terminal and prints the answer. `-i` shows the status and headers, `-X` picks the method, `-H` adds a header, `-d` sends a body. To stay logged in, `-c` saves the cookie the server sets and `-b` sends it back.",
    ),
    code(
      "bash",
      "Logging in and listing notes",
      [
        "$ curl -i -c jar.txt -X POST \\",
        "    localhost:3000/api/auth/login \\",
        '    -H "Content-Type: application/json" \\',
        '    -d \'{"email":"a@b.co",',
        '         "password":"secret123"}\'',
        "HTTP/1.1 200 OK",
        "",
        "$ curl -i -b jar.txt \\",
        "    localhost:3000/api/notes",
        "HTTP/1.1 200 OK",
        "Content-Type: application/json…",
        '[{"id":8,"title":"Milk",…}]',
      ],
      {
        1: "-c jar.txt: keep the login cookie in a file",
        3: "the body is JSON, and we say so",
        8: "-b jar.txt: send the cookie back",
        12: "the same JSON your React app gets",
      },
    ),
  ),

  part(
    "network-tab",
    "Watch it in the Network tab",
    explain(
      "In the running app, open DevTools → **Network** and filter by **Fetch/XHR** to see only API calls. Click one: **Headers** shows the method, URL and status; **Payload** the body you sent; **Response** what came back. Right-click a request and choose **Copy → Copy as cURL** to replay it in the terminal.",
    ),
    keyPoints(
      "Fetch/XHR hides images and scripts: only API calls remain.",
      "A red row is a 4xx or 5xx: click it and read the response body.",
      "Copy as cURL (or as fetch) turns any call into one you can rerun.",
    ),
    quickCheck(
      "Saving a note shows an error in the app. What should you look at first?",
      [
        "The React component's JSX",
        "The request in the Network tab: its status and response body",
        "The database tables",
      ],
      1,
      "The Network tab shows the contract in action: what was sent and what came back. A 400 with `Title is required` points at the client; a 500 points at the server.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Calling fetch all over the components",
      language: "jsx",
      wrong: [
        "// in NoteCard, NoteForm, Dashboard…",
        'await fetch("/api/notes/" + id, {',
        '  method: "DELETE" });',
      ],
      problem:
        "The cookie option, JSON and error checks are copied everywhere. One copy forgets to check the status, and a failed delete looks like it worked.",
      right: ["await deleteNote(id);"],
      why: "One request function, one function per endpoint: the contract lives in one place.",
    }),
    mistake({
      title: "Guessing the contract",
      wrong: ['request("/api/note/8", { method: "POST" });'],
      problem:
        "There's no `POST /api/note/8`. The server answers 404 and you lose time guessing.",
      right: ['request("/api/notes/8", { method: "PUT",', "  body: note });"],
      why: "Read the endpoint table (or the routes file) first, and try it with curl.",
    }),
    mistake({
      title: "Updating the screen before the server agrees",
      wrong: [
        "setNotes(notes.filter((n) => n.id !== id));",
        "deleteNote(id); // not awaited",
      ],
      problem:
        "If the server answers 404 or 500, the note vanishes from the screen but still exists.",
      right: [
        "await deleteNote(id);",
        "setNotes(notes.filter((n) => n.id !== id));",
      ],
      why: "Wait for the response, then update. (Advanced apps undo on failure instead.)",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Read a request line",
      task: 'Write `parseRequestLine(line)` that takes the first line of a request, such as `"GET /api/notes HTTP/1.1"`, and returns `{ method, path }`.',
      starter: ["function parseRequestLine(line) {", "", "}"],
      tests: [
        [
          'parseRequestLine("GET /api/notes HTTP/1.1")',
          '{ method: "GET", path: "/api/notes" }',
        ],
        [
          'parseRequestLine("DELETE /api/notes/8 HTTP/1.1")',
          '{ method: "DELETE", path: "/api/notes/8" }',
        ],
      ],
      hint: 'Split on spaces: `line.split(" ")` gives the method, the path and the version.',
      solution: [
        "function parseRequestLine(line) {",
        '  const [method, path] = line.split(" ");',
        "  return { method, path };",
        "}",
      ],
    }),
    yourTurn({
      title: "Call the API",
      task: "Write `async function loadTitles(send)`. `send(path)` is a fake fetch: it returns a promise of a response with a `json()` method. Call it with `/api/notes`, read the JSON (a list of notes) and return just their titles.",
      starter: ["async function loadTitles(send) {", "", "}"],
      tests: [
        [
          'loadTitles(async (path) => ({ json: async () => path === "/api/notes" ? [{ id: 9, title: "Eggs" }, { id: 8, title: "Milk" }] : [] }))',
          '["Eggs", "Milk"]',
        ],
        ["loadTitles(async () => ({ json: async () => [] }))", "[]"],
      ],
      hint: "Two awaits: one for the response, one for `response.json()`. Then `map` to the titles.",
      solution: [
        "async function loadTitles(send) {",
        '  const response = await send("/api/notes");',
        "  const notes = await response.json();",
        "  return notes.map((note) => note.title);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("APIs cheat sheet", [
      ["API", "A contract between two programs.", "send this, get that"],
      ["Endpoint", "A method plus a path.", "GET /api/notes"],
      [
        "Request",
        "Method, URL, headers, maybe a body.",
        "POST /api/notes + JSON",
      ],
      ["Response", "Status, headers, usually a body.", "201 + the new note"],
      [
        "Client wrapper",
        "One function sends every call.",
        'request("/api/notes")',
      ],
      [
        "curl",
        "Try an endpoint from the terminal.",
        "curl -i localhost:3000/api/health",
      ],
      ["Network tab", "Watch real calls; filter Fetch/XHR.", "Copy as cURL"],
    ]),
    quickCheck(
      "The server team renames `title` to `name` in every note it sends. Your code didn't change. What happens?",
      [
        "Nothing: the API is on another machine",
        "Your app breaks: it relied on the contract, and the contract changed",
        "The browser renames it back",
      ],
      1,
      "Your code reads `note.title`, which is now `undefined`. Changing what an API sends changes the contract, so every client must change too. That's why contracts change carefully.",
    ),
  ),
);
