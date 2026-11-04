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
  playground,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// HTML's building blocks in depth: what HTML is, elements and tags (anatomy),
// attributes and void elements, the everyday attributes, id vs class,
// nesting, a step-through of the browser building the tree, block and
// inline, div and span, where it's used, mistakes, practice and a recap.
export const elementsModule = moduleLesson(
  "elements-and-attributes",
  "What HTML is: elements, tags and attributes",
  45,
  [
    "Say what HTML does, and what it leaves to CSS and JavaScript.",
    "Name the parts of an element: opening tag, content, closing tag and attributes.",
    "Use the everyday attributes, and tell `id` from `class`.",
    "Nest elements correctly, and picture the tree the browser builds from them.",
    "Tell block elements from inline ones, and know when `<div>` and `<span>` are right.",
  ],

  part(
    "why",
    "What HTML is",
    explain(
      "[[html]] is the language web pages are written in. It doesn't decide colours (that's CSS) or behaviour (that's JavaScript). It says **what each piece of content is**: a heading, a paragraph, a link, a button. A page is one text file, an [[html-document]], that the browser reads from top to bottom.",
    ),
    diagram([
      ["you write", "a text file of HTML: index.html"],
      ["the browser reads it", "tag by tag, top to bottom"],
      ["it builds a tree", "of elements, the DOM"],
      ["it draws the page", "using CSS for the looks"],
    ]),
    analogy(
      "Like labelling boxes when you move house: “kitchen”, “books”. HTML labels each piece of content so the browser, screen readers and search engines know what it is.",
    ),
  ),

  part(
    "elements-and-tags",
    "Elements and tags",
    explain(
      "Each piece of content is an [[html-element|element]]. You mark where it starts and ends with [[tag|tags]]: an **opening tag** like `<p>`, then the content, then a **closing tag** like `</p>` with a slash. Settings for the element go inside the opening tag, as [[attribute|attributes]].",
    ),
    anatomy(
      "An element",
      ['<p class="note">Buy milk</p>'],
      [
        [
          "<p",
          "opening tag",
          "Starts the element and says what it is: a paragraph.",
        ],
        [
          'class="note"',
          "an attribute",
          'A setting, written name="value", inside the opening tag.',
        ],
        ["Buy milk", "content", "What appears on the page."],
        [
          "</p>",
          "closing tag",
          "The same name with a slash: the element ends here.",
        ],
      ],
    ),
    quickCheck(
      "Which part of `<h1>My notes</h1>` appears on the page?",
      ["`<h1>`", "`My notes`", "`</h1>`"],
      1,
      "The [[tag|tags]] mark the start and end; the content between them is what's shown.",
    ),
  ),

  part(
    "attributes",
    "Attributes: extra settings",
    explain(
      'An [[attribute]] adds a setting to an element, written inside the opening tag as `name="value"`, with spaces between several. Some elements, like `<img>` and `<input>`, have **no content** at all, only attributes, so they have no closing tag. They\'re [[void-element|void elements]].',
    ),
    code(
      "html",
      "attributes, and two void elements",
      [
        '<a href="/notes" title="All your notes">My notes</a>',
        '<img src="cat.jpg" alt="A sleeping cat">',
        '<input type="email" name="email">',
      ],
      {
        1: "two attributes, separated by a space",
        2: "a void element: no content, no closing tag",
        3: "another void element",
      },
    ),
    keyPoints(
      "Attributes go in the opening tag, never the closing one.",
      'Write values in double quotes: `name="value"`.',
      "Void elements (`img`, `input`, `br`, `hr`, `meta`, `link`) have no closing tag.",
    ),
  ),

  part(
    "common-attributes",
    "Attributes you'll use everywhere",
    explain(
      "A few attributes work on almost any element (`id`, `class`, `lang`, `title`); others belong to particular elements (`href` on links, `src` and `alt` on images, `type`, `name` and `value` on form fields). Here are the ones you'll write every day:",
    ),
    reference("Everyday attributes", [
      ["id", "A unique name for one element on the page.", '<h2 id="intro">'],
      [
        "class",
        "A group name for styling or scripts; can be shared.",
        '<p class="note">',
      ],
      ["href", "Where a link goes.", '<a href="/notes">'],
      [
        "src",
        "Which file to show: images, video, scripts.",
        '<img src="cat.jpg">',
      ],
      [
        "alt",
        "What an image shows, for when it can't be seen.",
        '<img alt="A cat">',
      ],
      ["type", "Which kind of input or button.", '<input type="email">'],
      [
        "name",
        "The key a form field's value is sent under.",
        '<input name="title">',
      ],
      [
        "value",
        "A field's starting value, or what a choice sends.",
        '<input value="Milk">',
      ],
      [
        "title",
        "Extra text on hover; don't rely on it alone.",
        '<abbr title="HyperText…">HTML</abbr>',
      ],
      ["lang", "The language of the page or a part of it.", '<html lang="en">'],
    ]),
  ),

  part(
    "id-and-class",
    "id or class?",
    explain(
      "Both name elements, for CSS and JavaScript to find. An `id` is **unique**: one element on the page, like the main title or a form field a label points at. A `class` is a **group**: any number of elements share it, and one element can have several, separated by spaces. Most styling uses classes.",
    ),
    playground("One id, a shared class", [
      "<style>",
      "  .note { border: 1px solid #999; padding: 4px; margin: 4px 0; }",
      "  .done { text-decoration: line-through; }",
      "  #today { font-weight: bold; }",
      "</style>",
      "",
      '<p id="today">Today</p>',
      '<p class="note">Milk</p>',
      '<p class="note done">Bread</p>',
      '<p class="note">Call Sam</p>',
    ]),
    quickCheck(
      "Several notes should share the same look. What groups them?",
      [
        "The same `id` on each",
        "The same `class` on each",
        "The same `name` on each",
      ],
      1,
      "An `id` must be unique on the page; a `class` is meant to be shared.",
    ),
  ),

  part(
    "nesting",
    "Elements inside elements",
    explain(
      "Elements can contain other elements: a list holds items, an article holds a heading and paragraphs. This [[nesting]] gives a page its structure. The rule: **close the inner element first**. The last tag you opened is the first one you close, like brackets in maths.",
    ),
    code(
      "html",
      "nesting, done right",
      [
        "<article>",
        "  <h2>Shopping</h2>",
        "  <p>Buy <strong>milk</strong> and eggs.</p>",
        "</article>",
      ],
      {
        2: "inside the article",
        3: "strong inside p, inside the article",
        4: "the article closes last",
      },
    ),
    quickCheck(
      "Which of these is nested correctly?",
      [
        "`<p><strong>Hi</p></strong>`",
        "`<p><strong>Hi</strong></p>`",
        "`<p><strong>Hi</p>`",
      ],
      1,
      "`strong` was opened last, so it's closed first, then `p`.",
    ),
  ),

  part(
    "how-the-tree-is-built",
    "How the browser builds the tree",
    explain(
      "As the browser reads, it keeps track of which elements are **open**, and puts each new element inside the one that's open. The result is a tree of elements (later you'll meet it as the DOM), which CSS styles and JavaScript changes. Step through it: the stack shows the elements still open.",
    ),
    trace(
      "Reading a list, move by move",
      [
        "<ul>",
        "  <li>Milk</li>",
        "  <li>Bread <em>wholemeal</em></li>",
        "</ul>",
      ],
      [
        {
          line: 1,
          note: "`<ul>` opens. Everything until `</ul>` goes inside it.",
          vars: [["tree", "ul"]],
          stack: ["ul"],
        },
        {
          line: 2,
          note: "An `<li>` opens inside the `ul`, gets the text Milk, and closes again on the same line.",
          vars: [["tree", 'ul > li "Milk"']],
          stack: ["ul"],
        },
        {
          line: 3,
          note: "A second `<li>` opens, with the text Bread. Then `<em>` opens **inside the li**, the element that's open now.",
          vars: [["tree", 'ul > li "Milk", li "Bread" > em']],
          stack: ["ul", "li", "em"],
        },
        {
          line: 3,
          note: "`</em>` closes the em, then `</li>` closes the li: inner first, so the stack unwinds in order.",
          vars: [["tree", 'ul > li "Milk", li "Bread" > em "wholemeal"']],
          stack: ["ul"],
        },
        {
          line: 4,
          note: "`</ul>` closes the list. Nothing is open; the tree is finished, and the browser can draw it.",
          vars: [["tree", 'ul > li "Milk", li "Bread" > em "wholemeal"']],
          output: "a list with two items",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "block-and-inline",
    "Block and inline",
    explain(
      "Most elements are [[block-inline|block or inline]]. A **block** element (`<p>`, `<h1>`, `<ul>`, `<article>`) starts on a new line and takes the full width, stacking like paragraphs. An **inline** element (`<strong>`, `<a>`, `<em>`, `<code>`) sits inside a line of text, like a word.",
    ),
    playground("Blocks stack, inline pieces flow", [
      "<style>",
      "  p, strong, a { outline: 1px dashed #999; }",
      "</style>",
      "<p>A paragraph is a block.</p>",
      "<p>So this one starts on a new line.</p>",
      '<p>Inside it, <strong>strong</strong> and <a href="#">a link</a> stay in the line.</p>',
    ]),
    quickCheck(
      "Which one starts on a new line by itself?",
      ["`<span>`", "`<a>`", "`<p>`"],
      2,
      "`<p>` is a block element; `<span>` and `<a>` are inline.",
    ),
  ),

  part(
    "div-and-span",
    "div and span: boxes with no meaning",
    explain(
      "[[div-span|`<div>` and `<span>`]] are the plain versions: a `<div>` is a block box and a `<span>` an inline piece, and **neither means anything**. They're for grouping things to style them, when no element with a meaning fits. If one does (a heading, a list, an article, a button), use it instead.",
    ),
    reference("Plain boxes, and what to try first", [
      ["<div>", "A block box with no meaning.", "a wrapper to lay things out"],
      [
        "<span>",
        "An inline piece with no meaning.",
        "one word in another colour",
      ],
      [
        "try first",
        "An element that says what it is.",
        "<article>, <nav>, <button>, <em>",
      ],
    ]),
  ),

  part(
    "where-used",
    "In the Notes App",
    explain(
      "Every Notes App screen is built from these pieces. A note card is an `<article>` (an element with a meaning) holding an `<h2>` title and a `<p>`, with a `class` so CSS can style every card the same way.",
    ),
    inTheNotesApp(
      '`NoteCard` renders `<article className="note-card">` with the title in an `<h2>`. In React, `class` is written `className`, because `class` is a reserved word in JavaScript, but it becomes a normal `class` attribute on the page.',
      { symbolId: "component:NoteCard" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting the closing tag",
      language: "html",
      wrong: ["<p>Buy milk", "<p>Buy eggs"],
      problem:
        "Browsers guess where it ends, and the guess is often wrong for other elements, like a missing `</a>` turning the rest of the page into a link.",
      right: ["<p>Buy milk</p>", "<p>Buy eggs</p>"],
      why: "Close every element that isn't void.",
    }),
    mistake({
      title: "Closing in the wrong order",
      language: "html",
      wrong: ["<p><strong>Important</p></strong>"],
      problem:
        "The tags cross over, so the browser has to repair the tree, and may not do it the way you meant.",
      right: ["<p><strong>Important</strong></p>"],
      why: "Inner first: the last tag opened is the first one closed.",
    }),
    mistake({
      title: "The same id twice",
      language: "html",
      wrong: ['<p id="note">Milk</p>', '<p id="note">Bread</p>'],
      problem:
        "An id must be unique: labels, links to `#note` and `getElementById` only find the first.",
      right: ['<p class="note">Milk</p>', '<p class="note">Bread</p>'],
      why: "Use a class for a group; keep each id for one element.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Add the attributes",
      task: "Make the link go to `/notes`, and give the image the file `cat.jpg` with the alt text `A sleeping cat`.",
      starter: ["<a>My notes</a>", "<img>"],
      checks: [
        {
          kind: "attr",
          label: "The link goes to /notes",
          selector: "a",
          name: "href",
          value: "/notes",
        },
        {
          kind: "attr",
          label: "The image's file",
          selector: "img",
          name: "src",
          value: "cat.jpg",
        },
        {
          kind: "attr",
          label: "The image's alt text",
          selector: "img",
          name: "alt",
          value: "A sleeping cat",
        },
      ],
      hint: 'Attributes go in the opening tag: `<a href="/notes">` and `<img src="…" alt="…">`.',
      solution: [
        '<a href="/notes">My notes</a>',
        '<img src="cat.jpg" alt="A sleeping cat">',
      ],
    }),
    pageYourTurn({
      title: "One id, one class",
      task: "Give all three paragraphs the class `note`, and the first one the id `first` as well.",
      starter: ["<p>Milk</p>", "<p>Bread</p>", "<p>Call Sam</p>"],
      checks: [
        { kind: "count", label: "Three notes", selector: "p.note", count: 3 },
        {
          kind: "text",
          label: "The first is Milk",
          selector: "#first",
          text: "Milk",
        },
        {
          kind: "count",
          label: "Only one has the id",
          selector: "#first",
          count: 1,
        },
      ],
      hint: '`<p id="first" class="note">Milk</p>`, then `class="note"` on the others.',
      solution: [
        '<p id="first" class="note">Milk</p>',
        '<p class="note">Bread</p>',
        '<p class="note">Call Sam</p>',
      ],
    }),
    pageYourTurn({
      title: "Inline inside a block",
      task: 'Write one paragraph that says "Buy milk from the shop", with **milk** inside `<strong>` and **the shop** as a link to `/map`.',
      starter: ["<p></p>"],
      checks: [
        { kind: "count", label: "One paragraph", selector: "p", count: 1 },
        {
          kind: "text",
          label: "It says the sentence",
          selector: "p",
          text: "Buy milk from the shop",
        },
        {
          kind: "text",
          label: "milk is strong",
          selector: "p strong",
          text: "milk",
        },
        {
          kind: "attr",
          label: "the shop links to /map",
          selector: "p a",
          name: "href",
          value: "/map",
        },
      ],
      hint: '`<p>Buy <strong>milk</strong> from <a href="/map">the shop</a></p>`',
      solution: [
        '<p>Buy <strong>milk</strong> from <a href="/map">the shop</a></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Building blocks cheat sheet", [
      ["element", "A piece of content, from tag to tag.", "<p>Buy milk</p>"],
      ["tags", "Opening and closing; closing has a slash.", "<p> … </p>"],
      [
        "attribute",
        'A setting: name="value", in the opening tag.',
        '<a href="/notes">',
      ],
      ["void element", "No content, no closing tag.", "<img>, <input>, <br>"],
      ["id / class", "Unique name / shared group.", 'id="first" class="note"'],
      ["nesting", "Inner closes first.", "<p><em>…</em></p>"],
      [
        "block / inline",
        "New line, full width / inside a line.",
        "<p> / <strong>",
      ],
      ["div / span", "No meaning: for grouping.", "only when nothing fits"],
    ]),
    quickCheck(
      "Which line is correct HTML?",
      [
        '`<img src="cat.jpg" alt="A cat"></img>`',
        '`<a href="/notes">Notes</a>`',
        "`<p class=note done>Milk</p>`",
      ],
      1,
      '`<img>` is void, so it has no closing tag, and attribute values with spaces need quotes: `class="note done"`.',
    ),
  ),
);
