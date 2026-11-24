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
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// APIs and JSON: data for programs. Pages and data, JSON taken apart,
// JSON's rules, JSON in JavaScript, endpoints, loading notes step by step,
// sending data, errors as data, looking at an API, the Notes App, mistakes,
// practice and a recap.
export const apisAndJsonModule = moduleLesson(
  "apis-and-json",
  "APIs and JSON: data for programs",
  40,
  [
    "Explain what an API is, and how it differs from a web page.",
    "Read and write JSON, and spot JSON that isn't valid.",
    "Name an API's endpoints from their methods and paths.",
    "Follow an app loading data: request, JSON response, parse, show.",
    "Send JSON to an API and handle the errors it sends back.",
  ],

  part(
    "pages-and-data",
    "Pages for people, data for programs",
    explain(
      "A web page is for people: HTML, ready to look at. An [[api]] (Application Programming Interface) is for programs: URLs that answer with **data** instead of a page, usually as [[json-data|JSON]]. The program that asked, like the Notes App's React code, decides how to show it.",
    ),
    analogy(
      "A restaurant's dining room serves finished plates; its supplier's door hands out raw ingredients in labelled boxes. The page is the plate; the API is the box of ingredients.",
    ),
    diagram(
      [
        ["GET /notes", "a page: HTML for you"],
        ["GET /api/notes", "data: JSON for the app"],
      ],
      true,
    ),
    quickCheck(
      "What does an API usually send back?",
      [
        "Data for a program to use, often JSON",
        "A finished page with styling",
        "An IP address",
      ],
      0,
      "An [[api]] returns data; the client decides how to show it.",
    ),
  ),

  part(
    "json-anatomy",
    "JSON, taken apart",
    explain(
      "JSON (JavaScript Object Notation) is text that looks like a JavaScript object. It has only a few building blocks: objects in `{}` with named values, lists in `[]`, and four kinds of value: strings, numbers, `true`/`false` and `null`. Here's one note, as the API sends it:",
    ),
    anatomy(
      "One note in JSON",
      [
        '{ "id": 7,',
        '  "title": "Milk",',
        '  "content": "",',
        '  "created_at": "2026-…" }',
      ],
      [
        ['"id"', "key", "Always a string in double quotes."],
        ["7", "number", "No quotes: a number."],
        ['"Milk"', "string", "Text, in double quotes."],
        ['""', "empty string", "Text with nothing in it, not missing."],
        [
          '"2026-…"',
          "a date, as text",
          "JSON has no dates: they travel as strings.",
        ],
      ],
    ),
  ),

  part(
    "json-rules",
    "JSON's strict rules",
    explain(
      "JSON looks like JavaScript but is much stricter, so any program in any language can read it. One stray comma and the whole thing fails to parse. These are the rules that catch people out:",
    ),
    reference("JSON's rules", [
      [
        "Double quotes",
        "Keys and strings: \"…\", never '…'.",
        '{"title":"Milk"}',
      ],
      ["No trailing comma", "Nothing after the last item.", "[1, 2, 3]"],
      ["No comments", "// and /* */ aren't allowed.", "—"],
      ["Values", "String, number, true, false, null.", '"a", 1, true, null'],
      ["No undefined", "Or functions, or dates.", "dates → strings"],
      ["Nesting", "Objects and lists inside each other.", '{"tags":["a"]}'],
    ]),
    quickCheck(
      "Which of these is valid JSON?",
      ["`{'title': 'Milk'}`", '`{"title": "Milk"}`', '`{"title": "Milk",}`'],
      1,
      "JSON needs double quotes and no trailing comma.",
    ),
  ),

  part(
    "json-in-javascript",
    "JSON in JavaScript",
    explain(
      "JSON travels as text, so both ends [[json-parse|convert it]]. `JSON.stringify` turns a value into JSON text to send; `JSON.parse` turns JSON text back into a value. You rarely call them by hand: `response.json()` parses a `fetch` response, and Express's `res.json()` stringifies for you.",
    ),
    code(
      "js",
      "turning values into JSON and back",
      [
        'const note = { title: "Milk" };',
        "",
        "const text = JSON.stringify(note);",
        '// \'{"title":"Milk"}\'',
        "",
        "const back = JSON.parse(text);",
        'back.title; // "Milk"',
        "",
        "JSON.parse(\"{'title':'Milk'}\");",
        "// SyntaxError",
      ],
      {
        3: "value → text, to send",
        6: "text → value, to use",
        9: "invalid JSON throws an error",
      },
    ),
  ),

  part(
    "endpoints",
    "Endpoints: an API's menu",
    explain(
      "An API is a set of [[rest-endpoint|endpoints]]: each one a method plus a path. Most web APIs follow the same pattern, called REST: a path names a kind of thing, an id picks one of them, and the [[method]] says what to do. Learn the pattern once and most APIs read the same:",
    ),
    reference("The REST pattern, for notes", [
      ["GET /api/notes", "List them.", "200 + [ … ]"],
      ["GET /api/notes/7", "Get one.", "200 + { … }"],
      ["POST /api/notes", "Create one; JSON body.", "201 + the new note"],
      ["PUT /api/notes/7", "Replace one; JSON body.", "200 + the note"],
      ["DELETE /api/notes/7", "Remove one.", "204, no body"],
    ]),
    keyPoints(
      "Paths are nouns (`/notes`); methods are the verbs.",
      "An id in the path picks one item.",
      "The status code says how it went; the body carries the data.",
    ),
  ),

  part(
    "step-by-step",
    "Loading notes, step by step",
    explain(
      "Step through the Notes App loading your notes, from React asking to the list on screen:",
    ),
    trace(
      "Loading the notes list",
      [
        "useNotes() runs once",
        "getNotes()",
        'request("/api/notes")',
        "fetch → GET /api/notes",
        "server: SELECT … notes",
        "res.json(result.rows)",
        "← 200, application/json",
        "response.ok? yes",
        "await response.json()",
        "setNotes(loaded)",
        "React draws the list",
      ],
      [
        {
          line: 1,
          note: "The dashboard appears, and its `useNotes` hook asks for the notes once.",
          vars: [["notes", "[]"]],
        },
        {
          line: 4,
          note: "`request.js` sends a GET to the API, with the login cookie.",
          vars: [
            ["notes", "[]"],
            ["sent", "GET /api/notes"],
          ],
        },
        {
          line: 6,
          note: "The server gets rows from the database: JavaScript objects. `res.json` turns them into JSON text and sets `Content-Type: application/json`.",
          vars: [["body", '[{"id":8,"title":"Milk",…}]']],
        },
        {
          line: 8,
          note: "The status is 200, so the request worked. (A 4xx or 5xx would be turned into an error here.)",
          vars: [["status", "200"]],
        },
        {
          line: 9,
          note: "`response.json()` parses the JSON text back into a JavaScript array.",
          vars: [["loaded", '[{ id: 8, title: "Milk", … }]']],
        },
        {
          line: 11,
          note: "The array goes into React state, and React draws one card per note.",
          vars: [["notes", "2 notes"]],
          output: "Milk · Eggs",
        },
      ],
    ),
  ),

  part(
    "sending-data",
    "Sending JSON",
    explain(
      "To send data, the client turns it into JSON for the request's [[message-body|body]] and says so with `Content-Type: application/json`. On the server, `express.json()` reads that header and parses the body into `req.body`. Without the header, `req.body` stays empty.",
    ),
    code(
      "js",
      "both ends of sending a note",
      [
        "// the browser",
        'fetch("/api/notes", {',
        '  method: "POST",',
        "  headers: {",
        '    "Content-Type":',
        '      "application/json",',
        "  },",
        "  body: JSON.stringify(",
        '    { title: "Milk" }),',
        "});",
        "",
        "// the server",
        "app.use(express.json());",
        'req.body.title; // "Milk"',
      ],
      {
        5: "tell the server the body is JSON",
        8: "value → JSON text",
        13: "parses JSON bodies into req.body",
      },
    ),
  ),

  part(
    "errors",
    "Errors are data too",
    explain(
      'When something goes wrong, a good API still answers with JSON: a 4xx or 5xx [[status-code]] and a body that explains, like `{"error":"Title is required"}`. The client checks the status first, then shows the message. `fetch` won\'t do that for you: it only fails when the network does.',
    ),
    code(
      "js",
      "the Notes App's request.js, shortened",
      [
        "const response =",
        "  await fetch(path, options);",
        "const data = await response",
        "  .json().catch(() => null);",
        "if (!response.ok) {",
        "  throw new Error(data?.error);",
        "}",
        "return data;",
      ],
      {
        3: "parse the body; some answers have none",
        5: "ok is true only for 2xx",
        6: "use the API's own message",
      },
    ),
  ),

  part(
    "look-at-an-api",
    "Look at an API yourself",
    explain(
      "In [[devtools|DevTools]], open **Network** and choose the **Fetch/XHR** filter to see only API calls. Click one: **Payload** shows the JSON you sent, **Preview** shows the JSON that came back as a tree you can open. From a terminal, `curl` shows the raw text.",
    ),
    keyPoints(
      "Network → Fetch/XHR: only API calls.",
      "Payload: the JSON you sent.",
      "Preview: the response, as a tree.",
      "`curl -s URL` prints the raw JSON.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's API",
    explain(
      "The Notes App is two programs talking JSON. The React app never touches the database: it calls `getNotes`, `createNote`, `updateNote` and `deleteNote`, which send requests to the API. The API reads and writes PostgreSQL and answers with JSON. Each side can change on its own as long as the JSON stays the same shape.",
    ),
    inTheNotesApp(
      "`notesApi.js` is the client's menu: one function per endpoint.",
      { fileId: "frontend/src/services/notesApi.js" },
    ),
    inTheNotesApp(
      "`useNotes.js` loads the list once and keeps it in React state.",
      { fileId: "frontend/src/hooks/useNotes.js" },
    ),
    inTheNotesApp(
      "`notesController.js` answers each endpoint with `res.json(…)`, or a status and an error.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting to await the body",
      wrong: [
        'const response = await fetch("/api/notes");',
        "const notes = response.json();",
        "notes.length; // undefined",
      ],
      problem:
        "`response.json()` returns a Promise: reading the body takes time. `notes` is the Promise, not the array.",
      right: [
        'const response = await fetch("/api/notes");',
        "const notes = await response.json();",
      ],
      why: "Await `response.json()` too: one await for the response, one for its body.",
    }),
    mistake({
      title: "Writing JavaScript instead of JSON",
      language: "json",
      wrong: ["{ title: 'Milk', pinned: false, }"],
      problem:
        "Unquoted keys, single quotes and a trailing comma are fine in JavaScript but invalid JSON. `JSON.parse` throws, and servers answer 400.",
      right: ['{ "title": "Milk", "pinned": false }'],
      why: "Double-quote every key and string, and drop the last comma. Or let `JSON.stringify` write it.",
    }),
    mistake({
      title: "Treating a date as a Date",
      wrong: ["note.created_at.getFullYear();", "// TypeError: not a function"],
      problem:
        'JSON has no dates, so `created_at` arrives as a string like `"2026-11-20T09:00:00.000Z"`.',
      right: ["new Date(note.created_at).getFullYear();"],
      why: "Turn date strings into `Date` objects when you need to work with them.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Fix the JSON",
      task: "The script can't read the note because the JSON in `#data` isn't valid. Fix the JSON (not the script) so the page shows its title and whether it's pinned.",
      starter: [
        '<script type="application/json" id="data">',
        "  { 'title': 'Milk', 'pinned': true, }",
        "</script>",
        '<p>Title: <span id="title">?</span></p>',
        '<p>Pinned: <span id="pinned">?</span></p>',
        "<script>",
        '  const json = document.getElementById("data").textContent;',
        "  const note = JSON.parse(json);",
        '  document.getElementById("title").textContent = note.title;',
        '  document.getElementById("pinned").textContent = note.pinned;',
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: "The title is read",
          selector: "#title",
          text: "Milk",
        },
        {
          kind: "text",
          label: "Pinned is read as true",
          selector: "#pinned",
          text: "true",
        },
      ],
      hint: "JSON wants double quotes around every key and string, and no comma after the last value.",
      solution: [
        '<script type="application/json" id="data">',
        '  { "title": "Milk", "pinned": true }',
        "</script>",
        '<p>Title: <span id="title">?</span></p>',
        '<p>Pinned: <span id="pinned">?</span></p>',
        "<script>",
        '  const json = document.getElementById("data").textContent;',
        "  const note = JSON.parse(json);",
        '  document.getElementById("title").textContent = note.title;',
        '  document.getElementById("pinned").textContent = note.pinned;',
        "</script>",
      ],
    }),
    pageYourTurn({
      title: "Read the response",
      task: "This is what `GET /api/notes` sent back. Replace each `?`: how many notes there are, the second note's title, and the JSON type of `created_at` (`string`, `number` or `date`).",
      starter: [
        '<pre>[{"id":9,"title":"Eggs","created_at":"2026-11-21T08:00:00Z"},',
        ' {"id":8,"title":"Milk","created_at":"2026-11-20T09:00:00Z"}]</pre>',
        '<p>Notes: <span id="count">?</span></p>',
        '<p>Second title: <span id="second">?</span></p>',
        '<p>Type of created_at: <span id="type">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Two notes",
          selector: "#count",
          text: "2",
        },
        {
          kind: "text",
          label: "The second is Milk",
          selector: "#second",
          text: "Milk",
        },
        {
          kind: "text",
          label: "Dates travel as strings",
          selector: "#type",
          text: "string",
        },
      ],
      hint: "Count the objects in the list. The second one comes after the first `},`. Anything in double quotes is a string.",
      solution: [
        '<pre>[{"id":9,"title":"Eggs","created_at":"2026-11-21T08:00:00Z"},',
        ' {"id":8,"title":"Milk","created_at":"2026-11-20T09:00:00Z"}]</pre>',
        '<p>Notes: <span id="count">2</span></p>',
        '<p>Second title: <span id="second">Milk</span></p>',
        '<p>Type of created_at: <span id="type">string</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Write the request body",
      task: "Write the JSON body for creating a note with the title `Milk` and the content `2 litres` inside `#body`. The script reads it the way the server would.",
      starter: [
        '<script type="application/json" id="body">',
        "",
        "</script>",
        '<p>Title: <span id="title">?</span></p>',
        '<p>Content: <span id="content">?</span></p>',
        "<script>",
        '  const body = JSON.parse(document.getElementById("body").textContent);',
        '  document.getElementById("title").textContent = body.title;',
        '  document.getElementById("content").textContent = body.content;',
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: "The body has the title",
          selector: "#title",
          text: "Milk",
        },
        {
          kind: "text",
          label: "The body has the content",
          selector: "#content",
          text: "2 litres",
        },
      ],
      hint: 'An object with two keys, `title` and `content`, both strings: `{ "title": …, "content": … }`.',
      solution: [
        '<script type="application/json" id="body">',
        '  { "title": "Milk", "content": "2 litres" }',
        "</script>",
        '<p>Title: <span id="title">?</span></p>',
        '<p>Content: <span id="content">?</span></p>',
        "<script>",
        '  const body = JSON.parse(document.getElementById("body").textContent);',
        '  document.getElementById("title").textContent = body.title;',
        '  document.getElementById("content").textContent = body.content;',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("APIs and JSON cheat sheet", [
      ["API", "URLs that answer with data.", "/api/notes"],
      ["JSON", "Text: objects, lists, strings, numbers…", '{"id":7}'],
      ["strict", "Double quotes, no trailing commas.", '"title"'],
      ["stringify / parse", "Value → text / text → value.", "JSON.parse(text)"],
      ["endpoint", "A method plus a path.", "POST /api/notes"],
      ["REST", "Nouns in paths, verbs as methods.", "GET /api/notes/7"],
      ["send JSON", "Content-Type header + JSON body.", "application/json"],
      ["errors", "Status + JSON message; check ok.", '{"error":"…"}'],
      ["dates", "Travel as strings.", "new Date(text)"],
    ]),
    quickCheck(
      "`fetch` resolves with a 400 response. What should the app do?",
      [
        "Use the body as if it were the data",
        "Check `response.ok`, then show the API's error message",
        "Nothing: fetch would have thrown",
      ],
      1,
      "`fetch` only throws when the network fails. A 4xx is still a response; check the [[status-code]] first.",
    ),
  ),
);
