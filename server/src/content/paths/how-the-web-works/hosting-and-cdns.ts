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

// Hosting and CDNs: where it all runs. Always on, kinds of hosting,
// static files and servers, from code to online, configuration, a deploy
// step by step, why distance matters, how a CDN works, what belongs on a
// CDN, the Notes App, mistakes, practice and a recap.
export const hostingAndCdnsModule = moduleLesson(
  "hosting-and-cdns",
  "Hosting and CDNs: where it all runs",
  40,
  [
    "Explain what hosting is, and choose between static hosting and a server.",
    "Describe the steps from code on your laptop to a site online.",
    "Keep configuration and secrets out of code with environment variables.",
    "Explain how a CDN cuts waiting time, and what a cache hit and miss are.",
    "Decide which files belong on a CDN and which must come from your server.",
  ],

  part(
    "always-on",
    "Always on, always connected",
    explain(
      "While you build, the Notes App runs on your laptop at `localhost`. Nobody else can reach it, and it stops when you close the lid. To be online it has to run on a computer that's always on, always connected and reachable by a public address: that's [[web-hosting|hosting]]. Most apps rent that computer in the [[cloud]].",
    ),
    analogy(
      "Cooking at home for friends versus renting a shop on the high street: same recipes, but the shop is open all day and anyone can walk in.",
    ),
    quickCheck(
      "Why can't you just send people `http://localhost:5173`?",
      [
        "localhost always means *their own* computer, not yours",
        "Port 5173 is blocked on the internet",
        "Browsers don't allow localhost links",
      ],
      0,
      "[[localhost]] is each computer talking to itself. Your app needs a host with a public address.",
    ),
  ),

  part(
    "kinds-of-hosting",
    "Kinds of hosting",
    explain(
      "How much of the computer you manage depends on the kind of hosting. A page that's only files needs [[static-hosting|static hosting]]: you upload, it serves. An API needs something that runs your program. The more the host does for you, the less you can change, and the less can go wrong:",
    ),
    reference("Kinds of hosting", [
      ["Static hosting", "Serves files only; often free.", "a built React app"],
      [
        "Platform (PaaS)",
        "Give it code or an image; it runs it.",
        "an Express API",
      ],
      ["Serverless", "Runs a function per request.", "a small API"],
      ["Virtual machine", "A whole computer to manage yourself.", "anything"],
      ["Managed database", "A database someone else runs.", "PostgreSQL"],
    ]),
  ),

  part(
    "static-and-servers",
    "Static files and servers",
    explain(
      "A React app becomes plain files when you [[production-build|build]] it: HTML, one JavaScript file, one CSS file, named after their content. Any static host can serve those. The API is different: it's a program that must run, talk to a database and answer each request. So the Notes App goes online as two parts, plus its database.",
    ),
    code(
      "bash",
      "building the React app into static files",
      [
        "$ npm run build",
        "dist/index.html",
        "dist/assets/index-3f9a1c.js",
        "dist/assets/index-b72e04.css",
      ],
      {
        1: "Vite turns the source into a few files",
        2: "the page: same name every time",
        3: "names change when the content does",
      },
    ),
    diagram([
      ["Static host / CDN", "dist/: the React app"],
      ["Platform", "the Express API"],
      ["Managed database", "PostgreSQL"],
    ]),
  ),

  part(
    "code-to-online",
    "From code to online",
    explain(
      "Putting an app online is called **deploying**. The host needs your code, a way to start it and its settings; then your domain's [[dns]] has to point at it, and [[https-basics|HTTPS]] has to be set up. Most hosts deploy automatically every time you push to your main branch ([[ci-cd|CI/CD]]).",
    ),
    keyPoints(
      "Build: turn source into what runs (files or a Docker image).",
      "Ship: send it to the host, usually on `git push`.",
      "Configure: set its environment variables.",
      "Point DNS at the host; it gets you a certificate.",
    ),
  ),

  part(
    "configuration",
    "Settings live outside the code",
    explain(
      "The same code runs on your laptop and on the host, with different settings: another database, another port, real secrets. So settings live in [[environment-config|environment variables]], set on the host's dashboard, never in the code. The Notes App's API needs four:",
    ),
    anatomy(
      "The Notes API's settings",
      [
        "PORT=3000",
        "DATABASE_URL=postgres://…",
        "JWT_SECRET=a-long-random…",
        "NODE_ENV=production",
      ],
      [
        ["PORT", "port", "Which port to listen on; many hosts set it."],
        ["DATABASE_URL", "database", "Where PostgreSQL is, with its password."],
        ["JWT_SECRET", "secret", "Signs login tokens; never commit it."],
        [
          "NODE_ENV=production",
          "mode",
          "Turns on production behaviour, like Secure cookies.",
        ],
      ],
    ),
  ),

  part(
    "step-by-step",
    "A deploy, step by step",
    explain(
      "Step through a deploy of the Notes API on a typical platform. The host starts the new version *before* stopping the old one, and only switches once a [[health-check]] says it works:",
    ),
    trace(
      "Deploying the Notes API",
      [
        "git push",
        "host: a new commit",
        "build the Docker image",
        "start new copy, PORT=10000",
        "GET /api/health → 200",
        "send traffic to new copy",
        "stop the old copy",
        "next push: a bug",
        "GET /api/health → 500",
        "keep the old copy running",
      ],
      [
        {
          line: 2,
          note: "The host is watching your repository. A push to `main` starts a deploy.",
          vars: [["live", "old copy"]],
        },
        {
          line: 3,
          note: "It builds the image from `backend/Dockerfile`: install packages, copy the code.",
          vars: [
            ["live", "old copy"],
            ["building", "new image"],
          ],
        },
        {
          line: 4,
          note: "It starts the new copy with your environment variables. This host says which port to use.",
          vars: [
            ["live", "old copy"],
            ["starting", "new copy on 10000"],
          ],
        },
        {
          line: 6,
          note: "The health check answered 200, so the host sends visitors to the new copy. Nobody saw any downtime.",
          vars: [["live", "new copy"]],
        },
        {
          line: 7,
          note: "Only now is the old copy stopped.",
          vars: [["live", "new copy"]],
          output: "deployed: no downtime",
        },
        {
          line: 10,
          note: "Next time the new copy is broken: its health check fails, so the host never switches. Visitors keep using the last good version.",
          vars: [
            ["live", "last good copy"],
            ["new copy", "failed, stopped"],
          ],
          output: "deploy failed · site still up",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "distance",
    "Distance costs time",
    explain(
      "Data in a fibre-optic cable travels at about 200 km per millisecond. A server in Frankfurt is 9,000 km from Tokyo: at least 45 ms each way, 90 ms there and back, before any work is done. A page needs several round trips (DNS, connecting, TLS, then each request), so distance adds up to whole seconds of [[latency]].",
    ),
    reference("Round trips from a server in Frankfurt", [
      ["Paris", "~500 km away.", "~10 ms"],
      ["New York", "~6,200 km away.", "~80 ms"],
      ["Tokyo", "~9,000 km away.", "~230 ms (cables wind)"],
      ["Sydney", "~16,500 km away.", "~280 ms"],
    ]),
    quickCheck(
      "Opening a page needs 6 round trips. Each takes 200 ms from Sydney. How long is spent just waiting?",
      ["About 0.2 seconds", "About 1.2 seconds", "About 12 seconds"],
      1,
      "6 × 200 ms = 1,200 ms. No server speed-up fixes distance; being closer does.",
    ),
  ),

  part(
    "how-a-cdn-works",
    "How a CDN works",
    explain(
      "A [[cdn]] (Content Delivery Network) has [[edge-server|edge servers]] in hundreds of cities. Your domain points at the CDN, so a visitor reaches the nearest one. If it has a copy, it answers at once: a **cache hit**. If not, a **miss**: it fetches the file from your server, the **origin**, keeps a copy as [[cache-control]] allows, and answers.",
    ),
    diagram([
      ["Visitor in Tokyo", "asks for app.js"],
      ["Tokyo edge", "hit: answers in ~10 ms"],
      ["Your server", "asked only on a miss"],
    ]),
    code(
      "http",
      "a cached answer from a CDN edge",
      [
        "HTTP/2 200",
        "content-type: text/javascript",
        "cache-control: max-age=31536000",
        "age: 86400",
        "x-cache: HIT",
      ],
      {
        3: "the origin said: keep it a year",
        4: "this copy has been at the edge for a day",
        5: "served from the edge, not your server",
      },
    ),
  ),

  part(
    "what-goes-on-a-cdn",
    "What belongs on a CDN",
    explain(
      "Anything that's the same for everyone can be served from the edge: the built JavaScript and CSS, images, fonts. Anything personal must come from your server: your notes, your account. Many CDNs also sit in front of the API, adding HTTPS and protection, but pass private requests straight through without keeping copies.",
    ),
    keyPoints(
      "Same for everyone: cache at the edge.",
      "Personal or changing: `no-store`, straight to the origin.",
      "Content-named files can be kept for a year.",
      "`index.html` must be checked each time, or visitors get old pages.",
    ),
    quickCheck(
      "Which response should a CDN never keep a copy of?",
      [
        "`/assets/index-3f9a1c.js`",
        "`/api/notes` (your private notes)",
        "`/logo.png`",
      ],
      1,
      "A shared cache would hand your notes to the next person who asks for the same URL.",
    ),
  ),

  part(
    "notes-app",
    "Hosting the Notes App",
    explain(
      "The Notes App goes online as three parts. Its React app is built into static files for a static host or CDN. Its API ships as a Docker image to a platform, which runs it, checks `/api/health` and sets its environment variables. Its database is a managed PostgreSQL. The Deployment topic does all of this for real, one piece at a time.",
    ),
    inTheNotesApp(
      "`Dockerfile` builds the API's image and tells the host how to check its health.",
      { fileId: "backend/Dockerfile" },
    ),
    inTheNotesApp(
      "`.env.example` lists the settings the API needs, with safe example values.",
      { fileId: "backend/.env.example" },
    ),
    inTheNotesApp(
      '`app.js` answers `/api/health` with `{"status":"ok"}` for the host\'s checks.',
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Committing secrets",
      language: "bash",
      wrong: ["$ git add .env", '$ git commit -m "config"'],
      problem:
        "Your database password and JWT secret are now in the repository's history for anyone who can see it, even after you delete the file.",
      right: [
        "# .env is in .gitignore",
        "# set the values on the host instead",
      ],
      why: "Commit `.env.example` with fake values; keep real ones in the host's settings. If a secret leaks, change it.",
    }),
    mistake({
      title: "A localhost URL in production",
      wrong: ['fetch("http://localhost:3000/api/notes");'],
      problem:
        "On a visitor's phone, `localhost` is the phone itself. Every request fails.",
      right: ['fetch("/api/notes");'],
      why: "Use relative URLs (or an environment setting), so the app talks to wherever it's hosted.",
    }),
    mistake({
      title: "Caching index.html at the edge",
      language: "http",
      wrong: ["GET /index.html", "Cache-Control: max-age=86400"],
      problem:
        "After a deploy, visitors keep the old page for a day, and it points at JavaScript files that may no longer exist.",
      right: ["GET /index.html", "Cache-Control: no-cache"],
      why: "Cache content-named files for long; make the page that names them check every time.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Static or server?",
      task: "Replace each `?` with `static` if a static host or CDN can serve it as a file, or `server` if your API has to answer it.",
      starter: [
        '<p>index.html: <span id="html">?</span></p>',
        '<p>assets/index-3f9a1c.js: <span id="js">?</span></p>',
        '<p>GET /api/notes: <span id="notes">?</span></p>',
        '<p>POST /api/auth/login: <span id="login">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The page is a file",
          selector: "#html",
          text: "static",
        },
        {
          kind: "text",
          label: "The script is a file",
          selector: "#js",
          text: "static",
        },
        {
          kind: "text",
          label: "Notes come from the API",
          selector: "#notes",
          text: "server",
        },
        {
          kind: "text",
          label: "Logging in needs the API",
          selector: "#login",
          text: "server",
        },
      ],
      hint: "Is it the same file for everyone, made once by the build? Or does it need your code and database to answer?",
      solution: [
        '<p>index.html: <span id="html">static</span></p>',
        '<p>assets/index-3f9a1c.js: <span id="js">static</span></p>',
        '<p>GET /api/notes: <span id="notes">server</span></p>',
        '<p>POST /api/auth/login: <span id="login">server</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Hit or miss?",
      task: "A CDN edge in Tokyo starts empty. Replace each `?` with `hit` or `miss` for what happens there.",
      starter: [
        '<p>First visitor asks for app.3f9a1c.js: <span id="first">?</span></p>',
        '<p>A second visitor asks for the same file: <span id="second">?</span></p>',
        '<p>Someone asks for /api/notes (no-store): <span id="private">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The first request has no copy yet",
          selector: "#first",
          text: "miss",
        },
        {
          kind: "text",
          label: "The second uses the copy",
          selector: "#second",
          text: "hit",
        },
        {
          kind: "text",
          label: "no-store is never kept",
          selector: "#private",
          text: "miss",
        },
      ],
      hint: "A hit needs a copy already at the edge. `no-store` means no copy is ever kept.",
      solution: [
        '<p>First visitor asks for app.3f9a1c.js: <span id="first">miss</span></p>',
        '<p>A second visitor asks for the same file: <span id="second">hit</span></p>',
        '<p>Someone asks for /api/notes (no-store): <span id="private">miss</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Order the deploy",
      task: "The steps of a no-downtime deploy are mixed up. Move whole lines so they run from first to last. Change only the order, not the words.",
      starter: [
        '<ol id="deploy">',
        "  <li>Send visitors to the new copy</li>",
        "  <li>Build the new version</li>",
        "  <li>Stop the old copy</li>",
        "  <li>Check the new copy's health</li>",
        "  <li>Start the new copy</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "Build first",
          selector: "#deploy li:nth-child(1)",
          text: "Build the new version",
        },
        {
          kind: "text",
          label: "Then start it",
          selector: "#deploy li:nth-child(2)",
          text: "Start the new copy",
        },
        {
          kind: "text",
          label: "Check it works",
          selector: "#deploy li:nth-child(3)",
          text: "Check the new copy's health",
        },
        {
          kind: "text",
          label: "Switch visitors over",
          selector: "#deploy li:nth-child(4)",
          text: "Send visitors to the new copy",
        },
        {
          kind: "text",
          label: "Only then stop the old one",
          selector: "#deploy li:nth-child(5)",
          text: "Stop the old copy",
        },
      ],
      hint: "The old copy keeps serving visitors until the new one is proven healthy.",
      solution: [
        '<ol id="deploy">',
        "  <li>Build the new version</li>",
        "  <li>Start the new copy</li>",
        "  <li>Check the new copy's health</li>",
        "  <li>Send visitors to the new copy</li>",
        "  <li>Stop the old copy</li>",
        "</ol>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Hosting and CDNs cheat sheet", [
      ["hosting", "An always-on computer with a public address.", "the cloud"],
      ["static hosting", "Serves built files only.", "dist/"],
      ["platform", "Runs your program or Docker image.", "the API"],
      ["deploy", "Build, ship, configure, point DNS.", "git push"],
      ["env variables", "Settings and secrets, outside code.", "DATABASE_URL"],
      [
        "health check",
        "Proves a new copy works before the switch.",
        "/api/health",
      ],
      [
        "latency",
        "Distance costs time: ~1 ms per 100 km, there and back.",
        "Sydney ↔ Frankfurt",
      ],
      ["CDN", "Copies at edges near visitors.", "hit / miss"],
      [
        "what to cache",
        "Same-for-everyone files, not private data.",
        "assets, not /api",
      ],
    ]),
    quickCheck(
      "Your site is fast in Europe but slow in Australia. The server isn't busy. What helps most?",
      [
        "A faster database",
        "A CDN, so Australian visitors get files from a nearby edge",
        "Shorter variable names",
      ],
      1,
      "The time is spent travelling. A [[cdn]] puts copies close to visitors, so fewer trips cross the world.",
    ),
  ),
);
