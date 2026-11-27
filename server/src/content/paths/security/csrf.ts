import {
  anatomy,
  analogy,
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

// A fake res for the exercises: records the status and the body.
const fakeRes =
  "const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };";

// CSRF: a request you didn't send, a forged form taken apart, same site and
// SameSite cookies, will the browser send the cookie (step by step), never
// changing data on a GET, how the Notes App is protected, CSRF tokens,
// checking Origin, which defence when, mistakes, practice and a recap.
export const csrfModule = moduleLesson(
  "csrf",
  "CSRF: requests you didn't send",
  45,
  [
    "Explain how another site can make your browser send a request with your login cookie.",
    "Read a forged form and say which requests SameSite=Lax cookies stop.",
    "Keep GET requests free of changes, so links and images stay harmless.",
    "Describe how a CSRF token and an Origin check refuse forged requests.",
    "Say how the Notes App is protected, and what it would add if its cookies were cross-site.",
  ],

  part(
    "attack",
    "A request you didn't send",
    explain(
      "You're logged in to the Notes App, so your browser holds its login cookie. You open another tab, a page on evil.example. That page quietly submits a form to the Notes App. Your browser adds cookies to requests for a site, whoever started them, so the app sees your cookie and thinks you asked. That is [[csrf|CSRF]], cross-site request forgery.",
    ),
    diagram([
      ["evil.example", "a hidden form"],
      ["Your browser", "adds the notes cookie"],
      ["Notes App", "“it's you, done”"],
    ]),
    analogy(
      "Someone slips a filled-in cheque into your pile of letters to sign. Your signature is real; the request isn't yours.",
    ),
    keyPoints(
      "The attacker never sees your cookie. The browser sends it for them.",
      "They can't read the answer, but the change has already happened.",
      "Any request that changes data is a target: create, delete, log out.",
    ),
  ),

  part(
    "forged-form",
    "A forged form, taken apart",
    explain(
      "An [[html-form|HTML form]] may submit to any address, not just its own site's. A few lines of HTML on the attacker's page are enough. A line of script submits the form as soon as the page loads, so you never click anything. You'd only notice later, if at all.",
    ),
    anatomy(
      "The attacker's page on evil.example",
      [
        '<form method="POST" action=',
        '  "https://notes.example/api/notes">',
        '  <input name="title" value="Spam">',
        "</form>",
      ],
      [
        [
          'method="POST"',
          "a change",
          "Forms can send GET or POST to any site.",
        ],
        [
          "https://notes.example/api/notes",
          "your app",
          "The target is the real app, where you're logged in.",
        ],
        [
          'name="title"',
          "attacker's data",
          "They pick every field the request carries.",
        ],
        ["</form>", "no button", "A script submits it as the page loads."],
      ],
    ),
    code(
      "html",
      "The line that sends it",
      ["<script>", "  document.forms[0].submit();", "</script>"],
      { 2: "runs on load: no click needed" },
    ),
  ),

  part(
    "same-site",
    "Same site, and SameSite cookies",
    explain(
      "Two addresses are the [[same-site|same site]] when they share a registrable domain: `app.notes.example` and `api.notes.example` are, `evil.example` isn't. A cookie's `SameSite` [[cookie-attributes|attribute]] tells the browser when to leave it off requests that another site started. With `Lax`, it's left off cross-site POSTs, which kills the forged form.",
    ),
    reference("SameSite values", [
      [
        "Strict",
        "Never sent on requests other sites start, not even links.",
        "SameSite=Strict",
      ],
      [
        "Lax",
        "Sent only when you follow a link (a top-level GET).",
        "SameSite=Lax",
      ],
      [
        "None",
        "Always sent. Needs Secure, and a CSRF token.",
        "SameSite=None; Secure",
      ],
    ]),
    code("http", "The Notes App's login cookie", [
      "Set-Cookie: token=eyJhbGci…; HttpOnly;",
      "  SameSite=Lax; Secure; Max-Age=604800",
    ]),
  ),

  part(
    "step-by-step",
    "Will the browser send the cookie?",
    explain(
      "This function models the browser's choice for one cookie. `from` is the site that started the request. Follow the forged POST from evil.example, then a plain link from the same page. The cookie is the Notes App's, with `SameSite=Lax`.",
    ),
    trace(
      "A forged POST, then a link",
      [
        "function sendsCookie(c, req) {",
        "  if (req.from === c.site) return true;",
        '  if (c.sameSite === "None") return true;',
        '  if (c.sameSite === "Strict") return false;',
        '  return req.method === "GET" &&',
        "    req.topLevel; // Lax",
        "}",
        'const token = { site: "notes.example",',
        '  sameSite: "Lax" };',
        'const post = { from: "evil.example",',
        '  method: "POST", topLevel: true };',
        "const a = sendsCookie(token, post);",
        'const link = { from: "evil.example",',
        '  method: "GET", topLevel: true };',
        "const b = sendsCookie(token, link);",
      ],
      [
        {
          line: 12,
          note: "The forged form's request, started by evil.example.",
          vars: [
            ["sendsCookie", "\u0192 sendsCookie(c, req)"],
            ["token", '{ site: "notes.example", sameSite: "Lax" }'],
            [
              "post",
              '{ from: "evil.example", method: "POST", topLevel: true }',
            ],
          ],
        },
        {
          line: 2,
          note: "evil.example is not notes.example: a cross-site request.",
          vars: [
            ["c", '{ site: "notes.example", sameSite: "Lax" }'],
            ["req", '{ from: "evil.example", method: "POST", topLevel: true }'],
          ],
          stack: ["sendsCookie"],
        },
        {
          line: 4,
          note: "The cookie is Lax, not None or Strict, so the method decides.",
          vars: [
            ["c", '{ site: "notes.example", sameSite: "Lax" }'],
            ["req", '{ from: "evil.example", method: "POST", topLevel: true }'],
          ],
          stack: ["sendsCookie"],
        },
        {
          line: 5,
          note: "Lax only allows a top-level GET. This is a POST, so the cookie stays home.",
          vars: [
            ["c", '{ site: "notes.example", sameSite: "Lax" }'],
            ["req", '{ from: "evil.example", method: "POST", topLevel: true }'],
          ],
          stack: ["sendsCookie"],
        },
        {
          line: 13,
          note: "No cookie: the Notes App sees nobody and answers 401. Now a plain link on the same evil page.",
          vars: [
            ["sendsCookie", "\u0192 sendsCookie(c, req)"],
            ["token", '{ site: "notes.example", sameSite: "Lax" }'],
            [
              "post",
              '{ from: "evil.example", method: "POST", topLevel: true }',
            ],
            ["a", "false"],
          ],
        },
        {
          line: 5,
          note: "Following a link is a top-level GET, so Lax sends the cookie.",
          vars: [
            ["c", '{ site: "notes.example", sameSite: "Lax" }'],
            ["req", '{ from: "evil.example", method: "GET", topLevel: true }'],
          ],
          stack: ["sendsCookie"],
        },
        {
          line: 15,
          note: "The cookie goes with links. Harmless, as long as a GET only reads.",
          vars: [
            ["sendsCookie", "\u0192 sendsCookie(c, req)"],
            ["token", '{ site: "notes.example", sameSite: "Lax" }'],
            [
              "post",
              '{ from: "evil.example", method: "POST", topLevel: true }',
            ],
            ["a", "false"],
            ["link", '{ from: "evil.example", method: "GET", topLevel: true }'],
            ["b", "true"],
          ],
        },
      ],
    ),
    keyPoints(
      "Lax stops forged POST, PUT and DELETE from other sites.",
      "Lax still sends the cookie when you follow a link: a GET.",
      "So a GET must never change anything.",
    ),
  ),

  part(
    "safe-get",
    "Never change data on a GET",
    explain(
      "`Lax` lets the cookie ride along on links, because following a link should only ever read. That's the promise of a [[safe-method|safe method]]. Break it with a route like `GET /api/notes/8/delete`, and any link or image on any site can delete your notes. Every Notes App route that changes data uses POST, PUT or DELETE, including logout.",
    ),
    mistake({
      title: "A GET that deletes",
      wrong: ['notesRoutes.get("/:id/delete",', "  deleteNote);"],
      problem:
        'Any page can add <img src="https://notes.example/api/notes/8/delete">, and the Lax cookie goes with it.',
      right: ['notesRoutes.delete("/:id",', "  deleteNote);"],
      why: "Lax only sends the cookie on top-level GETs, so changes behind DELETE are out of reach of other sites.",
    }),
  ),

  part(
    "notes-app",
    "How the Notes App is protected",
    explain(
      "The Notes App has no CSRF tokens and no Origin check. It relies on two things: its login cookie is `SameSite=Lax`, and no GET changes data. In development the Vite proxy puts the page and the API on one origin, so the cookie never needs to be cross-site. A third thing helps by accident: it only reads JSON bodies, and a plain form can't send JSON.",
    ),
    code(
      "js",
      "authController.js: the cookie options",
      [
        "const cookieOptions = {",
        "  httpOnly: true,",
        '  sameSite: "lax",',
        "  secure: process.env.NODE_ENV ===",
        '    "production",',
        "};",
      ],
      {
        2: "scripts can't read it",
        3: "left off cross-site POSTs",
        4: "HTTPS only, in production",
      },
    ),
    inTheNotesApp(
      "cookieOptions: “Other websites can't make the browser send it with their requests.” The [[secure-cookies|cookie attributes]] are set once and used by login and logout.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
    keyPoints(
      "express.json() ignores a form's body, so validation answers 400.",
      "Sending JSON from another site needs the server's CORS permission first.",
      "Useful, but an accident: don't count it as your defence.",
    ),
  ),

  part(
    "tokens",
    "CSRF tokens",
    explain(
      "Sometimes SameSite isn't enough: the front end lives on another site and needs `SameSite=None`, or an attacker controls a page on a sibling subdomain, which counts as the same site. Then add a [[csrf-token|CSRF token]]: a random value the server gives its own page and requires on every change. A forged form can't read it, so it can't send it.",
    ),
    code(
      "js",
      "A token check (not in the Notes App)",
      [
        "const SAFE = ['GET', 'HEAD', 'OPTIONS'];",
        "function requireCsrf(req, res, next) {",
        "  if (SAFE.includes(req.method))",
        "    return next();",
        '  const sent = req.get("X-CSRF-Token");',
        "  if (!sent || sent !== req.session.csrf)",
        "    return res.status(403)",
        '      .json({ error: "Bad CSRF token" });',
        "  next();",
        "}",
      ],
      {
        3: "reads are left alone",
        5: "the page's JavaScript adds this header",
        6: "must match the one the server issued",
        7: "403: we know you, the request is refused",
      },
    ),
    code(
      "js",
      "The front end sends it on every change",
      [
        "headers: {",
        '  "Content-Type": "application/json",',
        '  "X-CSRF-Token": csrfToken,',
        "},",
      ],
      { 3: "fetched once from the API, kept in memory" },
    ),
  ),

  part(
    "origin",
    "Checking Origin",
    explain(
      "A lighter extra defence is an [[origin-check|Origin check]]. Browsers add an `Origin` header to cross-site POSTs, naming the page that sent them, and a page can't change it. The server refuses any change whose Origin isn't one of its own. A request with no Origin usually comes from a tool like curl, which has no victim's cookie to abuse.",
    ),
    code(
      "http",
      "The forged request, as the server sees it",
      [
        "POST /api/notes HTTP/1.1",
        "Host: notes.example",
        "Origin: https://evil.example",
        "Content-Type: application/x-www-form-…",
        "",
        "title=Spam",
      ],
      {
        3: "set by the browser, not the page",
        4: "a form's encoding, not JSON",
      },
    ),
    quickCheck(
      "A POST arrives with `Origin: https://evil.example`. The app's own origin is https://notes.example. What should an Origin check do?",
      [
        "Allow it: the cookie is valid",
        "Refuse it with 403",
        "Redirect to the login page",
      ],
      1,
      "A valid cookie is exactly what CSRF abuses. The Origin names who started the request, and evil.example isn't on the list, so the change is refused.",
    ),
  ),

  part(
    "layers",
    "Which defence, when",
    explain(
      "Defences stack. Most apps need the first two, and add more when their cookies must be cross-site. One thing beats all of them: an [[xss|XSS]] bug runs script on your own page, which can read the token and send same-site requests. Stopping XSS comes first.",
    ),
    reference("CSRF defences", [
      [
        "SameSite=Lax cookie",
        "Other sites' POST, PUT and DELETE go without it.",
        'sameSite: "lax"',
      ],
      [
        "No changes on GET",
        "Links and images stay harmless.",
        "DELETE /api/notes/8",
      ],
      [
        "Origin check",
        "Refuse changes from origins not on your list.",
        "Origin: https://notes.example",
      ],
      [
        "CSRF token",
        "Needed with SameSite=None or untrusted subdomains.",
        "X-CSRF-Token: 9f2c…",
      ],
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "SameSite=None with no token",
      wrong: [
        'res.cookie("token", jwt, {',
        '  httpOnly: true, sameSite: "none",',
        "  secure: true });",
      ],
      problem:
        "The cookie now goes with every cross-site request, so a forged form works again.",
      right: [
        'res.cookie("token", jwt, {',
        '  httpOnly: true, sameSite: "lax",',
        "  secure: true });",
      ],
      why: "Keep Lax whenever the page and API share a site. If you truly need None, add a CSRF token check.",
    }),
    mistake({
      title: "Checking the token from a cookie",
      wrong: [
        "const sent = req.cookies.csrf;",
        "if (sent !== req.session.csrf) …",
      ],
      problem:
        "Cookies are sent automatically, so a forged request carries the right token too.",
      right: [
        'const sent = req.get("X-CSRF-Token");',
        "if (sent !== req.session.csrf) …",
      ],
      why: "The token must arrive in something only your page can add: a header or a form field it filled in.",
    }),
    mistake({
      title: "Thinking CORS stops CSRF",
      wrong: [
        "// no cors() middleware, so other",
        "// sites can't reach the API",
      ],
      problem:
        "CORS only decides whether another site's script may read the answer. A plain form is still sent, and the change still happens.",
      right: [
        "// SameSite=Lax cookie, no changes",
        "// on GET, and an Origin check",
      ],
      why: "CORS protects responses from being read. CSRF defences stop the request from counting.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "An Origin check",
      task: "Write `originAllowed(req, allowed)`. `req` has `method` and `headers`. GET, HEAD and OPTIONS are always allowed. For anything else, a missing `headers.origin` is allowed, and otherwise the origin must be in the `allowed` array. Return `true` or `false`.",
      starter: [
        "function originAllowed(req, allowed) {",
        "  return true;",
        "}",
      ],
      tests: [
        [
          'originAllowed({ method: "POST", headers: { origin: "https://evil.example" } }, ["https://notes.example"])',
          "false",
        ],
        [
          'originAllowed({ method: "POST", headers: { origin: "https://notes.example" } }, ["https://notes.example"])',
          "true",
        ],
        [
          'originAllowed({ method: "GET", headers: { origin: "https://evil.example" } }, ["https://notes.example"])',
          "true",
        ],
        [
          'originAllowed({ method: "DELETE", headers: {} }, ["https://notes.example"])',
          "true",
        ],
      ],
      hint: "Return true early for safe methods and for no origin, then `allowed.includes(origin)`.",
      solution: [
        "const SAFE = ['GET', 'HEAD', 'OPTIONS'];",
        "function originAllowed(req, allowed) {",
        "  if (SAFE.includes(req.method)) return true;",
        "  const origin = req.headers.origin;",
        "  if (!origin) return true;",
        "  return allowed.includes(origin);",
        "}",
      ],
    }),
    yourTurn({
      title: "A CSRF token middleware",
      task: 'Write `requireCsrf(req, res, next)`. For GET, call `next()`. For other methods, `req.headers["x-csrf-token"]` must be non-empty and equal `req.session.csrf`: then call `next()`. Otherwise answer `res.status(403).json({ error: "Bad CSRF token" })`.',
      starter: ["function requireCsrf(req, res, next) {", "  next();", "}"],
      tests: [
        [
          `(() => { ${fakeRes} let called = false; requireCsrf({ method: "POST", headers: { "x-csrf-token": "9f2c" }, session: { csrf: "9f2c" } }, res, () => { called = true; }); return called; })()`,
          "true",
        ],
        [
          `(() => { ${fakeRes} let called = false; requireCsrf({ method: "POST", headers: {}, session: { csrf: "9f2c" } }, res, () => { called = true; }); return [called, res.statusCode, res.body]; })()`,
          '[false, 403, { error: "Bad CSRF token" }]',
        ],
        [
          `(() => { ${fakeRes} let called = false; requireCsrf({ method: "DELETE", headers: { "x-csrf-token": "guess" }, session: { csrf: "9f2c" } }, res, () => { called = true; }); return [called, res.statusCode]; })()`,
          "[false, 403]",
        ],
        [
          `(() => { ${fakeRes} let called = false; requireCsrf({ method: "GET", headers: {}, session: {} }, res, () => { called = true; }); return called; })()`,
          "true",
        ],
      ],
      hint: "Read the header into `sent`, then refuse when `!sent || sent !== req.session.csrf`.",
      solution: [
        "function requireCsrf(req, res, next) {",
        '  if (req.method === "GET") return next();',
        '  const sent = req.headers["x-csrf-token"];',
        "  if (!sent || sent !== req.session.csrf) {",
        "    return res.status(403)",
        '      .json({ error: "Bad CSRF token" });',
        "  }",
        "  next();",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("CSRF cheat sheet", [
      [
        "CSRF",
        "Another site makes your browser send a request with your cookie.",
        "a hidden form on evil.example",
      ],
      [
        "Same site",
        "Same registrable domain; subdomains count.",
        "app.notes.example, api.notes.example",
      ],
      [
        "SameSite=Lax",
        "Cookie left off other sites' POST, PUT, DELETE.",
        'sameSite: "lax"',
      ],
      [
        "Safe GET",
        "A GET only reads, so links are harmless.",
        "DELETE /api/notes/8, not GET …/delete",
      ],
      [
        "CSRF token",
        "A random value only your page can send.",
        "X-CSRF-Token: 9f2c…",
      ],
      [
        "Origin check",
        "Refuse changes from other origins.",
        "Origin: https://evil.example → 403",
      ],
      ["Not CORS", "CORS guards reading answers, not sending requests."],
      ["Notes App", "Lax cookie, no changes on GET, one origin. No tokens."],
    ]),
    quickCheck(
      "The Notes App's cookie is SameSite=Lax. Which request from evil.example arrives with the login cookie?",
      [
        "A hidden form that POSTs a note",
        "A link the user clicks to /api/notes",
        "A script calling fetch with DELETE",
      ],
      1,
      "Lax sends the cookie only on top-level GETs like following a link. That's harmless because the Notes App's GETs only read; the POST and DELETE go without the cookie and get 401.",
    ),
  ),
);
