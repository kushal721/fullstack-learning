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
  scene,
  trace,
  tryIt,
} from "../blocks.js";

// HTTP: requests and responses. Why a shared language, a request and a
// response taken apart, the animated exchange, saving a note step by step,
// methods, safe and repeatable methods, status codes, reading it yourself,
// the Notes App's API, mistakes, practice and a recap.
export const httpModule = moduleLesson(
  "http",
  "HTTP: requests and responses",
  45,
  [
    "Explain why browsers and servers need a shared language, and what HTTP is.",
    "Name the parts of a request: method, path, headers and body.",
    "Name the parts of a response: status code, headers and body.",
    "Choose the right method for an action, and read what a status code means.",
    "Watch real requests in DevTools, and recognise common HTTP mistakes.",
  ],

  part(
    "shared-language",
    "Why a shared language?",
    explain(
      "Your browser might be Chrome on a phone; the server might be Node on Linux, written by someone you'll never meet. They still understand each other because both follow the same rules for messages: [[http]], the HyperText Transfer Protocol. The browser sends a [[request]]; the server sends back exactly one [[response]].",
    ),
    analogy(
      "Like ordering at a counter anywhere in the world: you say what you want, and you get it back or hear why not. The words are fixed, so it works with any shop.",
    ),
    diagram([
      ["Request", "what I want"],
      ["Server", "does the work"],
      ["Response", "how it went + data"],
    ]),
    quickCheck(
      "Who starts an HTTP conversation?",
      [
        "The server, whenever it has news",
        "The client, by sending a request",
        "Whoever is faster",
      ],
      1,
      "The [[client]] always asks first. A server only ever answers a request; this is the [[request-response|request–response cycle]].",
    ),
  ),

  part(
    "request-anatomy",
    "A request, taken apart",
    explain(
      "A request is plain text. The first line says **what** you want: an [[method]] and a [[path]]. Then come [[header|headers]], one per line, with extra information. After an empty line, some requests carry a [[message-body|body]]: the data you're sending. Here the Notes App saves a new note:",
    ),
    anatomy(
      "One request",
      [
        "POST /api/notes HTTP/1.1",
        "Host: notes.app",
        "Content-Type: application/json",
        '{"title":"Milk"}',
      ],
      [
        ["POST", "method", "The verb: what to do. POST means create."],
        ["/api/notes", "path", "What to do it to, on that server."],
        ["HTTP/1.1", "version", "Which version of the rules."],
        ["Host: notes.app", "header", "Which site; one server can host many."],
        [
          "Content-Type: application/json",
          "header",
          "What format the body is in.",
        ],
        [
          '{"title":"Milk"}',
          "body",
          "The data itself. A blank line comes before it.",
        ],
      ],
    ),
  ),

  part(
    "response-anatomy",
    "A response, taken apart",
    explain(
      "The response has the same shape. Its first line is the **status line**: a [[status-code]] and a short reason, so you know how it went before reading anything else. Headers and a body follow, just like the request.",
    ),
    anatomy(
      "One response",
      [
        "HTTP/1.1 201 Created",
        "Content-Type: application/json",
        '{"id":8,"title":"Milk"}',
      ],
      [
        ["HTTP/1.1", "version", "The same rules the request used."],
        ["201", "status code", "How it went. 201 means something was made."],
        ["Created", "reason", "The code in words, for people."],
        [
          "Content-Type: application/json",
          "header",
          "The body is JSON, so the app knows how to read it.",
        ],
        [
          '{"id":8,"title":"Milk"}',
          "body",
          "The new note, now with the id the server gave it.",
        ],
      ],
    ),
    quickCheck(
      "Which part of a response tells you, first of all, whether it worked?",
      ["The body", "The status code", "The Host header"],
      1,
      "The [[status-code]] on the first line says how it went. Read it before trusting the body.",
    ),
  ),

  part(
    "watch-an-exchange",
    "Watch an exchange",
    explain(
      "Here's the Notes App saving a note and then loading the list. Each arrow from the browser is one request; each arrow back is its one response. The server may talk to a database in between, but the browser never sees that.",
    ),
    scene("http-exchange"),
    keyPoints(
      "One request always gets exactly one response.",
      "The server can do any work in between: read files, ask a database.",
      "HTTP is [[stateless]]: every request carries all it needs.",
    ),
  ),

  part(
    "step-by-step",
    "Saving a note, step by step",
    explain(
      "Step through what happens when you save a note called “Milk”, and then when you try to save one with no title. Watch the method, path and status as they travel:",
    ),
    trace(
      "POST /api/notes, twice",
      [
        "click Save: “Milk”",
        "POST /api/notes",
        '  {"title":"Milk"}',
        "server: POST + /api/notes",
        "  → createNote()",
        "  title ok? yes",
        "  INSERT INTO notes",
        "201 Created",
        '  {"id":8,"title":"Milk"}',
        "list shows Milk",
        "click Save: no title",
        "400 Bad Request",
      ],
      [
        {
          line: 2,
          note: "`fetch` builds a request: method `POST`, path `/api/notes`, a `Content-Type: application/json` header.",
          vars: [
            ["method", "POST"],
            ["path", "/api/notes"],
          ],
        },
        {
          line: 3,
          note: "The note travels in the request's [[message-body|body]], as JSON text.",
          vars: [["body", '{"title":"Milk"}']],
        },
        {
          line: 5,
          note: "The server matches the method **and** the path to a route. `POST /api/notes` runs `createNote`; `GET /api/notes` would run something else.",
          vars: [["route", "POST /api/notes"]],
        },
        {
          line: 7,
          note: "The title is valid, so the note is saved and the database gives it id 8.",
          vars: [["new id", "8"]],
        },
        {
          line: 8,
          note: "The server answers `201 Created`, with the saved note as the body.",
          vars: [
            ["status", "201"],
            ["body", '{"id":8,"title":"Milk"}'],
          ],
        },
        {
          line: 10,
          note: "The app sees a 2xx status, reads the body and adds the note to the list.",
          vars: [["status", "201"]],
          output: "Milk appears in your notes",
        },
        {
          line: 12,
          note: "Same method, same path, but no title. The server refuses with `400`: the problem is in the request, so nothing is saved.",
          vars: [
            ["status", "400"],
            ["body", '{"error":"Title is required"}'],
          ],
          output: "first save: 201 · second save: 400",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "methods",
    "Methods: what you want to do",
    explain(
      "The [[method]] is the verb of the request. The path names *what*; the method says *what to do with it*. The same path can mean different things: `GET /api/notes` lists notes, `POST /api/notes` makes one. Most apps need only these five:",
    ),
    reference("The methods you'll use", [
      ["GET", "Read something. Never changes data.", "GET /api/notes"],
      ["POST", "Create something new.", "POST /api/notes"],
      ["PUT", "Replace something with a new version.", "PUT /api/notes/7"],
      ["PATCH", "Change part of something.", "PATCH /api/notes/7"],
      ["DELETE", "Remove something.", "DELETE /api/notes/7"],
    ]),
    quickCheck(
      "You click **Save** on a brand-new note. Which method does the app send?",
      ["GET", "POST", "DELETE"],
      1,
      "Creating something new is a [[post]]. [[get]] only reads.",
    ),
  ),

  part(
    "safe-and-repeatable",
    "Safe and repeatable methods",
    explain(
      "Methods also promise how they behave. GET is **safe**: it only reads, so browsers, search engines and caches send it freely. PUT and DELETE are [[idempotent]]: sending one twice ends the same as sending it once. POST is neither, so sending it twice makes two notes.",
    ),
    keyPoints(
      "GET is safe: it should never change anything.",
      "PUT and DELETE are repeatable: twice ends like once.",
      "POST isn't: a double-click can save two notes.",
      "That's why browsers warn before re-sending a form.",
    ),
    quickCheck(
      "A shaky connection makes the app send `DELETE /api/notes/7` twice. What happens?",
      [
        "Two notes are deleted",
        "Note 7 is deleted; the second request finds nothing to delete",
        "Note 7 comes back",
      ],
      1,
      "DELETE is [[idempotent]]: the end result is the same. The second request just gets a 404, because note 7 is already gone.",
    ),
  ),

  part(
    "status-codes",
    "How did it go? Status codes",
    explain(
      "Every response starts with a three-digit [[status-code]]. The first digit is the family: **2xx** it worked, **3xx** look somewhere else, **4xx** the request had a problem (the client's fault), **5xx** the server failed. Try the families, then keep the table for the codes you'll see most:",
    ),
    tryIt("status-codes"),
    reference("Status codes you'll meet", [
      ["200 OK", "It worked; here's the data.", "GET a list"],
      ["201 Created", "Something new was made.", "POST a note"],
      ["204 No Content", "It worked; nothing to send back.", "DELETE a note"],
      ["301 / 302", "It's moved; look at Location.", "http → https"],
      ["304 Not Modified", "Your cached copy is still good.", "reload a page"],
      ["400 Bad Request", "The request itself is wrong.", "missing title"],
      ["401 Unauthorized", "Who are you? Log in first.", "no login cookie"],
      ["403 Forbidden", "Logged in, but not allowed.", "someone else's"],
      ["404 Not Found", "Nothing at that path.", "GET /api/notes/99"],
      ["500 Server Error", "The server broke.", "a bug, a crash"],
      ["503 Unavailable", "Too busy or down for now.", "during a deploy"],
    ]),
  ),

  part(
    "see-it-yourself",
    "Read HTTP yourself",
    explain(
      "Open [[devtools|DevTools]] (F12, or Cmd+Option+I on a Mac) and choose **Network**. Reload, and every request the page makes appears: method, path, status, size and time. Click one to see its **Headers**, **Payload** (the request body) and **Response**. From a terminal, `curl -i` prints a response with its status line and headers:",
    ),
    code(
      "bash",
      "a request from the terminal",
      [
        "$ curl -i https://notes.app/api/notes",
        "HTTP/2 401",
        "content-type: application/json",
        "",
        '{"error":"Please log in"}',
        "",
        "$ curl -i -X POST https://notes.app/api/notes \\",
        '    -H "Content-Type: application/json" \\',
        '    -d \'{"title":"Milk"}\'',
      ],
      {
        1: "-i shows the status line and headers, not just the body",
        2: "no login cookie, so: who are you?",
        3: "HTTP/2 writes header names in lower case",
        7: "-X picks the method (GET if you leave it out)",
        8: "-H adds a header; -d sends a body",
      },
    ),
  ),

  part(
    "notes-app",
    "HTTP in the Notes App",
    explain(
      "The Notes App's whole API is four routes under one path. Each pairs a method with a path, and each answers with a status the app checks before reading the body. Every route needs you logged in, so without the login cookie they all answer `401`.",
    ),
    reference("The Notes App's API", [
      ["GET /api/notes", "Your notes, newest first.", "200 + list"],
      ["POST /api/notes", "Make a note.", "201, or 400 if invalid"],
      ["PUT /api/notes/:id", "Replace note :id.", "200, 400 or 404"],
      ["DELETE /api/notes/:id", "Remove note :id.", "204, or 404"],
    ]),
    inTheNotesApp(
      "`notes.js` pairs each method and path with a controller function, after checking you're logged in.",
      { fileId: "backend/src/routes/notes.js" },
    ),
    inTheNotesApp(
      "`request.js` sends every request, and turns any status that isn't 2xx into an error the screen can show.",
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Changing data with GET",
      language: "http",
      wrong: ["GET /api/notes/7/delete"],
      problem:
        "GET is meant to be safe. Browsers prefetch links and crawlers follow them, so a GET that deletes can delete things nobody asked to.",
      right: ["DELETE /api/notes/7"],
      why: "Use the method that says what you mean: reads with GET, changes with POST, PUT, PATCH or DELETE.",
    }),
    mistake({
      title: "Thinking fetch fails on a 404",
      wrong: [
        'const res = await fetch("/api/notes/99");',
        "const note = await res.json(); // { error: ... }",
      ],
      problem:
        "`fetch` only throws when the network fails. A 404 or 500 is still a response, so the code carries on with an error message as if it were a note.",
      right: [
        'const res = await fetch("/api/notes/99");',
        'if (!res.ok) throw new Error("Not found");',
      ],
      why: "`res.ok` is true only for a 2xx status. Check it before using the body.",
    }),
    mistake({
      title: "Sending JSON without saying so",
      language: "http",
      wrong: ["POST /api/notes", "", '{"title":"Milk"}'],
      problem:
        "With no `Content-Type` header, the server doesn't know the body is JSON, so it doesn't read it and answers 400: title is required.",
      right: [
        "POST /api/notes",
        "Content-Type: application/json",
        "",
        '{"title":"Milk"}',
      ],
      why: "A body needs a [[content-type]] header that says what format it is in.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read a request",
      task: "Read the request, then replace each `?` with its method, its path, and the format of its body (the `Content-Type`).",
      starter: [
        "<pre>PUT /api/notes/7 HTTP/1.1",
        "Host: notes.app",
        "Content-Type: application/json",
        "",
        '{"title":"Eggs"}</pre>',
        '<p>Method: <span id="method">?</span></p>',
        '<p>Path: <span id="path">?</span></p>',
        '<p>Body format: <span id="format">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The method",
          selector: "#method",
          text: "PUT",
        },
        {
          kind: "text",
          label: "The path",
          selector: "#path",
          text: "/api/notes/7",
        },
        {
          kind: "text",
          label: "The body's format",
          selector: "#format",
          text: "application/json",
        },
      ],
      hint: "The first line is method, path, version. The format is the value after `Content-Type:`.",
      solution: [
        "<pre>PUT /api/notes/7 HTTP/1.1",
        "Host: notes.app",
        "Content-Type: application/json",
        "",
        '{"title":"Eggs"}</pre>',
        '<p>Method: <span id="method">PUT</span></p>',
        '<p>Path: <span id="path">/api/notes/7</span></p>',
        '<p>Body format: <span id="format">application/json</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Choose the method",
      task: "Replace each `?` with the method the Notes App sends for that action: `GET`, `POST`, `PUT` or `DELETE`.",
      starter: [
        '<p>Load all your notes: <span id="load">?</span></p>',
        '<p>Save a brand-new note: <span id="create">?</span></p>',
        '<p>Change note 7\'s title: <span id="change">?</span></p>',
        '<p>Remove note 7: <span id="remove">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Loading reads",
          selector: "#load",
          text: "GET",
        },
        {
          kind: "text",
          label: "Saving a new note creates",
          selector: "#create",
          text: "POST",
        },
        {
          kind: "text",
          label: "Changing a note replaces it",
          selector: "#change",
          text: "PUT",
        },
        {
          kind: "text",
          label: "Removing deletes",
          selector: "#remove",
          text: "DELETE",
        },
      ],
      hint: "Read, create, replace, remove: one method each. The Notes App replaces a whole note when you edit it.",
      solution: [
        '<p>Load all your notes: <span id="load">GET</span></p>',
        '<p>Save a brand-new note: <span id="create">POST</span></p>',
        '<p>Change note 7\'s title: <span id="change">PUT</span></p>',
        '<p>Remove note 7: <span id="remove">DELETE</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Name the status",
      task: "Replace each `?` with the status code the Notes App's API answers with in that situation.",
      starter: [
        '<p>A new note was saved: <span id="saved">?</span></p>',
        '<p>You ask for note 99, which doesn\'t exist: <span id="missing">?</span></p>',
        '<p>You aren\'t logged in: <span id="login">?</span></p>',
        '<p>A bug crashes the server: <span id="crash">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Something was created",
          selector: "#saved",
          text: "201",
        },
        {
          kind: "text",
          label: "Nothing at that path",
          selector: "#missing",
          text: "404",
        },
        {
          kind: "text",
          label: "Not logged in",
          selector: "#login",
          text: "401",
        },
        {
          kind: "text",
          label: "The server failed",
          selector: "#crash",
          text: "500",
        },
      ],
      hint: "2xx worked, 4xx the request's problem, 5xx the server's. The status code table has the exact numbers.",
      solution: [
        '<p>A new note was saved: <span id="saved">201</span></p>',
        '<p>You ask for note 99, which doesn\'t exist: <span id="missing">404</span></p>',
        '<p>You aren\'t logged in: <span id="login">401</span></p>',
        '<p>A bug crashes the server: <span id="crash">500</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("HTTP cheat sheet", [
      ["request", "Method, path, headers, optional body.", "POST /api/notes"],
      ["response", "Status, headers, optional body.", "201 Created"],
      ["method", "The verb: GET, POST, PUT, PATCH, DELETE.", "GET reads"],
      ["path", "What on the server.", "/api/notes/7"],
      ["header", "Extra information, one per line.", "Content-Type: …"],
      ["body", "The data; after a blank line.", '{"title":"Milk"}'],
      ["2xx / 3xx", "It worked / look elsewhere.", "200, 201, 204, 301"],
      ["4xx / 5xx", "Request's problem / server's.", "400, 401, 404, 500"],
      ["idempotent", "Twice ends like once.", "PUT, DELETE"],
      ["see it", "DevTools → Network, or curl -i.", "curl -i notes.app"],
    ]),
    quickCheck(
      "A request comes back `400 Bad Request`. Where should you look first?",
      [
        "At the request you sent: its body or headers are wrong",
        "At the server's hardware",
        "At your internet connection",
      ],
      0,
      "4xx means the problem is in the request. If the network had failed there'd be no response at all; a server failure would be 5xx.",
    ),
  ),
);
