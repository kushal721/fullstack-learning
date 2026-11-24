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

// Headers, cookies and caching. Headers up close, HTTP forgets, cookies,
// a cookie taken apart, logging in step by step, keeping cookies safe,
// caching, asking "has it changed?", redirects, the Notes App, mistakes,
// practice and a recap.
export const cookiesAndCachingModule = moduleLesson(
  "cookies-and-caching",
  "Headers, cookies and caching",
  45,
  [
    "Read a response's headers and say what each one asks the browser to do.",
    "Explain how a cookie lets a stateless server remember who you are.",
    "Read a Set-Cookie header, and say what HttpOnly, Secure and SameSite protect.",
    "Choose a Cache-Control value, and explain a 304 Not Modified.",
    "Follow a redirect, and tell permanent from temporary.",
  ],

  part(
    "headers-up-close",
    "Headers up close",
    explain(
      "[[header|Headers]] are the instructions around a message. Some describe the body, like [[content-type]]. Others ask the browser to *do* something: remember a value ([[cookie]]), keep a copy ([[cache-control]]) or go elsewhere ([[redirect]]). This module is about those three.",
    ),
    code(
      "http",
      "a response's headers",
      [
        "HTTP/1.1 200 OK",
        "Content-Type: application/json",
        "Cache-Control: no-store",
        "Set-Cookie: token=…; HttpOnly",
        "Content-Length: 58",
      ],
      {
        2: "what kind of data the body is",
        3: "may a copy be kept?",
        4: "please remember this",
        5: "how big the body is, in bytes",
      },
    ),
    quickCheck(
      "Which header tells the browser the body is JSON?",
      ["`Content-Type`", "`Cache-Control`", "`Set-Cookie`"],
      0,
      "[[content-type]] names the kind of data: `application/json` here.",
    ),
  ),

  part(
    "http-forgets",
    "HTTP forgets",
    explain(
      "HTTP is [[stateless]]: each request stands alone, and the server keeps no memory of the last one. Thousands of people send `GET /api/notes`; on its own, that request says nothing about *whose* notes. So something has to travel with every request to say who's asking.",
    ),
    analogy(
      "Like a cloakroom: the attendant can't remember every face, so you get a numbered ticket. Show the ticket and you get your coat back, whoever's on duty.",
    ),
    quickCheck(
      "You log in, then load your notes. Without cookies, what does the server know on the second request?",
      [
        "That you just logged in",
        "Nothing: each request stands alone",
        "Your IP address proves who you are",
      ],
      1,
      "HTTP is [[stateless]]. Without something sent with the request, it's a stranger asking.",
    ),
  ),

  part(
    "cookies",
    "Cookies: the browser remembers",
    explain(
      "A [[cookie]] is a small named value the server asks the browser to keep. The server sends `Set-Cookie` once, usually when you log in; from then on the browser adds a `Cookie` header to every request to that site, automatically. The server reads it and knows who you are: your [[session]].",
    ),
    diagram([
      ["Log in", "POST /api/auth/login"],
      ["Set-Cookie", "server → browser, once"],
      ["Cookie", "browser → server, every time"],
      ["You're known", "the server reads it"],
    ]),
  ),

  part(
    "cookie-anatomy",
    "A cookie, taken apart",
    explain(
      "Besides its name and value, `Set-Cookie` carries [[cookie-attributes|attributes]]: how long to keep the cookie, where to send it, and who may see it. Here's the Notes App's login cookie, exactly as Express sends it (minus the expiry date):",
    ),
    anatomy(
      "The Notes App's login cookie",
      [
        "token=eyJhb…;",
        "Max-Age=604800; Path=/;",
        "HttpOnly; Secure;",
        "SameSite=Lax",
      ],
      [
        [
          "token=eyJhb…",
          "name=value",
          "A signed token saying which user you are.",
        ],
        ["Max-Age=604800", "lifetime", "Keep it 604,800 seconds: 7 days."],
        ["Path=/", "path", "Send it with requests to every path."],
        ["HttpOnly", "no JavaScript", "The page's scripts can't read it."],
        ["Secure", "HTTPS only", "Never sent over plain HTTP."],
        [
          "SameSite=Lax",
          "same site",
          "Kept off requests other sites start, except links.",
        ],
      ],
    ),
  ),

  part(
    "step-by-step",
    "Logging in, step by step",
    explain(
      "Step through logging in to the Notes App, loading your notes, and logging out. Watch the cookie arrive, travel and leave:",
    ),
    trace(
      "Log in, load notes, log out",
      [
        "POST /api/auth/login",
        "  password ✓",
        "← 200, Set-Cookie: token=…",
        "browser stores token",
        "GET /api/notes",
        "  Cookie: token=…",
        "  verify token → user 4",
        "← 200, your notes",
        "POST /api/auth/logout",
        "← 204, clear the cookie",
        "GET /api/notes",
        "← 401 Please log in",
      ],
      [
        {
          line: 2,
          note: "The server checks your email and password against the database.",
          vars: [["cookie jar", "empty"]],
        },
        {
          line: 4,
          note: "The response's `Set-Cookie` gives the browser a signed token. The browser keeps it for 7 days.",
          vars: [["cookie jar", "token (7 days)"]],
        },
        {
          line: 6,
          note: "You didn't write any code for this: the browser adds `Cookie: token=…` to every request to the site by itself.",
          vars: [
            ["cookie jar", "token (7 days)"],
            ["sent", "Cookie: token=…"],
          ],
        },
        {
          line: 8,
          note: "The server checks the token's signature and expiry, finds user 4, and sends back only user 4's notes.",
          vars: [
            ["cookie jar", "token (7 days)"],
            ["user", "4"],
          ],
        },
        {
          line: 10,
          note: "Logging out sends a `Set-Cookie` that expires the token at once, so the browser throws it away.",
          vars: [["cookie jar", "empty"]],
        },
        {
          line: 12,
          note: "The next request carries no cookie, so the server doesn't know who's asking and refuses.",
          vars: [
            ["cookie jar", "empty"],
            ["user", "unknown"],
          ],
          output: "200 with the cookie · 401 without it",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "cookie-safety",
    "Keeping cookies safe",
    explain(
      "A login cookie is as good as your password: whoever sends it *is* you. Its attributes are its protection. HttpOnly stops a script injected into the page from reading it, Secure keeps it off plain HTTP, and SameSite stops other sites from making your browser send it for them (following a link to the site still sends it).",
    ),
    reference("Cookie attributes that protect you", [
      ["HttpOnly", "Scripts can't read it.", "stops XSS stealing it"],
      ["Secure", "Only sent over HTTPS.", "no café Wi-Fi snooping"],
      [
        "SameSite=Lax",
        "Off other sites' requests, except links.",
        "stops CSRF",
      ],
      ["Max-Age", "Expires on its own.", "604800 = 7 days"],
    ]),
    quickCheck(
      "A bug lets an attacker run JavaScript on your page. Which attribute stops them reading the login cookie?",
      ["`Secure`", "`HttpOnly`", "`Path=/`"],
      1,
      "`HttpOnly` cookies aren't visible to `document.cookie`, so injected scripts can't copy them.",
    ),
  ),

  part(
    "caching",
    "Caching: don't ask twice",
    explain(
      "A [[cache]] keeps a copy of a response so it doesn't have to be fetched again. Your browser has one; [[cdn|CDNs]] and other servers on the way can have them too. The [[cache-control]] header says who may keep a copy and for how long, so the right setting depends on what the file is:",
    ),
    reference("Cache-Control values", [
      ["max-age=31536000", "Keep it a year, no questions.", "app.3f9a1c.js"],
      ["no-cache", "Keep it, but check before each use.", "index.html"],
      ["no-store", "Never keep a copy anywhere.", "private data"],
      ["private", "Only the browser may keep it, not CDNs.", "a user's page"],
      ["public", "Shared caches like CDNs may keep it.", "logo.png"],
    ]),
    keyPoints(
      "Files named after their content (`app.3f9a1c.js`) can be kept forever.",
      "A new version gets a new name, so nobody sees an old one.",
      "`index.html` keeps its name, so it's checked every time.",
    ),
  ),

  part(
    "has-it-changed",
    "“Has it changed?”",
    explain(
      "A copy that must be checked doesn't have to be downloaded again. The first response carries an [[etag]], a fingerprint of the content. Next time the browser sends it back in `If-None-Match`; if the content is the same, the server answers **304 Not Modified** with no body, and the browser uses its copy.",
    ),
    code(
      "http",
      "checking a cached copy",
      [
        "HTTP/1.1 200 OK",
        'ETag: W/"a-zmvaW6"',
        "",
        "GET /api/notes HTTP/1.1",
        'If-None-Match: W/"a-zmvaW6"',
        "",
        "HTTP/1.1 304 Not Modified",
      ],
      {
        2: "the first answer's fingerprint",
        5: "later: I have this one; has it changed?",
        7: "no: use your copy (no body sent)",
      },
    ),
    quickCheck(
      "What does a `304 Not Modified` response contain?",
      [
        "The whole file again",
        "No body: the browser reuses the copy it has",
        "An error message",
      ],
      1,
      "304 means “your copy is still right”. Skipping the body is the whole point.",
    ),
  ),

  part(
    "redirects",
    "Redirects: go over there",
    explain(
      "A [[redirect]] is a 3xx response with a `Location` header: “what you want is over there”. The browser follows it by itself and shows only the final address. Permanent redirects (301, 308) are remembered, so the browser may skip straight to the new address next time; temporary ones (302, 307) aren't.",
    ),
    code(
      "http",
      "a redirect",
      [
        "GET /old-page HTTP/1.1",
        "",
        "HTTP/1.1 301 Moved Permanently",
        "Location: https://notes.app/new",
      ],
      { 3: "3xx: look elsewhere, for good", 4: "where to go instead" },
    ),
    reference("Redirect codes", [
      ["301", "Moved for good; may change POST to GET.", "renamed page"],
      ["308", "Moved for good; keeps the method.", "an API move"],
      ["302", "Temporary; may change POST to GET.", "after logging in"],
      ["307", "Temporary; keeps the method.", "maintenance"],
    ]),
  ),

  part(
    "notes-app",
    "Cookies and caching in the Notes App",
    explain(
      "The Notes App logs you in with one cookie, `token`: HttpOnly, SameSite=Lax, Secure in production, kept for 7 days. Every notes route checks it first. It sets no Cache-Control on API responses, but Express adds an ETag to each, so a repeated `GET /api/notes` with nothing changed gets a 304.",
    ),
    inTheNotesApp(
      "`authController.js` sets the cookie's options and sends it on login, and expires it on logout.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
    inTheNotesApp(
      "`authMiddleware.js` reads the cookie on every notes request and answers 401 if it's missing or invalid.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
    inTheNotesApp(
      '`request.js` sends `credentials: "include"`, so `fetch` includes the cookie.',
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Reading an HttpOnly cookie from JavaScript",
      wrong: ["const token = document.cookie;", '// "" — where is it?'],
      problem:
        "An HttpOnly cookie is invisible to the page's scripts, on purpose. You don't need it there: the browser sends it with every request already.",
      right: ['fetch("/api/notes", { credentials: "include" });'],
      why: "Let the browser carry the cookie. Make the request; the server reads it.",
    }),
    mistake({
      title: "Caching a file whose name never changes",
      language: "http",
      wrong: ["GET /app.js", "Cache-Control: max-age=31536000"],
      problem:
        "Deploy a fix and visitors keep the old `app.js` for up to a year, because the browser never asks again.",
      right: ["GET /app.3f9a1c.js", "Cache-Control: max-age=31536000"],
      why: "Only cache for a long time when the name changes with the content. Build tools like Vite do this for you.",
    }),
    mistake({
      title: "Letting a CDN keep private data",
      language: "http",
      wrong: ["GET /api/notes", "Cache-Control: public, max-age=60"],
      problem:
        "A shared cache may hand one user's notes to the next person who asks for the same URL.",
      right: ["GET /api/notes", "Cache-Control: private, no-store"],
      why: "Anything personal is `private`, and usually `no-store`.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the cookie",
      task: "Read the `Set-Cookie` header, then replace each `?`: the cookie's name, how many days it's kept, and whether page scripts can read it (`yes` or `no`).",
      starter: [
        "<pre>Set-Cookie: sid=9f2c; Max-Age=86400; HttpOnly; Secure</pre>",
        '<p>Name: <span id="name">?</span></p>',
        '<p>Kept for (days): <span id="days">?</span></p>',
        '<p>Can scripts read it? <span id="scripts">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The cookie's name",
          selector: "#name",
          text: "sid",
        },
        {
          kind: "text",
          label: "86400 seconds is one day",
          selector: "#days",
          text: "1",
        },
        {
          kind: "text",
          label: "HttpOnly hides it from scripts",
          selector: "#scripts",
          text: "no",
        },
      ],
      hint: "The name is before the `=`. A day is 24 × 60 × 60 = 86,400 seconds. Look for `HttpOnly`.",
      solution: [
        "<pre>Set-Cookie: sid=9f2c; Max-Age=86400; HttpOnly; Secure</pre>",
        '<p>Name: <span id="name">sid</span></p>',
        '<p>Kept for (days): <span id="days">1</span></p>',
        '<p>Can scripts read it? <span id="scripts">no</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Choose the Cache-Control",
      task: "Replace each `?` with the best `Cache-Control` value for that response: `no-store`, `no-cache` or `max-age=31536000`.",
      starter: [
        '<p>GET /api/notes (your private notes): <span id="notes">?</span></p>',
        '<p>GET /index.html (same name every deploy): <span id="html">?</span></p>',
        '<p>GET /app.3f9a1c.js (name changes with content): <span id="js">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Private data is never stored",
          selector: "#notes",
          text: "no-store",
        },
        {
          kind: "text",
          label: "The page is checked every time",
          selector: "#html",
          text: "no-cache",
        },
        {
          kind: "text",
          label: "Content-named files are kept",
          selector: "#js",
          text: "max-age=31536000",
        },
      ],
      hint: "Private: never keep. Same name, new content: keep but check. New name for new content: keep for a year.",
      solution: [
        '<p>GET /api/notes (your private notes): <span id="notes">no-store</span></p>',
        '<p>GET /index.html (same name every deploy): <span id="html">no-cache</span></p>',
        '<p>GET /app.3f9a1c.js (name changes with content): <span id="js">max-age=31536000</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Which status?",
      task: "Replace each `?` with the status code the server sends: `301`, `302` or `304`.",
      starter: [
        '<p>The page has moved to a new address for good: <span id="moved">?</span></p>',
        '<p>After logging in, send the user on to the dashboard: <span id="temp">?</span></p>',
        '<p>The ETag matches: the browser\'s copy is still right: <span id="same">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Moved for good",
          selector: "#moved",
          text: "301",
        },
        {
          kind: "text",
          label: "A temporary redirect",
          selector: "#temp",
          text: "302",
        },
        {
          kind: "text",
          label: "Not modified",
          selector: "#same",
          text: "304",
        },
      ],
      hint: "301 is permanent, 302 temporary. 304 isn't a redirect at all: it says “use your copy”.",
      solution: [
        '<p>The page has moved to a new address for good: <span id="moved">301</span></p>',
        '<p>After logging in, send the user on to the dashboard: <span id="temp">302</span></p>',
        '<p>The ETag matches: the browser\'s copy is still right: <span id="same">304</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Headers, cookies and caching", [
      ["stateless", "Each request stands alone.", "who's asking?"],
      ["Set-Cookie", "Server: please remember this.", "token=…; HttpOnly"],
      ["Cookie", "Browser: sent with every request.", "Cookie: token=…"],
      ["HttpOnly / Secure", "No scripts / HTTPS only.", "login cookies"],
      [
        "SameSite=Lax",
        "Off other sites' requests, except links.",
        "stops CSRF",
      ],
      ["Cache-Control", "Who may keep a copy, how long.", "no-store, max-age"],
      ["ETag + 304", "Has it changed? No: use your copy.", "If-None-Match"],
      ["301 / 308", "Moved for good.", "Location: …"],
      ["302 / 307", "Temporary redirect.", "after logging in"],
    ]),
    quickCheck(
      "You're logged in to the Notes App. What makes the server know it's you on each request?",
      [
        "Your IP address",
        "The `token` cookie the browser sends with every request",
        "The server remembers your last request",
      ],
      1,
      "HTTP is [[stateless]]; the [[cookie]] travels with every request and says who you are.",
    ),
  ),
);
