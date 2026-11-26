import {
  anatomy,
  code,
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

// Headers: request and response headers, a header taken apart, Content-Type
// and Accept, Content-Length and Location, cookies as an API sees them,
// custom headers and case, headers in fetch (step by step), reading response
// headers, the Notes App, mistakes, practice and a recap.
export const headersModule = moduleLesson(
  "headers",
  "Headers: facts about the message",
  45,
  [
    "Tell request headers from response headers, and read any header line.",
    "Label a body with Content-Type and ask for a format with Accept.",
    "Explain what Content-Length, Location, Cookie and Set-Cookie are for.",
    "Set request headers and read response headers with fetch.",
    "Send Content-Type only when there is a body, as the Notes App does.",
  ],

  part(
    "two-sides",
    "Request headers and response headers",
    explain(
      "Every request and response carries [[http-headers|headers]]: `Name: value` lines between the first line and the body. They are facts about the message: what format the body is in, how long it is, who is asking, where to look next. Some only make sense in a request, some only in a response, and a few, like `Content-Type`, travel both ways.",
    ),
    code(
      "http",
      "Saving a note: the request, then the response",
      [
        "POST /api/notes HTTP/1.1",
        "Host: localhost:3000",
        "Content-Type: application/json",
        "Accept: application/json",
        "Cookie: token=eyJhbGci…",
        "Content-Length: 16",
        "",
        '{"title":"Milk"}',
        "",
        "HTTP/1.1 201 Created",
        "Content-Type: application/json",
        "Content-Length: 23",
        "",
        '{"id":7,"title":"Milk"}',
      ],
      {
        3: "the body below is JSON",
        4: "I'd like JSON back",
        5: "the login cookie, sent by the browser",
        8: "an empty line, then the body",
        11: "the server labels its body too",
      },
    ),
    keyPoints(
      "Headers sit between the first line and the body.",
      "Request headers describe the request and the client.",
      "Response headers describe the response and what to do next.",
      "An empty line ends the headers.",
    ),
  ),

  part(
    "anatomy",
    "One header, taken apart",
    explain(
      "A header is one line: a name, a colon, then the value. Many values have a main part plus extra parameters after a `;`. You'll meet this shape again and again: `Content-Type`, `Cache-Control` and `Set-Cookie` all use it.",
    ),
    anatomy(
      "A Content-Type header",
      ["Content-Type: application/json; charset=utf-8"],
      [
        [
          "Content-Type",
          "name",
          "Case doesn't matter: content-type is the same header.",
        ],
        [":", "colon", "Separates the name from the value."],
        [
          "application/json",
          "media type",
          "type/subtype: here, the body is JSON.",
        ],
        [
          "charset=utf-8",
          "parameter",
          "Extra detail after the semicolon: the text encoding.",
        ],
      ],
    ),
  ),

  part(
    "negotiation",
    "Content-Type and Accept",
    explain(
      "`Content-Type` labels the body that is actually in this message. `Accept` is a request header listing the formats the client can read. Together they are [[content-negotiation]]: the client asks, the server picks one and labels it. A server that can't send any of them may answer `406 Not Acceptable`; one that can't read the body you sent answers `415 Unsupported Media Type`.",
    ),
    code(
      "http",
      "Asking for JSON, getting JSON",
      [
        "GET /api/notes HTTP/1.1",
        "Accept: application/json",
        "",
        "HTTP/1.1 200 OK",
        "Content-Type: application/json",
      ],
      {
        2: "the client: JSON, please",
        5: "the server: here's JSON",
      },
    ),
    quickCheck(
      "You send `POST /api/notes` with a JSON body. Which header tells the server how to read that body?",
      ["Accept", "Content-Type", "Content-Length"],
      1,
      "Content-Type describes the body in this message. Accept is about the response you want back, and Content-Length only gives its size.",
    ),
  ),

  part(
    "length-location",
    "Content-Length and Location",
    explain(
      "`Content-Length` is the body's size in bytes, not characters: `é` is two bytes. fetch and the server work it out for you, so you rarely set it. The [[location-header|Location]] header holds a URL. On a `201 Created` it says where the new thing lives; on a 3xx redirect it says where to go instead.",
    ),
    code(
      "http",
      "A create that says where the note lives",
      [
        "HTTP/1.1 201 Created",
        "Location: /api/notes/7",
        "Content-Type: application/json",
        "",
        '{"id":7,"title":"Milk"}',
      ],
      { 2: "GET this URL to read note 7 again" },
    ),
    explain(
      "The Notes App doesn't send `Location`: its create answers `201` with the whole note in the body, id included, and the client builds `/api/notes/7` itself. That's common for JSON APIs. Adding `res.location(`/api/notes/${id}`)` would be a one-line change.",
    ),
  ),

  part(
    "cookies",
    "Cookies, as an API sees them",
    explain(
      "Cookies are just two headers. A response sets one with `Set-Cookie`; after that, the browser adds `Cookie` to every request it sends to that site. The API reads it to find out who's asking. The login details (what goes in the cookie, its safety options) come later, in authentication. Here it's enough to see the headers.",
    ),
    code(
      "http",
      "Logging in, then asking for notes",
      [
        "HTTP/1.1 200 OK",
        "Set-Cookie: token=eyJhbGci…; HttpOnly;",
        "  SameSite=Lax; Path=/",
        "",
        "GET /api/notes HTTP/1.1",
        "Cookie: token=eyJhbGci…",
      ],
      {
        2: "the login response stores a cookie",
        6: "every later request sends it back",
      },
    ),
    keyPoints(
      "Set-Cookie is a response header; Cookie is a request header.",
      "The browser stores and sends cookies, not your code.",
      "With fetch, credentials decides whether cookies go along.",
    ),
  ),

  part(
    "custom-and-case",
    "Custom headers, and case",
    explain(
      'You can invent headers. Old ones started with `X-`, like `X-Request-Id`, but that prefix is no longer required: `Request-Id` is fine. Header names ignore case: `Content-Type`, `content-type` and `CONTENT-TYPE` are the same header. HTTP/2 even sends them all in lower case, and Node gives them to you that way (`req.headers["content-type"]`).',
    ),
    reference("Headers you'll meet in APIs", [
      [
        "Content-Type",
        "Format of the body in this message.",
        "Content-Type: application/json",
      ],
      ["Accept", "Formats the client can read.", "Accept: application/json"],
      ["Content-Length", "Body size in bytes.", "Content-Length: 16"],
      ["Location", "Where a new item lives.", "Location: /api/notes/7"],
      ["Cookie", "Cookies the browser sends back.", "Cookie: token=…"],
      ["Set-Cookie", "Asks the browser to store a cookie.", "Set-Cookie: a=1"],
      [
        "X-Request-Id",
        "A made-up header, often for logs.",
        "X-Request-Id: 9f2c",
      ],
    ]),
  ),

  part(
    "fetch-headers",
    "Setting headers with fetch",
    explain(
      "fetch takes a `headers` option: a plain object, or a `Headers` object. Only add what the request needs. A GET has no body, so it needs no `Content-Type`. Step through a helper that adds it only when there is a body.",
    ),
    trace(
      "Headers for a GET and a POST",
      [
        'const JSON_TYPE = "application/json";',
        "function buildInit(method, body) {",
        "  const headers = { Accept: JSON_TYPE };",
        "  const init = { method, headers };",
        "  if (body !== undefined) {",
        '    headers["Content-Type"] = JSON_TYPE;',
        "    init.body = JSON.stringify(body);",
        "  }",
        "  return init;",
        "}",
        'const get = buildInit("GET");',
        'const note = { title: "Milk" };',
        'const post = buildInit("POST", note);',
      ],
      [
        {
          line: 11,
          note: "A GET, with no body passed in.",
          vars: [["JSON_TYPE", '"application/json"']],
        },
        {
          line: 3,
          note: "Every request may say what it accepts, so `Accept` is always there.",
          vars: [
            ["method", '"GET"'],
            ["body", "undefined"],
            ["headers", '{ Accept: "application/json" }'],
          ],
          stack: ["buildInit"],
        },
        {
          line: 5,
          note: "No body, so the `if` is skipped: no Content-Type, nothing to label.",
          vars: [
            ["method", '"GET"'],
            ["body", "undefined"],
            ["headers", '{ Accept: "application/json" }'],
            ["init", '{ method: "GET", headers }'],
          ],
          stack: ["buildInit"],
        },
        {
          line: 13,
          note: "Now a POST, with a note as the body.",
          vars: [
            ["get", '{ method: "GET", headers }'],
            ["note", '{ title: "Milk" }'],
          ],
        },
        {
          line: 6,
          note: "There is a body, so it gets a label: the server will know to read it as JSON.",
          vars: [
            ["method", '"POST"'],
            ["body", '{ title: "Milk" }'],
            ["headers", "{ Accept, Content-Type }"],
            ["init", '{ method: "POST", headers }'],
          ],
          stack: ["buildInit"],
        },
        {
          line: 7,
          note: "The body is turned into JSON text, the thing the label describes.",
          vars: [
            ["method", '"POST"'],
            ["body", '{ title: "Milk" }'],
            ["headers", "{ Accept, Content-Type }"],
            ["init.body", '\'{"title":"Milk"}\''],
          ],
          stack: ["buildInit"],
        },
      ],
    ),
  ),

  part(
    "reading",
    "Reading response headers",
    explain(
      "A response's headers are a `Headers` object, not a plain object. Read one with `response.headers.get(name)`: the name ignores case, and a missing header gives `null`. In the browser, a page calling another site's API only sees a few simple headers unless that server lists more for it to read: that's part of cross-origin rules, covered with security.",
    ),
    code(
      "js",
      "The Headers object",
      [
        'const res = await fetch("/api/notes");',
        'res.headers.get("content-type");',
        '// "application/json; charset=utf-8"',
        'res.headers.get("Location"); // null',
        "",
        "const h = new Headers();",
        'h.set("Accept", "application/json");',
        'h.has("accept"); // true',
        'await fetch("/api/notes", { headers: h });',
      ],
      {
        2: "any case works",
        4: "not sent: null, not undefined",
        8: "lookups ignore case here too",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App's headers",
    explain(
      '`request()` in the frontend sets `Content-Type: application/json` only when it has a body to send, and `credentials: "include"` so the login cookie goes along. On the server, `express.json()` reads a body only when its Content-Type says JSON. Anything else is left unread, so the controller sees no body at all.',
    ),
    code(
      "js",
      "From request.js",
      [
        "const response = await fetch(path, {",
        "  method,",
        '  credentials: "include",',
        "  headers: body",
        '    ? { "Content-Type": "application/json" }',
        "    : undefined,",
        "  body: body",
        "    ? JSON.stringify(body)",
        "    : undefined,",
        "});",
      ],
      {
        3: "send the login cookie",
        5: "only when there is a body",
      },
    ),
    inTheNotesApp(
      "`request()` adds `Content-Type` only when there is a body to send, and includes the cookie on every call.",
      { fileId: "frontend/src/services/request.js" },
    ),
    inTheNotesApp(
      "`express.json()` reads JSON bodies, and `cookieParser()` reads the `Cookie` header into `req.cookies`.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Sending JSON without saying so",
      wrong: [
        'fetch("/api/notes", {',
        '  method: "POST",',
        "  body: JSON.stringify(note),",
        "});",
      ],
      problem:
        "fetch labels a string body `text/plain`, so `express.json()` skips it and the server sees no title: 400.",
      right: [
        'fetch("/api/notes", {',
        '  method: "POST",',
        '  headers: { "Content-Type": "application/json" },',
        "  body: JSON.stringify(note),",
        "});",
      ],
      why: "The server reads a body by its label. JSON text needs the JSON label.",
    }),
    mistake({
      title: "Reading headers like an object",
      wrong: ['response.headers["content-type"]'],
      problem:
        "`headers` is a `Headers` object, not a plain one, so this is always `undefined`.",
      right: ['response.headers.get("content-type")'],
      why: "Use `get`, which also ignores case.",
    }),
    mistake({
      title: "Content-Type on a GET",
      wrong: [
        'fetch("/api/notes", {',
        '  headers: { "Content-Type": "application/json" },',
        "});",
      ],
      problem:
        "There's no body to describe. It's harmless here, but it can make browsers send an extra check before calling another site.",
      right: [
        'fetch("/api/notes", {',
        '  headers: { Accept: "application/json" },',
        "});",
      ],
      why: "Content-Type labels a body. To ask for a format, use Accept.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Headers for a request",
      task: 'Write `buildHeaders(body)`. It always returns `Accept: "application/json"`, and adds `"Content-Type": "application/json"` only when `body` isn\'t `undefined`.',
      starter: ["function buildHeaders(body) {", "", "}"],
      tests: [
        ["buildHeaders()", '({ Accept: "application/json" })'],
        [
          'buildHeaders({ title: "Milk" })',
          '({ Accept: "application/json", "Content-Type": "application/json" })',
        ],
        ['Object.keys(buildHeaders("")).length', "2"],
      ],
      hint: 'Start with `const headers = { Accept: "application/json" };`, then add the other one inside `if (body !== undefined)`.',
      solution: [
        "function buildHeaders(body) {",
        '  const headers = { Accept: "application/json" };',
        "  if (body !== undefined) {",
        '    headers["Content-Type"] = "application/json";',
        "  }",
        "  return headers;",
        "}",
      ],
    }),
    yourTurn({
      title: "Any case will do",
      task: "Headers arrive as a plain object whose names could be in any case. Write `getHeader(headers, name)` that finds the value whatever the case, or returns `null` when it isn't there.",
      starter: ["function getHeader(headers, name) {", "", "}"],
      tests: [
        [
          'getHeader({ "Content-Type": "text/html" }, "content-type")',
          '"text/html"',
        ],
        [
          'getHeader({ location: "/api/notes/7" }, "Location")',
          '"/api/notes/7"',
        ],
        ['getHeader({ Accept: "*/*" }, "Cookie")', "null"],
      ],
      hint: "Loop over `Object.entries(headers)` and compare `key.toLowerCase()` with `name.toLowerCase()`.",
      solution: [
        "function getHeader(headers, name) {",
        "  const wanted = name.toLowerCase();",
        "  for (const [key, value] of Object.entries(headers)) {",
        "    if (key.toLowerCase() === wanted) return value;",
        "  }",
        "  return null;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Headers cheat sheet", [
      [
        "Shape",
        "Name: value, case-insensitive name.",
        "Accept: application/json",
      ],
      [
        "Content-Type",
        "Labels the body. Only send it with one.",
        "Content-Type: application/json",
      ],
      ["Accept", "Formats you can read back.", "Accept: application/json"],
      ["406 / 415", "Can't send what you accept / can't read what you sent."],
      ["Location", "Where a created item lives.", "Location: /api/notes/7"],
      ["Set-Cookie / Cookie", "Server stores one; browser sends it back."],
      [
        "Set with fetch",
        "The headers option.",
        'fetch(url, { headers: { Accept: "…" } })',
      ],
      [
        "Read with fetch",
        "headers.get, null if missing.",
        'res.headers.get("location")',
      ],
    ]),
    quickCheck(
      "A POST sends `JSON.stringify(note)` with no headers. On the Notes App server, what does the controller see?",
      [
        "The note, as usual",
        "No body, so validation fails with 400",
        "A 415 from fetch before it's sent",
      ],
      1,
      "Without a JSON Content-Type, express.json() doesn't read the body, so there is no title and validateNote answers 400 Title is required.",
    ),
  ),
);
