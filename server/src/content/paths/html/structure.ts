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

// Meaningful structure in depth: meaning over looks, the structure tags
// (anatomy and a page-layout chart), building a page, div vs section vs
// article, the heading outline, a step-through of how a screen reader
// reads a page, landmarks, where it's used, mistakes, practice and a recap.
export const structureModule = moduleLesson(
  "semantic-structure",
  "Meaningful structure: landmarks and headings",
  40,
  [
    "Explain why HTML should say what each part of a page is, not how it looks.",
    "Lay out a page with `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>` and `<footer>`.",
    "Choose between `<div>`, `<section>` and `<article>`.",
    "Build a heading outline: one `<h1>`, then levels in order without skipping.",
    "Describe how screen readers use landmarks and headings to move around a page.",
  ],

  part(
    "why",
    "Meaning, not looks",
    explain(
      "Two pages can look identical while one is a pile of `<div>`s and the other says what each part **is**. That's [[html-semantic-structure|semantic HTML]]. The difference is invisible to sighted mouse users, and huge for everyone else: screen readers jump between parts, search engines find the main content, and the next developer understands the page at a glance.",
    ),
    code(
      "html",
      "the same page, twice",
      [
        "<!-- Says nothing -->",
        '<div class="top">Notes</div>',
        '<div class="links">…</div>',
        '<div class="content">…</div>',
        "",
        "<!-- Says what each part is -->",
        "<header>Notes</header>",
        "<nav>…</nav>",
        "<main>…</main>",
      ],
      {
        2: "a box; only the class hints at its job",
        7: "the page's header: a landmark",
        9: "the main content: screen readers can jump here",
      },
    ),
    keyPoints(
      "HTML says what something is; CSS decides how it looks.",
      "Semantic elements cost nothing, and help screen readers, search engines and developers.",
      "Use `<div>` only when no element with a meaning fits.",
    ),
  ),

  part(
    "structure-tags",
    "The structure tags",
    explain(
      "A handful of elements describe the big parts of almost any page. Most pages have a `<header>` at the top, a `<nav>` of main links, one `<main>` with the content, and a `<footer>`. Inside the main content, an `<article>` holds something self-contained and a `<section>` a themed part.",
    ),
    anatomy(
      "A page's big parts",
      [
        "<header>…</header>",
        "<nav>…</nav>",
        "<main>…</main>",
        "<footer>…</footer>",
      ],
      [
        ["<header>", "the top", "Logo, page title, maybe the main links."],
        ["<nav>", "navigation", "The main links around the site."],
        ["<main>", "the content", "What this page is for. Only one per page."],
        ["<footer>", "the bottom", "Credits, contact, small print."],
      ],
    ),
    diagram([
      ["<header>", "site name, logo"],
      ["<nav>", "All notes · Starred · Settings"],
      ["<main>", "the content: <article>s, <section>s, maybe an <aside>"],
      ["<footer>", "© 2026 · Help · Privacy"],
    ]),
    reference("Tags that say what a part of the page is", [
      [
        "<header>",
        "The top of the page, or of an article.",
        "<header><h1>Notes</h1></header>",
      ],
      [
        "<nav>",
        "A group of main navigation links.",
        '<nav><a href="/">Home</a></nav>',
      ],
      ["<main>", "The page's main content; one per page.", "<main>…</main>"],
      [
        "<section>",
        "A themed part, with its own heading.",
        "<section><h2>Today</h2>…</section>",
      ],
      [
        "<article>",
        "Makes sense on its own: a note, a post.",
        "<article><h3>Milk</h3></article>",
      ],
      [
        "<aside>",
        "Beside the main point: tips, related links.",
        "<aside>Tip: …</aside>",
      ],
      [
        "<footer>",
        "The bottom of the page or an article.",
        "<footer>© 2026</footer>",
      ],
      [
        "<figure>",
        "An image or diagram with its caption.",
        "<figure><img …><figcaption>…</figcaption></figure>",
      ],
      [
        "<time>",
        "A date or time machines can read.",
        '<time datetime="2026-10-21">Today</time>',
      ],
    ]),
  ),

  part(
    "build-a-page",
    "Build a page with landmarks",
    explain(
      "Here's a notes page laid out with the structure tags. It looks plain, because there's no CSS yet: that's the point. The structure is all meaning. Add a second `<article>`, or move the `<aside>` out of `<main>`, and notice that nothing about the meaning gets in the way of the styling you'll add later.",
    ),
    playground("A notes page, in meaningful parts", [
      "<header>",
      "  <h1>Notes</h1>",
      '  <nav><a href="#">All</a> · <a href="#">Starred</a></nav>',
      "</header>",
      "<main>",
      "  <section>",
      "    <h2>Today</h2>",
      "    <article>",
      "      <h3>Shopping</h3>",
      "      <p>Milk, bread.</p>",
      '      <footer>Edited <time datetime="2026-11-03">today</time></footer>',
      "    </article>",
      "  </section>",
      "  <aside>Tip: star the notes you use most.</aside>",
      "</main>",
      "<footer>Made by you</footer>",
    ]),
  ),

  part(
    "div-section-article",
    "div, section or article?",
    explain(
      "Ask what the part **is**. If it would make sense on its own, copied to another page (a note, a blog post, a comment), it's an `<article>`. If it's a themed part of something bigger, with its own heading (“Today”, “Starred”), it's a `<section>`. If it's only there to group things for styling, with no meaning, it's a [[div-span|`<div>`]].",
    ),
    reference("Which one?", [
      [
        "<article>",
        "Self-contained: makes sense alone.",
        "a note, a post, a comment",
      ],
      [
        "<section>",
        "A themed part, with a heading.",
        "“Today”, “Starred notes”",
      ],
      ["<div>", "No meaning: a box for styling.", "a wrapper to centre things"],
    ]),
    quickCheck(
      "Each note in the Notes App's grid can be read on its own. Which element should wrap one note?",
      ["`<section>`", "`<article>`", "`<div>`"],
      1,
      "A note is self-contained, so it's an `<article>`. The grid holding them all is the `<section>`.",
    ),
  ),

  part(
    "headings",
    "The heading outline",
    explain(
      "Headings form the page's [[outline]], like a book's table of contents. Use **one** `<h1>` for what the whole page is about. Then go down one level at a time: `<h2>`s for its parts, `<h3>`s inside those. Never pick a level for its size: making it smaller is CSS's job.",
    ),
    code(
      "html",
      "an outline, by level",
      [
        "<h1>Your notes</h1>",
        "  <h2>Today</h2>",
        "    <h3>Shopping</h3>",
        "    <h3>Call the bank</h3>",
        "  <h2>Starred</h2>",
        "    <h3>Passwords to change</h3>",
      ],
      {
        1: "one h1: the page's subject",
        2: "a part of the page",
        3: "an item inside that part",
      },
    ),
    keyPoints(
      "One `<h1>` per page.",
      "Go down one level at a time; going back up is fine.",
      "Choose the level by meaning, then style the size with CSS.",
    ),
  ),

  part(
    "how-a-screen-reader-reads",
    "How a screen reader reads it",
    explain(
      "A screen reader doesn't read a page top to bottom like a speaker. It first lists the **landmarks** and **headings**, so a person can jump straight to the main content or the note they want, the way you skim with your eyes. Step through what it finds on this page:",
    ),
    trace(
      "What a screen reader finds, move by move",
      [
        "<header>",
        "  <h1>Notes</h1>",
        '  <nav><a href="/">All</a></nav>',
        "</header>",
        "<main>",
        "  <h2>Today</h2>",
        "  <article><h3>Shopping</h3></article>",
        "</main>",
        "<footer>Made by you</footer>",
      ],
      [
        {
          line: 1,
          note: "`<header>` at the top of the page is a **banner** landmark.",
          vars: [["landmarks", "banner"]],
          output: "banner",
        },
        {
          line: 2,
          note: "The `<h1>` goes in the headings list, at level 1.",
          vars: [
            ["landmarks", "banner"],
            ["headings", "1 Notes"],
          ],
        },
        {
          line: 3,
          note: "`<nav>` is a **navigation** landmark.",
          vars: [
            ["landmarks", "banner, navigation"],
            ["headings", "1 Notes"],
          ],
          output: "navigation",
        },
        {
          line: 5,
          note: "`<main>` is the **main** landmark. “Skip to main content” jumps here.",
          vars: [
            ["landmarks", "banner, navigation, main"],
            ["headings", "1 Notes"],
          ],
          output: "main",
        },
        {
          line: 7,
          note: "Lines 6 and 7 add two more headings, so the outline is complete. A user can press H to move between them.",
          vars: [
            ["landmarks", "banner, navigation, main"],
            ["headings", "1 Notes · 2 Today · 3 Shopping"],
          ],
        },
        {
          line: 9,
          note: "The page's `<footer>` is a **contentinfo** landmark. With `<div>`s instead, every list would be empty.",
          vars: [
            ["landmarks", "banner, navigation, main, contentinfo"],
            ["headings", "1 Notes · 2 Today · 3 Shopping"],
          ],
          output: "contentinfo",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "landmarks",
    "Landmarks",
    explain(
      "Each structure tag gives a [[landmark]] that assistive technology announces and lets people jump to. They come for free. Two details: a `<section>` only becomes a landmark when it has a name (from a heading via `aria-labelledby`, or `aria-label`), and if a page has two `<nav>`s, label them so people can tell them apart.",
    ),
    reference("Tag → landmark", [
      ["<header>", "banner (at the top of the page).", "the site's header"],
      ["<nav>", "navigation.", '<nav aria-label="Main">'],
      ["<main>", "main.", "one per page"],
      ["<aside>", "complementary.", "a tips panel"],
      [
        "<footer>",
        "contentinfo (at the bottom of the page).",
        "the site's footer",
      ],
      ["<section> with a name", "region.", '<section aria-label="Notes">'],
      ["<form> with a name", "form.", '<form aria-label="New note">'],
    ]),
  ),

  part(
    "where-used",
    "Structure in the Notes App",
    explain(
      "The Notes App is built exactly this way. Its `Navbar` is a `<header>` with a `<nav>` for the user's controls. Each page is a `<main>` with one `<h1>`: “Your notes”, “Log in”, “Create an account”. The notes grid is a `<section aria-label=\"Notes\">`, so it's a named region, and each note is an `<article>` with an `<h2>` title.",
    ),
    inTheNotesApp(
      '`Dashboard` renders `<main className="dashboard">`, then `<h1>Your notes</h1>`, then `<section className="notes-grid" aria-label="Notes">`, with one `NoteCard` (an `<article>` with an `<h2>`) per note.',
      { symbolId: "component:Dashboard" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Div soup",
      language: "html",
      wrong: ['<div class="header">…</div>', '<div class="main">…</div>'],
      problem:
        "Classes mean nothing to a screen reader, so the page has no landmarks to jump to.",
      right: ["<header>…</header>", "<main>…</main>"],
      why: "Use the element that says what the part is; keep the class for styling if you need it.",
    }),
    mistake({
      title: "Choosing a heading for its size",
      language: "html",
      wrong: ["<h1>Notes</h1>", "<h4>Today</h4> <!-- wanted it smaller -->"],
      problem:
        "The outline jumps from level 1 to 4, so a screen reader user wonders what they missed.",
      right: [
        "<h1>Notes</h1>",
        "<h2>Today</h2>",
        "<!-- and in CSS: h2 { font-size: 1rem; } -->",
      ],
      why: "Pick the level by meaning, then change the size with CSS.",
    }),
    mistake({
      title: "More than one main",
      language: "html",
      wrong: ["<main>Notes</main>", "<main>Tips</main>"],
      problem: "“Skip to main content” can only go to one place.",
      right: [
        "<main>",
        "  <section>Notes</section>",
        "  <aside>Tips</aside>",
        "</main>",
      ],
      why: "One `<main>` per page; split its content into sections and asides.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Give the page landmarks",
      task: "Replace the four `<div>`s with the right structure tags: a header, a nav, the main content and a footer.",
      starter: [
        '<div class="header"><h1>Notes</h1></div>',
        '<div class="nav"><a href="#">All</a></div>',
        '<div class="main"><p>No notes yet.</p></div>',
        '<div class="footer">Made by you</div>',
      ],
      checks: [
        { kind: "exists", label: "A header", selector: "header h1" },
        { kind: "exists", label: "A nav with the link", selector: "nav a" },
        { kind: "count", label: "One main", selector: "main", count: 1 },
        { kind: "exists", label: "A footer", selector: "footer" },
        { kind: "missing", label: "No divs left", selector: "div" },
      ],
      hint: 'Swap each `<div class="header">…</div>` for `<header>…</header>`, and so on. You can keep the classes or drop them.',
      solution: [
        "<header><h1>Notes</h1></header>",
        '<nav><a href="#">All</a></nav>',
        "<main><p>No notes yet.</p></main>",
        "<footer>Made by you</footer>",
      ],
    }),
    pageYourTurn({
      title: "Fix the outline",
      task: "This page has two `<h1>`s and skips a level. Make it one `<h1>` (Your notes), with `<h2>`s for Today and Starred.",
      starter: [
        "<h1>Your notes</h1>",
        "<h1>Today</h1>",
        "<p>Milk, bread.</p>",
        "<h4>Starred</h4>",
        "<p>Passwords to change.</p>",
      ],
      checks: [
        { kind: "count", label: "One h1", selector: "h1", count: 1 },
        {
          kind: "text",
          label: "The h1 is the page's subject",
          selector: "h1",
          text: "Your notes",
        },
        { kind: "count", label: "Two h2s", selector: "h2", count: 2 },
        { kind: "missing", label: "No skipped levels", selector: "h4" },
      ],
      hint: "Change the second `<h1>` and the `<h4>` into `<h2>`s.",
      solution: [
        "<h1>Your notes</h1>",
        "<h2>Today</h2>",
        "<p>Milk, bread.</p>",
        "<h2>Starred</h2>",
        "<p>Passwords to change.</p>",
      ],
    }),
    pageYourTurn({
      title: "Notes as articles",
      task: 'Wrap each note in an `<article>` and give it an `<h2>` title. Put all three in a `<section aria-label="Notes">` inside `<main>`.',
      starter: [
        "<main>",
        "  <h1>Your notes</h1>",
        "  <div><b>Milk</b> 2 litres</div>",
        "  <div><b>Bread</b> wholemeal</div>",
        "  <div><b>Call Sam</b> about Friday</div>",
        "</main>",
      ],
      checks: [
        {
          kind: "exists",
          label: "A named section of notes",
          selector: 'main section[aria-label="Notes"]',
        },
        {
          kind: "count",
          label: "Three articles",
          selector: "section article",
          count: 3,
        },
        {
          kind: "count",
          label: "Each with an h2",
          selector: "article h2",
          count: 3,
        },
        {
          kind: "text",
          label: "The first is Milk",
          selector: "article h2",
          text: "Milk",
        },
      ],
      hint: '`<section aria-label="Notes">`, then for each: `<article><h2>Milk</h2><p>2 litres</p></article>`.',
      solution: [
        "<main>",
        "  <h1>Your notes</h1>",
        '  <section aria-label="Notes">',
        "    <article><h2>Milk</h2><p>2 litres</p></article>",
        "    <article><h2>Bread</h2><p>wholemeal</p></article>",
        "    <article><h2>Call Sam</h2><p>about Friday</p></article>",
        "  </section>",
        "</main>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Structure cheat sheet", [
      [
        "<header> / <footer>",
        "Top and bottom of the page, or of an article.",
        "banner / contentinfo",
      ],
      ["<nav>", "Main links.", '<nav aria-label="Main">'],
      ["<main>", "The content; one per page.", "skip-link target"],
      ["<article>", "Self-contained.", "a note"],
      ["<section>", "A themed part with a heading.", "“Today”"],
      ["<aside>", "Beside the main point.", "tips"],
      ["<div>", "No meaning; styling only.", "a wrapper"],
      ["headings", "One h1, then levels in order.", "h1 → h2 → h3"],
    ]),
    quickCheck(
      'Why does `<main>` matter more than `<div class="main">` for a screen reader user?',
      [
        "It's read faster",
        "It's a landmark they can jump straight to",
        "It makes the text bigger",
      ],
      1,
      "Landmarks let people skip the header and navigation and go straight to the content. A class means nothing to assistive technology.",
    ),
  ),
);
