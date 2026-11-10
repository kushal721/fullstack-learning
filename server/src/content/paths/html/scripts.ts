import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pagePlayground,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Loading scripts in depth: why a plain script blocks the parser, the
// anatomy of the head's loading tags, every loading mode in one table, a
// step-through of the parser meeting async, defer and plain scripts, the
// order scripts really run in (live), defer versus async, module scripts,
// DOMContentLoaded and load, other things that block (styles) and resource
// hints, the Notes App, mistakes, practice and a recap.
export const scriptsModule = moduleLesson(
  "script-loading",
  "Loading scripts without blocking",
  40,
  [
    "Explain why a plain `<script>` stops the parser, and what the user sees while it waits.",
    'Choose between a plain script, `defer`, `async` and `type="module"`, and predict the order they run in.',
    "Wait for the page with `DOMContentLoaded` or `load`, and say how they differ.",
    "Spot other things that hold the page up (style sheets) and use `preload` and `preconnect` hints.",
    "Read the Notes App's module script and what Vite turns it into.",
  ],

  part(
    "why",
    "Why a script can hold up the page",
    explain(
      "The [[html-parser|parser]] reads the HTML top to bottom. When it meets a plain `<script>`, it **stops**: the script might change the page, so the browser downloads it and runs it before reading another tag. On a slow connection that's a blank screen. [[script-loading|`defer` and `async`]] let the download happen while the parser carries on.",
    ),
    diagram([
      ["parser reads HTML", "builds the DOM as it goes"],
      ["plain <script>", "parser stops"],
      ["download and run", "the user waits, nothing new is shown"],
      ["parser carries on", "the rest of the page appears"],
    ]),
    keyPoints(
      "A plain script stops the parser until it has downloaded and run.",
      "Everything after it waits, so the page appears late.",
      "`defer`, `async` and modules download without stopping the parser.",
    ),
  ),

  part(
    "anatomy",
    "Anatomy of a page's loading tags",
    explain(
      "Most pages load their files from the `<head>`. Each tag says what to fetch and, through its attributes, when it may run. A script always needs its closing `</script>`, even when it has a `src` and nothing inside.",
    ),
    anatomy(
      "The head of a typical page",
      [
        "<head>",
        '  <link rel="stylesheet" href="style.css">',
        '  <script src="app.js" defer></script>',
        '  <script type="module" src="/src/main.jsx"></script>',
      ],
      [
        [
          'rel="stylesheet"',
          "a style sheet",
          "Doesn't stop the parser, but the page isn't drawn until it's loaded.",
        ],
        ['src="app.js"', "the file", "Where the script comes from."],
        [
          "defer",
          "wait for the page",
          "Download now, run once the whole HTML has been read, in order.",
        ],
        [
          'type="module"',
          "a module script",
          "Can use `import`; deferred by default, with no attribute needed.",
        ],
        [
          "</script>",
          "the end tag",
          "Always needed: `<script />` doesn't close the element.",
        ],
      ],
    ),
  ),

  part(
    "modes",
    "Every way to load a script",
    explain(
      "Two questions decide the right tag: **does it stop the parser** while it downloads, and **when does it run**? Only `defer` and modules keep their order and wait for the whole page, which is what an app's main code needs.",
    ),
    reference("Script loading modes", [
      [
        "<script> in head",
        "Stops the parser; runs at once, before the body exists.",
        '<script src="a.js"></script>',
      ],
      [
        "<script> at end of body",
        "Stops the parser, but only once everything above it is built.",
        '…<script src="a.js"></script></body>',
      ],
      [
        "defer",
        "Downloads alongside; runs after the HTML is read, in order.",
        '<script src="a.js" defer></script>',
      ],
      [
        "async",
        "Downloads alongside; runs as soon as it arrives, in any order.",
        '<script src="stats.js" async></script>',
      ],
      [
        'type="module"',
        "Deferred by default; can import other modules.",
        '<script type="module" src="main.js"></script>',
      ],
      [
        "inline <script>",
        "Runs at once where it is; defer and async are ignored.",
        "<script>…</script>",
      ],
    ]),
    quickCheck(
      "Which script is guaranteed to find every element on the page when it runs?",
      [
        '`<script src="a.js" async>` in the head',
        '`<script src="a.js" defer>` in the head',
        '`<script src="a.js">` in the head',
      ],
      1,
      "`defer` waits until the whole HTML has been read. `async` runs whenever it arrives, which may be before the body is built.",
    ),
  ),

  part(
    "how-it-loads",
    "Following the parser, move by move",
    explain(
      "Step through a page with an `async` script, a `defer` script and a plain one. Watch when the parser stops, what downloads alongside it, and what has run.",
    ),
    trace(
      "Three scripts, one page",
      [
        "<head>",
        '  <script src="stats.js" async></script>',
        '  <script src="app.js" defer></script>',
        '  <script src="old.js"></script>',
        "</head>",
        "<body>",
        "  <h1>My notes</h1>",
        "</body>",
      ],
      [
        {
          line: 2,
          note: "`async`: the browser starts downloading `stats.js` and the parser carries straight on.",
          vars: [
            ["parser", "reading"],
            ["downloading", "stats.js"],
            ["ran", "nothing"],
          ],
        },
        {
          line: 3,
          note: "`defer`: `app.js` starts downloading too, and is put on a list to run once the HTML is read. The parser carries on.",
          vars: [
            ["parser", "reading"],
            ["downloading", "stats.js, app.js"],
            ["ran", "nothing"],
          ],
        },
        {
          line: 4,
          note: "A plain script. The parser **stops** here until `old.js` has downloaded and run. Nothing in the body exists yet.",
          vars: [
            ["parser", "stopped"],
            ["downloading", "stats.js, app.js, old.js"],
            ["ran", "nothing"],
          ],
        },
        {
          line: 4,
          note: "`stats.js` arrives first. It's `async`, so it runs as soon as it arrives, even while the parser is still stopped.",
          vars: [
            ["parser", "stopped"],
            ["downloading", "app.js, old.js"],
            ["ran", "stats.js"],
          ],
        },
        {
          line: 4,
          note: "`old.js` arrives and runs. Only now can the parser go on.",
          vars: [
            ["parser", "reading"],
            ["downloading", "app.js"],
            ["ran", "stats.js, old.js"],
          ],
        },
        {
          line: 7,
          note: "The body is built: the heading is in the DOM and can be drawn.",
          vars: [
            ["parser", "reading"],
            ["downloading", "app.js"],
            ["ran", "stats.js, old.js"],
          ],
        },
        {
          line: 8,
          note: "The HTML is fully read. Deferred scripts run now, in the order they were written: `app.js`, which can find the `h1`. Then `DOMContentLoaded` fires.",
          vars: [
            ["parser", "done"],
            ["ran", "stats.js, old.js, app.js"],
          ],
          output: "DOMContentLoaded",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "order",
    "The order scripts really run in",
    explain(
      "Run this page and read the Console. The classic script in the head runs before the body exists, so it finds no heading. The one at the end of the body finds it. The module script was written in the head, but modules are deferred, so it runs after the whole page is read, just before `DOMContentLoaded`.",
    ),
    pagePlayground("Who runs when, and what can they see?", [
      "<!doctype html>",
      '<html lang="en">',
      "<head>",
      "  <title>Order</title>",
      "  <script>",
      '    console.log("1. classic in head finds:", document.querySelector("h1"));',
      '    document.addEventListener("DOMContentLoaded", () => console.log("4. DOMContentLoaded"));',
      "  </script>",
      '  <script type="module">',
      '    console.log("3. module in head finds:", document.querySelector("h1").textContent);',
      "  </script>",
      "</head>",
      "<body>",
      "  <h1>My notes</h1>",
      "  <script>",
      '    console.log("2. classic at end of body finds:", document.querySelector("h1").textContent);',
      "  </script>",
      "</body>",
      "</html>",
    ]),
    keyPoints(
      "Classic scripts run where they are, the moment the parser reaches them.",
      "Module scripts wait for the whole page, even when written in the head.",
      "`DOMContentLoaded` fires after the deferred and module scripts have run.",
    ),
  ),

  part(
    "defer-or-async",
    "defer or async?",
    explain(
      "Use `defer` for your own code: it waits for the page and keeps the order, so a script can rely on the one before it. Use `async` for something that stands alone and doesn't touch the page, like analytics: it runs as early as possible, but in whatever order the files arrive.",
    ),
    reference("Choosing", [
      [
        "Your app's code",
        "Needs the DOM; files depend on each other.",
        '<script src="app.js" defer></script>',
      ],
      [
        "Analytics, ads",
        "Stand alone; the sooner the better.",
        '<script src="stats.js" async></script>',
      ],
      [
        "Modern app with imports",
        "A module: deferred and ordered already.",
        '<script type="module" src="main.js"></script>',
      ],
      [
        "Must run before drawing",
        "Rare: a tiny inline script, like setting a dark theme.",
        "<script>document.documentElement.dataset.theme = …</script>",
      ],
    ]),
    quickCheck(
      "`helpers.js` and `app.js` are both `async`. `app.js` uses a function from `helpers.js`. What can go wrong?",
      [
        "Nothing: async keeps the order",
        "`app.js` may arrive first and run before `helpers.js` exists",
        "Both will block the parser",
      ],
      1,
      "`async` scripts run in the order they arrive. Use `defer` (or modules with `import`) when one script needs another.",
    ),
  ),

  part(
    "modules",
    "Module scripts",
    explain(
      'A `type="module"` script can `import` from other files, so the browser fetches the whole tree of imports in parallel. Modules are deferred by default (add `async` to run as soon as they\'re ready), run in strict mode, keep their variables to themselves instead of making globals, and run only once even if included twice.',
    ),
    code(
      "html",
      "a module and what it imports",
      [
        '<script type="module">',
        '  import { formatDate } from "./dates.js";',
        "  const when = formatDate(new Date());",
        '  document.querySelector("#when").textContent = when;',
        "</script>",
      ],
      {
        1: "deferred: the page is fully read before this runs",
        2: "the browser fetches dates.js first",
        3: "when is local to this module, not a global",
      },
    ),
  ),

  part(
    "page-events",
    "Waiting for the page",
    explain(
      "Two events mark how far the page has got. **`DOMContentLoaded`** fires when the HTML is read and the deferred scripts have run: the DOM is complete, but images may still be loading. **`load`** fires on `window` when everything has finished, images and style sheets included. Most code wants the first; measuring an image needs the second.",
    ),
    code(
      "js",
      "two moments in a page's life",
      [
        'document.addEventListener("DOMContentLoaded", () => {',
        "  // every element exists; images may still be loading",
        "});",
        'window.addEventListener("load", () => {',
        "  // images, styles and frames have all finished",
        "});",
      ],
      {
        1: "fires on document, as soon as the DOM is complete",
        4: "fires on window, often much later",
      },
    ),
    quickCheck(
      "A deferred script needs every element on the page. Does it need a `DOMContentLoaded` listener?",
      [
        "Yes, always",
        "No: deferred scripts already run after the HTML is read",
        "No, but it needs a `load` listener",
      ],
      1,
      "A deferred script runs just before `DOMContentLoaded`, so the elements are already there.",
    ),
  ),

  part(
    "other-blockers",
    "Style sheets and resource hints",
    explain(
      "Scripts aren't the only thing the page waits for. A style sheet in the head doesn't stop the parser, but the browser won't draw the page until it's loaded, so a big one delays everything. Hints in the head let you start important downloads early.",
    ),
    reference("In the head", [
      [
        'rel="stylesheet"',
        "Loaded before the page is drawn.",
        '<link rel="stylesheet" href="style.css">',
      ],
      [
        'rel="preload"',
        "Fetch this now; it'll be needed soon.",
        '<link rel="preload" href="font.woff2" as="font" crossorigin>',
      ],
      [
        'rel="preconnect"',
        "Connect to a server early, before anything asks.",
        '<link rel="preconnect" href="https://api.example.com">',
      ],
      [
        'rel="modulepreload"',
        "Fetch a module and its imports early.",
        '<link rel="modulepreload" href="/assets/app.js">',
      ],
      [
        "fetchpriority",
        "Ask for this one sooner or later than usual.",
        '<img src="hero.jpg" fetchpriority="high" alt="…">',
      ],
    ]),
  ),

  part(
    "where-used",
    "Scripts in the Notes App",
    explain(
      "The Notes App's `index.html` loads all its code with one module script: `/src/main.jsx`. Because it's a module, it's deferred: the parser builds `<div id=\"root\">` first, then React renders into it. When Vite builds the app, it bundles everything into one hashed file and writes a matching module script, so the same rule still holds.",
    ),
    inTheNotesApp(
      'The body ends with `<script type="module" src="/src/main.jsx"></script>`. The build swaps it for something like `<script type="module" crossorigin src="/assets/index-…js">`, and it\'s still deferred.',
      { fileId: "frontend/index.html" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A head script looking for the body",
      language: "html",
      wrong: [
        "<head>",
        '  <script src="app.js"></script>',
        "</head>",
        "<!-- app.js: document.querySelector('h1') is null -->",
      ],
      problem:
        "The script runs before the body has been read, so every element it looks for is missing.",
      right: ["<head>", '  <script src="app.js" defer></script>', "</head>"],
      why: "`defer` runs it after the HTML is read, when every element exists.",
    }),
    mistake({
      title: "async scripts that depend on each other",
      language: "html",
      wrong: [
        '<script src="helpers.js" async></script>',
        '<script src="app.js" async></script>',
      ],
      problem:
        "They run in the order they arrive, so `app.js` sometimes runs before `helpers.js` and breaks.",
      right: [
        '<script src="helpers.js" defer></script>',
        '<script src="app.js" defer></script>',
      ],
      why: "`defer` keeps the order you wrote. Keep `async` for scripts that stand alone.",
    }),
    mistake({
      title: "A self-closing script tag",
      language: "html",
      wrong: ['<script src="app.js" />', "<h1>My notes</h1>"],
      problem:
        "`/>` doesn't close a script. Everything after it is read as script text, so the heading disappears.",
      right: ['<script src="app.js"></script>', "<h1>My notes</h1>"],
      why: "A script always needs its `</script>` end tag.",
    }),
    mistake({
      title: "defer on an inline script",
      language: "html",
      wrong: [
        "<head>",
        '  <script defer>document.querySelector("h1").textContent = "Hi";</script>',
        "</head>",
      ],
      problem:
        "`defer` and `async` only apply to scripts with a `src`. This one still runs at once and finds no `h1`.",
      right: [
        "<head>",
        '  <script type="module">document.querySelector("h1").textContent = "Hi";</script>',
        "</head>",
      ],
      why: "Inline module scripts are deferred; or move the script to the end of the body.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Move the script to where the heading exists",
      task: 'This script runs in the head, before the heading exists, so it changes nothing. Move the whole `<script>` to the end of the `<body>`, so the heading says "Ready".',
      starter: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        "  <title>Notes</title>",
        "  <script>",
        '    const heading = document.querySelector("h1");',
        '    if (heading) heading.textContent = "Ready";',
        "  </script>",
        "</head>",
        "<body>",
        "  <h1>Loading…</h1>",
        "</body>",
        "</html>",
      ],
      checks: [
        {
          kind: "text",
          label: 'The heading says "Ready"',
          selector: "h1",
          text: "Ready",
        },
        {
          kind: "exists",
          label: "The script is in the body",
          selector: "body script",
        },
      ],
      hint: "Cut the three script lines (with their `<script>` and `</script>`) and paste them just before `</body>`.",
      solution: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        "  <title>Notes</title>",
        "</head>",
        "<body>",
        "  <h1>Loading…</h1>",
        "  <script>",
        '    const heading = document.querySelector("h1");',
        '    if (heading) heading.textContent = "Ready";',
        "  </script>",
        "</body>",
        "</html>",
      ],
    }),
    pageYourTurn({
      title: "Make the inline script wait",
      task: 'This inline script has `defer`, but `defer` is ignored without a `src`, so it runs before the heading exists. Make it a module script instead (`type="module"`) and remove the useless `defer`.',
      starter: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        "  <title>Notes</title>",
        "  <script defer>",
        '    const heading = document.querySelector("h1");',
        '    if (heading) heading.textContent = "Ready";',
        "  </script>",
        "</head>",
        "<body>",
        "  <h1>Loading…</h1>",
        "</body>",
        "</html>",
      ],
      checks: [
        {
          kind: "exists",
          label: "A module script in the head",
          selector: 'head script[type="module"]',
        },
        {
          kind: "missing",
          label: "No defer left on it",
          selector: "script[defer]",
        },
      ],
      hint: 'Change `<script defer>` to `<script type="module">`. Modules are deferred already, even inline.',
      solution: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        "  <title>Notes</title>",
        '  <script type="module">',
        '    const heading = document.querySelector("h1");',
        '    if (heading) heading.textContent = "Ready";',
        "  </script>",
        "</head>",
        "<body>",
        "  <h1>Loading…</h1>",
        "</body>",
        "</html>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Script loading cheat sheet", [
      [
        "plain <script>",
        "Stops the parser to download and run.",
        '<script src="a.js"></script>',
      ],
      [
        "defer",
        "Runs after the HTML is read, in order.",
        '<script src="a.js" defer></script>',
      ],
      [
        "async",
        "Runs when it arrives, any order.",
        '<script src="stats.js" async></script>',
      ],
      [
        'type="module"',
        "Deferred; can import.",
        '<script type="module" src="main.js"></script>',
      ],
      [
        "DOMContentLoaded",
        "The DOM is complete.",
        'document.addEventListener("DOMContentLoaded", …)',
      ],
      [
        "load",
        "Everything has finished.",
        'window.addEventListener("load", …)',
      ],
      [
        'rel="preload"',
        "Start a download early.",
        '<link rel="preload" href="…" as="font">',
      ],
      ["</script>", "Always needed; no `/>`.", "<script src></script>"],
    ]),
    quickCheck(
      "Where should an app's main script go, and how should it be loaded?",
      [
        "In the head, as a plain script, so it runs first",
        "In the head with `defer` (or as a module), so it downloads early and runs once the page is read",
        "In the head with `async`, so it runs as soon as possible",
      ],
      1,
      '`defer` (or `type="module"`) starts the download early without stopping the parser, and runs it when every element exists.',
    ),
  ),
);
