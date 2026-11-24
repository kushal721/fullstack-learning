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
  scene,
  trace,
} from "../blocks.js";

// The browser's job. What a browser does, HTML, CSS and JavaScript, how a
// page names its files, one page and many files, the full journey, a page
// loading step by step, text to pixels, when a file fails, looking at a
// page's files, the Notes App, mistakes, practice and a recap.
export const theBrowserModule = moduleLesson(
  "the-browser",
  "The browser's job",
  40,
  [
    "Describe the browser's job: find the server, ask for the page, build it.",
    "Say what HTML, CSS and JavaScript each do on a page.",
    "Explain why one page means many requests, one per file.",
    "Follow a page load from the first request to the finished page.",
    "Tell from what you see which file failed to load.",
  ],

  part(
    "browsers-job",
    "What a browser does",
    explain(
      "The [[browser]] is the [[client]] you use every day. When you open an address it does three jobs: **find** the server ([[dns]]), **ask** it for the page ([[http]]), and **build** what comes back into a page you can read and use. Under the hood, each browser has a [[browser-engine]] that does the building.",
    ),
    reference("Browsers and their engines", [
      ["Chrome, Edge, Opera", "Engine: Blink.", "most of the world"],
      ["Safari", "Engine: WebKit; every iPhone browser too.", "Apple devices"],
      ["Firefox", "Engine: Gecko.", "Mozilla"],
    ]),
    quickCheck(
      "Which of these is **not** one of the browser's jobs?",
      [
        "Finding the server's address",
        "Storing everyone's notes",
        "Building the page from what comes back",
      ],
      1,
      "Storing data is the [[server]]'s job. The browser finds, asks and builds.",
    ),
  ),

  part(
    "three-languages",
    "HTML, CSS and JavaScript",
    explain(
      "What comes back is written in three languages, each with one job. [[html]] says what's on the page: headings, text, buttons, forms. [[css]] says how it looks: colours, sizes, layout. [[javascript]] says what it does: respond to clicks, fetch data, change the page while you use it.",
    ),
    analogy(
      "Like a house: HTML is the walls and rooms, CSS the paint and furniture, JavaScript the lights, doorbell and heating.",
    ),
    diagram([
      ["HTML", "structure"],
      ["CSS", "looks"],
      ["JavaScript", "behaviour"],
      ["Page", "what you see"],
    ]),
    quickCheck(
      "Which file decides the colour of a button?",
      ["HTML", "CSS", "JavaScript"],
      1,
      "[[css]] controls how things look. [[html]] says a button exists; [[javascript]] says what it does.",
    ),
  ),

  part(
    "naming-files",
    "How a page names its files",
    explain(
      "The HTML is the starting point: it names every other file the page needs. A `<link>` brings in a stylesheet, an `<img>` an image, a `<script>` a JavaScript file. Each is a URL, often relative, so the browser asks the same server:",
    ),
    anatomy(
      "Three files named in HTML",
      [
        '<link rel="stylesheet"',
        '      href="app.css">',
        '<img src="logo.png">',
        '<script src="app.js">',
      ],
      [
        ['rel="stylesheet"', "kind", "This link is a stylesheet: CSS."],
        ['href="app.css"', "CSS file", "Where to fetch it: one request."],
        ['src="logo.png"', "image", "Another request, for the picture."],
        ['src="app.js"', "script", "A third request, for the JavaScript."],
      ],
    ),
  ),

  part(
    "many-files",
    "One page, many files",
    explain(
      "Every file is its own [[resource]], fetched with its own request and response. A simple page might need five; a big news site, two hundred. The browser fetches many at once, so they don't wait in a single line, and keeps copies ([[cache]]) so the next page is faster.",
    ),
    reference("Files a page loads", [
      ["HTML", "The page itself; names the rest.", "index.html"],
      ["CSS", "Styles.", "app.css"],
      ["JavaScript", "Behaviour.", "app.js"],
      ["Images", "Pictures and icons.", "logo.png, photo.jpg"],
      ["Fonts", "Typefaces the CSS asks for.", "inter.woff2"],
      ["Data", "Fetched by JavaScript, often JSON.", "/api/notes"],
    ]),
  ),

  part(
    "the-full-journey",
    "The full journey",
    explain(
      "Put together, opening a website is one round of finding and many rounds of asking. Watch the whole thing, from typing the address to the page on screen:",
    ),
    scene("journey"),
    keyPoints(
      "You type a [[url]]; [[dns]] finds the server's [[ip-address]].",
      "The browser sends an HTTP [[request]] for the page.",
      "The HTML arrives, then the CSS and JavaScript it names.",
      "The browser builds the page: [[how-the-web-works|how the web works]].",
    ),
    quickCheck(
      "What happens first when you open a website?",
      [
        "The server sends the HTML",
        "The browser asks DNS for the server's address",
        "The browser draws the page",
      ],
      1,
      "Before any [[http]] can happen, the browser needs the server's address from [[dns]].",
    ),
  ),

  part(
    "step-by-step",
    "A page loading, step by step",
    explain(
      "Step through a page loading, from its HTML to its data. The script sits at the end of the `<body>`, as it usually does, so the page appears before it runs:",
    ),
    trace(
      "Loading notes.app",
      [
        "GET /  → index.html",
        "read the HTML, top down",
        '<link href="app.css">',
        "  GET /app.css",
        '<img src="logo.png">',
        "  GET /logo.png",
        "build the DOM",
        "apply CSS, lay out, paint",
        '<script src="app.js">',
        "  GET /app.js, run it",
        "  GET /api/notes",
        "show the notes",
      ],
      [
        {
          line: 1,
          note: "The first request is for the HTML. Everything else is discovered from it.",
          vars: [["requests", "1"]],
        },
        {
          line: 4,
          note: "Reading from the top, the browser meets a stylesheet and asks for it straight away, while it carries on reading.",
          vars: [["requests", "2"]],
        },
        {
          line: 6,
          note: "An image: another request. Requests run side by side, not one after another.",
          vars: [["requests", "3"]],
        },
        {
          line: 7,
          note: "The HTML becomes the [[dom]]: the browser's live tree of everything on the page.",
          vars: [
            ["requests", "3"],
            ["DOM", "built"],
          ],
        },
        {
          line: 8,
          note: "With the CSS in, the browser works out sizes and positions and paints pixels: you see the page. This is [[rendering]].",
          vars: [
            ["requests", "3"],
            ["on screen", "the page, no notes yet"],
          ],
        },
        {
          line: 10,
          note: "The script is fetched and run. JavaScript can now respond to clicks and change the page.",
          vars: [["requests", "4"]],
        },
        {
          line: 12,
          note: "The script asks the API for data and adds it to the DOM, so the browser paints again.",
          vars: [
            ["requests", "5"],
            ["on screen", "the page, with notes"],
          ],
          output: "5 requests: HTML, CSS, image, JS, data",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "text-to-pixels",
    "From text to pixels",
    explain(
      "Building the page is called [[rendering]]. The browser reads the HTML into the [[dom]], matches each element with its CSS, works out every box's size and position (layout), then paints the pixels. When JavaScript changes the DOM, the browser redoes only the steps it has to.",
    ),
    diagram([
      ["HTML", "read"],
      ["DOM", "a tree"],
      ["+ CSS", "styles"],
      ["Layout", "sizes, places"],
      ["Paint", "pixels"],
    ]),
  ),

  part(
    "when-a-file-fails",
    "When a file fails",
    explain(
      "Each file can fail on its own, and each failure looks different. Learning the look tells you where to start: plain black text means the CSS didn't arrive, a blank page in a JavaScript app means the script failed, a box with words in it means an image is missing.",
    ),
    reference("What you see when a file fails", [
      [
        "CSS missing",
        "Plain text, default fonts, no layout.",
        "404 on app.css",
      ],
      [
        "JS missing",
        "Clicks do nothing; React apps are blank.",
        "app.js error",
      ],
      ["Image missing", "Its alt text, or an empty box.", "logo.png 404"],
      ["Font missing", "A fallback font instead.", "inter.woff2"],
      ["Data missing", "Page loads, but no notes.", "/api/notes 500"],
    ]),
    quickCheck(
      "A page loads but shows plain black text with no colours or layout. What failed?",
      ["The HTML", "The CSS", "DNS"],
      1,
      "The text arrived, so the HTML did. Without [[css]] it falls back to plain default styles.",
    ),
  ),

  part(
    "look-inside",
    "Look at a page's files",
    explain(
      "You can see every file a page loaded. Open [[devtools|DevTools]] (F12, or Cmd+Option+I on a Mac) and choose **Network**, then reload. Each row is one request: its name, type, status and time. A red row is a file that failed.",
    ),
    keyPoints(
      "Network → reload: one row per file.",
      "The Type column says html, stylesheet, script, png, fetch.",
      "A red row, or a 404, is a file that didn't load.",
      "View Source (Cmd/Ctrl+U) shows the HTML as it arrived.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's page",
    explain(
      'The Notes App\'s HTML is almost empty: a `<div id="root">` and one script. That script is React; it builds every heading, form and note inside the div, then fetches your notes from the API. So without JavaScript the Notes App is a blank page, and View Source shows none of your notes.',
    ),
    code(
      "html",
      "the Notes App's whole body",
      [
        "<body>",
        '  <div id="root"></div>',
        '  <script type="module" src="/src/main.jsx"></script>',
        "</body>",
      ],
      {
        2: "empty: React fills it",
        3: "one script starts the whole app",
      },
    ),
    inTheNotesApp(
      "`index.html` is the first file the browser gets: one empty div and one script.",
      { fileId: "frontend/index.html" },
    ),
    inTheNotesApp(
      "`main.jsx` is that script: it starts React inside `#root`.",
      { fileId: "frontend/src/main.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A wrong path to the stylesheet",
      language: "html",
      wrong: ['<link rel="stylesheet"', '      href="css/app.css">'],
      problem:
        "The file is at `/app.css`, so this asks for `/css/app.css`, gets a 404, and the page shows unstyled.",
      right: ['<link rel="stylesheet"', '      href="/app.css">'],
      why: "When a page looks unstyled, open the Network tab and look for the red row: the URL it asked for tells you what's wrong.",
    }),
    mistake({
      title: "A script that runs before the page exists",
      language: "html",
      wrong: [
        "<head>",
        '  <script src="app.js"></script>',
        "</head>",
        "<body><button>Add</button></body>",
      ],
      problem:
        'The browser runs the script as soon as it meets it, before the button has been read, so `document.querySelector("button")` finds nothing.',
      right: [
        "<head>",
        '  <script src="app.js" defer></script>',
        "</head>",
        "<body><button>Add</button></body>",
      ],
      why: '`defer` (or `type="module"`, or putting the script at the end of the body) waits until the HTML has been read.',
    }),
    mistake({
      title: "Looking for JavaScript's changes in View Source",
      language: "html",
      wrong: ["<!-- View Source: -->", '<div id="root"></div>'],
      problem:
        "View Source shows the HTML as it arrived. Everything JavaScript added afterwards, like React's notes, isn't there.",
      right: [
        "<!-- DevTools → Elements: -->",
        '<div id="root"><main>…</main></div>',
      ],
      why: "Use the Elements panel to see the live [[dom]] as it is now.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Link the stylesheet",
      task: "The page needs its styles from `app.css`. Add a `<link>` to the `<head>` that loads it as a stylesheet.",
      starter: [
        "<head>",
        "  <title>Notes</title>",
        "</head>",
        "<body>",
        "  <h1>My notes</h1>",
        "</body>",
      ],
      checks: [
        {
          kind: "exists",
          label: "There's a stylesheet link",
          selector: 'link[rel="stylesheet"]',
        },
        {
          kind: "attr",
          label: "It loads app.css",
          selector: 'link[rel="stylesheet"]',
          name: "href",
          value: "app.css",
        },
      ],
      hint: '`<link rel="stylesheet" href="app.css">`: `rel` says what kind of file, `href` where it is.',
      solution: [
        "<head>",
        "  <title>Notes</title>",
        '  <link rel="stylesheet" href="app.css">',
        "</head>",
        "<body>",
        "  <h1>My notes</h1>",
        "</body>",
      ],
    }),
    pageYourTurn({
      title: "Which language?",
      task: "Replace each `?` with the language you'd use for that job: `HTML`, `CSS` or `JavaScript`.",
      starter: [
        '<p>Add a heading to the page: <span id="heading">?</span></p>',
        '<p>Make the heading red: <span id="red">?</span></p>',
        '<p>Show a message when a button is clicked: <span id="click">?</span></p>',
        '<p>Put the sidebar on the left: <span id="layout">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Content is HTML",
          selector: "#heading",
          text: "HTML",
        },
        {
          kind: "text",
          label: "Colour is CSS",
          selector: "#red",
          text: "CSS",
        },
        {
          kind: "text",
          label: "Responding to clicks is JavaScript",
          selector: "#click",
          text: "JavaScript",
        },
        {
          kind: "text",
          label: "Layout is CSS",
          selector: "#layout",
          text: "CSS",
        },
      ],
      hint: "What's there: HTML. How it looks and where it sits: CSS. What happens when you use it: JavaScript.",
      solution: [
        '<p>Add a heading to the page: <span id="heading">HTML</span></p>',
        '<p>Make the heading red: <span id="red">CSS</span></p>',
        '<p>Show a message when a button is clicked: <span id="click">JavaScript</span></p>',
        '<p>Put the sidebar on the left: <span id="layout">CSS</span></p>',
      ],
    }),
    pageYourTurn({
      title: "What failed to load?",
      task: "For each thing you see, replace `?` with the file that failed: `CSS`, `JavaScript` or `image`.",
      starter: [
        '<p>Plain black text, no colours or layout: <span id="plain">?</span></p>',
        '<p>The Notes App is a completely blank page: <span id="blank">?</span></p>',
        '<p>A box with the words “Notes logo” in it: <span id="logo">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "No styles means the CSS",
          selector: "#plain",
          text: "CSS",
        },
        {
          kind: "text",
          label: "A blank React app means the JavaScript",
          selector: "#blank",
          text: "JavaScript",
        },
        {
          kind: "text",
          label: "Alt text means the image",
          selector: "#logo",
          text: "image",
        },
      ],
      hint: "Text arrived but looks plain? Styles. Nothing at all in a React app? The script that builds it. Words where a picture should be? That's its alt text.",
      solution: [
        '<p>Plain black text, no colours or layout: <span id="plain">CSS</span></p>',
        '<p>The Notes App is a completely blank page: <span id="blank">JavaScript</span></p>',
        '<p>A box with the words “Notes logo” in it: <span id="logo">image</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("The browser's job", [
      ["find", "Turn the name into an address.", "DNS"],
      ["ask", "Request the page, then each file.", "GET /app.css"],
      ["build", "DOM, CSS, layout, paint.", "rendering"],
      ["HTML", "What's on the page; names the files.", "<h1>, <link>"],
      ["CSS", "How it looks.", "color: teal"],
      ["JavaScript", "What it does.", "onClick, fetch"],
      ["many files", "One request each, side by side.", "HTML, CSS, JS…"],
      ["a file fails", "Each failure looks different.", "plain text = CSS"],
      ["see them", "DevTools → Network; Elements.", "F12"],
    ]),
    quickCheck(
      "How many requests does a page with one stylesheet, two images and one script make, at least?",
      ["1", "4", "5"],
      2,
      "One for the HTML, then one per file it names: 1 + 1 + 2 + 1 = 5.",
    ),
  ),
);
