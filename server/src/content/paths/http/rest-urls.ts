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

// REST URLs: resources as nouns, a URL taken apart, collections and items,
// ids in the path, nested resources, query parameters, URLSearchParams step
// by step, actions that don't fit, designing a URL table, the Notes App's
// routes, mistakes, practice and a recap.
export const restUrlsModule = moduleLesson(
  "rest-urls",
  "REST URLs: naming things",
  45,
  [
    "Name resources with plural nouns and let the method be the verb.",
    "Tell a collection URL from an item URL, and validate the id in the path.",
    "Use nested resources for ownership, and keep them one level deep.",
    "Filter, sort and search with query parameters built by URLSearchParams.",
    "Design the URL table for a small API, including actions that don't fit.",
  ],

  part(
    "nouns",
    "URLs are nouns, methods are verbs",
    explain(
      "A [[rest-endpoint|REST]] API names things, not actions. The URL says which thing (a resource): the notes, or note 42. The method says what to do with it. So there's no `/getNotes` or `/deleteNote`: the same URL does different jobs with different methods. Once you know the pattern, you can guess an API's URLs before reading its docs.",
    ),
    code(
      "http",
      "Verbs in the URL, then nouns",
      [
        "POST /api/getNotes",
        "POST /api/deleteNote?id=42",
        "",
        "GET    /api/notes",
        "DELETE /api/notes/42",
      ],
      {
        1: "a verb in the URL, and the wrong method",
        2: "the method can't tell anyone what happens",
        4: "read the collection",
        5: "remove one item",
      },
    ),
    keyPoints(
      "A URL names a resource: a noun.",
      "The method is the verb: GET, POST, PUT, PATCH, DELETE.",
      "One URL, many methods, many jobs.",
    ),
  ),

  part(
    "anatomy",
    "A URL, taken apart",
    explain(
      "Read an API URL from left to right: a prefix for the API, the collection, then (sometimes) one item's id, then (sometimes) a query string that narrows the answer.",
    ),
    anatomy(
      "A request for one note, and for a list",
      ["GET /api/notes/42", "GET /api/notes?sort=newest"],
      [
        ["/api", "prefix", "Keeps API URLs apart from the pages'."],
        ["notes", "collection", "A plural noun: all the notes."],
        ["42", "item id", "Which one: a path parameter."],
        ["notes", "collection again", "No id: the request is about the list."],
        [
          "?sort=newest",
          "query",
          "Narrows or orders the list; the resource stays the same.",
        ],
      ],
    ),
  ),

  part(
    "collections",
    "Collections and items",
    explain(
      "Every resource gets two URLs. The collection, `/api/notes`, is the list: GET reads it, POST adds to it. The item, `/api/notes/42`, is one thing: GET reads it, PUT or PATCH changes it, DELETE removes it. Use plural nouns for both, so the item URL reads as “notes, number 42”.",
    ),
    reference("One resource, two URLs", [
      ["GET /api/notes", "List the notes."],
      ["POST /api/notes", "Create a note; the body holds it."],
      ["GET /api/notes/42", "Read note 42."],
      ["PUT /api/notes/42", "Replace note 42 with the body."],
      ["PATCH /api/notes/42", "Change only the fields sent."],
      ["DELETE /api/notes/42", "Remove note 42."],
    ]),
    quickCheck(
      "Which URL creates a new note?",
      ["POST /api/notes", "POST /api/notes/new", "GET /api/createNote"],
      0,
      "You add to the collection, so POST to /api/notes. The server picks the new id and sends the note back.",
    ),
  ),

  part(
    "path-ids",
    "Ids in the path",
    explain(
      "The id is a [[path-parameter]]. The route is written once with a placeholder, `/api/notes/:id`, and the server reads the real value from each request. It always arrives as text, and anyone can type anything there: `/api/notes/abc` or `/api/notes/-1`. So check it before using it. In the Notes App, an id that can't be a note gets a 404, not a database error.",
    ),
    code(
      "js",
      "From notesController.js",
      [
        "function noteId(req) {",
        "  const id = Number(req.params.id);",
        "  return Number.isInteger(id) && id > 0",
        "    ? id",
        "    : null;",
        "}",
        "",
        "const id = noteId(req);",
        "if (!id) return res.status(404)",
        '  .json({ error: "Note not found" });',
      ],
      {
        2: '"42" becomes 42; "abc" becomes NaN',
        3: "a positive whole number, or nothing",
        9: "no such note can exist: 404",
      },
    ),
    inTheNotesApp(
      "`noteId()` turns `req.params.id` into a number and rejects anything that isn't a positive whole number.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "nested",
    "Nested resources, kept shallow",
    explain(
      "When one thing belongs to another, nest it: `/api/notes/42/comments` is the comments of note 42. That's a [[nested-resource]]. Use it for the collection, where you need the parent. Once a comment has its own id, give it a short URL, `/api/comments/7`, instead of `/api/notes/42/comments/7`. Deep chains are long to build and break when things move.",
    ),
    code(
      "http",
      "One level, not three",
      [
        "GET  /api/notes/42/comments",
        "POST /api/notes/42/comments",
        "DELETE /api/comments/7",
        "",
        "GET /api/users/3/notes/42/comments/7",
      ],
      {
        1: "comments on note 42",
        2: "add one to note 42",
        3: "one comment: its id is enough",
        5: "too deep: every level must be right",
      },
    ),
  ),

  part(
    "query",
    "Query parameters: filter, sort, search",
    explain(
      "A [[query-parameter]] narrows or orders a collection without naming a new resource: `/api/notes?search=milk&sort=newest` is still the notes, just fewer and in order. Use them for optional things; the path is for which resource. The Notes App has no query parameters yet: `GET /api/notes` always returns all your notes, newest first.",
    ),
    code(
      "http",
      "Same collection, different views",
      [
        "GET /api/notes?search=milk",
        "GET /api/notes?sort=oldest",
        "GET /api/notes?tag=shopping&sort=title",
      ],
      {
        1: "only notes that mention milk",
        2: "a different order",
        3: "pairs joined with &",
      },
    ),
  ),

  part(
    "search-params",
    "Building a query string safely",
    explain(
      "Some characters mean something in a URL: `&` splits pairs, `#` starts a fragment, `?` starts the query. Glue user text in by hand and `milk & tea` becomes two broken pairs. [[url-search-params|URLSearchParams]] encodes values for you, and reads them back decoded. Step through a round trip.",
    ),
    trace(
      "Encoding a search, and reading it back",
      [
        "const params = new URLSearchParams();",
        'params.set("search", "milk & tea");',
        'params.set("sort", "newest");',
        "const qs = params.toString();",
        "const url = `/api/notes?${qs}`;",
        'const back = new URL(url, "http://x");',
        'back.searchParams.get("search");',
      ],
      [
        {
          line: 1,
          note: "An empty set of name-value pairs.",
          vars: [["params", "URLSearchParams {}"]],
        },
        {
          line: 3,
          note: "Two pairs set. `set` replaces a value; `append` would add a second one with the same name.",
          vars: [["params", '{ search: "milk & tea", sort: "newest" }']],
        },
        {
          line: 4,
          note: "Encoded: spaces become `+` and `&` becomes `%26`, so it can't be mistaken for a separator.",
          vars: [
            ["params", '{ search: "milk & tea", sort: "newest" }'],
            ["qs", '"search=milk+%26+tea&sort=newest"'],
          ],
        },
        {
          line: 5,
          note: "Joined onto the collection's path.",
          vars: [
            ["params", '{ search: "milk & tea", sort: "newest" }'],
            ["qs", '"search=milk+%26+tea&sort=newest"'],
            ["url", '"/api/notes?search=milk+%26+tea&sort=newest"'],
          ],
        },
        {
          line: 7,
          note: "The server side (or any URL) reads it back decoded. `new URL` needs a base for a path, so any origin will do.",
          vars: [
            ["params", '{ search: "milk & tea", sort: "newest" }'],
            ["qs", '"search=milk+%26+tea&sort=newest"'],
            ["url", '"/api/notes?search=milk+%26+tea&sort=newest"'],
            ["back", 'URL { pathname: "/api/notes" }'],
          ],
          output: '"milk & tea"',
        },
      ],
    ),
  ),

  part(
    "actions",
    "Actions that don't fit",
    explain(
      'Some operations aren\'t a plain read or change: archiving, publishing, sending. First try to make it a field: archiving is `PATCH /api/notes/42` with `{ "archived": true }`. When an action really is a process, with side effects beyond one field, a sub-resource with POST is fine: `POST /api/notes/42/archive`. The Notes App has neither: notes have no archived field.',
    ),
    code(
      "http",
      "Two ways to archive note 42",
      [
        "PATCH /api/notes/42",
        "Content-Type: application/json",
        "",
        '{"archived":true}',
        "",
        "POST /api/notes/42/archive",
      ],
      {
        1: "first choice: it's just a field changing",
        6: "an action noun under the item, with POST",
      },
    ),
    quickCheck(
      "Notes can be pinned to the top. Which is the plainest REST design for pinning note 42?",
      [
        "GET /api/pinNote?id=42",
        'PATCH /api/notes/42 with {"pinned":true}',
        "POST /api/pin",
      ],
      1,
      "Pinned is just a field of the note, so change it with PATCH on the note's own URL. A GET must never change anything.",
    ),
  ),

  part(
    "url-table",
    "Designing a small API's URLs",
    explain(
      "Before writing code, write the table: every method and URL, and what each does. It shows gaps and inconsistencies early, and it's what the frontend needs to know. Here's a table for notes with comments, in the patterns from this module.",
    ),
    reference("Notes with comments: the URL table", [
      ["GET /api/notes", "List my notes; ?search= and ?sort= optional."],
      ["POST /api/notes", "Create a note: 201 and the note."],
      ["GET /api/notes/:id", "One note, or 404."],
      ["PATCH /api/notes/:id", "Change some fields of a note."],
      ["DELETE /api/notes/:id", "Remove a note: 204."],
      ["GET /api/notes/:id/comments", "The comments on one note."],
      ["POST /api/notes/:id/comments", "Add a comment to that note."],
      ["DELETE /api/comments/:id", "Remove one comment by its own id."],
    ]),
  ),

  part(
    "notes-app",
    "The Notes App's routes",
    explain(
      "The Notes App follows the pattern for notes: `GET` and `POST` on `/api/notes`, `PUT` and `DELETE` on `/api/notes/:id` (it has no `GET` for a single note, and updates with PUT, not PATCH). Login is different: `POST /api/auth/login`, `/register` and `/logout` are actions, a common exception for auth. `GET /api/auth/me` reads the current user, and `GET /api/health` says the server is up.",
    ),
    inTheNotesApp(
      "Four routes on one router: the collection (GET, POST) and the item `/:id` (PUT, DELETE).",
      { fileId: "backend/src/routes/notes.js" },
    ),
    inTheNotesApp(
      "The auth routes: register, login and logout are POSTs to action names; `/me` is a GET.",
      { fileId: "backend/src/routes/auth.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Gluing user text into the query",
      wrong: ["const url = `/api/notes?search=${text}`;"],
      problem:
        "With `milk & tea`, the server sees `search=milk ` and a stray ` tea` pair.",
      right: [
        "const qs = new URLSearchParams({",
        "  search: text,",
        "});",
        "const url = `/api/notes?${qs}`;",
      ],
      why: "URLSearchParams encodes `&`, spaces and the rest for you.",
    }),
    mistake({
      title: "Trusting the id in the path",
      wrong: ["const id = req.params.id;", "// used as a number straight away"],
      problem:
        'It\'s the text `"42"`, or `"abc"` from a curious visitor, which can crash a database query.',
      right: [
        "const id = Number(req.params.id);",
        "if (!Number.isInteger(id) || id < 1)",
        "  return res.status(404).end();",
      ],
      why: "Path parameters are text from the user. Convert and check them.",
    }),
    mistake({
      title: "Mixing singular and plural",
      language: "http",
      wrong: ["GET /api/notes", "GET /api/note/42"],
      problem:
        "Two names for one resource: people have to remember which is which.",
      right: ["GET /api/notes", "GET /api/notes/42"],
      why: "One plural noun for the collection and its items.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build a list URL",
      task: 'In real code, `URLSearchParams` does this for you. To see what it does, write `buildUrl(path, params)` by hand: encode each value with `encodeURIComponent`, join pairs with `&`, skip values that are `undefined` or `""`, and add no `?` when none are left.',
      starter: [
        "function buildUrl(path, params) {",
        "  const pairs = Object.entries(params)",
        '    .map(([k, v]) => k + "=" + v);',
        '  return path + "?" + pairs.join("&");',
        "}",
      ],
      tests: [
        [
          'buildUrl("/api/notes", { search: "milk & tea" })',
          '"/api/notes?search=milk%20%26%20tea"',
        ],
        ['buildUrl("/api/notes", {})', '"/api/notes"'],
        [
          'buildUrl("/api/notes", { search: "", sort: "newest" })',
          '"/api/notes?sort=newest"',
        ],
      ],
      hint: 'Filter `Object.entries(params)` to keep values that aren\'t `undefined` or `""`, then map each to `k + "=" + encodeURIComponent(v)`.',
      solution: [
        "function buildUrl(path, params) {",
        "  const pairs = Object.entries(params)",
        '    .filter(([, v]) => v !== undefined && v !== "")',
        '    .map(([k, v]) => k + "=" + encodeURIComponent(v));',
        "  if (pairs.length === 0) return path;",
        '  return path + "?" + pairs.join("&");',
        "}",
      ],
    }),
    yourTurn({
      title: "Match a route",
      task: "Write `matchRoute(pattern, path)`. Split both on `/`. Parts starting with `:` match anything and are collected by name; the rest must be equal. Return the params object, or `null` if it doesn't match.",
      starter: ["function matchRoute(pattern, path) {", "  return null;", "}"],
      tests: [
        ['matchRoute("/api/notes/:id", "/api/notes/42")', '({ id: "42" })'],
        ['matchRoute("/api/notes/:id", "/api/notes")', "null"],
        ['matchRoute("/api/notes/:id", "/api/users/42")', "null"],
        [
          'matchRoute("/api/notes/:noteId/comments/:id", "/api/notes/4/comments/9")',
          '({ noteId: "4", id: "9" })',
        ],
        ['matchRoute("/api/notes", "/api/notes")', "({})"],
      ],
      hint: "If the two arrays differ in length, return null. Then loop: `:name` parts go into params with `slice(1)` as the key; other parts must be equal.",
      solution: [
        "function matchRoute(pattern, path) {",
        '  const want = pattern.split("/");',
        '  const got = path.split("/");',
        "  if (want.length !== got.length) return null;",
        "  const params = {};",
        "  for (let i = 0; i < want.length; i++) {",
        '    if (want[i].startsWith(":")) {',
        "      params[want[i].slice(1)] = got[i];",
        "    } else if (want[i] !== got[i]) {",
        "      return null;",
        "    }",
        "  }",
        "  return params;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("REST URLs cheat sheet", [
      ["Collection", "Plural noun: list (GET), create (POST).", "/api/notes"],
      ["Item", "Collection plus id: GET, PUT, PATCH, DELETE.", "/api/notes/42"],
      ["Path parameter", "Which item; text, so check it.", "/api/notes/:id"],
      ["Nested", "Ownership, one level deep.", "/api/notes/42/comments"],
      [
        "Query parameter",
        "Filter, sort, search a collection.",
        "?search=milk&sort=newest",
      ],
      [
        "URLSearchParams",
        "Builds and encodes the query.",
        "new URLSearchParams({ q })",
      ],
      [
        "Actions",
        "A field with PATCH, or POST to a sub-resource.",
        "POST /api/notes/42/archive",
      ],
      [
        "Never",
        "Verbs in URLs, or a GET that changes things.",
        "/api/deleteNote?id=42",
      ],
    ]),
    quickCheck(
      "Where should a note's id go, and where should a search term go?",
      [
        "Both in the query string",
        "The id in the path, the search in the query string",
        "The id in the query string, the search in the path",
      ],
      1,
      "The path names which resource (note 42). The query narrows or orders a collection, so optional things like a search term go after the ?.",
    ),
  ),
);
