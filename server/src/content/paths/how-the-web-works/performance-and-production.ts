import {
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

// Performance and the Notes App in production. Where the time goes, one
// request's timing, a first and a second visit step by step, fewer round
// trips, fewer bytes, measuring what users feel, DNS records for
// production, the whole path in production, the Notes App, mistakes,
// practice and a recap.
export const performanceAndProductionModule = moduleLesson(
  "performance-and-production",
  "Performance and the Notes App in production",
  45,
  [
    "Break a page load into its parts: DNS, connecting, TLS, waiting, downloading.",
    "Count the round trips in a first and a repeat visit, and cut them.",
    "Make responses smaller with compression, smaller images and less code.",
    "Measure what users feel with Core Web Vitals.",
    "Point a domain at a host with A and CNAME records, and trace a request through production.",
  ],

  part(
    "where-the-time-goes",
    "Where the time goes",
    explain(
      "A slow page is rarely one slow thing. The time is spread over every step: finding the server, connecting, securing the connection, waiting for the server, downloading, then drawing. Most of it is [[latency]], waiting for messages to cross the distance, not the server working. Speeding up a page starts with knowing which step is slow.",
    ),
    reference("A page load's steps", [
      ["DNS lookup", "Name → address; free if cached.", "0–100 ms"],
      ["Connect (TCP)", "One round trip.", "10–300 ms"],
      ["TLS", "One more round trip (TLS 1.3).", "10–300 ms"],
      [
        "Waiting (TTFB)",
        "Request out, server works, first byte back.",
        "50–500 ms",
      ],
      ["Download", "Depends on size and bandwidth.", "1–1000 ms"],
      ["Render", "The browser builds and draws the page.", "10–500 ms"],
    ]),
  ),

  part(
    "one-request",
    "One request's timing",
    explain(
      "DevTools shows each request's timing. Open **Network**, click a request and choose **Timing**: the bar is split into the steps above. **Waiting (TTFB)**, time to first byte, is one round trip plus the server's own work, so it's the place to look when the server is slow:",
    ),
    anatomy(
      "One request's Timing tab",
      [
        "DNS Lookup         20 ms",
        "Initial connection 80 ms",
        "  SSL              40 ms",
        "Waiting (TTFB)    120 ms",
      ],
      [
        ["DNS Lookup", "DNS", "Finding the address; 0 ms when cached."],
        [
          "Initial connection",
          "TCP + TLS",
          "Opening the connection, TLS included.",
        ],
        ["SSL", "TLS", "The TLS part of connecting."],
        [
          "Waiting (TTFB)",
          "time to first byte",
          "A round trip plus the server's work.",
        ],
      ],
    ),
  ),

  part(
    "step-by-step",
    "A first and a second visit",
    explain(
      "Count round trips for a visitor in Sydney opening the Notes App on a server in Frankfurt, about 280 ms there and back. Then count again when they come back a minute later:",
    ),
    trace(
      "Sydney → Frankfurt, twice",
      [
        "first visit",
        "DNS lookup        1 trip",
        "TCP connect       1 trip",
        "TLS 1.3           1 trip",
        "GET /             1 trip",
        "GET app.js, .css  1 trip",
        "GET /api/notes    1 trip",
        "second visit",
        "DNS: cached       0",
        "connection reused 0",
        "files: cached     0",
        "GET /api/notes    1 trip",
      ],
      [
        {
          line: 2,
          note: "The resolver has never seen the name, so the lookup costs a round trip (often more).",
          vars: [
            ["trips", "1"],
            ["time", "~0.3 s"],
          ],
        },
        {
          line: 4,
          note: "Connecting and securing the connection: two more round trips before any HTTP.",
          vars: [
            ["trips", "3"],
            ["time", "~0.8 s"],
          ],
        },
        {
          line: 6,
          note: "The HTML names the script and stylesheet. With HTTP/2 both come down the same connection at once: one more trip.",
          vars: [
            ["trips", "5"],
            ["time", "~1.4 s"],
          ],
        },
        {
          line: 7,
          note: "The script runs and asks for the notes: a sixth trip before the list appears.",
          vars: [
            ["trips", "6"],
            ["time", "~1.7 s"],
          ],
          output: "first visit: ~1.7 s, nearly all waiting",
        },
        {
          line: 11,
          note: "A minute later: DNS is cached, the browser kept the connection open, and the content-named files are in its cache.",
          vars: [
            ["trips", "0"],
            ["time", "~0 s"],
          ],
        },
        {
          line: 12,
          note: "Only the private data must come from the server. One round trip.",
          vars: [
            ["trips", "1"],
            ["time", "~0.3 s"],
          ],
          output: "second visit: ~0.3 s",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "fewer-round-trips",
    "Fewer round trips",
    explain(
      "Since most of the time is waiting, the biggest wins remove round trips or shorten them. Caching removes them entirely; a [[cdn]] shortens them by being close; HTTP/2 and keeping connections open stop them repeating. Each technique in this table is one you've already met in this topic:",
    ),
    reference("Ways to cut waiting", [
      [
        "Cache files",
        "Content names + max-age: no trip at all.",
        "app.3f9a1c.js",
      ],
      ["CDN", "Each trip is short: the edge is near.", "Sydney edge"],
      [
        "Keep connections",
        "No new TCP and TLS handshakes.",
        "keep-alive, HTTP/2",
      ],
      ["TLS 1.3, HTTP/3", "Fewer trips to connect.", "1 trip, or 0 on return"],
      ["DNS TTL", "Answers stay cached.", "TTL 300+"],
      ["Fewer chained requests", "Ask for data in one go.", "one /api call"],
    ]),
  ),

  part(
    "fewer-bytes",
    "Fewer bytes",
    explain(
      "After waiting comes downloading. Text (HTML, CSS, JavaScript, JSON) shrinks to a fraction with **compression**: the server sends `Content-Encoding: br` or `gzip` and the browser unpacks it. Images are usually the heaviest part of a page: send the size it's shown at, in a modern format. And the least code is the code you don't send.",
    ),
    reference("Ways to send less", [
      [
        "Compress text",
        "Brotli or gzip; text shrinks ~70%.",
        "Content-Encoding: br",
      ],
      ["Right-sized images", "Don't send 4000px for a 400px box.", "srcset"],
      ["Modern formats", "WebP and AVIF are much smaller.", "photo.avif"],
      ["Minify", "The build strips spaces and comments.", "vite build"],
      ["Split code", "Load a page's code when it's needed.", "import()"],
    ]),
    quickCheck(
      "A page sends a 3 MB photo into a 300-pixel-wide box. What's the fix?",
      [
        "A faster server",
        "Resize it to about the size it's shown at, in WebP or AVIF",
        "Turn off caching",
      ],
      1,
      "The browser downloads every byte, then throws most away to shrink it. Send the size you show.",
    ),
  ),

  part(
    "measure",
    "Measure what users feel",
    explain(
      "Users don't feel round trips; they feel waiting for content, laggy buttons and jumping layouts. Google's [[core-web-vitals]] put numbers on those three. **Lighthouse**, in DevTools, measures them on your own computer; real users' numbers come from the field. Measure before and after a change, not by feel.",
    ),
    reference("Core Web Vitals, and what counts as good", [
      ["LCP", "Largest content painted: the main thing appears.", "≤ 2.5 s"],
      ["INP", "Interaction to next paint: clicks feel instant.", "≤ 200 ms"],
      ["CLS", "Layout shift: things don't jump around.", "≤ 0.1"],
    ]),
    keyPoints(
      "Slow LCP: often a big image or a slow first response.",
      "Slow INP: too much JavaScript running on a click.",
      "High CLS: images and adverts without a reserved size.",
    ),
  ),

  part(
    "dns-for-production",
    "Pointing your domain at production",
    explain(
      "To put the app at your own name, you add [[dns-record|DNS records]] at your domain's name server. An **A** record points a name at an IP address. A **CNAME** points a name at *another name*, an alias, which suits hosts and CDNs whose addresses change. The bare domain (the apex) can't be a CNAME, so providers offer an ALIAS record for it instead.",
    ),
    code(
      "bash",
      "records for a production domain (TTL and IN left out)",
      [
        "notes.app.      A",
        "  76.76.21.21",
        "www.notes.app.  CNAME",
        "  notes.app.",
        "api.notes.app.  CNAME",
        "  notes-api.host.example.",
        "notes.app.      MX",
        "  10 mail.notes.app.",
      ],
      {
        1: "A: the bare domain → an IPv4 address",
        3: "CNAME: www is an alias for notes.app",
        5: "CNAME: the API follows the host's own name",
        7: "MX: where the domain's email goes",
      },
    ),
    quickCheck(
      "What does a CNAME record do?",
      [
        "Points one name at another name",
        "Sets the server's port",
        "Stores the certificate",
      ],
      0,
      "A CNAME says “this name is an alias for that one”. DNS follows it to the A record and the final address. Lower the [[ttl]] a day before you change any of them.",
    ),
  ),

  part(
    "the-whole-path",
    "The whole path in production",
    explain(
      "Put the topic together. A request to the Notes App in production passes through most of what you've learned before it reaches your code: DNS, a CDN edge, a reverse proxy or load balancer, one of several copies of the API, and the database. Each piece takes a job off the next.",
    ),
    diagram([
      ["Browser", "HTTPS, HTTP/2"],
      ["DNS", "notes.app → the CDN"],
      ["CDN edge", "TLS, cached files"],
      ["Load balancer", "picks a healthy copy"],
      ["Express API × 3", "your code"],
      ["PostgreSQL", "your notes"],
    ]),
  ),

  part(
    "notes-app",
    "The Notes App in production",
    explain(
      "The Notes App is built for this path. Its React build has content-named files a CDN can keep for a year. Its API checks a token on every request, so any copy behind a load balancer can answer, and reports health at `/api/health`. Its database pool keeps connections open, so queries skip the handshakes. The Deployment topic builds the whole chain, one piece at a time.",
    ),
    inTheNotesApp(
      "`Dockerfile` builds the API image, with a health check the platform uses.",
      { fileId: "backend/Dockerfile" },
    ),
    inTheNotesApp("`db.js` keeps a pool of open connections to PostgreSQL.", {
      fileId: "backend/src/db.js",
    }),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Requests that wait for each other",
      wrong: [
        "const user = await getUser();",
        "const notes = await getNotes();",
        "const tags = await getTags();",
      ],
      problem:
        "Each request waits for the one before, though none needs the others' answers: three round trips in a row.",
      right: [
        "const [user, notes, tags] =",
        "  await Promise.all([",
        "    getUser(),",
        "    getNotes(),",
        "    getTags(),",
        "  ]);",
      ],
      why: "Start independent requests together; they share one round trip of waiting.",
    }),
    mistake({
      title: "A CNAME on the bare domain",
      language: "bash",
      wrong: ["notes.app.  CNAME  host.example."],
      problem:
        "The bare domain must also hold records like NS and MX, which a CNAME can't sit beside. Many DNS providers refuse it; others break email.",
      right: ["notes.app.  ALIAS  host.example."],
      why: "Use your provider's ALIAS (or A records) at the apex, and CNAME for subdomains like www.",
    }),
    mistake({
      title: "Optimising by guessing",
      language: "bash",
      wrong: ["# rewrote the API in another language; page still slow"],
      problem:
        "The server's work was 30 ms of a 3-second load. The time was in a huge image and six round trips.",
      right: ["# DevTools → Lighthouse, Network → Timing first"],
      why: "Measure where the time goes, fix the biggest part, then measure again.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the timing",
      task: "Read this request's timing, then replace each `?`: the slowest step's name, exactly as written, and the total in milliseconds.",
      starter: [
        "<pre>DNS Lookup          0 ms",
        "Initial connection 60 ms",
        "Waiting (TTFB)    450 ms",
        "Content Download   40 ms</pre>",
        '<p>Slowest step: <span id="slowest">?</span></p>',
        '<p>Total (ms): <span id="total">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The slowest step",
          selector: "#slowest",
          text: "Waiting (TTFB)",
        },
        {
          kind: "text",
          label: "0 + 60 + 450 + 40",
          selector: "#total",
          text: "550",
        },
      ],
      hint: "Compare the four numbers. Then add them up.",
      solution: [
        "<pre>DNS Lookup          0 ms",
        "Initial connection 60 ms",
        "Waiting (TTFB)    450 ms",
        "Content Download   40 ms</pre>",
        '<p>Slowest step: <span id="slowest">Waiting (TTFB)</span></p>',
        '<p>Total (ms): <span id="total">550</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Choose the record",
      task: "Replace each `?` with the record type to add: `A`, `CNAME` or `MX`.",
      starter: [
        '<p>notes.app → the address 76.76.21.21: <span id="apex">?</span></p>',
        '<p>www.notes.app → an alias for notes.app: <span id="www">?</span></p>',
        '<p>Where notes.app\'s email is delivered: <span id="mail">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A name to an address",
          selector: "#apex",
          text: "A",
        },
        {
          kind: "text",
          label: "A name to another name",
          selector: "#www",
          text: "CNAME",
        },
        {
          kind: "text",
          label: "Email",
          selector: "#mail",
          text: "MX",
        },
      ],
      hint: "Address: A. Alias: CNAME. Mail exchange: MX.",
      solution: [
        '<p>notes.app → the address 76.76.21.21: <span id="apex">A</span></p>',
        '<p>www.notes.app → an alias for notes.app: <span id="www">CNAME</span></p>',
        '<p>Where notes.app\'s email is delivered: <span id="mail">MX</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Pick the fix",
      task: "Replace each `?` with the fix that helps most: `CDN`, `compress` or `cache`.",
      starter: [
        '<p>Visitors far from the server wait on every round trip: <span id="far">?</span></p>',
        '<p>A 900 KB JavaScript file is sent as plain text: <span id="big">?</span></p>',
        '<p>Returning visitors download the same logo every time: <span id="again">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Distance: be closer",
          selector: "#far",
          text: "CDN",
        },
        {
          kind: "text",
          label: "Text shrinks with compression",
          selector: "#big",
          text: "compress",
        },
        {
          kind: "text",
          label: "Don't download it twice",
          selector: "#again",
          text: "cache",
        },
      ],
      hint: "Too far: move closer. Too big: make it smaller. Again and again: keep a copy.",
      solution: [
        '<p>Visitors far from the server wait on every round trip: <span id="far">CDN</span></p>',
        '<p>A 900 KB JavaScript file is sent as plain text: <span id="big">compress</span></p>',
        '<p>Returning visitors download the same logo every time: <span id="again">cache</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Performance and production cheat sheet", [
      ["latency", "Most load time is waiting, not working.", "round trips"],
      ["TTFB", "A round trip plus server work.", "Waiting (TTFB)"],
      ["first visit", "DNS, TCP, TLS, then requests.", "~6 trips"],
      ["repeat visit", "Caches and kept connections.", "~1 trip"],
      ["fewer trips", "Cache, CDN, HTTP/2, Promise.all.", "max-age"],
      ["fewer bytes", "Compress, right-size images, split code.", "br, AVIF"],
      [
        "Core Web Vitals",
        "LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.",
        "Lighthouse",
      ],
      ["A / CNAME", "Name → address / name → name.", "www → notes.app"],
      ["production path", "DNS → CDN → balancer → API → DB.", "the Notes App"],
    ]),
    quickCheck(
      "A page is slow only on the first visit; repeat visits are fast. Where is the time most likely going?",
      [
        "Round trips and downloads that caching saves on later visits",
        "The database on every request",
        "The user's screen",
      ],
      0,
      "Caches, kept connections and cached DNS remove most of the work after the first visit. Cut first-visit trips with a [[cdn]] and fewer requests.",
    ),
  ),
);
