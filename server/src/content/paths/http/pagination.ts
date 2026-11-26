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

// Pagination: why lists come in pages, limit and offset, a page's response
// taken apart, cursors, the Link header, a client following next step by
// step, "Load more" in React, the Notes App, mistakes, practice and a recap.
export const paginationModule = moduleLesson(
  "pagination",
  "Pagination: a page at a time",
  45,
  [
    "Explain why long lists are sent a page at a time, and why the server caps the page size.",
    "Page with limit and offset, and say why items can shift between pages.",
    "Use cursor pagination and the Link header, and design a response with items and next.",
    "Write a client that follows next to the last page, and a “Load more” button in React.",
  ],

  part(
    "why",
    "Why not send everything?",
    explain(
      "`GET /api/notes` sends every note at once. Fine for 20 notes. With 20,000 the response is megabytes, the database works hard on every request and the screen only shows 20 anyway. [[pagination|Pagination]] sends a long list a page at a time: the client asks for one page, and the response says how to get the next.",
    ),
    analogy(
      "A search engine doesn't show you ten million results. It shows ten and a Next link, and you only ask for more if you want them.",
    ),
    keyPoints(
      "Smaller responses: faster to send, parse and show.",
      "Less work for the database on every request.",
      "The server caps the page size, whatever the client asks for.",
      "Each response says how to get the next page.",
    ),
  ),

  part(
    "limit-offset",
    "Limit and offset",
    explain(
      "The simplest way is [[offset-pagination|offset pagination]]: `?limit=20&offset=40` means skip 40, then return the next 20 (page 3). Read both from [[query-parameter|query parameters]], turn the text into numbers, and cap `limit`. A client asking for `limit=1000000` gets your maximum, not a million rows.",
    ),
    code(
      "js",
      "Reading limit and offset safely",
      [
        "const MAX = 50;",
        "",
        "function pageParams(query) {",
        "  const limit = Number(query.limit) || 20;",
        "  const offset = Number(query.offset) || 0;",
        "  return {",
        "    limit: Math.min(Math.max(limit, 1), MAX),",
        "    offset: Math.max(offset, 0),",
        "  };",
        "}",
      ],
      {
        4: "missing or not a number: 20",
        7: "at least 1, never more than 50",
        8: "no negative offsets",
      },
    ),
  ),

  part(
    "response",
    "What a page looks like",
    explain(
      "Send the page as an object, not a bare array, so there's room for what the client needs next: the `items`, a `next` URL (`null` on the last page) and, if it's cheap to count, a `total`. An object also lets you add fields later without breaking anyone.",
    ),
    anatomy(
      "One page of notes",
      [
        '{ "items": [ …20 notes… ],',
        '  "next": "/api/notes?limit=20&offset=40",',
        '  "total": 137 }',
      ],
      [
        ['"items"', "this page", "At most `limit` notes, in a fixed order."],
        [
          '"next"',
          "how to go on",
          "A ready-made URL for the next page. `null` means this is the last one.",
        ],
        [
          '"total"',
          "optional count",
          "Lets the screen say “137 notes”. Counting a big table is slow, so some APIs leave it out.",
        ],
      ],
    ),
    quickCheck(
      "A client asks for `?limit=500`. Your maximum is 50. What should the server do?",
      [
        "Send all 500 items",
        "Send 50 items and a next link for the rest",
        "Crash with 500 Internal Server Error",
      ],
      1,
      "Capping is the usual choice: the client gets a full page and follows `next` for more. (Some APIs answer 400 instead. Both protect the server.)",
    ),
  ),

  part(
    "cursor",
    "Cursors: “continue after this one”",
    explain(
      "Offsets count positions, and positions move. If a note is added while you read page 1, everything shifts down one, and page 2 starts with a note you've already seen. [[cursor-pagination|Cursor pagination]] says *where* to continue instead: “the 2 notes after note 8”. The cursor is opaque: clients send it back unchanged, without reading it.",
    ),
    code(
      "http",
      "Two pages with a cursor (real cursors are usually encoded)",
      [
        "GET /api/notes?limit=2",
        '{ "items": [{ "id": 9 }, { "id": 8 }],',
        '  "next": "/api/notes?limit=2&after=8" }',
        "",
        "GET /api/notes?limit=2&after=8",
        '{ "items": [{ "id": 7 }, { "id": 6 }],',
        '  "next": "/api/notes?limit=2&after=6" }',
      ],
      {
        3: "the cursor: the last note on this page",
        5: "a new note 10 doesn't move this page",
      },
    ),
    keyPoints(
      "Offset: simple, can jump to page 7, but shifts when items change.",
      "Cursor: stable and fast, but only next (or previous), no jumping.",
      "Sort by something unique, such as the date and then the id.",
      "Treat a cursor as opaque: pass it back exactly as you got it.",
    ),
  ),

  part(
    "link-header",
    "The Link header",
    explain(
      "Instead of a `next` field in the body, an API can send its links in a [[link-header|Link header]]. Each URL sits in angle brackets with a `rel` saying what it is: `next`, `prev`, `first` or `last`, separated by commas. GitHub's API pages this way. Either way, the client follows the URL it's given instead of building one.",
    ),
    anatomy(
      "A page whose links are in a header",
      [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json",
        'Link: </api/notes?after=6>; rel="next"',
      ],
      [
        ["Link:", "the header", "Links related to this response."],
        [
          "</api/notes?after=6>",
          "the URL",
          "Always in angle brackets. Often a full URL with the host.",
        ],
        [
          'rel="next"',
          "what it is",
          "next, prev, first or last. No next link: this is the last page.",
        ],
      ],
    ),
  ),

  part(
    "client-loop",
    "Following next, step by step",
    explain(
      "To get every item (for an export, say), ask for the first page, keep its items, then follow `next` until there isn't one. This `fetchAll` takes `fetchPage` as a parameter, so it works with any API, and with a fake one in tests. Step through it with three notes and pages of two.",
    ),
    trace(
      "Three notes, two pages",
      [
        "async function fetchAll(fetchPage) {",
        "  const all = [];",
        '  let url = "/api/notes?limit=2";',
        "  while (url) {",
        "    const page = await fetchPage(url);",
        "    all.push(...page.items);",
        "    url = page.next;",
        "  }",
        "  return all;",
        "}",
      ],
      [
        {
          line: 2,
          note: "An empty array collects the items from every page.",
          vars: [["all", "[]"]],
          stack: ["fetchAll"],
        },
        {
          line: 3,
          note: "The first URL is the only one the client builds itself.",
          vars: [
            ["all", "[]"],
            ["url", '"/api/notes?limit=2"'],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 5,
          note: "Page 1 arrives: two notes (n9 is note 9) and a `next` URL.",
          vars: [
            ["all", "[]"],
            ["url", '"/api/notes?limit=2"'],
            ["page", '{ items: [n9, n8], next: "…after=8" }'],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 6,
          note: "Its items are added to the collection.",
          vars: [
            ["all", "[n9, n8]"],
            ["url", '"/api/notes?limit=2"'],
            ["page", '{ items: [n9, n8], next: "…after=8" }'],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 7,
          note: "Follow the link the server gave: no URL building.",
          vars: [
            ["all", "[n9, n8]"],
            ["url", '"…after=8"'],
            ["page", '{ items: [n9, n8], next: "…after=8" }'],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 5,
          note: "`url` isn't empty, so the loop asks for page 2. It's the last: `next` is null.",
          vars: [
            ["all", "[n9, n8]"],
            ["url", '"…after=8"'],
            ["page", "{ items: [n7], next: null }"],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 6,
          note: "The last note joins the others.",
          vars: [
            ["all", "[n9, n8, n7]"],
            ["url", '"…after=8"'],
            ["page", "{ items: [n7], next: null }"],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 4,
          note: "`url` is now null, which is falsy, so the loop stops.",
          vars: [
            ["all", "[n9, n8, n7]"],
            ["url", "null"],
          ],
          stack: ["fetchAll"],
        },
        {
          line: 9,
          note: "All three notes, fetched in two requests.",
          vars: [
            ["all", "[n9, n8, n7]"],
            ["url", "null"],
          ],
          stack: ["fetchAll"],
          output: "[n9, n8, n7]",
        },
      ],
    ),
  ),

  part(
    "load-more",
    "“Load more” in React",
    explain(
      "On screen you rarely fetch every page up front. Keep the items and the `next` URL in state, show a “Load more” button while `next` isn't null, and append each new page. Infinite scroll is the same idea: an IntersectionObserver calls `loadMore` when the end of the list scrolls into view, instead of a button.",
    ),
    code(
      "jsx",
      "Pages appended to what's already shown",
      [
        'const FIRST = "/api/notes?limit=20";',
        "const [notes, setNotes] = useState([]);",
        "const [next, setNext] = useState(FIRST);",
        "",
        "async function loadMore() {",
        "  const page = await request(next);",
        "  setNotes((old) => [...old, ...page.items]);",
        "  setNext(page.next);",
        "}",
        "",
        "{next && (",
        "  <button onClick={loadMore}>",
        "    Load more",
        "  </button>",
        ")}",
      ],
      {
        7: "append: keep the pages already shown",
        8: "null after the last page",
        11: "no next, no button",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App: one big list",
    explain(
      "The Notes App doesn't paginate. `listNotes` runs one query for all of a user's notes, newest first, and `GET /api/notes` answers with a bare array. For a personal notes list that's fine. If it grew, the query would get a `LIMIT` and a cursor, the response would become `{ items, next }`, and `useNotes` would need a “Load more”.",
    ),
    inTheNotesApp(
      "`listNotes` sends every note in one array: no `LIMIT`, no `next`.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    code(
      "sql",
      "listNotes with a cursor (not in the app)",
      [
        "SELECT id, title, content, created_at",
        "  FROM notes",
        " WHERE user_id = $1",
        "   AND (created_at, id) < ($2, $3)",
        " ORDER BY created_at DESC, id DESC",
        " LIMIT $4",
      ],
      {
        4: "only notes older than the cursor's note",
        5: "the id breaks ties between equal dates",
        6: "the capped page size",
      },
    ),
    keyPoints(
      "The Notes App sends every note: fine for a small, personal list.",
      "Turning the array into `{ items, next }` would break old clients.",
      "So decide on a paged shape early, before others depend on it.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "No cap on the page size",
      wrong: ["const limit = Number(req.query.limit);"],
      problem:
        "`?limit=1000000` makes the server load and send every row. `?limit=abc` gives `NaN`.",
      right: [
        "const limit = Math.min(",
        "  Number(req.query.limit) || 20, 50);",
      ],
      why: "The server decides the largest page, whatever the client asks for.",
    }),
    mistake({
      title: "An order that isn't unique",
      language: "sql",
      wrong: ["ORDER BY created_at DESC", "LIMIT 20 OFFSET 20"],
      problem:
        "Notes saved at the same moment can come back in any order, so one can appear on two pages and another on none.",
      right: ["ORDER BY created_at DESC, id DESC", "LIMIT 20 OFFSET 20"],
      why: "Add a unique tie-breaker, such as the id, so every page is the same each time.",
    }),
    mistake({
      title: "Building the next URL yourself",
      wrong: ['url = "/api/notes?page=" + (page + 1);'],
      problem:
        "The loop doesn't know when to stop, and it breaks the day the API switches to cursors.",
      right: ["url = data.next; // null at the end"],
      why: "Follow the links the API gives you; their absence tells you you're done.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Cut out one page",
      task: "Write `paginate(items, { limit, offset })`. Return `{ items, next }`: up to `limit` items starting at `offset`, but never more than `MAX_LIMIT` (50). `next` is the offset of the following page, or `null` when there's nothing after this page.",
      starter: [
        "const MAX_LIMIT = 50;",
        "",
        "function paginate(items, { limit = 20, offset = 0 }) {",
        "",
        "}",
      ],
      tests: [
        [
          "paginate([1, 2, 3, 4, 5], { limit: 2, offset: 0 })",
          "{ items: [1, 2], next: 2 }",
        ],
        [
          "paginate([1, 2, 3, 4, 5], { limit: 2, offset: 4 })",
          "{ items: [5], next: null }",
        ],
        [
          "paginate([1, 2, 3, 4], { limit: 2, offset: 2 })",
          "{ items: [3, 4], next: null }",
        ],
        [
          "paginate(Array.from({ length: 80 }, (_, i) => i), { limit: 1000 }).items.length",
          "50",
        ],
      ],
      hint: "Work out `size` with `Math.min(limit, MAX_LIMIT)`, then `end = offset + size`. `items.slice(offset, end)` is the page; there's a next page only if `end < items.length`.",
      solution: [
        "const MAX_LIMIT = 50;",
        "",
        "function paginate(items, { limit = 20, offset = 0 }) {",
        "  const end = offset + Math.min(limit, MAX_LIMIT);",
        "  return {",
        "    items: items.slice(offset, end),",
        "    next: end < items.length ? end : null,",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Follow next to the end",
      task: "Write `async fetchAll(fetchPage, url)`. Call `await fetchPage(url)`, which resolves to `{ items, next }`, collect the items, and keep following `next` until it's `null`. Return every item in order.",
      starter: ["async function fetchAll(fetchPage, url) {", "", "}"],
      tests: [
        [
          'fetchAll(async (u) => ({ "/a": { items: [1, 2], next: "/b" }, "/b": { items: [3], next: null } })[u], "/a")',
          "[1, 2, 3]",
        ],
        ['fetchAll(async () => ({ items: [], next: null }), "/x")', "[]"],
        [
          'fetchAll(async (u) => ({ items: [u], next: u.length < 3 ? u + "x" : null }), "x")',
          '["x", "xx", "xxx"]',
        ],
      ],
      hint: "Start with `const all = []`. Loop `while (url)`: fetch the page, `all.push(...page.items)`, then `url = page.next`.",
      solution: [
        "async function fetchAll(fetchPage, url) {",
        "  const all = [];",
        "  while (url) {",
        "    const page = await fetchPage(url);",
        "    all.push(...page.items);",
        "    url = page.next;",
        "  }",
        "  return all;",
        "}",
      ],
    }),
    yourTurn({
      title: "Read a Link header",
      task: 'Write `parseLinks(header)`, which turns a Link header such as `</a?p=3>; rel="next", </a?p=1>; rel="prev"` into `{ next: "/a?p=3", prev: "/a?p=1" }`: each `rel` mapped to its URL. An empty header gives `{}`.',
      starter: ["function parseLinks(header) {", "  return {};", "}"],
      tests: [
        [
          'parseLinks(\'</a?p=3>; rel="next", </a?p=1>; rel="prev"\')',
          '{ next: "/a?p=3", prev: "/a?p=1" }',
        ],
        [
          "parseLinks('</notes?after=6>; rel=\"next\"')",
          '{ next: "/notes?after=6" }',
        ],
        ['parseLinks("")', "{}"],
      ],
      hint: 'Split on `","`. In each piece, the regular expression `/<([^>]*)>;\\s*rel="(\\w+)"/` captures the URL and the rel.',
      solution: [
        "function parseLinks(header) {",
        "  const links = {};",
        '  for (const piece of header.split(",")) {',
        '    const m = piece.match(/<([^>]*)>;\\s*rel="(\\w+)"/);',
        "    if (m) links[m[2]] = m[1];",
        "  }",
        "  return links;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Pagination cheat sheet", [
      [
        "Pagination",
        "Send a long list a page at a time.",
        "GET /api/notes?limit=20",
      ],
      [
        "limit",
        "The page size. The server always caps it.",
        "Math.min(limit, 50)",
      ],
      [
        "offset",
        "How many to skip. Can jump, but shifts when items change.",
        "?limit=20&offset=40",
      ],
      [
        "Cursor",
        "Continue after this item. Stable and fast; next only.",
        "?limit=20&after=8",
      ],
      [
        "Response",
        "An object: the items and how to go on.",
        '{ "items": […], "next": "…" }',
      ],
      ["next: null", "The last page: stop."],
      ["Link header", "The same links, in a header.", 'Link: <…>; rel="next"'],
      ["Client loop", "Follow next until it's null.", "while (url) { … }"],
      [
        "Load more",
        "Append the page; hide the button at the end.",
        "[...old, ...page.items]",
      ],
      ["Stable order", "Sort by something unique.", "ORDER BY created_at, id"],
    ]),
    quickCheck(
      "With offset pagination, a new note is added while someone reads page 1. What can happen when they open page 2?",
      [
        "Nothing: pages never change",
        "A note from page 1 shows up again at the top of page 2",
        "The request fails with 409 Conflict",
      ],
      1,
      "The new note pushes everything down one place, so the last note of page 1 is now first on page 2. A cursor (“after note 8”) doesn't have this problem.",
    ),
  ),
);
