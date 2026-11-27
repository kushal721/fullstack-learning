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

// A fake res for the middleware exercise: records headers it sets and removes.
const fakeRes =
  'const res = { headers: { "X-Powered-By": "Express" }, setHeader(k, v) { this.headers[k] = v; }, removeHeader(k) { delete this.headers[k]; } };';

// Security headers: headers that switch on browser protections, four of them
// taken apart, Content Security Policy, building a CSP step by step, HTTPS
// and HSTS, nosniff, clickjacking, helmet, checking your headers, mistakes,
// practice and a recap.
export const securityHeadersModule = moduleLesson(
  "security-headers",
  "Security headers",
  40,
  [
    "Explain how response headers switch on browser protections, and read the main ones.",
    "Write a Content Security Policy, and say why it backs up escaping rather than replacing it.",
    "Keep a site on HTTPS with HSTS, and stop type guessing with nosniff.",
    "Stop clickjacking with frame-ancestors or X-Frame-Options.",
    "Add helmet to an Express app, and check the headers with curl or DevTools.",
  ],

  part(
    "what-they-are",
    "Headers that switch on protections",
    explain(
      "Browsers have protections that stay off until a site asks for them. [[security-headers|Security headers]] are how it asks: a few lines on every response saying which scripts may run, to use HTTPS only, not to guess file types and not to be shown inside another site's frame. They cost nothing and close whole kinds of attack.",
    ),
    code(
      "http",
      "An answer with security headers",
      [
        "HTTP/1.1 200 OK",
        "Content-Type: text/html",
        "Content-Security-Policy: default-src 'self'",
        "Strict-Transport-Security: max-age=31536000",
        "X-Content-Type-Options: nosniff",
        "X-Frame-Options: DENY",
      ],
      {
        3: "which files may load",
        4: "HTTPS only, for a year",
        5: "trust Content-Type",
        6: "never inside a frame",
      },
    ),
    inTheNotesApp(
      "app.js sets no security headers: no helmet, no CSP. Express even adds `X-Powered-By: Express`. This step shows what it would add.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "anatomy",
    "Four headers, taken apart",
    explain(
      "Each header switches on one protection. Read them as instructions to the browser, not to the server: the server only sends them, and the browser does the blocking.",
    ),
    anatomy(
      "Four common security headers",
      [
        "Content-Security-Policy: script-src 'self'",
        "Strict-Transport-Security: max-age=31536000",
        "X-Content-Type-Options: nosniff",
        "X-Frame-Options: DENY",
      ],
      [
        [
          "script-src 'self'",
          "scripts from here only",
          "Inline scripts and other sites' scripts are blocked.",
        ],
        [
          "max-age=31536000",
          "HTTPS for a year",
          "Seconds. The browser won't use plain HTTP for this site again.",
        ],
        [
          "nosniff",
          "no guessing",
          "The Content-Type decides what a file is, not its contents.",
        ],
        ["DENY", "no framing", "No site may show this page inside an iframe."],
      ],
    ),
  ),

  part(
    "csp",
    "Content Security Policy",
    explain(
      "A [[content-security-policy|Content Security Policy]] lists where a page may load scripts, styles, images and more from. `script-src 'self'` allows scripts only from your own origin, so an injected `<script>` or `onerror=` attribute won't run. It's a second layer against [[xss|XSS]]: escaping output still comes first, CSP catches what slips through.",
    ),
    code(
      "html",
      "An injected note title, with script-src 'self'",
      [
        "<h2>",
        '  <img src="x" onerror="steal()">',
        "</h2>",
        '<script src="/assets/app.js"></script>',
      ],
      {
        2: "inline handler: blocked by CSP",
        4: "your own file: allowed",
      },
    ),
    reference("Common directives", [
      ["default-src", "The fallback for every kind of file.", "'self'"],
      ["script-src", "Where scripts may come from.", "'self'"],
      ["style-src", "Where styles may come from.", "'self'"],
      ["img-src", "Where images may come from.", "'self' data:"],
      ["frame-ancestors", "Who may frame this page.", "'none'"],
    ]),
    quickCheck(
      "A page sends `Content-Security-Policy: script-src 'self'`. Which script runs?",
      [
        "<script>alert(1)</script> in a note",
        '<script src="/assets/app.js">',
        '<script src="https://evil.example/x.js">',
      ],
      1,
      "'self' allows only files from the page's own origin. Inline scripts and scripts from other sites are blocked, which is what makes CSP useful against XSS.",
    ),
  ),

  part(
    "step-by-step",
    "Building a policy, step by step",
    explain(
      "A policy is a list of directives separated by `;`, each a name and its sources. Writing it as an object and joining it keeps it readable as it grows. Watch the string build up.",
    ),
    trace(
      "Turning an object into a CSP header",
      [
        "const policy = {",
        '  "default-src": "\'self\'",',
        '  "frame-ancestors": "\'none\'",',
        "};",
        "function buildCsp(policy) {",
        "  const parts = [];",
        "  for (const name in policy) {",
        '    parts.push(name + " " + policy[name]);',
        "  }",
        '  return parts.join("; ");',
        "}",
        "const header = buildCsp(policy);",
      ],
      [
        {
          line: 12,
          note: "Two directives: load everything from our own origin, and never be framed.",
          vars: [["policy", "{ default-src, frame-ancestors }"]],
        },
        {
          line: 6,
          note: "Collect one string per directive.",
          vars: [
            ["policy", "{ default-src, frame-ancestors }"],
            ["parts", "[]"],
          ],
          stack: ["buildCsp"],
        },
        {
          line: 8,
          note: "First directive: its name, a space, its sources.",
          vars: [
            ["policy", "{ default-src, frame-ancestors }"],
            ["parts", "[\"default-src 'self'\"]"],
            ["name", '"default-src"'],
          ],
          stack: ["buildCsp"],
        },
        {
          line: 8,
          note: "Second directive.",
          vars: [
            ["policy", "{ default-src, frame-ancestors }"],
            ["parts", "[\"default-src 'self'\", \"frame-ancestors 'none'\"]"],
            ["name", '"frame-ancestors"'],
          ],
          stack: ["buildCsp"],
        },
        {
          line: 10,
          note: "Join with a semicolon and a space.",
          vars: [
            ["policy", "{ default-src, frame-ancestors }"],
            ["parts", "[\"default-src 'self'\", \"frame-ancestors 'none'\"]"],
          ],
          stack: ["buildCsp"],
        },
        {
          line: 12,
          note: "The header's value, ready for res.setHeader.",
          vars: [
            ["policy", "{ default-src, frame-ancestors }"],
            ["header", "\"default-src 'self'; frame-ancestors 'none'\""],
          ],
        },
      ],
    ),
  ),

  part(
    "https",
    "HTTPS everywhere: HSTS",
    explain(
      "[[https|HTTPS]] keeps requests private and unchanged, and you saw in How the Web Works how [[hsts|HSTS]] keeps a site on it. `Strict-Transport-Security: max-age=31536000` tells the browser: for a year, never use plain HTTP here, even if someone types `http://`. Browsers ignore it on plain HTTP, so it only takes effect once the site is already on HTTPS.",
    ),
    keyPoints(
      "Redirect http:// to https://, then send HSTS.",
      "max-age is in seconds: 31536000 is a year.",
      "includeSubDomains covers every subdomain: be sure they all use HTTPS.",
      "The Notes App's cookie is Secure in production, so it needs HTTPS too.",
    ),
    inTheNotesApp(
      "authController.js sets `secure: true` on the login cookie in production, so the cookie is only sent over HTTPS. HSTS would make sure every visit is.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "nosniff",
    "nosniff: no guessing file types",
    explain(
      "Browsers used to guess a file's type from its contents, ignoring `Content-Type`. Then a file someone uploaded as text could be loaded as a script if it looked like JavaScript. [[nosniff|`X-Content-Type-Options: nosniff`]] stops the guessing: a `<script>` loads only if the server said it's JavaScript. Always send the right `Content-Type`, and this header.",
    ),
    code(
      "http",
      "An upload that looks like code",
      [
        "GET /uploads/notes.txt HTTP/1.1",
        "",
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        "X-Content-Type-Options: nosniff",
        "",
        "fetch('/api/notes').then(…)",
      ],
      {
        4: "the server says: plain text",
        5: "so <script src> refuses to run it",
        7: "it looks like JavaScript",
      },
    ),
  ),

  part(
    "clickjacking",
    "Clickjacking: refusing frames",
    explain(
      "In [[clickjacking]], another site loads your page in an invisible `<iframe>` and puts its own button on top. You think you're clicking “Win a prize”, but you're clicking “Delete” on a note in the real, logged-in app. The fix is to refuse to be framed: `frame-ancestors 'none'` in the CSP, or the older `X-Frame-Options: DENY` for old browsers.",
    ),
    diagram([
      ["evil.example", "“Win a prize!” button"],
      ["Invisible iframe", "your app, logged in"],
      ["The click", "lands on Delete"],
    ]),
    code(
      "html",
      "The attacker's page",
      [
        "<button>Win a prize!</button>",
        '<iframe src="https://notes.app"',
        '  style="opacity: 0; position: absolute;',
        '  top: 0; left: 0"></iframe>',
      ],
      {
        2: "your real page",
        3: "invisible, lying over the button",
      },
    ),
    inTheNotesApp(
      "The Notes App's login cookie is `SameSite=Lax`, so it isn't sent inside another site's frame, and the framed app shows the login page. That helps, but frame-ancestors protects every page.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "helmet",
    "helmet: all of them in one line",
    explain(
      "[[helmet]] is an Express middleware that sets a dozen security headers with safe defaults: a CSP, HSTS, nosniff, frame protection, and it removes `X-Powered-By`. Add it first in `createApp`, so every answer gets the headers, even errors. Adjust its options when your app needs something it blocks. The Notes App doesn't use it; this is how it would look.",
    ),
    code(
      "js",
      "app.js with helmet (not in the Notes App)",
      [
        'import helmet from "helmet";',
        "",
        "const app = express();",
        "app.use(helmet());",
        "app.use(express.json());",
        "app.use(cookieParser());",
      ],
      {
        4: "first: every answer gets the headers",
      },
    ),
    code(
      "js",
      "Changing one directive",
      [
        "app.use(helmet({",
        "  contentSecurityPolicy: {",
        "    directives: {",
        '      "img-src": ["\'self\'", "data:"],',
        "    },",
        "  },",
        "}));",
      ],
      { 4: "the other defaults stay as they are" },
    ),
    keyPoints(
      "CSP and frame rules matter most on the HTML page.",
      "Whoever serves index.html must send them too.",
      "The API's answers are JSON, but nosniff and HSTS still help.",
    ),
  ),

  part(
    "checking",
    "Checking your headers",
    explain(
      "Look before you trust it: `curl -I` prints only the headers, and DevTools' Network tab shows them for every request. A strict CSP can break your own page, so roll it out with `Content-Security-Policy-Report-Only` first: the browser reports what it *would* block in the console, without blocking anything.",
    ),
    code(
      "bash",
      "Just the headers",
      [
        "curl -I https://notes.app",
        "",
        "# or only the security ones",
        "curl -sI https://notes.app \\",
        "  | grep -i -E 'content-security|strict|x-'",
      ],
      {
        1: "-I: ask with HEAD, print headers",
        5: "filter to the ones you care about",
      },
    ),
    quickCheck(
      "You add a strict CSP and want to see what it would break before switching it on. Which header?",
      [
        "Content-Security-Policy",
        "Content-Security-Policy-Report-Only",
        "X-Content-Type-Options",
      ],
      1,
      "Report-Only applies the same policy but only reports problems in the console. When nothing important is reported, rename it to Content-Security-Policy to enforce it.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Allowing inline scripts",
      language: "http",
      wrong: [
        "Content-Security-Policy: script-src 'self'",
        "  'unsafe-inline'",
      ],
      problem:
        "'unsafe-inline' lets injected `<script>` tags and onerror= attributes run again, so CSP no longer stops XSS.",
      right: ["Content-Security-Policy: script-src 'self'"],
      why: "Move inline code into .js files. Vite's build already does that for a React app.",
    }),
    mistake({
      title: "helmet after the routes",
      wrong: ['app.use("/api/notes", notesRoutes);', "app.use(helmet());"],
      problem:
        "The routes answer before helmet runs, so their answers have no security headers.",
      right: ["app.use(helmet());", 'app.use("/api/notes", notesRoutes);'],
      why: "Middleware runs in order. Headers must be set before something answers.",
    }),
    mistake({
      title: "Relying on CSP instead of escaping",
      language: "jsx",
      wrong: [
        "// CSP will block anything bad",
        "<div dangerouslySetInnerHTML={{",
        "  __html: note.title }} />",
      ],
      problem:
        "CSP can be loosened, missing on some pages, or unsupported, and HTML injection can do harm without scripts.",
      right: ["<h2>{note.title}</h2>"],
      why: "Escape first, as React's {} does. CSP is the second layer, not the first.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build a CSP header",
      task: 'Write `buildCsp(policy)`. `policy` maps directive names to arrays of sources. Return `"name src1 src2; name2 src"`: each directive as its name and its sources joined with spaces, directives joined with `"; "`.',
      starter: [
        "function buildCsp(policy) {",
        '  return Object.keys(policy).join("; ");',
        "}",
      ],
      tests: [
        ['buildCsp({ "default-src": ["\'self\'"] })', "\"default-src 'self'\""],
        [
          'buildCsp({ "default-src": ["\'self\'"], "img-src": ["\'self\'", "data:"] })',
          "\"default-src 'self'; img-src 'self' data:\"",
        ],
        [
          'buildCsp({ "frame-ancestors": ["\'none\'"], "script-src": ["\'self\'"] })',
          "\"frame-ancestors 'none'; script-src 'self'\"",
        ],
      ],
      hint: '`Object.entries(policy).map(([name, srcs]) => name + " " + srcs.join(" "))`, then join with `"; "`.',
      solution: [
        "function buildCsp(policy) {",
        "  return Object.entries(policy)",
        '    .map(([name, srcs]) => name + " " + srcs.join(" "))',
        '    .join("; ");',
        "}",
      ],
    }),
    yourTurn({
      title: "A tiny helmet",
      task: 'Write `securityHeaders(req, res, next)`. Set `X-Content-Type-Options` to `"nosniff"`, `X-Frame-Options` to `"DENY"` and `Content-Security-Policy` to `"default-src \'self\'"` with `res.setHeader`, remove `X-Powered-By` with `res.removeHeader`, then call `next()`.',
      starter: [
        "function securityHeaders(req, res, next) {",
        '  res.setHeader("X-Frame-Options", "DENY");',
        "  next();",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeRes} let called = false; securityHeaders({}, res, () => { called = true; }); return called; })()`,
          "true",
        ],
        [
          `(() => { ${fakeRes} securityHeaders({}, res, () => {}); return res.headers; })()`,
          '({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src \'self\'" })',
        ],
      ],
      hint: 'Three `setHeader` calls, one `removeHeader("X-Powered-By")`, then `next()`.',
      solution: [
        "function securityHeaders(req, res, next) {",
        '  res.setHeader("X-Content-Type-Options", "nosniff");',
        '  res.setHeader("X-Frame-Options", "DENY");',
        "  res.setHeader(",
        '    "Content-Security-Policy",',
        "    \"default-src 'self'\",",
        "  );",
        '  res.removeHeader("X-Powered-By");',
        "  next();",
        "}",
      ],
    }),
    yourTurn({
      title: "Which headers are missing?",
      task: "Write `missingHeaders(headers)`. `headers` has lower-case names, like Node gives you. Return, in this order, the ones missing from: `content-security-policy`, `strict-transport-security`, `x-content-type-options`.",
      starter: ["function missingHeaders(headers) {", "  return [];", "}"],
      tests: [
        [
          'missingHeaders({ "content-type": "text/html" })',
          '["content-security-policy", "strict-transport-security", "x-content-type-options"]',
        ],
        [
          'missingHeaders({ "content-security-policy": "default-src \'self\'", "x-content-type-options": "nosniff" })',
          '["strict-transport-security"]',
        ],
        [
          'missingHeaders({ "content-security-policy": "a", "strict-transport-security": "b", "x-content-type-options": "c" })',
          "[]",
        ],
      ],
      hint: "Keep the three names in an array and `filter` the ones where `!(name in headers)`.",
      solution: [
        "const required = [",
        '  "content-security-policy",',
        '  "strict-transport-security",',
        '  "x-content-type-options",',
        "];",
        "function missingHeaders(headers) {",
        "  return required.filter((h) => !(h in headers));",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Security headers cheat sheet", [
      [
        "Security headers",
        "Switch on browser protections; the browser enforces them.",
        "sent on every response",
      ],
      [
        "Content-Security-Policy",
        "Where files may load from; blocks inline scripts.",
        "default-src 'self'",
      ],
      [
        "CSP and XSS",
        "A second layer. Escaping output comes first.",
        "{note.title}, plus CSP",
      ],
      [
        "Report-Only",
        "Test a policy without blocking anything.",
        "Content-Security-Policy-Report-Only",
      ],
      ["HSTS", "HTTPS only, for max-age seconds.", "max-age=31536000"],
      [
        "nosniff",
        "Trust Content-Type; never guess.",
        "X-Content-Type-Options: nosniff",
      ],
      ["Clickjacking", "Refuse to be framed.", "frame-ancestors 'none'"],
      [
        "X-Frame-Options",
        "The older way to refuse frames.",
        "X-Frame-Options: DENY",
      ],
      [
        "helmet",
        "All of these with safe defaults, first in the app.",
        "app.use(helmet())",
      ],
      ["Check", "Look at what's really sent.", "curl -I https://notes.app"],
    ]),
    quickCheck(
      "A site wants to stop other sites showing it in an invisible iframe. Which header does that?",
      [
        "X-Content-Type-Options: nosniff",
        "Content-Security-Policy: frame-ancestors 'none'",
        "Strict-Transport-Security: max-age=31536000",
      ],
      1,
      "frame-ancestors says who may frame the page; 'none' means nobody, which stops clickjacking. nosniff is about file types and HSTS about HTTPS.",
    ),
  ),
);
