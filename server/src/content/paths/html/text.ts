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
  playground,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Text, lists and links in depth: text has meaning, headings and
// paragraphs, emphasis, the other text tags (with a playground), special
// characters, lists (anatomy, nesting, description lists), links and their
// kinds of address, a step-through of where each link goes, link or button
// (the Notes App), mistakes, practice and a recap.
export const textModule = moduleLesson(
  "text-lists-links",
  "Text, lists and links",
  45,
  [
    "Mark up text by meaning: headings, paragraphs, emphasis, quotes and code.",
    "Show characters HTML treats as code, like `<` and `&`, with entities.",
    "Choose between `<ul>`, `<ol>` and `<dl>`, and nest lists correctly.",
    "Write links to other sites, other pages, places on a page, email and phone.",
    "Work out where a relative link goes, and choose a link or a button.",
  ],

  part(
    "why",
    "Text has meaning too",
    explain(
      "Most of a page is text, and HTML gives it meaning, not looks. A [[heading]] is a title, `<p>` is a paragraph, `<strong>` is important, `<em>` is stressed, `<code>` is code. Browsers give each a default look, but that's only a default: CSS can make a heading tiny or `<strong>` red. What stays is the meaning, which screen readers, search engines and copy-and-paste all use.",
    ),
    code(
      "html",
      "text, marked up by meaning",
      [
        "<h1>My notes</h1>",
        "<p>Buy <strong>milk</strong> before <em>Friday</em>.</p>",
        "<p>Run <code>npm start</code> to see the app.</p>",
      ],
      {
        1: "the page's title",
        2: "important, then stressed",
        3: "a piece of code inside a sentence",
      },
    ),
  ),

  part(
    "headings-and-paragraphs",
    "Headings and paragraphs",
    explain(
      "There are six heading levels, `<h1>` to `<h6>`: one `<h1>` for the page, `<h2>`s for its sections, `<h3>`s inside those. Most pages never need more than three. Text goes in `<p>` paragraphs. Each `<p>` is a block, so paragraphs stack with space between them; a new paragraph needs a new `<p>`, not an empty line.",
    ),
    code(
      "html",
      "headings and text",
      [
        "<h1>My notes</h1>",
        "<h2>Shopping</h2>",
        "<p>Milk, bread and eggs.</p>",
        "<h2>Work</h2>",
        "<p>Send the report.</p>",
        "<p>Book the meeting room.</p>",
      ],
      {
        1: "one main title",
        2: "a section",
        6: "a second paragraph: a new <p>",
      },
    ),
    keyPoints(
      "Pick a heading by its level, not its size: CSS changes sizes.",
      "One `<h1>` per page; go down one level at a time.",
      "Screen reader users jump from heading to heading.",
    ),
  ),

  part(
    "emphasis",
    "Important, stressed, or just bold?",
    explain(
      "`<strong>` means **important** and `<em>` means **stressed**, the way your voice leans on a word. Browsers show them bold and italic. `<b>` and `<i>` also look bold and italic, but only mean “set apart”: a keyword, a book title, a word in another language. When you're not sure, ask whether you'd say it differently out loud.",
    ),
    reference("Tags that change how text is read", [
      [
        "<strong>",
        "Important, serious or urgent.",
        "<strong>Don't share your password.</strong>",
      ],
      ["<em>", "Stressed: changes the meaning.", "I <em>did</em> save it."],
      [
        "<b>",
        "Set apart, without extra importance.",
        "<b>Tip:</b> star a note.",
      ],
      ["<i>", "A different voice: a term, a title.", "<i>Hamlet</i>"],
      ["<mark>", "Highlighted, like a search match.", "Buy <mark>milk</mark>"],
      [
        "<small>",
        "Side comments, small print.",
        "<small>Prices include tax.</small>",
      ],
    ]),
    quickCheck(
      "Which tag marks text as *important*?",
      ["`<em>`", "`<strong>`", "`<p>`"],
      1,
      "`<strong>` means important (shown bold); `<em>` means stressed (shown in italics).",
    ),
  ),

  part(
    "more-text-tags",
    "More tags for text",
    explain(
      "A few more tags turn up in almost every site. Try them in the playground: change the text, add a tag, and watch the page.",
    ),
    reference("More text tags", [
      [
        "<br>",
        "A line break inside text: addresses, poems.",
        "Line one<br>Line two",
      ],
      ["<hr>", "A change of topic, drawn as a line.", "<hr>"],
      [
        "<blockquote>",
        "A quotation from somewhere else.",
        "<blockquote>Less is more.</blockquote>",
      ],
      ["<q>", "A short quote inside a sentence.", "She said <q>hi</q>."],
      ["<code>", "Code inside a sentence.", "Type <code>npm start</code>."],
      [
        "<pre>",
        "Text shown exactly as typed: spaces kept.",
        "<pre>  kept   as typed</pre>",
      ],
      [
        "<abbr>",
        "An abbreviation, with its meaning.",
        '<abbr title="HyperText Markup Language">HTML</abbr>',
      ],
      [
        "<sub> <sup>",
        "Lower and raised text.",
        "H<sub>2</sub>O, 10<sup>3</sup>",
      ],
    ]),
    playground("Change the text, add a tag, watch the page", [
      "<h1>My notes</h1>",
      "<p>This is <strong>important</strong> and this is <em>stressed</em>.</p>",
      "<p>12 Main Street<br>Kathmandu</p>",
      "<blockquote>Write it down, or it didn't happen.</blockquote>",
      '<p><abbr title="HyperText Markup Language">HTML</abbr> uses <code>&lt;p&gt;</code> for paragraphs.</p>',
      "<hr>",
      "<pre>",
      "  spaces    are",
      "     kept here",
      "</pre>",
    ]),
  ),

  part(
    "special-characters",
    "Special characters",
    explain(
      "Some characters mean something to HTML: `<` starts a [[tag]] and `&` starts an [[html-entity|entity]]. To show them as text, write them as entities: `&lt;` for <, `&gt;` for >, `&amp;` for &. Everything else, like é, ₹ or 🎉, you can type directly, because the page is UTF-8.",
    ),
    code(
      "html",
      "showing < and & as text",
      [
        "<p>Use &lt;p&gt; for a paragraph.</p>",
        "<p>Salt &amp; pepper</p>",
        "<p>10&nbsp;kg</p>",
        "<p>© 2026 · café · 🎉</p>",
      ],
      {
        1: "shows: Use <p> for a paragraph.",
        2: "shows: Salt & pepper",
        3: "a space that never breaks the line",
        4: "type these directly",
      },
    ),
    quickCheck(
      "You want the page to show the text `<b>` instead of making things bold. What do you write?",
      ["`<b>`", "`&lt;b&gt;`", '`"<b>"`'],
      1,
      "`&lt;` and `&gt;` show < and > as text, so the browser doesn't read them as a tag.",
    ),
  ),

  part(
    "lists",
    "Lists",
    explain(
      "A [[html-list|list]] groups items. `<ul>` (unordered) shows bullets, for when the order doesn't matter. `<ol>` (ordered) shows numbers, for when it does: steps, rankings. Every item is an `<li>`, and only `<li>`s go directly inside a `<ul>` or `<ol>`. Navigation menus are usually lists of links too.",
    ),
    anatomy(
      "A list",
      ["<ol>", "  <li>Mix</li>", "  <li>Fry</li>", "</ol>"],
      [
        [
          "<ol>",
          "the list",
          "Ordered: numbered 1, 2, 3. `<ul>` would show bullets.",
        ],
        [
          "<li>Mix</li>",
          "an item",
          "Each item is an `<li>`, directly inside the list.",
        ],
        ["</ol>", "the end", "Close the list after the last item."],
      ],
    ),
    quickCheck(
      "Recipe steps must be done in order. Which list?",
      ["`<ul>`", "`<ol>`", "Separate `<p>` paragraphs"],
      1,
      "`<ol>` is an ordered [[html-list|list]]: its numbers tell the reader the order matters.",
    ),
  ),

  part(
    "more-lists",
    "Lists inside lists, and description lists",
    explain(
      "A list can sit **inside an `<li>`**, never directly inside the `<ul>`: that's how sub-items and menus with sub-menus work. `<ol>` takes `start` and `reversed` for numbering. And when each item is a name with a description, like a glossary, use a description list: `<dl>` with `<dt>` for each term and `<dd>` for its description.",
    ),
    playground("Nested and description lists", [
      "<ul>",
      "  <li>Shopping",
      "    <ul>",
      "      <li>Milk</li>",
      "      <li>Bread</li>",
      "    </ul>",
      "  </li>",
      "  <li>Work</li>",
      "</ul>",
      '<ol start="3">',
      "  <li>Third</li>",
      "  <li>Fourth</li>",
      "</ol>",
      "<dl>",
      "  <dt>HTML</dt>",
      "  <dd>What each part of the page is.</dd>",
      "  <dt>CSS</dt>",
      "  <dd>How it looks.</dd>",
      "</dl>",
    ]),
  ),

  part(
    "links",
    "Links",
    explain(
      "A [[anchor|link]] is an `<a>` element. Its `href` [[attribute]] is where it goes; its content is what people click, so it should say where it leads. The `href` can be a full [[url]], a path on the same site, a place on the same page (`#` and an element's `id`), an email address or a phone number.",
    ),
    reference("Kinds of href", [
      [
        "https://…",
        "Another site: a full address.",
        '<a href="https://example.com">Example</a>',
      ],
      [
        "/notes",
        "A page on this site, from the root.",
        '<a href="/notes">My notes</a>',
      ],
      [
        "help.html",
        "Relative: next to the current page.",
        '<a href="help.html">Help</a>',
      ],
      [
        "#today",
        'A place on this page: the element with id="today".',
        '<a href="#today">Today</a>',
      ],
      [
        "mailto:",
        "Opens an email to that address.",
        '<a href="mailto:help@notes.app">Email us</a>',
      ],
      [
        "tel:",
        "Calls the number on a phone.",
        '<a href="tel:+9771234567">Call</a>',
      ],
    ]),
    keyPoints(
      'Link text says where it goes: "Read the setup guide", not "click here".',
      '`target="_blank"` opens a new tab; use it rarely, and say so in the text.',
      "`download` asks the browser to save the file instead of opening it.",
    ),
  ),

  part(
    "where-links-go",
    "Where does a link go?",
    explain(
      "A full address goes exactly where it says. Everything else is **relative**: the browser works out the full address from the page you're on. Say you're on `https://notes.app/help/start.html`. Step through how the browser turns each `href` into a full address:",
    ),
    trace(
      "Resolving each link, move by move",
      [
        '<a href="https://example.com">',
        '<a href="/notes">',
        '<a href="faq.html">',
        '<a href="../about">',
        '<a href="#install">',
      ],
      [
        {
          line: 1,
          note: "It starts with `https://`, so it's already a full address: it goes exactly there.",
          vars: [
            ["page", "https://notes.app/help/start.html"],
            ["goes to", "https://example.com"],
          ],
        },
        {
          line: 2,
          note: "It starts with `/`, so it starts from the site's root: keep `https://notes.app`, then add the path.",
          vars: [
            ["page", "https://notes.app/help/start.html"],
            ["goes to", "https://notes.app/notes"],
          ],
        },
        {
          line: 3,
          note: "No `/` at the start: it's next to the current page, in the same folder, `/help/`.",
          vars: [
            ["page", "https://notes.app/help/start.html"],
            ["goes to", "https://notes.app/help/faq.html"],
          ],
        },
        {
          line: 4,
          note: "`../` goes up one folder, from `/help/` to `/`, then adds `about`.",
          vars: [
            ["page", "https://notes.app/help/start.html"],
            ["goes to", "https://notes.app/about"],
          ],
        },
        {
          line: 5,
          note: 'Only a `#`: same page, no new request. The browser scrolls to the element with `id="install"`.',
          vars: [
            ["page", "https://notes.app/help/start.html"],
            ["goes to", "https://notes.app/help/start.html#install"],
          ],
          output: "scrolls to #install",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "link-or-button",
    "Link or button?",
    explain(
      "They can be styled to look the same, so choose by what they **do**. A link **goes somewhere**: it has an address you could bookmark or open in a new tab. A [[html-button|button]] **does something** on this page: saves, deletes, opens a menu, switches a view. Screen readers announce them differently, and keyboards use them differently too (Enter for links, Enter or Space for buttons).",
    ),
    inTheNotesApp(
      "On the Notes App's `Login` page, “No account yet? Register” is a `<p>` holding a `<Button variant=\"link\">`. It looks like a link but switches the screen to the register form without a new address, so it's really a button.",
      { symbolId: "component:Login" },
    ),
    quickCheck(
      "A “Delete note” control removes the note from this page. Link or button?",
      ["A link", "A button", "Either; they're the same"],
      1,
      "It does something instead of going somewhere, so it's a button.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "“Click here”",
      language: "html",
      wrong: ['<p>To read the guide, <a href="/guide">click here</a>.</p>'],
      problem:
        "Screen reader users often skim a list of just the links, and “click here” tells them nothing.",
      right: ['<p>Read <a href="/guide">the setup guide</a>.</p>'],
      why: "Put the destination in the link text.",
    }),
    mistake({
      title: "Line breaks for spacing",
      language: "html",
      wrong: ["Milk and bread.<br><br>", "Call Sam."],
      problem:
        "`<br>` is for line breaks inside one piece of text. Two in a row fake a paragraph, and the gap can't be styled.",
      right: ["<p>Milk and bread.</p>", "<p>Call Sam.</p>"],
      why: "Separate paragraphs are separate `<p>`s; spacing is CSS's job.",
    }),
    mistake({
      title: "A fake list",
      language: "html",
      wrong: ["<p>- Milk</p>", "<p>- Bread</p>"],
      problem:
        "It looks like a list but isn't one: a screen reader can't say “list, 2 items”.",
      right: ["<ul>", "  <li>Milk</li>", "  <li>Bread</li>", "</ul>"],
      why: "Use `<ul>` or `<ol>`, with an `<li>` for each item.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Mark up a recipe",
      task: "Turn the plain text into a recipe: an `<h1>` titled `Pancakes`, the three ingredients as a bulleted list, and the two steps as a numbered list.",
      starter: ["Pancakes", "Flour, Milk, Eggs", "1. Mix 2. Fry"],
      checks: [
        { kind: "text", label: "The title", selector: "h1", text: "Pancakes" },
        {
          kind: "count",
          label: "Three ingredients, bulleted",
          selector: "ul > li",
          count: 3,
        },
        {
          kind: "count",
          label: "Two steps, numbered",
          selector: "ol > li",
          count: 2,
        },
        {
          kind: "text",
          label: "The first step is Mix",
          selector: "ol > li",
          text: "Mix",
        },
      ],
      hint: "`<h1>Pancakes</h1>`, then `<ul><li>Flour</li>…</ul>` and `<ol><li>Mix</li><li>Fry</li></ol>`. The `<ol>` adds the numbers for you.",
      solution: [
        "<h1>Pancakes</h1>",
        "<ul>",
        "  <li>Flour</li>",
        "  <li>Milk</li>",
        "  <li>Eggs</li>",
        "</ul>",
        "<ol>",
        "  <li>Mix</li>",
        "  <li>Fry</li>",
        "</ol>",
      ],
    }),
    pageYourTurn({
      title: "Three kinds of link",
      task: "Make the three items links: `Home` goes to `/`, `Today` to the element with the id `today` on this page, and `Email us` to `mailto:help@notes.app`.",
      starter: [
        "<nav>",
        "  <ul>",
        "    <li>Home</li>",
        "    <li>Today</li>",
        "    <li>Email us</li>",
        "  </ul>",
        "</nav>",
        '<h2 id="today">Today</h2>',
      ],
      checks: [
        {
          kind: "count",
          label: "Three links in the nav",
          selector: "nav li a",
          count: 3,
        },
        {
          kind: "text",
          label: "Home goes to /",
          selector: 'nav a[href="/"]',
          text: "Home",
        },
        {
          kind: "text",
          label: "Today goes to #today",
          selector: 'nav a[href="#today"]',
          text: "Today",
        },
        {
          kind: "text",
          label: "Email us opens an email",
          selector: 'nav a[href="mailto:help@notes.app"]',
          text: "Email us",
        },
      ],
      hint: 'Wrap each text in an `<a>` inside its `<li>`: `<li><a href="/">Home</a></li>`.',
      solution: [
        "<nav>",
        "  <ul>",
        '    <li><a href="/">Home</a></li>',
        '    <li><a href="#today">Today</a></li>',
        '    <li><a href="mailto:help@notes.app">Email us</a></li>',
        "  </ul>",
        "</nav>",
        '<h2 id="today">Today</h2>',
      ],
    }),
    pageYourTurn({
      title: "Meaning in a sentence",
      task: "In the paragraph, mark `Don't` as important with `<strong>`, and `npm start` as code with `<code>`.",
      starter: ["<p>Don't close the terminal while npm start is running.</p>"],
      checks: [
        {
          kind: "text",
          label: "Don't is important",
          selector: "p strong",
          text: "Don't",
        },
        {
          kind: "text",
          label: "npm start is code",
          selector: "p code",
          text: "npm start",
        },
        {
          kind: "text",
          label: "The sentence is unchanged",
          selector: "p",
          text: "Don't close the terminal while npm start is running.",
        },
      ],
      hint: "`<p><strong>Don't</strong> close the terminal while <code>npm start</code> is running.</p>`",
      solution: [
        "<p><strong>Don't</strong> close the terminal while <code>npm start</code> is running.</p>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Text, lists and links cheat sheet", [
      ["<h1>…<h6>", "Headings by level; one h1.", "<h2>Shopping</h2>"],
      ["<p>", "A paragraph; a new one for each.", "<p>Buy milk.</p>"],
      ["<strong> / <em>", "Important / stressed.", "<strong>Don't</strong>"],
      [
        "<code> / <pre>",
        "Code in a sentence / text as typed.",
        "<code>npm start</code>",
      ],
      ["&lt; &amp;", "Show < and & as text.", "&lt;p&gt;"],
      [
        "<ul> / <ol> + <li>",
        "Bullets / numbers; li inside.",
        "<ol><li>Mix</li></ol>",
      ],
      [
        "<dl> <dt> <dd>",
        "Terms and their descriptions.",
        "<dt>HTML</dt><dd>…</dd>",
      ],
      [
        "<a href>",
        "Goes somewhere; text says where.",
        '<a href="/notes">My notes</a>',
      ],
      [
        "href kinds",
        "full, /root, relative, #id, mailto:, tel:",
        '<a href="#today">',
      ],
    ]),
    quickCheck(
      'You\'re on `https://notes.app/help/start.html`. Where does `<a href="faq.html">` go?',
      [
        "`https://notes.app/faq.html`",
        "`https://notes.app/help/faq.html`",
        "`https://faq.html`",
      ],
      1,
      "A relative link without a `/` at the start stays in the current page's folder, `/help/`.",
    ),
  ),
);
