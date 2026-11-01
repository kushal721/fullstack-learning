import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  jsPlayground,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Reading real code: a guided read of the Notes App's request, notesApi and
// useNotes, putting the Intermediate ideas together. How to read code you
// didn't write, the files and how a call travels, request line by line
// (anatomy, a step-through and a playground), notesApi, useNotes' state,
// loading and updates, spotting each concept, changing it safely, practice
// and a recap.
export const readingRealCodeModule = moduleLesson(
  "reading-the-notes-api",
  "Reading real code: the Notes App's API",
  45,
  [
    "Read code you didn't write with a plan: exports first, then one call at a time.",
    "Follow a request from a component, through `useNotes` and `notesApi`, to `request` and the server.",
    "Explain every line of `request`: options, `fetch`, status checks, JSON and errors.",
    "Spot each Intermediate idea in real code: modules, async, JSON, errors, spread, `?.` and `??`.",
    "Make small, safe changes to existing code and check them with tests.",
  ],

  part(
    "why",
    "How to read code you didn't write",
    explain(
      "Most of your time as a developer goes on **reading** code: a teammate's, a library's, your own from last month. Nobody reads a project top to bottom like a book. You read it with a plan, and you now know enough JavaScript to read the Notes App's real API code, every line.",
    ),
    diagram([
      ["1. what does it export?", "the file's job, from the outside"],
      ["2. read names and comments", "they say what each part is for"],
      ["3. follow one call", "from where it starts to where it ends"],
      ["4. name each idea", "async, destructuring, spread…"],
      ["5. try it", "run it, change one thing, see what happens"],
    ]),
    keyPoints(
      "Start from the outside: what does each file export?",
      "Follow one real call rather than reading everything.",
      "Unknown syntax? Name it, look it up, carry on.",
    ),
  ),

  part(
    "the-files",
    "Three files, one job each",
    explain(
      "The Notes App's frontend talks to the server through three small files. `request.js` knows **how** to talk to the API. `notesApi.js` knows **which** URLs mean what. `useNotes.js` keeps the list of notes for the page. Here's how loading the dashboard travels through them:",
    ),
    diagram([
      ["Dashboard", "calls useNotes() to get the notes"],
      ["useNotes", "calls getNotes() once, when it appears"],
      ["getNotes", 'calls request("/api/notes")'],
      ["request", "calls fetch, checks the reply, reads JSON"],
      ["server", "answers 200 with the notes as JSON"],
    ]),
    quickCheck(
      "Where would you change how every request sends the login cookie?",
      ["useNotes.js", "notesApi.js", "request.js"],
      2,
      "Every API call goes through `request`, so how requests are sent is written once, there.",
    ),
  ),

  part(
    "request-signature",
    "request: the first line",
    explain(
      '`request` is the one function every API call goes through. Its first line already uses four ideas from this level. It takes a path, plus an **options** object that\'s destructured on the spot, with defaults. The final `= {}` means you can call `request("/api/notes")` with no options at all.',
    ),
    anatomy(
      "The first line, split up",
      [
        "export async function request(",
        "  path,",
        '  { method = "GET", body } = {},',
        ") {",
      ],
      [
        ["export", "module", "Other files can import it."],
        ["async", "async", "It can `await`, and it returns a promise."],
        ["path", "parameter", 'The URL, like `"/api/notes"`.'],
        [
          'method = "GET"',
          "default",
          "Destructured from the options; GET unless told otherwise.",
        ],
        ["body", "the data", "The note to send, if any."],
        [
          "= {}",
          "default object",
          "No options given? Destructure an empty object instead of failing.",
        ],
      ],
    ),
  ),

  part(
    "sending",
    "request: sending it",
    explain(
      'The first half sends the request. `fetch` gets the path and an options object. The `body` is turned into JSON text, and a header says so; with no body, both are left out (`undefined`). `credentials: "include"` sends the login cookie.',
    ),
    code(
      "js",
      "request.js, sending",
      [
        "const response = await fetch(path, {",
        "  method,",
        '  credentials: "include",',
        "  headers: body",
        '    ? { "Content-Type": "application/json" }',
        "    : undefined,",
        "  body: body ? JSON.stringify(body) : undefined,",
        "});",
      ],
      {
        1: "await: pause until the reply arrives",
        2: "shorthand for method: method",
        3: "send the login cookie",
        4: "a header only when there's a body",
        7: "the note as JSON text",
      },
    ),
  ),

  part(
    "reading-the-reply",
    "request: reading the reply",
    explain(
      "The second half deals with what came back. A 204 means success with no body. Otherwise it reads the JSON, but `.catch(() => null)` copes with a reply that isn't JSON. Then the key line: `fetch` doesn't reject on a 400 or 500, so `request` throws itself, using the server's own message if there is one.",
    ),
    code(
      "js",
      "request.js, reading the reply",
      [
        "if (response.status === 204) return null;",
        "",
        "const data = await response.json().catch(() => null);",
        "",
        "if (!response.ok) {",
        '  throw new Error(data?.error ?? "Something went wrong");',
        "}",
        "return data;",
      ],
      {
        1: "No Content: nothing to read",
        3: "not JSON? use null instead of failing",
        5: "a 4xx or 5xx status",
        6: "the server's message, or a fallback",
        8: "the parsed JSON: the notes, or the saved note",
      },
    ),
    quickCheck(
      "The server crashes and replies 500 with an HTML page. What does `request` do?",
      [
        "Throws a SyntaxError from response.json()",
        'Throws an Error saying "Something went wrong"',
        "Returns null",
      ],
      1,
      "`.json()` fails, but `.catch(() => null)` turns that into `null`. The status isn't ok, and `null?.error` is `undefined`, so `??` picks the fallback message.",
    ),
  ),

  part(
    "request-step-by-step",
    "A failed save, step by step",
    explain(
      'Follow one call that goes wrong: saving a note with an empty title. The server answers 400 with `{ "error": "Title is required" }`. Here\'s `request`, slightly shortened so it fits:',
    ),
    trace(
      "request with a 400 reply",
      [
        "async function request(path, options = {}) {",
        '  const { method = "GET", body } = options;',
        "  const response = await fetch(path, {",
        "    method,",
        "    body: JSON.stringify(body),",
        "  });",
        "  if (response.status === 204) return null;",
        "  const data = await response.json();",
        "  if (!response.ok) {",
        '    throw new Error(data?.error ?? "Failed");',
        "  }",
        "  return data;",
        "}",
      ],
      [
        {
          line: 2,
          note: '`createNote` called `request("/api/notes", { method: "POST", body: { title: "" } })`. Destructuring picks out `method` and `body`.',
          vars: [
            ["path", '"/api/notes"'],
            ["method", '"POST"'],
            ["body", '{ title: "" }'],
          ],
          stack: ["handleSave()", "createNote()", "request()"],
        },
        {
          line: 3,
          note: "The body becomes JSON text and the request is sent. `await` pauses `request` until the reply arrives.",
          vars: [
            ["path", '"/api/notes"'],
            ["method", '"POST"'],
            ["body", '{ title: "" }'],
            ["response", "(waiting)"],
          ],
          stack: ["handleSave()", "createNote()", "request()"],
        },
        {
          line: 7,
          note: "The reply: status 400. Not 204, so carry on.",
          vars: [
            ["path", '"/api/notes"'],
            ["method", '"POST"'],
            ["body", '{ title: "" }'],
            ["response", "{ status: 400, ok: false }"],
          ],
          stack: ["handleSave()", "createNote()", "request()"],
        },
        {
          line: 8,
          note: "Read the body as JSON: the server's error object.",
          vars: [
            ["response", "{ status: 400, ok: false }"],
            ["data", '{ error: "Title is required" }'],
          ],
          stack: ["handleSave()", "createNote()", "request()"],
        },
        {
          line: 10,
          note: "`response.ok` is false, so `request` throws, with the server's message. It stops, and so does `createNote`, which has no `try`.",
          vars: [
            ["response", "{ status: 400, ok: false }"],
            ["data", '{ error: "Title is required" }'],
          ],
          stack: ["handleSave()", "createNote()", "request()"],
        },
        {
          line: 10,
          note: "The error arrives in `handleSave`'s `catch`, which shows “Title is required” under the form.",
          stack: ["handleSave() (catch)"],
        },
      ],
    ),
  ),

  part(
    "try-request",
    "Try request yourself",
    explain(
      "Here is the real `request`, with `fakeFetch` standing in for the network (the playground can't reach a server). It answers like the Notes App's API would. Run it, then add your own calls: try `{ method: \"DELETE\" }`.",
    ),
    jsPlayground("The real request, with a fake server", [
      "async function fakeFetch(path, { method, body }) {",
      "  const note = body ? JSON.parse(body) : null;",
      '  if (method === "DELETE") return { status: 204, ok: true };',
      "  if (note && !note.title) {",
      '    const error = { error: "Title is required" };',
      "    return { status: 400, ok: false, json: async () => error };",
      "  }",
      '  return { status: 200, ok: true, json: async () => [{ title: "Milk" }] };',
      "}",
      "",
      'async function request(path, { method = "GET", body } = {}) {',
      "  const response = await fakeFetch(path, { method, body: body ? JSON.stringify(body) : undefined });",
      "  if (response.status === 204) return null;",
      "  const data = await response.json().catch(() => null);",
      '  if (!response.ok) throw new Error(data?.error ?? "Something went wrong");',
      "  return data;",
      "}",
      "",
      'request("/api/notes").then((notes) => console.log("GET:", notes));',
      'request("/api/notes", { method: "POST", body: { title: "" } }).catch((e) => console.log("POST:", e.message));',
    ]),
  ),

  part(
    "notes-api",
    "notesApi: one small function per call",
    explain(
      "`notesApi.js` is a list of one-line functions on top of `request`. Each one names an action, so components say `getNotes()` instead of building URLs. Notice the destructured `{ title, content }`: only those two fields are sent, even if the note object has more.",
    ),
    code(
      "js",
      "notesApi.js",
      [
        'import { request } from "./request.js";',
        "",
        "export function getNotes() {",
        '  return request("/api/notes");',
        "}",
        "",
        "export function createNote({ title, content }) {",
        '  return request("/api/notes", {',
        '    method: "POST",',
        "    body: { title, content },",
        "  });",
        "}",
        "",
        "export function deleteNote(id) {",
        '  return request(`/api/notes/${id}`, { method: "DELETE" });',
      ],
      {
        4: "return the promise, so callers can await it",
        7: "destructure: take only title and content",
        10: "shorthand: { title: title, content: content }",
        15: "a template literal builds the URL",
      },
    ),
    quickCheck(
      "Why does `getNotes` say `return request(…)`, not just `request(…)`?",
      [
        "Without return, the caller gets undefined instead of the promise",
        "request only runs when returned",
        "It's just style",
      ],
      0,
      "The caller awaits what `getNotes` gives back. Without `return`, that's `undefined`: the request still happens, but nobody gets the notes.",
    ),
  ),

  part(
    "use-notes",
    "useNotes: loading the list",
    explain(
      "`useNotes` keeps the notes for the page. `useState` (from React) gives back a value and a function to change it, unpacked with array destructuring. When the page appears, it loads the notes with `then`/`catch`/`finally`, so the page can show all three states. `ignore` drops a reply that arrives after the page has gone.",
    ),
    code(
      "js",
      "useNotes.js, loading",
      [
        "const [notes, setNotes] = useState([]);",
        "const [isLoading, setIsLoading] = useState(true);",
        "const [error, setError] = useState(null);",
        "",
        "useEffect(() => {",
        "  let ignore = false;",
        "  getNotes()",
        "    .then((loaded) => { if (!ignore) setNotes(loaded); })",
        "    .catch((err) => { if (!ignore) setError(err.message); })",
        "    .finally(() => { if (!ignore) setIsLoading(false); });",
        "  return () => { ignore = true; };",
        "}, []);",
      ],
      {
        1: "array destructuring: the value and its setter",
        5: "run once, when the page appears",
        9: "request's thrown message ends up here",
        10: "loading is over, either way",
        11: "the page has gone: ignore a late reply",
      },
    ),
  ),

  part(
    "updating",
    "useNotes: changing the list",
    explain(
      "The other functions change the list, and always make a **new** array: React only notices a new value. Adding uses spread, replacing uses `map`, removing uses `filter`. `removeNote` awaits the server **first**, so a note only leaves the page once it's really deleted. Try the three, with plain variables in place of React:",
    ),
    jsPlayground("Add, replace, remove: always a new array", [
      'let notes = [{ id: 1, title: "Milk" }, { id: 2, title: "Bread" }];',
      "function setNotes(update) {",
      "  notes = update(notes); // like React: a function of the current list",
      '  console.log(notes.map((n) => n.title).join(", "));',
      "}",
      "",
      "function addNote(note) {",
      "  setNotes((current) => [note, ...current]);",
      "}",
      "function replaceNote(updated) {",
      "  setNotes((current) =>",
      "    current.map((note) => (note.id === updated.id ? updated : note)),",
      "  );",
      "}",
      "function removeNote(id) {",
      "  setNotes((current) => current.filter((note) => note.id !== id));",
      "}",
      "",
      'addNote({ id: 3, title: "Eggs" });',
      'replaceNote({ id: 1, title: "Oat milk" }); removeNote(2);',
    ]),
  ),

  part(
    "spot-the-ideas",
    "Spot the ideas",
    explain(
      "Every idea from this level appears in these three files. Here's where to find each one. If any line still puzzles you, go back to that module.",
    ),
    reference("Intermediate ideas in the Notes App", [
      [
        "modules",
        "Every file imports and exports.",
        'import { request } from "./request.js";',
      ],
      [
        "async / await",
        "request waits for the reply and the body.",
        "const response = await fetch(…)",
      ],
      [
        "promises",
        "useNotes loads with then / catch / finally.",
        "getNotes().then(…).catch(…)",
      ],
      [
        "JSON",
        "Sending and reading bodies.",
        "JSON.stringify(body), response.json()",
      ],
      [
        "errors",
        "A failed status becomes a thrown Error.",
        "throw new Error(data?.error ?? …)",
      ],
      [
        "destructuring",
        "Options, notes and React state.",
        '{ method = "GET", body } = {}',
      ],
      ["spread", "A new list with one more note.", "[note, ...current]"],
      ["?. and ??", "A reply that may have no body.", 'data?.error ?? "…"'],
      [
        "map / filter",
        "Replace or remove one note.",
        "current.filter((n) => n.id !== id)",
      ],
    ]),
    inTheNotesApp(
      "Open `request` in the code explorer and read it next to this module: it's the same code, with comments. Then follow its callers: `createNote` and the rest of `notesApi.js`, and `useNotes`.",
      { symbolId: "fn:request" },
    ),
  ),

  part(
    "changing-safely",
    "Changing it safely",
    explain(
      "Reading comes before changing. Before you edit code like this, find **everyone who calls it**: a change to `request` affects every API call. Change one thing at a time, keep the function's shape (what it takes and gives back), and check it straight away. Here's what goes wrong when a small change ignores that:",
    ),
    mistake({
      title: "Removing the .catch on response.json()",
      wrong: ["const data = await response.json();"],
      problem:
        "Fine while the server sends JSON. But when a crashed server sends an HTML error page, `.json()` throws a SyntaxError, and users see a confusing message instead of “Something went wrong”.",
      right: ["const data = await response.json().catch(() => null);"],
      why: "That line copes with the replies you don't expect. Know why a line is there before removing it.",
    }),
    mistake({
      title: "Changing state in place",
      wrong: [
        "function addNote(note) {",
        "  setNotes((current) => {",
        "    current.push(note);",
        "    return current;",
        "  });",
        "}",
      ],
      problem:
        "It's the same array, so React sees no change and the new note doesn't appear.",
      right: [
        "function addNote(note) {",
        "  setNotes((current) => [note, ...current]);",
        "}",
      ],
      why: "Keep the pattern the file already uses: a new array every time.",
    }),
    mistake({
      title: "Dropping a return in notesApi",
      wrong: ["export function getNotes() {", '  request("/api/notes");', "}"],
      problem:
        "The request is still sent, but `getNotes()` gives back `undefined`, so `.then` fails in `useNotes`.",
      right: [
        "export function getNotes() {",
        '  return request("/api/notes");',
        "}",
      ],
      why: "Keep the function's shape: it gave back a promise, so it still must.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Add getNote",
      task: "Add `getNote(id)` in the style of `notesApi.js`: it should return `request` for `/api/notes/` plus the id. (This `request` just reports what it was asked to do.)",
      starter: [
        'function request(path, { method = "GET", body } = {}) {',
        "  return { path, method, body };",
        "}",
        "",
        "function getNote(id) {",
        "",
        "}",
      ],
      tests: [
        ["getNote(7).path", '"/api/notes/7"'],
        ["getNote(12).path", '"/api/notes/12"'],
        ["getNote(7).method", '"GET"'],
      ],
      hint: "`return request(`/api/notes/${id}`);`",
      solution: [
        'function request(path, { method = "GET", body } = {}) {',
        "  return { path, method, body };",
        "}",
        "",
        "function getNote(id) {",
        "  return request(`/api/notes/${id}`);",
        "}",
      ],
    }),
    yourTurn({
      title: "Send only what's needed",
      task: "Write `updateNote(id, note)` to `PUT` to `/api/notes/` plus the id, with a body of **only** the note's `title` and `content`.",
      starter: [
        'function request(path, { method = "GET", body } = {}) {',
        "  return { path, method, body };",
        "}",
        "",
        "function updateNote(id, note) {",
        "  return request(`/api/notes/${id}`, { body: note });",
        "}",
      ],
      tests: [
        [
          'updateNote(3, { id: 3, title: "Tea", content: "Green", done: true })',
          '{ path: "/api/notes/3", method: "PUT", body: { title: "Tea", content: "Green" } }',
        ],
        ['updateNote(8, { title: "Milk", content: "" }).method', '"PUT"'],
      ],
      hint: 'Destructure in the parameter: `updateNote(id, { title, content })`, then `{ method: "PUT", body: { title, content } }`.',
      solution: [
        'function request(path, { method = "GET", body } = {}) {',
        "  return { path, method, body };",
        "}",
        "",
        "function updateNote(id, { title, content }) {",
        "  return request(`/api/notes/${id}`, {",
        '    method: "PUT",',
        "    body: { title, content },",
        "  });",
        "}",
      ],
    }),
    yourTurn({
      title: "Read the reply",
      task: 'Finish `readReply(response)`, the second half of `request`: return `null` for a 204; read the JSON (using `null` if it isn\'t JSON); throw an Error with `data?.error`, or `"Something went wrong"`, when `response.ok` is false; otherwise return the data.',
      starter: [
        "async function readReply(response) {",
        "  return response.json();",
        "}",
        "",
        "const reply = (status, json) => ({ status, ok: status < 400, json });",
      ],
      tests: [
        ['readReply(reply(200, async () => ["Milk"]))', '["Milk"]'],
        ["readReply(reply(204))", "null"],
        [
          'readReply(reply(400, async () => ({ error: "Title is required" }))).catch((e) => e.message)',
          '"Title is required"',
        ],
        [
          'readReply(reply(500, async () => { throw new SyntaxError("not JSON"); })).catch((e) => e.message)',
          '"Something went wrong"',
        ],
      ],
      hint: "It's the lines from “reading the reply”, with `response` passed in.",
      solution: [
        "async function readReply(response) {",
        "  if (response.status === 204) return null;",
        "  const data = await response.json().catch(() => null);",
        "  if (!response.ok) {",
        '    throw new Error(data?.error ?? "Something went wrong");',
        "  }",
        "  return data;",
        "}",
        "",
        "const reply = (status, json) => ({ status, ok: status < 400, json });",
      ],
    }),
    yourTurn({
      title: "Replace one note",
      task: "Write `replaceNote(notes, updated)`: return a **new** array where the note with `updated`'s id is swapped for `updated`. Don't change `notes`.",
      starter: ["function replaceNote(notes, updated) {", "", "}"],
      tests: [
        [
          'replaceNote([{ id: 1, title: "Milk" }, { id: 2, title: "Tea" }], { id: 2, title: "Green tea" })',
          '[{ id: 1, title: "Milk" }, { id: 2, title: "Green tea" }]',
        ],
        [
          'replaceNote([{ id: 1, title: "Milk" }], { id: 9, title: "X" })',
          '[{ id: 1, title: "Milk" }]',
        ],
        [
          '((list) => (replaceNote(list, { id: 1, title: "B" }), list[0].title))([{ id: 1, title: "A" }])',
          '"A"',
        ],
      ],
      hint: "`return notes.map((note) => (note.id === updated.id ? updated : note));`",
      solution: [
        "function replaceNote(notes, updated) {",
        "  return notes.map((note) => (note.id === updated.id ? updated : note));",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap",
    reference("How the Notes App talks to its API", [
      [
        "request.js",
        "How to talk to the API: fetch, cookie, JSON, errors.",
        "request(path, { method, body })",
      ],
      [
        "notesApi.js",
        "One function per action, built on request.",
        "getNotes(), createNote({ title, content })",
      ],
      [
        "useNotes.js",
        "Keeps the list, loading and error for the page.",
        "const { notes, isLoading, error } = useNotes();",
      ],
      [
        "a failed status",
        "request throws; the caller's catch shows it.",
        "catch (err) { setError(err.message) }",
      ],
      [
        "reading code",
        "Exports first, then follow one call.",
        "Dashboard → useNotes → getNotes → request",
      ],
    ]),
    quickCheck(
      "The server answers `DELETE /api/notes/5` with 204. What does `deleteNote(5)` give back once it settles?",
      ["`undefined`", "`null`", "An error, because there's no JSON"],
      1,
      "`request` checks for 204 before reading any JSON, and returns `null`.",
    ),
  ),
);
