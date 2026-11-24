import {
  analogy,
  anatomy,
  code,
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
  tryIt,
} from "../blocks.js";

// URLs: addresses for everything. Why addresses, a URL taken apart, scheme,
// host and port, paths, queries, fragments, how the browser reads a URL,
// special characters, relative URLs, the Notes App, mistakes, practice and
// a recap.
export const urlsModule = moduleLesson(
  "urls",
  "URLs: addresses for everything",
  40,
  [
    "Name every part of a URL: scheme, host, port, path, query and fragment.",
    "Say which parts the browser uses itself and which it sends to the server.",
    "Read and write query strings, including characters that need encoding.",
    "Work out where a relative URL points from the page it's on.",
    "Recognise common URL mistakes.",
  ],

  part(
    "addresses",
    "Every page has an address",
    explain(
      "Every page, image, script and piece of data on the web has an address, called a [[url]] (Uniform Resource Locator). It tells the browser *how* to talk, *which* computer to talk to and *what* to ask it for. You type them, click them as links, and every request your browser makes is for one.",
    ),
    analogy(
      "Like a postal address: the city gets the letter to the right building, the street and number to the right door, and “attn: accounts” to the right person inside.",
    ),
    quickCheck(
      "Which of these has its own URL?",
      [
        "Only whole pages",
        "Pages, and every image, script and piece of data they load",
        "Only websites' home pages",
      ],
      1,
      "Everything the browser fetches is asked for by URL: each [[resource]] has its own.",
    ),
  ),

  part(
    "take-it-apart",
    "A URL, taken apart",
    explain(
      "A full URL has up to six parts, always in the same order. Most URLs you see leave some out: the port is usually implied, and many have no query or fragment. Here's one with everything, split over two lines:",
    ),
    anatomy(
      "One URL with every part",
      ["https://notes.app:443", "/notes/7?sort=new#top"],
      [
        ["https", "scheme", "How to talk: the protocol. Then ://"],
        ["notes.app", "host", "Which server: a domain or an IP address."],
        ["443", "port", "Which program; 443 is implied for https."],
        ["/notes/7", "path", "What you want from that server."],
        ["?sort=new", "query", "Extra options, as name=value pairs."],
        ["#top", "fragment", "A spot on the page; never sent."],
      ],
    ),
    tryIt("url-anatomy"),
  ),

  part(
    "scheme-host-port",
    "Scheme, host and port",
    explain(
      "The [[protocol|scheme]] says how to talk; almost every web URL is `https`. The host is a [[domain]] (or an IP address) that [[dns]] turns into the server's address. The [[port]] picks the program on that server; browsers fill in 443 for https and 80 for http, so you only see it when it's different, as in development.",
    ),
    reference("Schemes, hosts and ports you'll meet", [
      [
        "https://notes.app",
        "Encrypted; port 443 implied.",
        "almost every site",
      ],
      ["http://notes.app", "Not encrypted; port 80 implied.", "old sites"],
      ["http://localhost:5173", "Your computer, port 5173.", "the React app"],
      ["http://localhost:3000", "Your computer, port 3000.", "the Notes API"],
      ["mailto:you@notes.app", "Opens an email, not a page.", "a contact link"],
    ]),
  ),

  part(
    "paths",
    "Paths: what you want",
    explain(
      "The [[path]] comes after the host and starts with `/`. It looks like folders, `/notes/7`, but the server decides what it means: it may be a real file, like `/logo.png`, or a route that builds an answer, like `/api/notes/7`. Paths are case-sensitive on most servers: `/Notes` and `/notes` can be different.",
    ),
    keyPoints(
      "`/` on its own is the site's home, the root.",
      "Each `/` goes one level deeper: `/notes/7`.",
      "The server decides what each path means.",
      "Case matters: `/Notes` isn't always `/notes`.",
    ),
  ),

  part(
    "queries",
    "Queries: extra options",
    explain(
      "A [[query]] adds options to a request. It starts with `?`, then `name=value` pairs joined by `&`. Searching, sorting, filtering and paging usually live here, so the same path can answer in different ways: `/search?q=milk` and `/search?q=eggs` are one page with two searches.",
    ),
    code(
      "bash",
      "queries, read left to right",
      [
        "/search?q=milk",
        "/notes?sort=new&page=2",
        "/notes?tag=home&tag=work",
        "/search?q=milk%20%26%20eggs",
      ],
      {
        1: "one parameter: q is milk",
        2: "two, joined by &; their order doesn't matter",
        3: "a name can repeat: two tags",
        4: "q is “milk & eggs”, encoded (see below)",
      },
    ),
    quickCheck(
      "In `/notes?sort=new&page=2`, what is `page`?",
      ["The path", "A query parameter, with the value 2", "A fragment"],
      1,
      "Everything after `?` is the query: `sort=new` and `page=2` are its two parameters.",
    ),
  ),

  part(
    "fragments",
    "Fragments: a spot on the page",
    explain(
      "A [[fragment]] starts with `#` and points to a spot *inside* the page, usually an element with that `id`. The browser keeps it to itself: it's never sent to the server. Clicking a link to `#install` on the same page just scrolls there, with no request at all.",
    ),
    code(
      "html",
      "a link to a spot on the same page",
      [
        '<a href="#install">Jump to install</a>',
        "…",
        '<h2 id="install">Install</h2>',
      ],
      {
        1: "only a fragment: same page, no request",
        3: "the element the fragment names, by id",
      },
    ),
    quickCheck(
      "You open `https://notes.app/help#install`. What does the server receive?",
      ["`/help#install`", "`/help`", "`#install`"],
      1,
      "The fragment never leaves the browser. The server gets the path `/help`; the browser then scrolls to `#install`.",
    ),
  ),

  part(
    "step-by-step",
    "How the browser reads a URL",
    explain(
      "Step through what the browser does with what you type, and then with a click on a link to a fragment:",
    ),
    trace(
      "Typing notes.app/search?q=milk",
      [
        "typed: notes.app/search?q=milk",
        "no scheme? add https://",
        "https → port 443",
        "host: notes.app → DNS",
        "path: /search",
        "query: q=milk",
        "fragment: none",
        "GET /search?q=milk",
        "Host: notes.app",
        "click: …?q=milk#top",
        "same page: scroll to #top",
      ],
      [
        {
          line: 1,
          note: "You type an address with no scheme. The browser has to work out every part before it can send anything.",
          vars: [["typed", "notes.app/search?q=milk"]],
        },
        {
          line: 3,
          note: "With no scheme, browsers try `https`. That also gives the [[port]]: 443, since none was written.",
          vars: [
            ["scheme", "https"],
            ["port", "443"],
          ],
        },
        {
          line: 4,
          note: "The host goes to [[dns]] to find the server's [[ip-address]].",
          vars: [
            ["scheme", "https"],
            ["host", "notes.app"],
          ],
        },
        {
          line: 7,
          note: "Everything after the host splits at `?` and `#`: the [[path]], the [[query]], and here no [[fragment]].",
          vars: [
            ["path", "/search"],
            ["query", "q=milk"],
            ["fragment", "none"],
          ],
        },
        {
          line: 9,
          note: "The request carries only the path and query. The host goes in the `Host` header; the scheme and port were used to connect.",
          vars: [["sent", "GET /search?q=milk"]],
        },
        {
          line: 11,
          note: "A link to the same URL plus `#top` changes only the fragment, so the browser scrolls instead of asking the server again.",
          vars: [
            ["fragment", "top"],
            ["requests", "none"],
          ],
          output: "one request for the page · none for the fragment",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "special-characters",
    "Spaces and special characters",
    explain(
      "Some characters mean something in a URL (`?`, `&`, `=`, `#`, `/`) and spaces aren't allowed at all. To put them *inside* a value, they're [[percent-encoding|percent-encoded]]: a space becomes `%20` (or `+` in a query), `&` becomes `%26`. In JavaScript, `URLSearchParams` and `encodeURIComponent` do it for you.",
    ),
    code(
      "js",
      "letting JavaScript encode a search",
      [
        "const query = new URLSearchParams();",
        'query.set("q", "milk & eggs");',
        "query.toString();",
        '// "q=milk+%26+eggs"',
        "",
        'encodeURIComponent("milk & eggs");',
        '// "milk%20%26%20eggs"',
      ],
      {
        2: "set a query parameter; it's encoded for you",
        4: "the space became +, the & became %26",
        6: "encode one value by hand",
      },
    ),
  ),

  part(
    "relative-urls",
    "Relative URLs",
    explain(
      "Links inside a page usually leave out the start of the URL. A [[relative-url|relative URL]] is worked out from the page it's on: `/about` starts again from the site's root, `8` replaces the last part of the path, and `?sort=new` keeps the path and changes the query. On the page `https://notes.app/notes/7`:",
    ),
    reference("Relative URLs, from notes.app/notes/7", [
      ["/about", "From the root.", "https://notes.app/about"],
      ["8", "Replaces the last part.", "https://notes.app/notes/8"],
      ["../help", "Up one level first.", "https://notes.app/help"],
      ["?sort=new", "Same path, new query.", "…/notes/7?sort=new"],
      ["#top", "Same page, a fragment.", "…/notes/7#top"],
      ["https://x.example", "Absolute: used as it is.", "https://x.example"],
    ]),
    quickCheck(
      'On `https://notes.app/notes/7`, a link says `href="/notes/8"`. Where does it go?',
      [
        "`https://notes.app/notes/notes/8`",
        "`https://notes.app/notes/8`",
        "`https://notes.app/notes/7/notes/8`",
      ],
      1,
      "A leading `/` starts from the site's root, so the current path doesn't matter.",
    ),
  ),

  part(
    "notes-app",
    "URLs in the Notes App",
    explain(
      'The Notes App\'s screens all share one URL: `App.jsx` switches between login, register and your notes with React state, not by URL. Its *data*, though, lives at URLs: `fetch("/api/notes")` uses a relative URL, so it goes to whatever site the app is on. In development, Vite forwards anything under `/api` to the API on port 3000.',
    ),
    reference("The Notes App's API URLs", [
      ["/api/notes", "Your notes; POST adds one.", "GET, POST"],
      ["/api/notes/7", "Note 7; the id is in the path.", "PUT, DELETE"],
      ["/api/auth/login", "Log in.", "POST"],
      ["/api/auth/me", "Who's logged in?", "GET"],
    ]),
    inTheNotesApp(
      "`notesApi.js` builds each note's URL from its id: `/api/notes/${id}`.",
      { fileId: "frontend/src/services/notesApi.js" },
    ),
    inTheNotesApp(
      "`App.jsx` picks the screen with state, so the address bar stays the same on every screen.",
      { fileId: "frontend/src/App.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Gluing text into a query",
      wrong: ["fetch(`/api/search?q=${text}`);", '// text is "milk & eggs"'],
      problem:
        "The `&` ends the parameter early: the server sees `q` as “milk ” and a second parameter called “ eggs”, with no value.",
      right: [
        "const query = new URLSearchParams({ q: text });",
        "fetch(`/api/search?${query}`);",
      ],
      why: "Let `URLSearchParams` (or `encodeURIComponent`) encode values, so special characters stay inside them.",
    }),
    mistake({
      title: "Forgetting the leading slash",
      language: "html",
      wrong: ["<!-- on /notes/7 -->", '<a href="notes/8">Next</a>'],
      problem:
        "Without `/`, the link is relative to the current folder, `/notes/`, so it goes to `/notes/notes/8`.",
      right: ["<!-- on /notes/7 -->", '<a href="/notes/8">Next</a>'],
      why: "Start with `/` when you mean a path from the site's root.",
    }),
    mistake({
      title: "Putting secrets in the URL",
      language: "http",
      wrong: ["GET /login?email=sam@notes.app&password=hunter2"],
      problem:
        "URLs are saved in browser history, server logs and anywhere a link is shared, even over https.",
      right: [
        "POST /api/auth/login",
        "Content-Type: application/json",
        "",
        '{"email":"sam@notes.app","password":"…"}',
      ],
      why: "Send passwords and other secrets in a request body, never in the URL.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Take a URL apart",
      task: "Replace each `?` with that part of `https://notes.app/notes?sort=new#list`. Leave out the punctuation that separates them (`://`, `?`, `#`).",
      starter: [
        "<p>URL: https://notes.app/notes?sort=new#list</p>",
        '<p>Scheme: <span id="scheme">?</span></p>',
        '<p>Host: <span id="host">?</span></p>',
        '<p>Path: <span id="path">?</span></p>',
        '<p>Query: <span id="query">?</span></p>',
        '<p>Fragment: <span id="fragment">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The scheme",
          selector: "#scheme",
          text: "https",
        },
        {
          kind: "text",
          label: "The host",
          selector: "#host",
          text: "notes.app",
        },
        {
          kind: "text",
          label: "The path, with its slash",
          selector: "#path",
          text: "/notes",
        },
        {
          kind: "text",
          label: "The query",
          selector: "#query",
          text: "sort=new",
        },
        {
          kind: "text",
          label: "The fragment",
          selector: "#fragment",
          text: "list",
        },
      ],
      hint: "Split at `://`, then at the first `/`, then at `?`, then at `#`. The path keeps its leading `/`.",
      solution: [
        "<p>URL: https://notes.app/notes?sort=new#list</p>",
        '<p>Scheme: <span id="scheme">https</span></p>',
        '<p>Host: <span id="host">notes.app</span></p>',
        '<p>Path: <span id="path">/notes</span></p>',
        '<p>Query: <span id="query">sort=new</span></p>',
        '<p>Fragment: <span id="fragment">list</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Build a search link",
      task: "Change the link's `href` so it searches for `milk`, newest first: the path `/search`, then the parameters `q=milk` and `sort=new`, in that order.",
      starter: ['<a id="search" href="/search">Search for milk</a>'],
      checks: [
        {
          kind: "exists",
          label: "It still goes to /search, now with a query",
          selector: '#search[href^="/search?"]',
        },
        {
          kind: "attr",
          label: "The query is q=milk, then sort=new",
          selector: "#search",
          name: "href",
          value: "/search?q=milk&sort=new",
        },
      ],
      hint: "The query starts with `?`, and parameters are joined with `&`.",
      solution: [
        '<a id="search" href="/search?q=milk&sort=new">Search for milk</a>',
      ],
    }),
    pageYourTurn({
      title: "Where does each link go?",
      task: "You're on `https://notes.app/notes/7`. Replace each `?` with the full URL that link goes to.",
      starter: [
        "<p>On: https://notes.app/notes/7</p>",
        '<p>href="8": <span id="next">?</span></p>',
        '<p>href="/about": <span id="about">?</span></p>',
        '<p>href="?sort=new": <span id="sorted">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "8 replaces the last part",
          selector: "#next",
          text: "https://notes.app/notes/8",
        },
        {
          kind: "text",
          label: "/about starts from the root",
          selector: "#about",
          text: "https://notes.app/about",
        },
        {
          kind: "text",
          label: "?sort=new keeps the path",
          selector: "#sorted",
          text: "https://notes.app/notes/7?sort=new",
        },
      ],
      hint: "A leading `/` starts from the root. No slash replaces the last part of the path. A `?` keeps the whole path.",
      solution: [
        "<p>On: https://notes.app/notes/7</p>",
        '<p>href="8": <span id="next">https://notes.app/notes/8</span></p>',
        '<p>href="/about": <span id="about">https://notes.app/about</span></p>',
        '<p>href="?sort=new": <span id="sorted">https://notes.app/notes/7?sort=new</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("URL cheat sheet", [
      ["scheme", "How to talk.", "https"],
      ["host", "Which server; DNS finds it.", "notes.app"],
      ["port", "Which program; 443/80 implied.", ":5173"],
      ["path", "What you want; server decides.", "/notes/7"],
      ["query", "Options: ?name=value&…", "?sort=new&page=2"],
      ["fragment", "A spot on the page; not sent.", "#top"],
      ["encoding", "Special characters as %XX.", "space → %20"],
      ["relative", "Worked out from the current page.", "/about, 8, ?q=x"],
      ["sent to server", "Path and query, plus Host.", "GET /notes?sort=new"],
    ]),
    quickCheck(
      "Which part of `https://notes.app/notes/7?sort=new#top` does the browser keep to itself?",
      ["`/notes/7`", "`?sort=new`", "`#top`"],
      2,
      "The [[fragment]] never goes to the server. The path and query are sent in the request.",
    ),
  ),
);
