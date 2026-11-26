import {
  analogy,
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

// Versioning: clients you can't update, breaking and non-breaking changes,
// a strict reader breaking step by step, where the version goes, two
// versions side by side, deprecation headers taken apart, the Notes App,
// mistakes, practice and a recap.
export const versioningModule = moduleLesson(
  "versioning",
  "Versioning: change without breaking",
  45,
  [
    "Explain why an API must keep working for clients you can't update.",
    "Tell breaking changes from non-breaking ones, and prefer adding to changing.",
    "Write clients that are tolerant readers: they ignore fields they don't know.",
    "Compare versions in the path, a header or a date, and run two versions side by side.",
    "Deprecate an endpoint with Deprecation and Sunset headers, and give clients time to move.",
  ],

  part(
    "why",
    "APIs outlive their clients",
    explain(
      "Your React app and your API can ship together, so you can change both in one commit. Other clients can't keep up: a phone app installed last year and never updated, a partner's script, someone's spreadsheet. Rename `title` to `name` and they break, and you can't fix their code. [[api-versioning|Versioning]] and careful changes let an API grow without breaking anyone.",
    ),
    analogy(
      "Wall sockets don't change shape every year: plugs bought long ago still have to fit. New sockets add USB ports beside the old holes instead.",
    ),
    keyPoints(
      "A web page updates on reload; an installed app may never update.",
      "You can't change other people's code.",
      "So the shape of your responses is a promise.",
      "Most changes can keep the promise: you only add.",
    ),
  ),

  part(
    "breaking",
    "Breaking and non-breaking changes",
    explain(
      "A [[breaking-change|breaking change]] makes a client that worked yesterday fail today. Removing, renaming or retyping something breaks clients that use it. Adding usually doesn't: a new field, a new endpoint, a new optional parameter. Watch requests too: a new *required* field in a request body breaks every client that doesn't send it.",
    ),
    reference("Safe or breaking?", [
      [
        "Add a response field",
        "Safe: tolerant clients ignore it.",
        '"pinned": false',
      ],
      [
        "Add an endpoint",
        "Safe: nobody calls it yet.",
        "GET /api/notes/7/history",
      ],
      [
        "Add an optional parameter",
        "Safe: old requests don't send it.",
        "?sort=title",
      ],
      [
        "Rename a field",
        "Breaking: old clients read the old name.",
        "content → body",
      ],
      ["Remove a field or endpoint", "Breaking for anyone using it."],
      [
        "Change a type",
        "Breaking: code expecting one gets the other.",
        '"id": 7 → "id": "7"',
      ],
      ["Make a field required", "Breaking: old requests leave it out."],
      [
        "Change the response shape",
        "Breaking: an array becomes an object.",
        "[…] → { items: […] }",
      ],
    ]),
    quickCheck(
      "Which change is safe for clients you can't update?",
      [
        "Renaming `content` to `body`",
        "Adding a `pinned` field to every note in responses",
        "Making `content` required when creating a note",
      ],
      1,
      "Adding a response field breaks nobody, as long as clients ignore fields they don't know. Renaming breaks readers; a new required field breaks senders.",
    ),
  ),

  part(
    "tolerant",
    "Tolerant readers, step by step",
    explain(
      "Adding is only safe if clients are tolerant readers: they use the fields they need and ignore the rest. A client that insists on an exact set of fields turns every addition into a breaking change. Step through this strict reader: it accepts yesterday's note and rejects today's, which only gained a `pinned` field.",
    ),
    trace(
      "A strict reader meets a new field",
      [
        "function readNote(json) {",
        "  const keys = Object.keys(json).sort();",
        '  if (keys.join() !== "content,id,title") {',
        '    throw new Error("Unexpected note");',
        "  }",
        "  return json;",
        "}",
        'readNote({ id: 7, title: "Milk",',
        '  content: "" });',
        'readNote({ id: 7, title: "Milk",',
        '  content: "", pinned: false });',
      ],
      [
        {
          line: 8,
          note: "Yesterday's response: three fields.",
        },
        {
          line: 2,
          note: "The field names, sorted.",
          vars: [
            ["json", '{ id: 7, title: "Milk", content: "" }'],
            ["keys", '["content", "id", "title"]'],
          ],
          stack: ["readNote"],
        },
        {
          line: 6,
          note: "Exactly the expected names, so the note is accepted.",
          vars: [
            ["json", '{ id: 7, title: "Milk", content: "" }'],
            ["keys", '["content", "id", "title"]'],
          ],
          stack: ["readNote"],
        },
        {
          line: 10,
          note: "Today the server adds `pinned` to every note. Nothing was renamed or removed.",
        },
        {
          line: 2,
          note: "Now there are four names.",
          vars: [
            ["json", '{ id: 7, title: "Milk", content: "", pinned: false }'],
            ["keys", '["content", "id", "pinned", "title"]'],
          ],
          stack: ["readNote"],
        },
        {
          line: 4,
          note: "They don't match, so a harmless addition breaks this client. A tolerant reader would just read `id`, `title` and `content`.",
          vars: [
            ["json", '{ id: 7, title: "Milk", content: "", pinned: false }'],
            ["keys", '["content", "id", "pinned", "title"]'],
          ],
          stack: ["readNote"],
          output: "Error: Unexpected note",
        },
      ],
    ),
    code(
      "js",
      "A tolerant reader",
      [
        "function readNote(json) {",
        "  return {",
        "    id: json.id,",
        "    title: json.title,",
        '    content: json.content ?? "",',
        "  };",
        "}",
      ],
      {
        2: "takes what it needs, ignores the rest",
        5: "a sensible default if it's missing",
      },
    ),
  ),

  part(
    "where",
    "Where the version goes",
    explain(
      "When a breaking change can't be avoided, the client must say which version it wants. Put it in the path (`/api/v2/notes`): easy to see, try in a browser and route, and the most common choice. Or in a header, which keeps URLs clean but is easy to forget. Some big APIs use a date: each client is pinned to the API as it was on that day.",
    ),
    code(
      "http",
      "Three places for the version",
      [
        "GET /api/v2/notes",
        "",
        "GET /api/notes",
        "Api-Version: 2",
        "",
        "GET /api/notes",
        "Api-Version: 2026-11-01",
      ],
      {
        1: "in the path: the most common",
        4: "in a header (names vary by API)",
        7: "by date: the API as it was that day",
      },
    ),
    keyPoints(
      "Path: visible, simple to route and to test with curl.",
      "Header: clean URLs, but invisible in links and logs.",
      "Date: small, frequent changes, each client pinned to a day.",
      "Whichever you pick, use it the same way on every endpoint.",
    ),
  ),

  part(
    "side-by-side",
    "Two versions side by side",
    explain(
      "For a breaking change, keep v1 running and add v2 beside it. Usually both share the same code and database, and only the outside differs: v1 still answers with `content`, v2 with `body`. Old clients keep working while they move, and v1 is turned off only once nobody calls it.",
    ),
    code(
      "js",
      "One list of notes, two shapes",
      [
        "const toV1 = (note) => note;",
        "const toV2 = ({ content, ...rest }) =>",
        "  ({ ...rest, body: content });",
        "",
        "async function listV1(req, res) {",
        "  const notes = await findNotes(req.user);",
        "  res.json(notes.map(toV1));",
        "}",
        "async function listV2(req, res) {",
        "  const notes = await findNotes(req.user);",
        "  res.json(notes.map(toV2));",
        "}",
      ],
      {
        2: "v2 renames content to body",
        6: "the same data for both",
        11: "only the shape differs",
      },
    ),
  ),

  part(
    "deprecation",
    "Deprecating: telling clients",
    explain(
      "[[api-deprecation|Deprecation]] means “this still works, but it's going away, on this date”. Say it in the changelog and docs, email the people with keys, and say it in every response: a `Deprecation` header marks it, and `Sunset` gives the date it stops. Log who still calls it. After the sunset, some APIs answer `410 Gone`.",
    ),
    anatomy(
      "A response from a deprecated version",
      [
        "HTTP/1.1 200 OK",
        "Deprecation: @1793491200",
        "Sunset: Thu, 01 Jul 2027 00:00:00 GMT",
        'Link: </docs/v2>; rel="deprecation"',
      ],
      [
        ["200 OK", "still works", "Nothing breaks yet: the request succeeds."],
        [
          "Deprecation:",
          "it's deprecated",
          "Since when, as seconds since 1970 after an @ (here 1 November 2026).",
        ],
        ["Sunset:", "when it stops", "After this date it may stop working."],
        [
          'rel="deprecation"',
          "read more",
          "A link to the docs explaining what to move to.",
        ],
      ],
    ),
  ),

  part(
    "notes-app",
    "The Notes App: no version",
    explain(
      "The Notes App has no version: its routes are mounted at `/api/notes`, with no `v1`. That's a fair choice. Its only client is the React app in the same repository, deployed at the same time, so an API change and the matching `notesApi.js` change ship together. (A tab left open during a deploy still runs the old code until it reloads.)",
    ),
    inTheNotesApp(
      "`app.js` mounts the notes routes at `/api/notes`: no version in the path.",
      { fileId: "backend/src/app.js" },
    ),
    inTheNotesApp(
      "`notesApi.js` is the API's only client, and it ships with it.",
      { fileId: "frontend/src/services/notesApi.js" },
    ),
    keyPoints(
      "Breaking for it: renaming `content` or `created_at`.",
      "Breaking: `GET /api/notes` answering `{ items }` instead of an array.",
      "Breaking: replacing `{ error }` with another error shape.",
      "Not breaking: adding a `pinned` field to each note.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A new version for every change",
      wrong: ["// added pinned, so: v2", 'app.use("/api/v2/notes", notesV2);'],
      problem:
        "Each version is more code to run, test and document, and adding a field broke nobody.",
      right: [
        "// v1 notes now include pinned",
        "res.json({ ...note, pinned });",
      ],
      why: "Add to the version you have. Save new versions for breaking changes.",
    }),
    mistake({
      title: "Removing without warning",
      language: "http",
      wrong: ["GET /api/v1/notes", "← 404 Not Found"],
      problem:
        "Clients that worked yesterday fail today, with no time to move and no idea why.",
      right: [
        "GET /api/v1/notes",
        "← 200 OK",
        "  Deprecation: @1793491200",
        "  Sunset: Thu, 01 Jul 2027 00:00:00 GMT",
      ],
      why: "Announce it, mark the responses, watch the traffic, then remove it after the date.",
    }),
    mistake({
      title: "A client that rejects new fields",
      wrong: [
        "if (Object.keys(json).length !== 3) {",
        '  throw new Error("Bad note");',
        "}",
      ],
      problem: "The API adds a harmless field and this client stops working.",
      right: ["const { id, title, content } = json;"],
      why: "Read the fields you need and ignore the rest.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Breaking or not?",
      task: 'Write `isBreaking(change)`. `change.kind` is `"add-field"`, `"add-endpoint"`, `"remove-field"`, `"rename-field"` or `"change-type"`. Adding is safe, except a field added to the request (`where: "request"`) with `required: true`. Everything else is breaking.',
      starter: ["function isBreaking(change) {", "  return false;", "}"],
      tests: [
        ['isBreaking({ kind: "add-field", where: "response" })', "false"],
        ['isBreaking({ kind: "rename-field", where: "response" })', "true"],
        [
          'isBreaking({ kind: "add-field", where: "request", required: true })',
          "true",
        ],
        [
          'isBreaking({ kind: "add-field", where: "request", required: false })',
          "false",
        ],
        ['isBreaking({ kind: "add-endpoint" })', "false"],
        ['isBreaking({ kind: "change-type", where: "response" })', "true"],
      ],
      hint: 'Handle `"add-endpoint"` and `"add-field"` first; return `true` for everything else.',
      solution: [
        "function isBreaking(change) {",
        '  if (change.kind === "add-endpoint") return false;',
        '  if (change.kind === "add-field") {',
        '    return change.where === "request" && change.required === true;',
        "  }",
        "  return true;",
        "}",
      ],
    }),
    yourTurn({
      title: "Route by version",
      task: 'Write `routeVersion(path, handlers)`. For `/api/v1/notes/7`, call `handlers.v1("/notes/7")` and return its result. If the path has no version, or there\'s no handler for that version, return `{ status: 404 }`.',
      starter: [
        "function routeVersion(path, handlers) {",
        "  return handlers.v1(path);",
        "}",
      ],
      tests: [
        [
          'routeVersion("/api/v1/notes/7", { v1: (r) => "one " + r })',
          '"one /notes/7"',
        ],
        [
          'routeVersion("/api/v2/notes", { v1: () => 1, v2: (r) => "two " + r })',
          '"two /notes"',
        ],
        ['routeVersion("/api/v3/notes", { v1: (r) => r })', "{ status: 404 }"],
        ['routeVersion("/api/notes", { v1: (r) => r })', "{ status: 404 }"],
      ],
      hint: "The regular expression `/^\\/api\\/(v\\d+)(\\/.*)$/` captures the version and the rest of the path. No match, or no `handlers[version]`: 404.",
      solution: [
        "function routeVersion(path, handlers) {",
        "  const match = path.match(/^\\/api\\/(v\\d+)(\\/.*)$/);",
        "  const handler = match && handlers[match[1]];",
        "  if (!handler) return { status: 404 };",
        "  return handler(match[2]);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Versioning cheat sheet", [
      [
        "Breaking change",
        "A working client fails after it.",
        "rename, remove, retype",
      ],
      ["Additive change", "Add fields and endpoints: safe.", '"pinned": false'],
      [
        "Tolerant reader",
        "Use what you need, ignore the rest.",
        "const { id, title } = json;",
      ],
      ["Path version", "The most common place.", "/api/v2/notes"],
      ["Header version", "Clean URLs; easy to forget.", "Api-Version: 2"],
      [
        "Date version",
        "The API as it was that day.",
        "Api-Version: 2026-11-01",
      ],
      ["Side by side", "v1 and v2 share code; only the shape differs."],
      ["Deprecation", "Still works, going away.", "Deprecation: @1793491200"],
      ["Sunset", "The date it stops.", "Sunset: Thu, 01 Jul 2027 …"],
      ["Tell clients", "Docs, changelog, email, headers, then logs."],
    ]),
    quickCheck(
      "A partner's app reads `GET /api/v1/notes`. You want to rename `content` to `body`. What's the gentlest way?",
      [
        "Rename it in v1 and email them afterwards",
        "Send `body` beside `content`, deprecate `content`, and drop it in v2 or after a Sunset date",
        "Never rename anything, ever",
      ],
      1,
      "Adding `body` breaks nobody. Clients move to it while `content` still works, and the old name only goes once they've had time and the logs show nobody uses it.",
    ),
  ),
);
