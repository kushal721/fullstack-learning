import {
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

// Caching API responses: why and when, Cache-Control for data, asking
// "has it changed?", a 304 step by step, Vary and private data, two tabs
// editing one note, If-Match on an update, caching in React, the Notes App,
// mistakes, practice and a recap.
export const cachingApisModule = moduleLesson(
  "caching-apis",
  "Caching API responses",
  50,
  [
    "Choose Cache-Control for API data: private, no-store, no-cache or max-age.",
    "Save downloads with ETag, If-None-Match and 304 Not Modified.",
    "Keep one user's data out of shared caches with private and Vary.",
    "Stop two edits overwriting each other with If-Match and 412.",
    "Keep data fresh in React: refetch after a change, show stale data while revalidating.",
  ],

  part(
    "why",
    "Caching data, not just files",
    explain(
      "How the Web Works showed [[cache-control]] and [[etag|ETags]] for files. API responses can be cached too, but data changes more often than a logo, and much of it belongs to one person. So the question for every endpoint is: who may keep a copy, for how long, and how do they check it's still right?",
    ),
    keyPoints(
      "Public, slow-changing data: cache it for a while, even on a CDN.",
      "One user's data: only their browser may keep it, if anyone.",
      "Data that changes often: keep it, but check before using it.",
    ),
  ),

  part(
    "directives",
    "Cache-Control for API data",
    explain(
      "Pick the directives per endpoint. Mind the names: `no-cache` does *not* mean “don't cache”. It means “you may keep it, but revalidate with the server before every use”. `no-store` is the one that means never keep a copy.",
    ),
    reference("Cache-Control for APIs", [
      [
        "no-store",
        "Never keep a copy anywhere.",
        "GET /api/account (bank details)",
      ],
      [
        "private",
        "Only the user's browser may keep it, not CDNs or proxies.",
        "private, no-cache",
      ],
      ["no-cache", "Keep it, but ask before each use.", "GET /api/notes"],
      [
        "max-age=60",
        "Fresh for 60 seconds, used without asking.",
        "a public list of topics",
      ],
      [
        "public",
        "Shared caches like CDNs may keep it too.",
        "public, max-age=300",
      ],
      [
        "s-maxage=600",
        "A different max-age for shared caches only.",
        "CDN: 10 min, browser: 1",
      ],
    ]),
    quickCheck(
      "`GET /api/notes` returns the logged-in user's notes. Which header fits?",
      [
        "`Cache-Control: public, max-age=3600`",
        "`Cache-Control: private, no-cache`",
        "No header: it's an API, so nothing caches it",
      ],
      1,
      "`private` keeps the notes out of shared caches; `no-cache` lets the browser keep a copy but check it each time. `public` could serve one user's notes to another.",
    ),
  ),

  part(
    "revalidate",
    "“Has it changed?” for data",
    explain(
      "A [[conditional-request]] asks for data only if it changed. The browser sends the ETag it has in `If-None-Match`; if it still matches, the server answers [[not-modified|304 Not Modified]] with no body. Express already does this: `res.json` adds a weak ETag and turns the answer into a 304 when a GET's `If-None-Match` matches.",
    ),
    code(
      "http",
      "Revalidating the notes list",
      [
        "GET /api/notes HTTP/1.1",
        'If-None-Match: W/"2c-a1b2"',
        "",
        "HTTP/1.1 304 Not Modified",
        'ETag: W/"2c-a1b2"',
        "Cache-Control: private, no-cache",
      ],
      {
        2: "the ETag of the copy the browser has",
        4: "unchanged: no body, use your copy",
      },
    ),
    keyPoints(
      "A 304 saves the download, not the work: the server still ran the query.",
      "W/ marks a weak ETag: same meaning, maybe not the same bytes.",
      "`Last-Modified` and `If-Modified-Since` do the same with a date.",
      "Dates only have whole seconds; ETags catch every change.",
    ),
  ),

  part(
    "step-by-step",
    "A 304, step by step",
    explain(
      "Here is the server's side, written out by hand: work out the ETag of the body, compare it with the one the client sent, and answer 304 without the body when they match.",
    ),
    trace(
      "Two GETs of the same notes",
      [
        "function respond(req, notes) {",
        "  const body = JSON.stringify(notes);",
        '  const tag = `"${hash(body)}"`;',
        '  const sent = req.headers["if-none-match"];',
        "  if (sent === tag) {",
        "    return { status: 304, tag };",
        "  }",
        "  return { status: 200, tag, body };",
        "}",
        "respond({ headers: {} }, notes);",
        "respond({ headers: {",
        '  "if-none-match": \'"a1b2"\' } }, notes);',
      ],
      [
        {
          line: 10,
          note: "The first visit: the browser has no copy, so it sends no `If-None-Match`.",
          vars: [["notes", '[{ id: 7, title: "Milk" }]']],
        },
        {
          line: 3,
          note: "The body's fingerprint becomes the ETag.",
          vars: [
            ["notes", '[{ id: 7, title: "Milk" }]'],
            ["req", "{ headers: {} }"],
            ["body", '\'[{"id":7,"title":"Milk"}]\''],
            ["tag", "'\"a1b2\"'"],
          ],
          stack: ["respond"],
        },
        {
          line: 8,
          note: "Nothing was sent to compare with: 200, the body, and the ETag for next time.",
          vars: [
            ["notes", '[{ id: 7, title: "Milk" }]'],
            ["req", "{ headers: {} }"],
            ["body", '\'[{"id":7,"title":"Milk"}]\''],
            ["tag", "'\"a1b2\"'"],
            ["sent", "undefined"],
          ],
          stack: ["respond"],
          output: '200, ETag: "a1b2", with the body',
        },
        {
          line: 11,
          note: "Later, the browser revalidates its copy and sends the ETag back.",
          vars: [["notes", '[{ id: 7, title: "Milk" }]']],
        },
        {
          line: 5,
          note: "The notes haven't changed, so the hash is the same and the tags match.",
          vars: [
            ["notes", '[{ id: 7, title: "Milk" }]'],
            ["req", "{ headers: { … } }"],
            ["body", '\'[{"id":7,"title":"Milk"}]\''],
            ["tag", "'\"a1b2\"'"],
            ["sent", "'\"a1b2\"'"],
          ],
          stack: ["respond"],
        },
        {
          line: 6,
          note: "304 with no body. The browser uses its copy, and `fetch` still hands your code a 200 with the data.",
          vars: [
            ["notes", '[{ id: 7, title: "Milk" }]'],
            ["req", "{ headers: { … } }"],
            ["body", '\'[{"id":7,"title":"Milk"}]\''],
            ["tag", "'\"a1b2\"'"],
            ["sent", "'\"a1b2\"'"],
          ],
          stack: ["respond"],
          output: '304, ETag: "a1b2", no body',
        },
      ],
    ),
  ),

  part(
    "vary",
    "Vary, and never sharing private data",
    explain(
      "A shared cache, like a CDN, stores one copy per URL. If `/api/notes` were cached there publicly, the next person to ask would get your notes. The [[vary-header]] names request headers that change the answer, so caches keep one copy per value. For one user's data, the safest rule is simpler: `private` (or `no-store`), so shared caches never keep it.",
    ),
    anatomy(
      "A private response, taken apart",
      [
        "HTTP/1.1 200 OK",
        "Cache-Control: private, no-cache",
        "Vary: Cookie, Accept-Language",
        'ETag: W/"2c-a1b2"',
      ],
      [
        ["private", "browser only", "CDNs and proxies must not keep it."],
        ["no-cache", "check first", "Kept, but revalidated before each use."],
        ["Cookie", "per login", "Another login cookie means another copy."],
        [
          "Accept-Language",
          "per language",
          "English and French are kept apart.",
        ],
        ['W/"2c-a1b2"', "the version", "Sent back in If-None-Match next time."],
      ],
    ),
    keyPoints(
      "`Vary: Authorization` or `Vary: Cookie` for answers that depend on who asks.",
      "`Vary: Accept-Language` when the answer is translated.",
      "Never `public` on anything behind a login.",
    ),
  ),

  part(
    "two-tabs",
    "Two tabs, one note",
    explain(
      "You open note 7 in two tabs. In tab A you change the title and save. In tab B, still showing the old version, you edit the content and save. Tab B's PUT replaces the whole note, so tab A's new title is silently lost. [[optimistic-concurrency|Optimistic concurrency]] stops this: every save says which version it was based on.",
    ),
    diagram([
      ["Both tabs read", 'ETag "v3"'],
      ["Tab A saves", 'If-Match "v3" → 200, now "v4"'],
      ["Tab B saves", 'If-Match "v3" → 412'],
      ["Tab B reloads", 'sees "v4", edits again'],
    ]),
    code(
      "http",
      "The losing save",
      [
        "PUT /api/notes/7 HTTP/1.1",
        'If-Match: "v3"',
        '{ "title": "Milk", "content": "2 litres" }',
        "",
        "HTTP/1.1 412 Precondition Failed",
      ],
      {
        2: "only save if it's still version 3",
        5: "it's v4 now: nothing was saved",
      },
    ),
    quickCheck(
      'A PUT with `If-Match: "v3"` gets `412 Precondition Failed`. What does it mean?',
      [
        "The note was deleted",
        "Someone changed the note since you loaded version 3, so your save was refused",
        "The body was invalid",
      ],
      1,
      "412 says the condition failed: the stored version has moved on. Reload, show the newer version, and let the person apply their change again.",
    ),
  ),

  part(
    "if-match-server",
    "If-Match on the server",
    explain(
      "The server needs something that changes on every save: a `version` number or the `updated_at` time. It becomes the ETag. The update only matches rows still at the version the client sent, so checking and saving happen in one step. Use a strong ETag (no `W/`): `If-Match` never matches a weak one.",
    ),
    code(
      "js",
      "updateNote with If-Match (not in the Notes App)",
      [
        'const match = req.get("If-Match"); // "v3"',
        "if (!match) return res.status(428).end();",
        "const version = Number(match.slice(2, -1));",
        "const result = await pool.query(",
        "  `UPDATE notes",
        "      SET title = $1, version = version + 1",
        "    WHERE id = $2 AND user_id = $3",
        "      AND version = $4",
        "    RETURNING id, title, version`,",
        "  [title, id, req.user.id, version],",
        ");",
        "if (result.rowCount === 0)",
        "  return res.status(412).end();",
        "const note = result.rows[0];",
        'res.set("ETag", `"v${note.version}"`).json(note);',
      ],
      {
        2: "428 Precondition Required: send If-Match",
        3: '"v3" → 3',
        8: "only if nobody saved since",
        12: "a real version also checks for 404 here",
        15: "the new version's tag, for the next save",
      },
    ),
  ),

  part(
    "react",
    "Caching in React",
    explain(
      "The client keeps data too: the notes in state are a cache. After you change something, that copy is out of date, so update it from the server's answer or refetch. Stale-while-revalidate means showing the copy you have at once, fetching a fresh one in the background, then swapping it in. Libraries like TanStack Query and SWR do this for you.",
    ),
    code(
      "jsx",
      "Stale data at once, fresh data soon",
      [
        "let cached = null; // outlives the component",
        "",
        "function useNotes() {",
        "  const [notes, setNotes] = useState(cached);",
        "  async function refresh() {",
        "    cached = await getNotes();",
        "    setNotes(cached);",
        "  }",
        "  useEffect(() => { refresh(); }, []);",
        "  async function save(id, note) {",
        "    await updateNote(id, note);",
        "    await refresh();",
        "  }",
        "  return { notes, save };",
        "}",
      ],
      {
        4: "stale: last visit's notes, shown at once",
        9: "revalidate: fetch fresh ones",
        12: "after a change, refetch",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App",
    explain(
      "Notes belong to one user, so they must never sit in a shared cache. The Notes App sets no `Cache-Control` at all; it relies on Express's automatic weak ETags, so the browser can revalidate `GET /api/notes` and get a 304. Adding `private, no-cache` would make the rule explicit. It has no `If-Match`, so two tabs can overwrite each other's edits.",
    ),
    inTheNotesApp(
      "`updateNote` saves whatever arrives: its UPDATE checks the note's id and owner, but not which version the edit was based on.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    keyPoints(
      "`useNotes` updates its state from each saved note, instead of refetching.",
      "If-Match would need a version (or updated_at) as a strong ETag.",
      "NoteForm would send it, and show a “changed elsewhere” message on 412.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Public caching of private data",
      language: "http",
      wrong: ["GET /api/notes", "Cache-Control: public, max-age=600"],
      problem:
        "A CDN or proxy keeps the first user's notes and serves them to everyone who asks for /api/notes for ten minutes.",
      right: ["GET /api/notes", "Cache-Control: private, no-cache"],
      why: "Anything that depends on who is logged in is private, or not stored at all.",
    }),
    mistake({
      title: "Reading no-cache as “don't cache”",
      language: "http",
      wrong: ["# card numbers: never store", "Cache-Control: no-cache"],
      problem: "`no-cache` still lets the browser store the response on disk.",
      right: ["# card numbers: never store", "Cache-Control: no-store"],
      why: "`no-cache` means revalidate first; only `no-store` means don't keep it.",
    }),
    mistake({
      title: "Last write wins",
      wrong: ["await updateNote(7, { title, content });"],
      problem:
        "If the note changed in another tab since it was loaded, this save silently throws that change away.",
      right: [
        "await updateNote(7, note, {",
        '  "If-Match": etagWhenLoaded,',
        "}); // 412 → reload and retry",
      ],
      why: "Send the version you edited, and let the server refuse a stale save.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Answer If-None-Match",
      task: "Write `respondTo(ifNoneMatch, etag, body)`. `ifNoneMatch` is the header or `null`; it may list several tags separated by commas, and a `W/` in front of a tag is ignored. If any tag equals `etag`, return `{ status: 304 }`; otherwise `{ status: 200, etag, body }`.",
      starter: [
        "function respondTo(ifNoneMatch, etag, body) {",
        "  return { status: 200, etag, body };",
        "}",
      ],
      tests: [
        ['respondTo(\'"a1"\', \'"a1"\', "[]")', "{ status: 304 }"],
        [
          'respondTo(null, \'"a1"\', "[]")',
          '{ status: 200, etag: \'"a1"\', body: "[]" }',
        ],
        ['respondTo(\'"x9", "a1"\', \'"a1"\', "[]")', "{ status: 304 }"],
        ['respondTo(\'W/"a1"\', \'"a1"\', "[]")', "{ status: 304 }"],
        [
          'respondTo(\'"x9"\', \'"a1"\', "[]")',
          '{ status: 200, etag: \'"a1"\', body: "[]" }',
        ],
      ],
      hint: 'Split on `","`, then `trim()` each tag and remove a leading `W/` with `.replace(/^W\\//, "")`.',
      solution: [
        "function respondTo(ifNoneMatch, etag, body) {",
        '  const tags = (ifNoneMatch ?? "")',
        '    .split(",")',
        '    .map((t) => t.trim().replace(/^W\\//, ""));',
        "  if (tags.includes(etag)) return { status: 304 };",
        "  return { status: 200, etag, body };",
        "}",
      ],
    }),
    yourTurn({
      title: "Save only if unchanged",
      task: 'Write `saveIfMatch(note, ifMatch, changes)`. `note` has a `version`; its ETag is `"v"` plus the version, in double quotes, like `\'"v3"\'`. No `ifMatch`: return `{ status: 428 }`. A different tag: `{ status: 412 }`. A match: `{ status: 200, note }` with the changes applied and `version` one higher.',
      starter: [
        "function saveIfMatch(note, ifMatch, changes) {",
        "  const saved = { ...note, ...changes };",
        "  return { status: 200, note: saved };",
        "}",
      ],
      tests: [
        [
          'saveIfMatch({ id: 7, title: "Milk", version: 3 }, \'"v3"\', { title: "Tea" })',
          '{ status: 200, note: { id: 7, title: "Tea", version: 4 } }',
        ],
        [
          'saveIfMatch({ id: 7, title: "Milk", version: 4 }, \'"v3"\', { title: "Tea" })',
          "{ status: 412 }",
        ],
        [
          'saveIfMatch({ id: 7, title: "Milk", version: 3 }, undefined, { title: "Tea" })',
          "{ status: 428 }",
        ],
      ],
      hint: 'Build the current tag with a template literal: `` `"v${note.version}"` ``.',
      solution: [
        "function saveIfMatch(note, ifMatch, changes) {",
        "  if (!ifMatch) return { status: 428 };",
        '  if (ifMatch !== `"v${note.version}"`) {',
        "    return { status: 412 };",
        "  }",
        "  const version = note.version + 1;",
        "  const saved = { ...note, ...changes, version };",
        "  return { status: 200, note: saved };",
        "}",
      ],
    }),
    yourTurn({
      title: "Read Cache-Control",
      task: "Write `parseCacheControl(header)`: an object with one key per directive, in lower case. A directive with `=` gets its value as a number; one without gets `true`. Ignore empty parts and spaces.",
      starter: ["function parseCacheControl(header) {", "  return {};", "}"],
      tests: [
        ['parseCacheControl("no-store")', '{ "no-store": true }'],
        [
          'parseCacheControl("private, max-age=60")',
          '{ private: true, "max-age": 60 }',
        ],
        [
          'parseCacheControl("Public,  Max-Age=0,")',
          '{ public: true, "max-age": 0 }',
        ],
      ],
      hint: 'Split on `","`, `trim()` and `toLowerCase()` each part, skip empty ones, then split on `"="`.',
      solution: [
        "function parseCacheControl(header) {",
        "  const out = {};",
        '  for (const part of header.split(",")) {',
        "    const text = part.trim().toLowerCase();",
        "    if (!text) continue;",
        '    const [name, value] = text.split("=");',
        "    out[name] = value === undefined ? true : Number(value);",
        "  }",
        "  return out;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Caching APIs cheat sheet", [
      ["private", "Only the user's browser may store it.", "private, no-cache"],
      [
        "no-cache",
        "Store, but revalidate before use.",
        "Cache-Control: no-cache",
      ],
      ["no-store", "Never store it anywhere.", "Cache-Control: no-store"],
      [
        "max-age",
        "Seconds it stays fresh without asking.",
        "public, max-age=300",
      ],
      ["ETag", "The version's fingerprint.", 'ETag: W/"2c-a1b2"'],
      ["If-None-Match", "Send it only if it changed.", "→ 304 Not Modified"],
      ["Vary", "Headers that change the answer.", "Vary: Cookie"],
      [
        "If-Match",
        "Save only if it's still this version.",
        "→ 412 Precondition Failed",
      ],
      ["Refetch", "After a change, get fresh data.", "await refresh()"],
    ]),
    quickCheck(
      "Which pair stops a save from overwriting someone else's newer edit?",
      [
        "`If-None-Match` and 304",
        "`If-Match` and 412",
        "`Cache-Control: no-store`",
      ],
      1,
      "If-None-Match saves downloads on reads. If-Match guards writes: the save only happens if the version is unchanged, otherwise 412.",
    ),
  ),
);
