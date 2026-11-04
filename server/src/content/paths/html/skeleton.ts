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
  playground,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// The page skeleton in depth: the frame every page shares (anatomy), the
// doctype and lang, what goes in the head, charset and viewport, linking CSS
// and JavaScript, a whole page to edit, a step-through of the browser
// reading it, comments and spaces, the Notes App's index.html, mistakes,
// practice and a recap.
export const skeletonModule = moduleLesson(
  "page-skeleton",
  "The page skeleton: doctype, head and body",
  40,
  [
    "Write the skeleton every HTML page shares, from `<!doctype html>` to `</html>`.",
    "Tell what belongs in `<head>` (about the page) from what belongs in `<body>` (the page).",
    "Set the language, the character set, the viewport and the title.",
    "Link a style sheet and a script from the head.",
    "Use comments, and predict how the browser treats spaces and line breaks.",
  ],

  part(
    "why",
    "Every page has the same frame",
    explain(
      "Every [[html-document]] on the web, from a one-line test to a huge web app, sits in the same frame: a [[doctype]] line, then an `<html>` element holding two parts. `<head>` is **about** the page: its title, its language settings, which CSS and JavaScript to load. `<body>` **is** the page: everything you see.",
    ),
    diagram([
      ["<!doctype html>", "“this is modern HTML”"],
      ['<html lang="en">', "the whole page, in English"],
      ["<head>", "about the page: title, charset, viewport, CSS, scripts"],
      ["<body>", "the page itself: headings, text, images, forms"],
    ]),
  ),

  part(
    "skeleton",
    "The skeleton, piece by piece",
    anatomy(
      "The frame around every page",
      [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>…</head>",
        "  <body>…</body>",
      ],
      [
        [
          "<!doctype html>",
          "the doctype",
          "Not an element: tells the browser to use modern rules.",
        ],
        [
          '<html lang="en">',
          "the root element",
          "Holds everything else; `lang` says the page's language.",
        ],
        [
          "<head>…</head>",
          "the head",
          "Information for the browser. Nothing in it is drawn on the page.",
        ],
        ["<body>…</body>", "the body", "Everything people see and use."],
      ],
    ),
    quickCheck(
      "Where does the text you see on the page go?",
      ["In `<head>`", "In `<body>`", "Before `<!doctype html>`"],
      1,
      "`<body>` holds everything visible; `<head>` describes the page.",
    ),
  ),

  part(
    "doctype-and-lang",
    "The doctype and the language",
    explain(
      "`<!doctype html>` looks odd because it's a leftover from HTML's history: it's the same short line on every modern page. Leave it out and browsers switch to **quirks mode**, copying old layout bugs, so your CSS behaves strangely. The `lang` [[attribute]] on `<html>` tells screen readers which voice to use, translators which language to start from, and search engines who the page is for.",
    ),
    code(
      "html",
      "the first two lines",
      ["<!doctype html>", '<html lang="en">', "  …", "</html>"],
      {
        1: "modern rules, not quirks mode",
        2: "English; French is fr, Nepali is ne, German is de",
      },
    ),
    keyPoints(
      "`<!doctype html>` is always the very first line, before anything else.",
      "Set `lang` on `<html>`; a part in another language can set its own `lang`.",
      "There's exactly one `<head>` and one `<body>`, inside one `<html>`.",
    ),
  ),

  part(
    "inside-the-head",
    "What goes in the head",
    explain(
      "`<head>` holds instructions and information, not content. Most of it is [[void-element|void elements]] (`<meta>` and `<link>`), plus a `<title>`. Here's what you'll find in the head of almost every real page:",
    ),
    reference("Head elements", [
      [
        '<meta charset="utf-8">',
        "How letters are stored. First in the head.",
        '<meta charset="utf-8">',
      ],
      [
        '<meta name="viewport">',
        "Phones: use your real width.",
        'content="width=device-width, initial-scale=1"',
      ],
      [
        "<title>",
        "The tab's text, bookmarks, search results.",
        "<title>My notes</title>",
      ],
      [
        '<meta name="description">',
        "A sentence search engines may show.",
        'content="Write and find your notes."',
      ],
      [
        '<link rel="stylesheet">',
        "Loads a CSS file.",
        '<link rel="stylesheet" href="style.css">',
      ],
      [
        '<link rel="icon">',
        "The little picture on the tab.",
        '<link rel="icon" href="favicon.svg">',
      ],
      [
        "<script>",
        "Loads or runs JavaScript.",
        '<script src="app.js" defer></script>',
      ],
      ["<style>", "CSS written right in the page.", "<style>h1 { … }</style>"],
    ]),
  ),

  part(
    "charset-and-viewport",
    "charset, viewport and title",
    explain(
      'Three lines matter on every page. `<meta charset="utf-8">` sets the [[character-encoding]], so “café” and “नमस्ते” show correctly. The [[viewport-meta|viewport meta tag]] stops phones pretending to be a wide desktop screen and shrinking your page. And `<title>` names the tab, the bookmark and the link in search results.',
    ),
    code(
      "html",
      "a typical head",
      [
        "<head>",
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        "  <title>My notes</title>",
        "</head>",
      ],
      {
        2: "how letters are stored: first",
        3: "phones: use your real width",
        4: "the tab's title",
      },
    ),
    quickCheck(
      "Without the viewport line, what happens on a phone?",
      [
        "Nothing changes",
        "The page is shown as a shrunk-down desktop page",
        "The page doesn't load",
      ],
      1,
      "Phones assume a wide desktop page and zoom out, unless the [[viewport-meta|viewport meta tag]] says otherwise.",
    ),
  ),

  part(
    "css-and-js",
    "Linking CSS and JavaScript",
    explain(
      "CSS and JavaScript usually live in their own files, and the head says where to find them. A style sheet is loaded with `<link rel=\"stylesheet\">`, so the page is styled before it's drawn. A script is loaded with `<script src>`; adding `defer` lets the browser finish reading the HTML first and run the script after. You'll see why that order matters in [[script-loading|the Advanced level]].",
    ),
    code(
      "html",
      "a head that loads CSS and JavaScript",
      [
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>My notes</title>",
        '  <link rel="stylesheet" href="style.css">',
        '  <script src="app.js" defer></script>',
        "</head>",
      ],
      {
        4: "a void element: no closing tag",
        5: "script always needs </script>, even with src",
      },
    ),
  ),

  part(
    "build-a-page",
    "A whole page to edit",
    explain(
      "Here's a complete page. Change the `<title>`: it's not shown in the preview, because the title goes on the tab, not the page. Then edit the body and watch the preview change. Try writing a `<p>` inside the head: the browser quietly moves it into the body, because the head can't hold content.",
    ),
    playground("Your first whole page", [
      "<!doctype html>",
      '<html lang="en">',
      "  <head>",
      '    <meta charset="utf-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1">',
      "    <title>My notes</title>",
      "    <style>",
      "      body { font-family: sans-serif; }",
      "    </style>",
      "  </head>",
      "  <body>",
      "    <h1>My notes</h1>",
      "    <p>Write anything here. Café, नमस्ते and 🎉 all work.</p>",
      "  </body>",
      "</html>",
    ]),
  ),

  part(
    "how-the-browser-reads-it",
    "How the browser reads a page",
    explain(
      "The browser reads the file from the top, and each line of the skeleton changes something before a single word is drawn. Step through it and watch what the browser knows so far:",
    ),
    trace(
      "Reading a page, move by move",
      [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>My notes</title>",
        "</head>",
        "<body>",
        "  <h1>My notes</h1>",
        "</body>",
      ],
      [
        {
          line: 1,
          note: "The doctype: use modern, standards rules for layout, not quirks mode.",
          vars: [["mode", "standards"]],
        },
        {
          line: 2,
          note: "The root element opens. The page is in English, so a screen reader picks an English voice.",
          vars: [
            ["mode", "standards"],
            ["language", "en"],
          ],
          stack: ["html"],
        },
        {
          line: 4,
          note: "Inside the head, `charset` says to read the rest of the file as UTF-8, so every letter comes out right.",
          vars: [
            ["mode", "standards"],
            ["language", "en"],
            ["charset", "utf-8"],
          ],
          stack: ["html", "head"],
        },
        {
          line: 5,
          note: "The title goes on the tab. Nothing has been drawn on the page yet.",
          vars: [
            ["mode", "standards"],
            ["language", "en"],
            ["charset", "utf-8"],
            ["tab", "My notes"],
          ],
          stack: ["html", "head"],
          output: "tab: My notes",
        },
        {
          line: 7,
          note: "The head is closed and the body opens: from here on, elements are drawn on the page.",
          vars: [
            ["mode", "standards"],
            ["language", "en"],
            ["charset", "utf-8"],
            ["tab", "My notes"],
          ],
          stack: ["html", "body"],
        },
        {
          line: 8,
          note: "The first thing on the page: a heading.",
          vars: [
            ["mode", "standards"],
            ["language", "en"],
            ["charset", "utf-8"],
            ["tab", "My notes"],
          ],
          stack: ["html", "body"],
          output: "page: My notes (h1)",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "comments-and-spaces",
    "Comments and spaces",
    explain(
      "A [[html-comment|comment]], `<!-- like this -->`, is a note for people that the browser doesn't show. Spaces, tabs and line breaks in the HTML are **collapsed**: however many you type between two words, the page shows one space. That's why you're free to indent nested elements so the structure is easy to read.",
    ),
    code(
      "html",
      "what the browser does with spaces",
      [
        "<!-- The list of today's notes -->",
        "<p>Buy     milk",
        "",
        "   and eggs.</p>",
      ],
      {
        1: "not shown, but anyone can read it with View source",
        2: "shown as “Buy milk and eggs.”: one space each",
      },
    ),
    keyPoints(
      "Indent nested elements so the structure is easy to read.",
      "Comments are sent to every visitor: no secrets.",
      "Use `<p>` for new paragraphs, not empty lines.",
    ),
    quickCheck(
      "You put three empty lines between two words in the HTML. What does the page show?",
      ["Three empty lines", "One space", "An error"],
      1,
      "The browser collapses spaces and line breaks into a single space.",
    ),
  ),

  part(
    "where-used",
    "The Notes App's page",
    explain(
      'The Notes App\'s `index.html` is a full skeleton with an almost empty body. The head has everything from this module: charset, viewport and the title “Notes”. The body has one empty `<div id="root">` and one script. React, written in JavaScript, builds every heading, form and note inside that div while the page runs.',
    ),
    inTheNotesApp(
      'The Notes App\'s `index.html`: `<!doctype html>`, `<html lang="en">`, a head with charset, viewport and `<title>Notes</title>`, and a body with a comment, `<div id="root"></div>` and `<script type="module" src="/src/main.jsx">`.',
      { fileId: "frontend/index.html" },
    ),
    quickCheck(
      "Why is the Notes App's `<body>` almost empty?",
      [
        "The page is broken",
        "JavaScript (React) builds the content inside it",
        "The content is in `<head>`",
      ],
      1,
      'React creates the elements and puts them into `<div id="root">` while the page runs.',
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Leaving out the doctype",
      language: "html",
      wrong: ['<html lang="en">', "  <head>…</head>"],
      problem:
        "The browser falls into quirks mode, so sizes and spacing in your CSS come out differently from what you expect.",
      right: ["<!doctype html>", '<html lang="en">', "  <head>…</head>"],
      why: "Start every page with `<!doctype html>`.",
    }),
    mistake({
      title: "No charset",
      language: "html",
      wrong: ["<head>", "  <title>Café notes</title>", "</head>"],
      problem:
        "The browser may guess the wrong encoding and show “CafÃ© notes”.",
      right: [
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>Café notes</title>",
        "</head>",
      ],
      why: 'Put `<meta charset="utf-8">` first in the head, before any text.',
    }),
    mistake({
      title: "Content in the head",
      language: "html",
      wrong: ["<head>", "  <h1>My notes</h1>", "</head>"],
      problem:
        "The head can't hold content. The browser ends the head early and moves the heading into the body, and anything after it in the head ends up in the body too.",
      right: [
        "<head><title>My notes</title></head>",
        "<body>",
        "  <h1>My notes</h1>",
        "</body>",
      ],
      why: "The head describes the page; everything visible goes in the body.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Complete the head",
      task: 'Make the page English with `lang="en"`, and add the two lines every head needs: `<meta charset="utf-8">` and the viewport line with `content="width=device-width, initial-scale=1"`.',
      starter: [
        "<!doctype html>",
        "<html>",
        "  <head>",
        "    <title>My notes</title>",
        "  </head>",
        "  <body>",
        "    <h1>My notes</h1>",
        "  </body>",
        "</html>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The page is in English",
          selector: "html",
          name: "lang",
          value: "en",
        },
        {
          kind: "exists",
          label: "A charset in the head",
          selector: "head meta[charset]",
        },
        {
          kind: "attr",
          label: "The viewport line",
          selector: 'head meta[name="viewport"]',
          name: "content",
          value: "width=device-width, initial-scale=1",
        },
        {
          kind: "text",
          label: "The title is still there",
          selector: "head title",
          text: "My notes",
        },
      ],
      hint: '`<html lang="en">`, then in the head: `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
      solution: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1">',
        "    <title>My notes</title>",
        "  </head>",
        "  <body>",
        "    <h1>My notes</h1>",
        "  </body>",
        "</html>",
      ],
    }),
    pageYourTurn({
      title: "Name the page",
      task: 'The tab says “Untitled”. Change the title to `Shopping list`, and add a description: a `<meta name="description">` whose `content` is `Things to buy this week.`',
      starter: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>Untitled</title>",
        "  </head>",
        "  <body>",
        "    <h1>Shopping list</h1>",
        "  </body>",
        "</html>",
      ],
      checks: [
        {
          kind: "text",
          label: "The tab's title",
          selector: "title",
          text: "Shopping list",
        },
        {
          kind: "attr",
          label: "A description",
          selector: 'head meta[name="description"]',
          name: "content",
          value: "Things to buy this week.",
        },
        { kind: "count", label: "Only one title", selector: "title", count: 1 },
      ],
      hint: '`<title>Shopping list</title>` and `<meta name="description" content="Things to buy this week.">`, both in the head.',
      solution: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>Shopping list</title>",
        '    <meta name="description" content="Things to buy this week.">',
        "  </head>",
        "  <body>",
        "    <h1>Shopping list</h1>",
        "  </body>",
        "</html>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Skeleton cheat sheet", [
      ["<!doctype html>", "First line: modern rules.", "never leave it out"],
      ["<html lang>", "The root; the page's language.", '<html lang="en">'],
      ["<head>", "About the page; nothing drawn.", "charset, viewport, title"],
      ["<body>", "Everything visible.", "<h1>, <p>, <img>, <form>"],
      ["<meta charset>", "UTF-8, first in the head.", '<meta charset="utf-8">'],
      [
        "viewport",
        "Real width on phones.",
        "width=device-width, initial-scale=1",
      ],
      ["<title>", "Tab, bookmark, search result.", "<title>My notes</title>"],
      [
        "<link> / <script>",
        "Load CSS / JavaScript.",
        '<script src="app.js" defer>',
      ],
      ["<!-- … -->", "A comment; spaces collapse.", "no secrets in comments"],
    ]),
    quickCheck(
      "Which of these belongs in `<head>`?",
      ["`<h1>My notes</h1>`", "`<title>My notes</title>`", "`<p>Buy milk</p>`"],
      1,
      "The title describes the page and shows on the tab. Headings and paragraphs are content, so they go in the body.",
    ),
  ),
);
