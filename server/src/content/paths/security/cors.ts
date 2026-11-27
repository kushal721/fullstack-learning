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

// A fake res for the middleware exercise: records headers, status and end().
const fakeRes =
  "const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; }, end() { this.ended = true; return this; } };";

// CORS: the browser's rule and what CORS relaxes, why CORS doesn't protect
// the server, why the Notes App needs none, a CORS answer taken apart,
// credentialed requests, the cors middleware, an allowlist step by step,
// preflight, risky set-ups, mistakes, practice and a recap.
export const corsModule = moduleLesson(
  "cors",
  "CORS: who may read your API",
  40,
  [
    "Explain what the browser blocks across origins, and what CORS lets a server allow.",
    "Say why CORS protects the browser's user, not your server, and why curl ignores it.",
    "Allow a credentialed request: one exact origin, Allow-Credentials and Vary: Origin.",
    "Set up the cors middleware with an allowlist, and answer a preflight.",
    "Spot risky set-ups: reflecting any origin, endsWith checks and the null origin.",
  ],

  part(
    "the-rule",
    "The browser's rule, and what CORS relaxes",
    explain(
      "You met this in How the Web Works: a page can *send* a request to any site, but its scripts may only *read* answers from its own origin (scheme, host and port). [[cors|CORS]] is how a server says “this other origin may read my answers too”, with `Access-Control-Allow-…` headers. Without them, the browser hides the answer from the page.",
    ),
    diagram([
      ["Page", "https://notes.app"],
      ["fetch()", "to api.notes.app"],
      ["API answers", "with or without CORS headers"],
      ["Browser", "lets the page read it, or not"],
    ]),
    keyPoints(
      "The browser enforces CORS, not the server.",
      "It decides who may read an answer, not who may send.",
      "No CORS headers: the page can't read the answer.",
    ),
  ),

  part(
    "not-a-shield",
    "CORS doesn't protect your server",
    explain(
      "CORS protects the person using the browser: it stops another site's scripts reading their data with their login. It does nothing for your server. curl, a script or Postman never look at CORS headers. So CORS is not authentication: every route still checks the login, ownership and input, whoever is allowed to read.",
    ),
    code(
      "bash",
      "curl ignores CORS completely",
      [
        "curl https://api.notes.app/api/notes \\",
        '  -H "Origin: https://evil.example" \\',
        '  -H "Cookie: token=eyJhbGci…"',
      ],
      {
        2: "any Origin, any headers",
        3: "only a valid login gets notes back",
      },
    ),
    quickCheck(
      "An API sends no CORS headers at all. Who can still read its answers?",
      [
        "Nobody but the API's own pages",
        "Its own origin's pages, and any non-browser client like curl",
        "Every website",
      ],
      1,
      "CORS is a browser rule. Pages from other origins can't read the answer, but curl, scripts and servers don't apply CORS, so the API must still check every request.",
    ),
  ),

  part(
    "notes-app",
    "Why the Notes App needs no CORS",
    explain(
      "The Notes App has no cors middleware, and doesn't need one. In development, Vite forwards `/api` to the API on port 3000, so the browser sees one origin, `localhost:5173`, for the page and the API. In production one domain serves both. Same origin means no CORS headers and nothing to get wrong. Prefer this set-up when you can.",
    ),
    inTheNotesApp(
      "vite.config.js forwards `/api` to `http://localhost:3000`, so the page and the API share one origin and app.js needs no CORS.",
      { fileId: "frontend/vite.config.js" },
    ),
    keyPoints(
      "Same origin: no CORS needed at all.",
      "You need CORS when the page and API live on different origins.",
      "Example: the page on notes.app, the API on api.notes.app.",
    ),
  ),

  part(
    "anatomy",
    "A CORS answer, taken apart",
    explain(
      "Say the Notes API moved to `https://api.notes.app`. Its answers to the page at `https://notes.app` would need these headers. Each one is a promise the browser checks before it hands the body to the page's script.",
    ),
    anatomy(
      "The CORS headers on an API answer",
      [
        "HTTP/1.1 200 OK",
        "Access-Control-Allow-Origin: https://notes.app",
        "Access-Control-Allow-Credentials: true",
        "Vary: Origin",
      ],
      [
        [
          "Access-Control-Allow-Origin",
          "who may read",
          "The browser compares it with the page's origin, exactly.",
        ],
        [
          "https://notes.app",
          "one exact origin",
          "Scheme, host and port. One origin per answer, or *.",
        ],
        [
          "Allow-Credentials: true",
          "cookies allowed",
          "Needed when the request carried cookies. Never with *.",
        ],
        [
          "Vary: Origin",
          "for caches",
          "The answer differs per Origin, so a cache mustn't reuse it for another.",
        ],
      ],
    ),
  ),

  part(
    "credentials",
    "Credentialed requests",
    explain(
      'By default a cross-origin `fetch` sends no cookies. With `credentials: "include"` it sends them: a [[credentialed-request|credentialed request]]. Then the rules get strict: the server must answer `Allow-Credentials: true` and name the exact origin. `*` is refused, because that page is acting with the user\'s login. Only allow origins you control.',
    ),
    code(
      "js",
      "request.js already asks for cookies",
      [
        "const response = await fetch(path, {",
        "  method,",
        '  credentials: "include",',
        "  headers,",
        "  body,",
        "});",
      ],
      {
        3: "same origin: changes nothing; cross-origin: sends the cookie",
      },
    ),
    inTheNotesApp(
      'request.js passes `credentials: "include"`. On one origin cookies are sent anyway; it would matter if the API moved to its own origin.',
      { fileId: "frontend/src/services/request.js" },
    ),
  ),

  part(
    "middleware",
    "The cors middleware",
    explain(
      "In Express you don't write these headers by hand: the `cors` package does it. Give it an allowlist of exact origins and `credentials: true`. It adds the headers only when the request's `Origin` is on the list, and answers preflights for you. Put it first, before the routes. The Notes App doesn't use it; this is how it would look with a separate API origin.",
    ),
    code(
      "js",
      "app.js with an API on its own origin (not in the Notes App)",
      [
        'import cors from "cors";',
        "",
        "app.use(cors({",
        '  origin: ["https://notes.app"],',
        "  credentials: true,",
        "}));",
        "app.use(express.json());",
        'app.use("/api/notes", notesRoutes);',
      ],
      {
        4: "an allowlist: exact origins only",
        5: "adds Allow-Credentials: true",
        7: "cors first, then everything else",
      },
    ),
  ),

  part(
    "step-by-step",
    "An allowlist, step by step",
    explain(
      "Here is the heart of what the middleware does, as a plain function. It builds the CORS headers for one request's `Origin`. Watch two calls: the Notes front end, then a site that isn't on the list.",
    ),
    trace(
      "Building CORS headers from an allowlist",
      [
        'const allowed = ["https://notes.app"];',
        "function corsHeaders(origin) {",
        "  if (!allowed.includes(origin)) {",
        "    return {};",
        "  }",
        "  return {",
        '    "Access-Control-Allow-Origin": origin,',
        '    "Access-Control-Allow-Credentials":',
        '      "true",',
        '    Vary: "Origin",',
        "  };",
        "}",
        'const a = corsHeaders("https://notes.app");',
        'const b = corsHeaders("https://evil.app");',
      ],
      [
        {
          line: 13,
          note: "A request from the Notes front end. Its Origin header is https://notes.app.",
          vars: [["allowed", '["https://notes.app"]']],
        },
        {
          line: 3,
          note: "An exact match in the allowlist, so the check passes.",
          vars: [["origin", '"https://notes.app"']],
          stack: ["corsHeaders"],
        },
        {
          line: 6,
          note: "Name that one origin back, allow cookies, and tell caches the answer depends on Origin.",
          vars: [["origin", '"https://notes.app"']],
          stack: ["corsHeaders"],
        },
        {
          line: 14,
          note: "a holds the three headers. Now a request from a page on evil.app.",
          vars: [
            ["allowed", '["https://notes.app"]'],
            ["a", '{ "Access-Control-Allow-Origin": "https://notes.app", … }'],
          ],
        },
        {
          line: 3,
          note: "Not on the list.",
          vars: [["origin", '"https://evil.app"']],
          stack: ["corsHeaders"],
        },
        {
          line: 4,
          note: "No CORS headers at all. The browser won't let evil.app's script read the answer.",
          vars: [["origin", '"https://evil.app"']],
          stack: ["corsHeaders"],
        },
        {
          line: 14,
          note: "b is empty. The server still ran the request, though: CORS only hides the answer.",
          vars: [
            ["allowed", '["https://notes.app"]'],
            ["a", '{ "Access-Control-Allow-Origin": "https://notes.app", … }'],
            ["b", "{}"],
          ],
        },
      ],
    ),
  ),

  part(
    "preflight",
    "Answering a preflight",
    explain(
      "A JSON body, a `PUT` or a `DELETE` can't be sent across origins without asking first. The browser sends an `OPTIONS` preflight with the method and headers it wants to use. The server answers `204` with what it allows, and only then does the browser send the real request. The cors middleware answers preflights for you.",
    ),
    code(
      "http",
      "A preflight before deleting note 8",
      [
        "OPTIONS /api/notes/8 HTTP/1.1",
        "Origin: https://notes.app",
        "Access-Control-Request-Method: DELETE",
        "",
        "HTTP/1.1 204 No Content",
        "Access-Control-Allow-Origin: https://notes.app",
        "Access-Control-Allow-Credentials: true",
        "Access-Control-Allow-Methods: PUT,DELETE",
        "Access-Control-Max-Age: 600",
      ],
      {
        3: "may I send a DELETE?",
        5: "yes: no body, just headers",
        9: "remember this answer for 10 minutes",
      },
    ),
    quickCheck(
      "The preflight for `DELETE /api/notes/8` is refused. What happens to note 8?",
      [
        "It's deleted, but the page can't read the answer",
        "Nothing: the browser never sends the DELETE",
        "The server deletes it and answers 403",
      ],
      1,
      "When the preflight fails, the browser stops and the real request is never sent. That's why risky methods and JSON bodies get a preflight: the server is asked before anything changes.",
    ),
  ),

  part(
    "risky",
    "Risky set-ups",
    explain(
      "`*` with credentials is refused, so people “fix” the error by copying whatever `Origin` arrives back into `Allow-Origin`. Now every site can read your users' notes with their cookies. `SameSite=Lax` cookies would still stay off cross-site fetches, but don't rely on one layer. Matching with `endsWith` or `includes` lets `evilnotes.app` in, and allowing `null` lets in sandboxed pages.",
    ),
    reference("Safe and unsafe origin checks", [
      [
        "Exact list",
        "Safe: only the origins you named.",
        "allowed.includes(origin)",
      ],
      [
        "Reflect any origin",
        "Unsafe: every site may read, with cookies.",
        "origin: true, credentials: true",
      ],
      [
        "endsWith / includes",
        "Unsafe: evilnotes.app and notes.app.evil.example match.",
        'origin.endsWith("notes.app")',
      ],
      [
        'Allowing "null"',
        "Unsafe: sandboxed frames and files send null.",
        'allowed.includes("null")',
      ],
      ["*", "Fine for public data with no cookies.", "a public read-only API"],
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Reflecting any origin",
      wrong: [
        "app.use(cors({",
        "  origin: true,",
        "  credentials: true,",
        "}));",
      ],
      problem:
        "`origin: true` copies every request's Origin back, so any website can read users' data with their login.",
      right: [
        "app.use(cors({",
        '  origin: ["https://notes.app"],',
        "  credentials: true,",
        "}));",
      ],
      why: "Name the exact origins you trust. Everyone else gets no CORS headers.",
    }),
    mistake({
      title: "Matching the end of the origin",
      wrong: ['if (origin.endsWith("notes.app")) {', "  allow(origin);", "}"],
      problem:
        "`https://evilnotes.app` ends with notes.app too, so a stranger's site is allowed.",
      right: ["if (allowed.includes(origin)) {", "  allow(origin);", "}"],
      why: "Compare whole origins against a list. No string tricks.",
    }),
    mistake({
      title: "Treating CORS as a lock",
      wrong: [
        "// only notes.app may call us,",
        "// so this route needs no login",
        'router.delete("/:id", deleteNote);',
      ],
      problem:
        "curl and scripts ignore CORS, and a cross-site form still sends requests. Anyone can delete notes.",
      right: ["router.use(requireAuth);", 'router.delete("/:id", deleteNote);'],
      why: "CORS decides who reads answers in a browser. Logins, ownership checks and CSRF defences protect the server.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Is this origin allowed?",
      task: 'Write `isAllowedOrigin(origin, allowed)`. Return `true` only when `origin` is exactly one of the strings in the `allowed` array. A missing origin, `"null"` or a look-alike must give `false`.',
      starter: [
        "function isAllowedOrigin(origin, allowed) {",
        '  return String(origin).includes("notes.app");',
        "}",
      ],
      tests: [
        ['isAllowedOrigin("https://notes.app", ["https://notes.app"])', "true"],
        [
          'isAllowedOrigin("https://evilnotes.app", ["https://notes.app"])',
          "false",
        ],
        [
          'isAllowedOrigin("https://notes.app.evil.example", ["https://notes.app"])',
          "false",
        ],
        ['isAllowedOrigin(undefined, ["https://notes.app"])', "false"],
        ['isAllowedOrigin("null", ["https://notes.app"])', "false"],
      ],
      hint: "Arrays have `includes`, which compares whole strings.",
      solution: [
        "function isAllowedOrigin(origin, allowed) {",
        "  return allowed.includes(origin);",
        "}",
      ],
    }),
    yourTurn({
      title: "Build the CORS headers",
      task: 'Write `corsHeaders(origin, allowed)`. For an allowed origin return `{ "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", Vary: "Origin" }`. For any other origin return `{}`.',
      starter: [
        "function corsHeaders(origin, allowed) {",
        '  return { "Access-Control-Allow-Origin": "*" };',
        "}",
      ],
      tests: [
        [
          'corsHeaders("https://notes.app", ["https://notes.app"])',
          '({ "Access-Control-Allow-Origin": "https://notes.app", "Access-Control-Allow-Credentials": "true", Vary: "Origin" })',
        ],
        ['corsHeaders("https://evil.app", ["https://notes.app"])', "({})"],
        [
          'corsHeaders("https://b.app", ["https://a.app", "https://b.app"])["Access-Control-Allow-Origin"]',
          '"https://b.app"',
        ],
      ],
      hint: "Return `{}` early when `allowed.includes(origin)` is false, then return the three headers.",
      solution: [
        "function corsHeaders(origin, allowed) {",
        "  if (!allowed.includes(origin)) return {};",
        "  return {",
        '    "Access-Control-Allow-Origin": origin,',
        '    "Access-Control-Allow-Credentials": "true",',
        '    Vary: "Origin",',
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "A tiny cors middleware",
      task: 'Write `makeCors(allowed)`, returning `(req, res, next)`. If `req.headers.origin` is allowed, call `res.setHeader` for `Access-Control-Allow-Origin` (the origin) and `Access-Control-Allow-Credentials` (`"true"`). Then, if `req.method` is `"OPTIONS"`, answer `res.status(204).end()`; otherwise call `next()`.',
      starter: [
        "function makeCors(allowed) {",
        "  return (req, res, next) => {",
        "    next();",
        "  };",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeRes} let called = false; makeCors(["https://notes.app"])({ method: "GET", headers: { origin: "https://notes.app" } }, res, () => { called = true; }); return [called, res.headers]; })()`,
          '[true, { "Access-Control-Allow-Origin": "https://notes.app", "Access-Control-Allow-Credentials": "true" }]',
        ],
        [
          `(() => { ${fakeRes} let called = false; makeCors(["https://notes.app"])({ method: "OPTIONS", headers: { origin: "https://notes.app" } }, res, () => { called = true; }); return [called, res.statusCode, res.ended]; })()`,
          "[false, 204, true]",
        ],
        [
          `(() => { ${fakeRes} let called = false; makeCors(["https://notes.app"])({ method: "GET", headers: { origin: "https://evil.app" } }, res, () => { called = true; }); return [called, res.headers]; })()`,
          "[true, {}]",
        ],
      ],
      hint: "Set the headers inside `if (allowed.includes(req.headers.origin))`. Check for OPTIONS after that, and `return` after `end()`.",
      solution: [
        "function makeCors(allowed) {",
        "  return (req, res, next) => {",
        "    const origin = req.headers.origin;",
        "    if (allowed.includes(origin)) {",
        '      res.setHeader("Access-Control-Allow-Origin", origin);',
        '      res.setHeader("Access-Control-Allow-Credentials", "true");',
        "    }",
        '    if (req.method === "OPTIONS") {',
        "      return res.status(204).end();",
        "    }",
        "    next();",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("CORS cheat sheet", [
      [
        "Same-origin rule",
        "Pages may send anywhere but only read their own origin.",
        "notes.app ≠ api.notes.app",
      ],
      [
        "CORS",
        "Headers that let named origins read answers.",
        "Access-Control-Allow-Origin",
      ],
      [
        "Not a shield",
        "curl and scripts ignore it; check logins anyway.",
        "requireAuth on every route",
      ],
      [
        "Same origin",
        "A proxy or one domain: no CORS at all.",
        'proxy: { "/api": … }',
      ],
      [
        "Credentialed request",
        "Cookies cross origins: exact origin, Allow-Credentials.",
        'credentials: "include"',
      ],
      ["Vary: Origin", "Caches keep one answer per origin.", "Vary: Origin"],
      [
        "cors middleware",
        "An allowlist, before the routes.",
        'cors({ origin: ["https://notes.app"] })',
      ],
      [
        "Preflight",
        "OPTIONS first for JSON, PUT, DELETE; 204 if allowed.",
        "Access-Control-Request-Method",
      ],
      [
        "Never",
        "Reflect any origin, endsWith checks, allow null.",
        "origin: true",
      ],
    ]),
    quickCheck(
      "Cookies must go from `https://notes.app` to `https://api.notes.app`. Which answer lets the page read the result?",
      [
        "Allow-Origin: * with Allow-Credentials: true",
        "Allow-Origin: https://notes.app with Allow-Credentials: true",
        "No CORS headers, since it's the same site",
      ],
      1,
      "With cookies the browser refuses `*`: the server must name the exact origin and send Allow-Credentials: true. A subdomain is a different origin, so CORS headers are needed.",
    ),
  ),
);
