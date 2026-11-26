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

// JSON bodies: why JSON, a round trip step by step, what doesn't survive,
// dates, the Content-Type label, invalid JSON, empty bodies, designing body
// shapes, the Notes App, mistakes, practice and a recap.
export const jsonBodiesModule = moduleLesson(
  "json-bodies",
  "JSON bodies: sending and reading data",
  45,
  [
    "Send a JSON body with JSON.stringify and read one with response.json().",
    "Name the values that don't survive JSON, and send dates as ISO strings.",
    "Explain what the server sees when Content-Type is missing or the JSON is invalid.",
    "Handle a response with no body, such as 204 No Content.",
    "Design consistent body shapes for a small API.",
  ],

  part(
    "why-json",
    "JSON as the body format",
    explain(
      "A body is just text (or bytes). Both sides must agree how to read it, and for most APIs the answer is JSON: it's plain text, every language can read and write it, and it maps neatly onto objects, arrays, strings, numbers, booleans and `null`. Turning your objects into that text and back is called [[serialization]].",
    ),
    keyPoints(
      "A body is text; JSON is the usual format for APIs.",
      "JSON has objects, arrays, strings, numbers, booleans and null.",
      "Serializing turns a value into text; parsing turns it back.",
    ),
    anatomy(
      "A JSON body, ready for fetch",
      [
        "const init = {",
        '  headers: { "Content-Type": JSON_TYPE },',
        '  body: JSON.stringify({ title: "Milk" }),',
        "};",
      ],
      [
        [
          "Content-Type",
          "the label",
          "Tells the server to parse the body as JSON.",
        ],
        ["JSON_TYPE", "the format", 'Here, the string "application/json".'],
        ["JSON.stringify", "serialize", "Turns the value into JSON text."],
        ['{ title: "Milk" }', "the value", "An ordinary object in memory."],
      ],
    ),
  ),

  part(
    "round-trip",
    "A round trip, step by step",
    explain(
      "`JSON.stringify` turns a value into JSON text for the request body. On the other side, `JSON.parse` (or `response.json()`, which reads the body and parses it) turns the text back into a value. Step through a note going there and back, and watch what changes on the way.",
    ),
    trace(
      "A note, there and back",
      [
        "const note = {",
        '  title: "Milk",',
        '  due: new Date("2026-03-01"),',
        "  draft: undefined,",
        "};",
        "const text = JSON.stringify(note);",
        "const back = JSON.parse(text);",
        "back.due.getTime();",
      ],
      [
        {
          line: 1,
          note: "A note in memory: a string, a real `Date`, and a field set to `undefined`.",
          vars: [["note", '{ title: "Milk", due: Date, draft: undefined }']],
        },
        {
          line: 6,
          note: "Serialized. The date became a string, and `draft` is simply gone: JSON has no `undefined`.",
          vars: [
            ["note", '{ title: "Milk", due: Date, draft: undefined }'],
            ["text", '\'{"title":"Milk","due":"2026-03-01T00:00:00.000Z"}\''],
          ],
        },
        {
          line: 7,
          note: "Parsed back into an object. It looks right, but `due` is now a plain string.",
          vars: [
            ["note", '{ title: "Milk", due: Date, draft: undefined }'],
            ["text", '\'{"title":"Milk","due":"2026-…"}\''],
            ["back", '{ title: "Milk", due: "2026-03-01T00:00:00.000Z" }'],
          ],
        },
        {
          line: 8,
          note: "A string has no `getTime`, so this throws. Dates must be turned back into `Date` yourself.",
          vars: [
            ["note", '{ title: "Milk", due: Date, draft: undefined }'],
            ["text", '\'{"title":"Milk","due":"2026-…"}\''],
            ["back", '{ title: "Milk", due: "2026-03-01T00:00:00.000Z" }'],
          ],
          output: "TypeError: back.due.getTime is not a function",
        },
      ],
    ),
  ),

  part(
    "lost",
    "What doesn't survive",
    explain(
      "JSON only knows six kinds of value. Anything else is changed, dropped or refused when you stringify it, and nothing warns you. Check what you send: a `Map` arrives as `{}`, so the server gets an empty object and you'll wonder where your data went.",
    ),
    code(
      "js",
      "Stringify, and what comes out",
      [
        "JSON.stringify({",
        "  when: new Date(0), // ISO string",
        "  gone: undefined, // field dropped",
        "  run() {}, // function dropped",
        "  tags: new Map([[1, 2]]), // {}",
        "  ids: new Set([1, 2]), // {}",
        "  bad: NaN, // null",
        "});",
        "JSON.stringify({ n: 10n });",
        "// TypeError: can't serialize BigInt",
      ],
      {
        2: '"1970-01-01T00:00:00.000Z"',
        5: "convert first: Object.fromEntries(map)",
        6: "convert first: [...set]",
        9: "a BigInt throws: send it as a string",
      },
    ),
    quickCheck(
      'You send `{ title: "Milk", content: undefined }`. What does the server receive?',
      [
        '{"title":"Milk","content":null}',
        '{"title":"Milk"}',
        '{"title":"Milk","content":"undefined"}',
      ],
      1,
      "JSON has no undefined, so stringify leaves the field out. Send null if the server must see that it's empty.",
    ),
  ),

  part(
    "dates",
    "Dates as ISO strings",
    explain(
      'JSON has no date type, so APIs send dates as ISO 8601 strings like `"2026-03-01T09:30:00.000Z"`. They sort correctly as text, include the time zone (the `Z` means UTC), and `new Date(text)` reads them back. `JSON.stringify` already writes a `Date` this way. On the way in, turn the fields you know are dates back into `Date` objects.',
    ),
    code(
      "js",
      "Turning dates back into Dates",
      [
        'const res = await fetch("/api/notes");',
        "const notes = await res.json();",
        "const withDates = notes.map((n) => ({",
        "  ...n,",
        "  created_at: new Date(n.created_at),",
        "}));",
      ],
      {
        2: "created_at is a string here",
        5: "now a real Date you can format",
      },
    ),
  ),

  part(
    "label",
    "The body needs its label",
    explain(
      "The server only parses a body when `Content-Type` says it's JSON (that's the previous module). fetch labels a string body `text/plain`, so if you forget the header, the server's JSON reader skips the body. In the Notes App the controller then sees no body at all, finds no title, and answers `400 Title is required`, even though your JSON was perfect.",
    ),
    keyPoints(
      "JSON.stringify for the body, Content-Type for the label.",
      "No label: the JSON is never read.",
      "The error looks like a validation error, not a header one.",
    ),
  ),

  part(
    "invalid",
    "Invalid JSON",
    explain(
      "If the label says JSON but the text isn't valid JSON (a trailing comma, single quotes, a missing brace), the server can't parse it. That's the client's fault, so the answer is a `400 Bad Request`. In the Notes App, `express.json()` passes the parse error on, and the error handler in `app.js` turns it into a short message.",
    ),
    code(
      "http",
      "A trailing comma, and the answer",
      [
        "POST /api/notes HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{"title":"Milk",}',
        "",
        "HTTP/1.1 400 Bad Request",
        "Content-Type: application/json",
        "",
        '{"error":"Invalid JSON"}',
      ],
      {
        4: "JSON allows no trailing comma",
        9: "from the error handler in app.js",
      },
    ),
    inTheNotesApp(
      'The last middleware turns a JSON parse error (status 400) into `{ error: "Invalid JSON" }`, and anything else into a 500.',
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "empty",
    "Responses with no body",
    explain(
      "Not every response has a body. A successful `DELETE` often answers `204 No Content`, and calling `response.json()` on an empty body throws, because empty text isn't valid JSON. Check the status first. An error page from a proxy may not be JSON either, so be ready for `json()` to fail there too.",
    ),
    code(
      "js",
      "From request.js",
      [
        "// 204 No Content: nothing to read.",
        "if (response.status === 204) return null;",
        "",
        "const data = await response",
        "  .json()",
        "  .catch(() => null);",
      ],
      {
        2: "check before reading the body",
        6: "a body that isn't JSON becomes null",
      },
    ),
  ),

  part(
    "shapes",
    "Designing body shapes",
    explain(
      "A body's shape is part of your API, so make it predictable. Use the same field names everywhere (pick `camelCase` or `snake_case` and stick to it), give every item its `id`, send dates as ISO strings, and use one shape for every error. Lists can be a bare array or wrapped in an object: wrapping leaves room to add things like the total or the next page later.",
    ),
    code(
      "json",
      "A wrapped list, and an error",
      [
        "{",
        '  "notes": [',
        "    {",
        '      "id": 7,',
        '      "title": "Milk",',
        '      "createdAt": "2026-03-01T09:30:00Z"',
        "    }",
        "  ],",
        '  "total": 1',
        "}",
        "",
        '{ "error": "Note not found" }',
      ],
      {
        2: "the list, under a name",
        4: "every item has its id",
        9: "room for more next to the list",
        12: "one error shape, always",
      },
    ),
    quickCheck(
      'Why might an API return `{ "notes": [...] }` instead of a bare array?',
      [
        "JSON can't have an array at the top",
        "It leaves room to add fields like a total or next page later",
        "Arrays are slower to parse",
      ],
      1,
      "A bare array is valid JSON, but you can't add anything beside it without breaking clients. An object can grow new fields.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's bodies",
    explain(
      'The Notes App sends `{ title, content }` to create or update a note, and answers with the saved note: `id`, `title`, `content`, `created_at` and `updated_at`, dates as ISO strings. Its field names are `snake_case`, straight from the database columns. The list is a bare array, not wrapped. Every error is `{ "error": "…" }`, which `request()` turns into a thrown `Error`.',
    ),
    inTheNotesApp(
      "Each controller answers with `res.json(...)`: the note, the bare list of notes, or `{ error }` with a 4xx status.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    inTheNotesApp(
      "`request()` stringifies the body, returns null for a 204, and reads the error message from `data.error`.",
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Sending the object itself",
      wrong: [
        'fetch("/api/notes", {',
        '  method: "POST",',
        "  headers,",
        "  body: note,",
        "});",
      ],
      problem:
        'fetch turns the object into the text `"[object Object]"`, which isn\'t JSON: 400 Invalid JSON.',
      right: [
        'fetch("/api/notes", {',
        '  method: "POST",',
        "  headers,",
        "  body: JSON.stringify(note),",
        "});",
      ],
      why: "A body must be text (or bytes). Serialize it yourself.",
    }),
    mistake({
      title: "Reading a 204 as JSON",
      wrong: [
        'const res = await fetch("/api/notes/7",',
        '  { method: "DELETE" });',
        "const data = await res.json();",
      ],
      problem:
        "There's no body, so `json()` throws `Unexpected end of JSON input`, though the delete worked.",
      right: [
        'const res = await fetch("/api/notes/7",',
        '  { method: "DELETE" });',
        "if (res.status === 204) return null;",
        "const data = await res.json();",
      ],
      why: "Check for an empty response before reading the body.",
    }),
    mistake({
      title: "Forgetting `await` on json()",
      wrong: ["const notes = res.json();", "notes.length; // undefined"],
      problem:
        "`json()` returns a promise, because reading the body takes time.",
      right: ["const notes = await res.json();", "notes.length; // 3"],
      why: "Await it to get the parsed value.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Parse safely",
      task: 'Write `parseJson(text)`. Return `{ ok: true, value }` with the parsed value, or `{ ok: false, error: "Invalid JSON" }` when `JSON.parse` throws.',
      starter: [
        "function parseJson(text) {",
        "  return JSON.parse(text);",
        "}",
      ],
      tests: [
        [
          'parseJson(\'{"title":"Milk"}\')',
          '({ ok: true, value: { title: "Milk" } })',
        ],
        [
          'parseJson(\'{"title":"Milk",}\')',
          '({ ok: false, error: "Invalid JSON" })',
        ],
        ['parseJson("")', '({ ok: false, error: "Invalid JSON" })'],
      ],
      hint: "Put `JSON.parse` inside `try`, and return the error object from `catch`.",
      solution: [
        "function parseJson(text) {",
        "  try {",
        "    return { ok: true, value: JSON.parse(text) };",
        "  } catch {",
        '    return { ok: false, error: "Invalid JSON" };',
        "  }",
        "}",
      ],
    }),
    yourTurn({
      title: "Ready to send",
      task: "Write `toBody(note)`. Return a new object with only `title`, `content` and `due`, where `due` is an ISO string (use `toISOString()`), or `null` when the note has no `due`.",
      starter: ["function toBody(note) {", "  return note;", "}"],
      tests: [
        [
          'toBody({ id: 7, title: "Milk", content: "", due: new Date("2026-03-01T00:00:00Z") })',
          '({ title: "Milk", content: "", due: "2026-03-01T00:00:00.000Z" })',
        ],
        [
          'toBody({ id: 8, title: "Eggs", content: "Six" })',
          '({ title: "Eggs", content: "Six", due: null })',
        ],
      ],
      hint: "`due: note.due ? note.due.toISOString() : null`",
      solution: [
        "function toBody(note) {",
        "  return {",
        "    title: note.title,",
        "    content: note.content,",
        "    due: note.due ? note.due.toISOString() : null,",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "No body, no problem",
      task: "`readBody(response)` gets a fetch-like response. Return `null` when the status is 204, and otherwise the result of `response.json()`. Don't call `json()` on a 204: it throws.",
      starter: [
        "async function readBody(response) {",
        "  return response.json();",
        "}",
      ],
      tests: [
        [
          "readBody({ status: 200, json: async () => ({ id: 7 }) })",
          "({ id: 7 })",
        ],
        [
          'readBody({ status: 204, json: async () => { throw new Error("empty"); } })',
          "null",
        ],
      ],
      hint: "Start with `if (response.status === 204) return null;`",
      solution: [
        "async function readBody(response) {",
        "  if (response.status === 204) return null;",
        "  return response.json();",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("JSON bodies cheat sheet", [
      ["Send", "Stringify, and label it.", "body: JSON.stringify(note)"],
      [
        "Label",
        "Without it, the server won't parse.",
        "Content-Type: application/json",
      ],
      [
        "Read",
        "Parse the response body; await it.",
        "const data = await res.json();",
      ],
      [
        "Dates",
        "ISO strings; new Date() to revive.",
        '"2026-03-01T09:30:00.000Z"',
      ],
      ["Lost on the way", "undefined, functions; Map and Set become {}."],
      ["BigInt", "Throws: send it as a string.", "String(10n)"],
      [
        "Invalid JSON",
        "400; the Notes App says Invalid JSON.",
        '{"error":"Invalid JSON"}',
      ],
      ["No body", "Check for 204 before json().", "if (res.status === 204)"],
      ["Shapes", "Same names, ids, one error shape.", '{ "error": "…" }'],
    ]),
    quickCheck(
      "A DELETE succeeds with `204 No Content`, and your code calls `await response.json()`. What happens?",
      [
        "It returns null",
        "It returns an empty object",
        "It throws, because empty text isn't valid JSON",
      ],
      2,
      "json() parses the body as JSON, and an empty body isn't JSON, so it rejects. Check for 204 first, as request.js does.",
    ),
  ),
);
