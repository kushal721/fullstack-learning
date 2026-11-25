import {
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
} from "../blocks.js";

// Inside the browser: rendering and DevTools. The rendering pipeline, the
// live DOM, what a change costs, deleting a note step by step, sixty
// frames a second, a DevTools tour, Elements and Console, Network in
// depth, Application, debugging the Notes App, mistakes, practice and a
// recap.
export const insideTheBrowserModule = moduleLesson(
  "inside-the-browser",
  "Inside the browser: rendering and DevTools",
  40,
  [
    "Name the steps that turn HTML and CSS into pixels, and what each does.",
    "Say which changes cost layout, paint or only compositing.",
    "Explain the 16 ms frame budget and why long tasks feel janky.",
    "Find your way around DevTools: Elements, Console, Network and Application.",
    "Debug a failing request from symptom to cause.",
  ],

  part(
    "the-pipeline",
    "From HTML to pixels, in detail",
    explain(
      "[[rendering|Rendering]] is a pipeline. The browser parses HTML into the [[dom]] and CSS into the CSSOM, combines them into a tree of what's visible, works out every box's size and place (**layout**), fills in the pixels (**paint**) and stacks the painted layers onto the screen (**composite**). Each step feeds the next.",
    ),
    reference("The rendering pipeline", [
      ["Parse", "HTML → DOM; CSS → CSSOM.", "<li> → an element"],
      ["Style", "Which CSS rules apply to each element.", ".note-card h2"],
      ["Layout", "Every box's size and position.", "300 × 120 at (16, 80)"],
      ["Paint", "Fill in text, colours, borders, images.", "pixels per layer"],
      ["Composite", "Stack layers into the final frame.", "on the GPU"],
    ]),
  ),

  part(
    "the-live-dom",
    "The DOM is live",
    explain(
      "The HTML file is only the starting point. The DOM is a live tree of objects that JavaScript can change at any time, and React changes it constantly. DevTools' **Elements** panel shows the DOM as it is *now*, not as it arrived. Here's one Notes App card in the Elements panel:",
    ),
    anatomy(
      "One note card in the DOM",
      [
        '<article class="note-card">',
        "  <h2>Milk</h2>",
        "  <p>2 litres</p>",
        '  <div class="note-actions">…',
      ],
      [
        ["article", "element", "One DOM node; React created it."],
        ['class="note-card"', "attribute", "What the CSS selects on."],
        ["<h2>Milk</h2>", "child", "A node inside it, with a text node."],
        [
          'class="note-actions"',
          "child",
          "The Edit and Delete buttons live here.",
        ],
      ],
    ),
  ),

  part(
    "what-a-change-costs",
    "What a change costs",
    explain(
      "When something changes, the browser reruns the pipeline from the first step that's affected. Changing a width moves other boxes, so it costs layout, paint and composite. Changing a colour only needs repainting. Changing `transform` or `opacity` can skip both: the layer is just moved or faded on the GPU. That's why smooth animations use those two.",
    ),
    reference("Which steps a change reruns", [
      ["width, height, margin", "Layout → paint → composite.", "slowest"],
      [
        "Adding or removing elements",
        "Layout → paint → composite.",
        "a new note",
      ],
      ["color, background", "Paint → composite.", "a hover colour"],
      ["transform, opacity", "Composite only.", "slide, fade"],
    ]),
  ),

  part(
    "step-by-step",
    "Deleting a note, step by step",
    explain(
      "Step through what happens between clicking **Delete** on a note and the next frame on screen. Watch which pipeline steps run, and where the time goes:",
    ),
    trace(
      "Delete “Milk”, to the next frame",
      [
        "click Delete on Milk",
        "DELETE /api/notes/8",
        "← 204 No Content",
        "setNotes(without 8)",
        "React removes one <article>",
        "style: recalculate",
        "layout: cards below move up",
        "paint: the changed area",
        "composite: new frame",
      ],
      [
        {
          line: 2,
          note: "The click handler calls `removeNote(8)`, which sends the request. The page stays responsive while it waits.",
          vars: [["waiting for", "the network"]],
        },
        {
          line: 4,
          note: "The 204 arrives, so the hook updates state with a new array that leaves note 8 out.",
          vars: [["notes", "2 → 1"]],
        },
        {
          line: 5,
          note: "React compares the old and new lists and makes one change to the DOM: it removes that card's `<article>`.",
          vars: [["DOM changes", "1 node removed"]],
        },
        {
          line: 7,
          note: "Removing an element changes where everything after it sits, so layout runs: the cards below move up.",
          vars: [
            ["DOM changes", "1 node removed"],
            ["layout", "yes"],
          ],
        },
        {
          line: 9,
          note: "Only the changed area is repainted, then the layers are composited into the next frame. All in a few milliseconds.",
          vars: [["frame", "~4 ms of work"]],
          output: "the card is gone in the next frame",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "sixty-frames",
    "Sixty frames a second",
    explain(
      "Most screens show 60 frames a second, so the browser has about **16.7 ms** per frame for your JavaScript, style, layout and paint. Go over and a frame is skipped: scrolling stutters and clicks feel slow. JavaScript runs on the same [[main-thread|main thread]] as rendering, so a script that runs for 200 ms freezes the page for 200 ms.",
    ),
    keyPoints(
      "60 frames a second: about 16.7 ms each.",
      "JavaScript and rendering share one main thread.",
      "A task over 50 ms is a long task: it blocks clicks.",
      "Animate `transform` and `opacity` to skip layout and paint.",
    ),
    quickCheck(
      "A click handler runs for 300 ms. What does the user see?",
      [
        "Nothing different",
        "The page freezes: nothing redraws until the handler finishes",
        "The handler runs in the background",
      ],
      1,
      "Rendering waits for JavaScript on the main thread, so no frames are drawn for those 300 ms.",
    ),
  ),

  part(
    "devtools-tour",
    "A DevTools tour",
    explain(
      "[[devtools|DevTools]] (F12, or Cmd+Option+I on a Mac) is a set of panels, each answering one kind of question. You'll use four almost every day: Elements, Console, Network and Application.",
    ),
    reference("DevTools panels", [
      ["Elements", "The live DOM and its CSS; edit both.", "why is this blue?"],
      ["Console", "Errors, logs, and JavaScript you type.", "is it null?"],
      ["Sources", "Your code, with breakpoints.", "pause on line 12"],
      ["Network", "Every request, with timing.", "why did it 400?"],
      ["Performance", "A recording of every frame.", "why is it janky?"],
      ["Application", "Cookies and storage.", "am I logged in?"],
      ["Lighthouse", "Speed and accessibility scores.", "how fast is it?"],
    ]),
  ),

  part(
    "elements-and-console",
    "Elements and Console",
    explain(
      "In **Elements**, click the arrow icon and then anything on the page to jump to its node; the **Styles** pane shows every rule that applies, crossed out where something overrides it, and you can edit both live. The **Console** shows errors in red and runs JavaScript against the page, with a few shortcuts:",
    ),
    code(
      "js",
      "Console shortcuts",
      [
        "$0",
        "$0.textContent",
        '$$(".note-card").length',
        "console.table(notes)",
        "copy($0.outerHTML)",
      ],
      {
        1: "the element selected in Elements",
        2: "its text: “Milk”",
        3: "$$ is querySelectorAll, as an array",
        4: "print an array of objects as a table",
        5: "copy the element's HTML to the clipboard",
      },
    ),
  ),

  part(
    "network-in-depth",
    "Network in depth",
    explain(
      "The **Network** panel lists every request. Click one for its Headers, Payload, Response and Timing. A few switches at the top change what you see: keep requests across page loads, skip the cache, or pretend to be on a slow phone connection:",
    ),
    reference("Network panel switches", [
      ["Fetch/XHR filter", "Only API calls.", "hide images and CSS"],
      [
        "Preserve log",
        "Keep requests when the page reloads.",
        "a login redirect",
      ],
      [
        "Disable cache",
        "Always download (while DevTools is open).",
        "test a deploy",
      ],
      ["Throttling", "Pretend to be a slow connection.", "Slow 4G"],
      [
        "Copy as cURL",
        "Repeat the request in a terminal.",
        "right-click a row",
      ],
    ]),
  ),

  part(
    "application",
    "Application: cookies and storage",
    explain(
      "The **Application** panel shows what the site has stored in your browser. Under **Cookies** you'll see the Notes App's `token`, with ticks for HttpOnly and Secure and its SameSite value: scripts can't read it, but you can. Delete it here and the next request answers 401: a quick way to test what logged-out users see.",
    ),
    keyPoints(
      "Cookies: name, value, expiry, HttpOnly, Secure, SameSite.",
      "Local storage: data scripts keep between visits.",
      "Delete a cookie to test logging out.",
      "“Clear site data” resets everything for the site.",
    ),
  ),

  part(
    "debugging-the-notes-app",
    "Debugging the Notes App",
    explain(
      "Most bugs show up as a symptom far from their cause. Start from what you see, then use the panel that answers the next question. For a note that won't save:",
    ),
    reference("A note won't save: where to look", [
      [
        "No request in Network",
        "The handler didn't run: check Console for errors.",
        "Console",
      ],
      [
        "POST → 400",
        "Read the Response: the API says what's wrong.",
        '"Title is required"',
      ],
      [
        "POST → 401",
        "Not logged in: is the token cookie there?",
        "Application",
      ],
      ["POST → 500", "The server failed: read its logs.", "the terminal"],
      [
        "201, but no card",
        "The response arrived; check the state update.",
        "Sources",
      ],
    ]),
    inTheNotesApp(
      "`request.js` turns every non-2xx response into an error with the API's message, which is what the form shows.",
      { fileId: "frontend/src/services/request.js" },
    ),
    inTheNotesApp(
      '`NoteCard.jsx` is the card you inspect in Elements: an `<article class="note-card">`.',
      { fileId: "frontend/src/components/NoteCard.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Animating layout properties",
      language: "css",
      wrong: [
        ".panel {",
        "  transition: left 0.3s;",
        "}",
        ".panel.open { left: 0; }",
      ],
      problem:
        "`left` changes layout, so every frame of the animation reruns layout and paint. On a slow phone it stutters.",
      right: [
        ".panel {",
        "  transition: transform 0.3s;",
        "}",
        ".panel.open {",
        "  transform: translateX(0);",
        "}",
      ],
      why: "Move things with `transform` and fade with `opacity`: compositing only, smooth even on slow devices.",
    }),
    mistake({
      title: "Reading layout in a loop that writes it",
      wrong: [
        "for (const card of cards) {",
        "  const h = list.offsetHeight;",
        "  card.style.height = h + 'px';",
        "}",
      ],
      problem:
        "Each write invalidates layout, and each read of `offsetHeight` forces the browser to redo it at once: layout runs once per card.",
      right: [
        "const height = list.offsetHeight;",
        "for (const card of cards) {",
        "  card.style.height = height + 'px';",
        "}",
      ],
      why: "Read layout values first, then make all the writes.",
    }),
    mistake({
      title: "Losing the request you need",
      language: "bash",
      wrong: ["# log in → redirected → the Network list is empty"],
      problem:
        "By default the Network panel clears when the page navigates, so the request that went wrong disappears with it.",
      right: ["# tick Preserve log, then log in again"],
      why: "Turn on Preserve log whenever the bug involves a reload or redirect.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "What does it rerun?",
      task: "Replace each `?` with the first pipeline step the change makes the browser rerun: `layout`, `paint` or `composite`.",
      starter: [
        '<p>width: 300px → 400px: <span id="width">?</span></p>',
        '<p>color: black → red: <span id="color">?</span></p>',
        '<p>transform: translateX(100px): <span id="move">?</span></p>',
        '<p>opacity: 1 → 0.5: <span id="fade">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A size changes layout",
          selector: "#width",
          text: "layout",
        },
        {
          kind: "text",
          label: "A colour only repaints",
          selector: "#color",
          text: "paint",
        },
        {
          kind: "text",
          label: "transform is composite only",
          selector: "#move",
          text: "composite",
        },
        {
          kind: "text",
          label: "opacity is composite only",
          selector: "#fade",
          text: "composite",
        },
      ],
      hint: "Does it move other boxes? Layout. Only change pixels? Paint. Just move or fade a layer? Composite.",
      solution: [
        '<p>width: 300px → 400px: <span id="width">layout</span></p>',
        '<p>color: black → red: <span id="color">paint</span></p>',
        '<p>transform: translateX(100px): <span id="move">composite</span></p>',
        '<p>opacity: 1 → 0.5: <span id="fade">composite</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Which panel?",
      task: "Replace each `?` with the DevTools panel to open first: `Elements`, `Console`, `Network` or `Application`.",
      starter: [
        '<p>See why saving a note answered 400: <span id="saving">?</span></p>',
        '<p>Check the login cookie is there: <span id="cookie">?</span></p>',
        '<p>Try a new colour on a heading, live: <span id="colour">?</span></p>',
        '<p>Read a red error the script threw: <span id="error">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Requests are in Network",
          selector: "#saving",
          text: "Network",
        },
        {
          kind: "text",
          label: "Cookies are in Application",
          selector: "#cookie",
          text: "Application",
        },
        {
          kind: "text",
          label: "Live CSS is in Elements",
          selector: "#colour",
          text: "Elements",
        },
        {
          kind: "text",
          label: "Errors are in Console",
          selector: "#error",
          text: "Console",
        },
      ],
      hint: "Requests: Network. Stored data: Application. The DOM and its CSS: Elements. Errors and logs: Console.",
      solution: [
        '<p>See why saving a note answered 400: <span id="saving">Network</span></p>',
        '<p>Check the login cookie is there: <span id="cookie">Application</span></p>',
        '<p>Try a new colour on a heading, live: <span id="colour">Elements</span></p>',
        '<p>Read a red error the script threw: <span id="error">Console</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Smooth the animation",
      task: "The panel slides in by animating `left`, which reruns layout every frame. Change the `transition` so it animates `transform` instead (keep `0.3s`).",
      starter: ['<div id="panel" style="transition: left 0.3s">Notes</div>'],
      checks: [
        {
          kind: "exists",
          label: "The panel is still there",
          selector: "#panel",
        },
        {
          kind: "attr",
          label: "It transitions transform",
          selector: "#panel",
          name: "style",
          value: "transition: transform 0.3s",
        },
      ],
      hint: "Only the property name changes: `left` becomes `transform`.",
      solution: [
        '<div id="panel" style="transition: transform 0.3s">Notes</div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Inside the browser cheat sheet", [
      ["pipeline", "Parse, style, layout, paint, composite.", "every frame"],
      ["DOM", "Live tree; Elements shows it now.", "$0"],
      ["layout", "Sizes and positions: width, new nodes.", "costly"],
      ["paint", "Pixels: colours, text.", "color"],
      ["composite", "Move or fade layers only.", "transform, opacity"],
      ["frame budget", "~16.7 ms at 60 fps.", "long task > 50 ms"],
      ["Console", "Errors, logs, $0, $$, copy().", "$$('.note-card')"],
      ["Network", "Requests; Preserve log, throttling.", "Copy as cURL"],
      ["Application", "Cookies and storage.", "token, HttpOnly"],
    ]),
    quickCheck(
      "Scrolling stutters while a slide-in panel animates `width`. What's the best fix?",
      [
        "Animate `transform` instead, so each frame only composites",
        "Add more RAM",
        "Animate `height` instead",
      ],
      0,
      "`width` reruns layout every frame. `transform` skips layout and paint entirely.",
    ),
  ),
);
