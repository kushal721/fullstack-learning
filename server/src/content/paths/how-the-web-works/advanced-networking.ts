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

// Advanced networking. The TLS handshake in depth, HTTP/1.1 to HTTP/3,
// origins, CORS, a CORS request step by step, load balancers, proxies,
// WebSockets, the Notes App, mistakes, practice and a recap.
export const advancedNetworkingModule = moduleLesson(
  "advanced-networking",
  "Advanced networking",
  50,
  [
    "Explain the TLS handshake: the certificate chain and the agreed key.",
    "Compare HTTP/1.1, HTTP/2 and HTTP/3, and say what each fixed.",
    "Decide whether two URLs share an origin, and read a CORS exchange.",
    "Explain what load balancers and reverse proxies do in front of an app.",
    "Say when a WebSocket fits better than ordinary requests.",
  ],

  part(
    "tls-handshake",
    "The TLS handshake, closer",
    explain(
      "In the [[tls]] handshake the server sends its [[certificate]] plus the CA certificates that vouch for it: a **chain** ending at a root the browser already trusts. Meanwhile both sides swap key material and each works out the same secret key, never sent. TLS 1.3 does all this in one round trip; TLS 1.2 needed two.",
    ),
    diagram([
      ["notes.app", "signed by ↓"],
      ["Intermediate CA", "signed by ↓"],
      ["Root CA", "built into the browser"],
    ]),
    quickCheck(
      "How does the browser trust a certificate signed by a CA it has never heard of?",
      [
        "It doesn't need to trust it",
        "That CA's own certificate is signed by a root the browser trusts: a chain",
        "It asks the user",
      ],
      1,
      "Trust flows down the chain from a root the browser ships with. A break anywhere in it fails the handshake.",
    ),
  ),

  part(
    "http-versions",
    "HTTP/1.1, HTTP/2, HTTP/3",
    explain(
      "The messages haven't changed in meaning, only how they travel. HTTP/1.1 sends one request at a time per connection, so browsers open about six. [[http2|HTTP/2]] sends many at once over one connection, with compressed headers. HTTP/3 runs on QUIC over [[udp]], so one lost packet only holds up its own request.",
    ),
    reference("HTTP versions", [
      ["HTTP/1.1", "One at a time per connection; ~6 per site.", "1997"],
      ["HTTP/2", "Many at once on one TCP connection.", "2015"],
      ["HTTP/3", "Many at once on QUIC (UDP); TLS built in.", "2022"],
      [
        "Your code",
        "Unchanged: browser and server agree.",
        "fetch() is fetch()",
      ],
    ]),
    keyPoints(
      "HTTP/2: a lost TCP packet still stalls every request on the connection.",
      "HTTP/3: each request is its own stream; a loss stalls only that one.",
      "Check the Protocol column in DevTools' Network tab: h2, h3.",
    ),
  ),

  part(
    "origins",
    "Origins",
    explain(
      "An [[origin]] is a URL's scheme, host and port together. The browser keeps origins apart: a page can *send* requests anywhere, but by default its scripts can only *read* responses from its own origin. That stops a page you visit from reading your email at another site with your cookies.",
    ),
    anatomy(
      "One origin",
      ["https://notes.app:443"],
      [
        ["https", "scheme", "http and https are different origins."],
        ["notes.app", "host", "api.notes.app is a different one."],
        ["443", "port", "Implied for https; :8443 would differ."],
      ],
    ),
    reference("Same origin as https://notes.app?", [
      ["https://notes.app/api/notes", "Same: only the path differs.", "same"],
      ["http://notes.app", "Different scheme.", "different"],
      ["https://api.notes.app", "Different host.", "different"],
      ["https://notes.app:8443", "Different port.", "different"],
    ]),
  ),

  part(
    "cors",
    "CORS: letting another origin in",
    explain(
      "Sometimes you *want* another origin to read your API: the app at `app.example` calling `api.example`. [[cors-basics|CORS]] (Cross-Origin Resource Sharing) lets the server say so with `Access-Control-Allow-…` headers. For anything beyond a plain GET or form post, like JSON, the browser first sends a [[cors-preflight|preflight]] `OPTIONS` request to ask.",
    ),
    reference("CORS response headers", [
      [
        "Access-Control-Allow-Origin",
        "Which origin may read it.",
        "https://app.example",
      ],
      [
        "Access-Control-Allow-Methods",
        "Which methods (preflight).",
        "GET, POST, PUT",
      ],
      [
        "Access-Control-Allow-Headers",
        "Which request headers.",
        "Content-Type",
      ],
      ["Access-Control-Allow-Credentials", "May cookies be sent?", "true"],
      ["Access-Control-Max-Age", "Cache the preflight, seconds.", "600"],
    ]),
    quickCheck(
      "Your API works in curl but the browser blocks it. Most likely?",
      [
        "The API is down",
        "CORS: the API didn't allow the page's origin",
        "DNS is wrong",
      ],
      1,
      "[[cors-basics|CORS]] is enforced by the browser only; curl ignores it.",
    ),
  ),

  part(
    "step-by-step",
    "A CORS request, step by step",
    explain(
      "A page on `https://app.example` posts JSON, with cookies, to an API on `https://api.example`. Step through the preflight, the real request, and then the same request from a site the API doesn't allow:",
    ),
    trace(
      "POST across origins",
      [
        "fetch(api.example/notes)",
        "other origin? yes",
        "JSON body → preflight",
        "→ OPTIONS /notes",
        "← 204, Allow-Origin ✓",
        "  Allow-Methods: POST ✓",
        "  Allow-Headers ✓",
        "→ POST /notes + cookie",
        "← 201, Allow-Origin ✓",
        "script reads the note",
        "later, from evil.example",
        "← no Allow-Origin",
        "blocked: script can't read",
      ],
      [
        {
          line: 2,
          note: "The page's origin is `https://app.example`; the API's is `https://api.example`. Different hosts, so CORS rules apply.",
          vars: [["origin", "https://app.example"]],
        },
        {
          line: 4,
          note: "`Content-Type: application/json` isn't allowed without asking, so the browser first sends an `OPTIONS` [[cors-preflight|preflight]] with `Origin: https://app.example`.",
          vars: [
            ["origin", "https://app.example"],
            ["preflight", "sent"],
          ],
        },
        {
          line: 7,
          note: "The API answers that this origin may POST with a `Content-Type` header, and (`Allow-Credentials: true`) with cookies.",
          vars: [
            ["preflight", "allowed"],
            ["credentials", "allowed"],
          ],
        },
        {
          line: 9,
          note: "Now the real request goes, cookie included. The response carries `Access-Control-Allow-Origin: https://app.example` too.",
          vars: [["status", "201"]],
        },
        {
          line: 10,
          note: "The browser checks the header matches the page's origin, then lets the script read the body.",
          vars: [["script sees", "the new note"]],
          output: "201 · readable",
        },
        {
          line: 13,
          note: "A page on `evil.example` tries the same. The API doesn't list that origin, so the browser refuses to let the script see the answer.",
          vars: [
            ["origin", "https://evil.example"],
            ["script sees", "a CORS error"],
          ],
          output: "TypeError: Failed to fetch (CORS)",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "load-balancers",
    "Load balancers",
    explain(
      "One copy of an app can only answer so many requests. A [[load-balancer]] takes every incoming request and passes it to one of several identical copies, often in turn (round robin) or to the least busy. It runs [[health-check|health checks]] and stops sending to copies that fail. Adding copies like this is called **scaling out**.",
    ),
    diagram([
      ["Requests", "many visitors"],
      ["Load balancer", "picks a healthy copy"],
      ["App × 3", "identical copies"],
      ["Database", "shared by all"],
    ]),
    keyPoints(
      "Any copy may get any request, so copies keep nothing in memory.",
      "Shared data lives in the database (or a shared store).",
      "A copy that fails its health check gets no traffic.",
    ),
  ),

  part(
    "proxies",
    "Proxies",
    explain(
      "A [[proxy]] sits between client and server and passes messages on. A **forward** proxy works for clients (a company's web filter). A [[reverse-proxy|reverse proxy]] works for a server: it sits in front of your app and does the shared jobs, like HTTPS, compression, caching and routing paths to different apps, so your app only does its own logic.",
    ),
    diagram([
      ["Browser", "the client"],
      ["Reverse proxy", "TLS, gzip, cache, routing"],
      ["/api → Express", "/ → static files"],
    ]),
    analogy(
      "A hotel's front desk: guests talk only to the desk, which checks them in, takes parcels and sends each request to the right department behind it.",
    ),
  ),

  part(
    "websockets",
    "WebSockets: the server speaks first",
    explain(
      "HTTP is ask, then answer: the server can't speak first. A [[websocket]] starts as an HTTP request with `Upgrade: websocket`; the server answers `101 Switching Protocols`, and the same connection stays open so either side can send at any moment. Good for chat, live scores and shared editing; unnecessary when users only see changes they made.",
    ),
    code(
      "http",
      "opening a WebSocket",
      [
        "GET /chat HTTP/1.1",
        "Upgrade: websocket",
        "Connection: Upgrade",
        "",
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
      ],
      {
        2: "please switch this connection to WebSocket",
        5: "done: from now on, either side can send",
      },
    ),
    quickCheck(
      "A chat app must show new messages instantly. What fits best?",
      ["A WebSocket", "A 301 redirect", "A longer cache time"],
      0,
      "A [[websocket]] lets the server push each message the moment it arrives.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App and these pieces",
    explain(
      "The Notes App avoids CORS altogether: in development Vite acts as a reverse proxy, so the browser sees one origin, `localhost:5173`, for the page and `/api`. In production a reverse proxy does the same under one domain. Its login token is checked on every request, not kept in memory, so it works behind a load balancer. It needs no WebSocket: you only see changes you make.",
    ),
    inTheNotesApp(
      "`vite.config.js` proxies `/api` to port 3000, so the page and the API share an origin.",
      { fileId: "frontend/vite.config.js" },
    ),
    inTheNotesApp(
      "`authMiddleware.js` verifies the token on every request, so any copy of the API can answer any user.",
      { fileId: "backend/src/middleware/authMiddleware.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Allowing every origin, with cookies",
      language: "http",
      wrong: [
        "Access-Control-Allow-Origin: *",
        "Access-Control-Allow-Credentials: true",
      ],
      problem:
        "Browsers refuse this combination: a wildcard can't be used with credentials, so every request with cookies fails.",
      right: [
        "Access-Control-Allow-Origin: https://app.example",
        "Access-Control-Allow-Credentials: true",
        "Vary: Origin",
      ],
      why: "Name the exact origins you trust. `Vary: Origin` stops caches mixing up answers for different origins.",
    }),
    mistake({
      title: "Trying to fix CORS in the browser",
      wrong: ['fetch(url, { mode: "no-cors" });'],
      problem:
        "`no-cors` doesn't switch the rules off: it returns an empty, unreadable response. CORS is the *server's* decision.",
      right: [
        "// on the API server:",
        "// Access-Control-Allow-Origin: https://app.example",
      ],
      why: "Fix CORS on the API, or put the page and the API on one origin behind a reverse proxy.",
    }),
    mistake({
      title: "Keeping logins in memory behind a load balancer",
      wrong: ["const sessions = {}; // id → user", "sessions[id] = user;"],
      problem:
        "Each copy has its own `sessions`. Log in on copy 1, and your next request lands on copy 2, which has never heard of you.",
      right: [
        "// a signed token in a cookie (the Notes App)",
        "// or sessions in a shared database",
      ],
      why: "Behind a load balancer, keep nothing about users in one copy's memory.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Same origin?",
      task: "The page is on `https://notes.app`. Replace each `?` with `same` or `different`: is that URL on the same origin?",
      starter: [
        '<p>https://notes.app/api/notes: <span id="path">?</span></p>',
        '<p>http://notes.app: <span id="scheme">?</span></p>',
        '<p>https://api.notes.app: <span id="host">?</span></p>',
        '<p>https://notes.app:8443: <span id="port">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Only the path differs",
          selector: "#path",
          text: "same",
        },
        {
          kind: "text",
          label: "http isn't https",
          selector: "#scheme",
          text: "different",
        },
        {
          kind: "text",
          label: "A subdomain is another host",
          selector: "#host",
          text: "different",
        },
        {
          kind: "text",
          label: "Another port",
          selector: "#port",
          text: "different",
        },
      ],
      hint: "Compare only scheme, host and port. The path never matters.",
      solution: [
        '<p>https://notes.app/api/notes: <span id="path">same</span></p>',
        '<p>http://notes.app: <span id="scheme">different</span></p>',
        '<p>https://api.notes.app: <span id="host">different</span></p>',
        '<p>https://notes.app:8443: <span id="port">different</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Answer the preflight",
      task: "The app on `https://app.example` sends JSON with cookies to your API. Fill in each `?` in the preflight answer so the browser allows it.",
      starter: [
        '<p>Access-Control-Allow-Origin: <span id="origin">?</span></p>',
        '<p>Access-Control-Allow-Headers: <span id="headers">?</span></p>',
        '<p>Access-Control-Allow-Credentials: <span id="credentials">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The exact origin",
          selector: "#origin",
          text: "https://app.example",
        },
        {
          kind: "text",
          label: "The JSON header",
          selector: "#headers",
          text: "Content-Type",
        },
        {
          kind: "text",
          label: "Cookies allowed",
          selector: "#credentials",
          text: "true",
        },
      ],
      hint: "With cookies, the origin must be exact, not `*`. JSON needs the `Content-Type` request header.",
      solution: [
        '<p>Access-Control-Allow-Origin: <span id="origin">https://app.example</span></p>',
        '<p>Access-Control-Allow-Headers: <span id="headers">Content-Type</span></p>',
        '<p>Access-Control-Allow-Credentials: <span id="credentials">true</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Pick the piece",
      task: "Replace each `?` with what solves the problem: `WebSocket`, `load balancer`, `reverse proxy` or `CORS`.",
      starter: [
        '<p>A chat must show messages the instant they\'re sent: <span id="chat">?</span></p>',
        '<p>One server can\'t keep up; you run three copies: <span id="scale">?</span></p>',
        '<p>Handle HTTPS and compression in front of the app: <span id="front">?</span></p>',
        '<p>Let app.example read your API on api.example: <span id="cross">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Instant messages",
          selector: "#chat",
          text: "WebSocket",
        },
        {
          kind: "text",
          label: "Spreading the load",
          selector: "#scale",
          text: "load balancer",
        },
        {
          kind: "text",
          label: "Shared jobs in front",
          selector: "#front",
          text: "reverse proxy",
        },
        {
          kind: "text",
          label: "Another origin",
          selector: "#cross",
          text: "CORS",
        },
      ],
      hint: "Server speaks first: WebSocket. Many copies: load balancer. Jobs in front of one app: reverse proxy. Another origin reading: CORS.",
      solution: [
        '<p>A chat must show messages the instant they\'re sent: <span id="chat">WebSocket</span></p>',
        '<p>One server can\'t keep up; you run three copies: <span id="scale">load balancer</span></p>',
        '<p>Handle HTTPS and compression in front of the app: <span id="front">reverse proxy</span></p>',
        '<p>Let app.example read your API on api.example: <span id="cross">CORS</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Advanced networking cheat sheet", [
      [
        "TLS 1.3",
        "Chain to a trusted root; key in one round trip.",
        "Let's Encrypt → root",
      ],
      ["HTTP/2", "Many requests on one TCP connection.", "h2"],
      ["HTTP/3", "QUIC on UDP: a loss stalls one stream.", "h3"],
      ["origin", "Scheme + host + port.", "https://notes.app:443"],
      ["CORS", "The server lets other origins read.", "Allow-Origin"],
      ["preflight", "OPTIONS: may I send this?", "JSON, PUT, DELETE"],
      ["load balancer", "Spreads requests over copies.", "round robin"],
      ["reverse proxy", "Shared jobs in front of an app.", "TLS, gzip, /api"],
      ["WebSocket", "One open connection; both sides send.", "101 Switching"],
    ]),
    quickCheck(
      "Users get logged out at random after you add a second copy of your API. What's the likely cause?",
      [
        "HTTP/2",
        "Logins kept in each copy's memory, so the other copy doesn't know them",
        "The CDN",
      ],
      1,
      "Behind a [[load-balancer]], requests hop between copies. Keep logins in a token or a shared store.",
    ),
  ),
);
