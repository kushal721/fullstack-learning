import type { LevelPlan } from "@fsl/shared";
import {
  analogy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";
import { formsModule } from "./forms.js";

// Basic: steps 1–18. Tags, elements and attributes (with references of the
// everyday ones and live examples), the page skeleton, text, lists, links,
// images and simple forms.
export const basic: LevelPlan = {
  outcome:
    "Write a simple page by hand: headings, text, lists, links, images and a form.",
  steps: [
    lesson(
      "what-html-is",
      "What HTML is",
      2,
      explain(
        "[[html]] is the language web pages are written in. It doesn't decide colours or behaviour; it says *what each piece of content is*: a heading, a paragraph, a link, a button.",
      ),
      explain(
        "A page is one text file, an [[html-document]]. The browser reads it top to bottom and builds the page from it.",
      ),
      analogy(
        "Like labelling the boxes when you move house: “kitchen”, “books”. HTML labels each piece of content so the browser knows what it is.",
      ),
    ),
    lesson(
      "elements-and-tags",
      "Elements and tags",
      3,
      explain(
        "Each piece of content is an [[html-element|element]]. You mark where it starts and ends with [[tag|tags]]: an opening tag like `<p>` and a closing tag like `</p>`.",
      ),
      code("html", "one paragraph element", ["<p>Buy milk</p>"], {
        1: "opening tag, content, closing tag",
      }),
      quickCheck(
        "Which part of `<h1>My notes</h1>` is the content?",
        ["`<h1>`", "`My notes`", "`</h1>`"],
        1,
        "The [[tag|tags]] mark the start and end; `My notes` is what appears on the page.",
      ),
    ),
    lesson(
      "tags-for-text",
      "Tags for text",
      4,
      reference("The tags you'll write most for text", [
        [
          "<h1>…<h6>",
          "Headings, from the page title (`h1`) down to small sub-sections.",
          "<h2>Shopping</h2>",
        ],
        ["<p>", "A paragraph of text.", "<p>Buy milk and eggs.</p>"],
        [
          "<strong>",
          "Important text; browsers show it bold.",
          "<strong>Don't forget!</strong>",
        ],
        [
          "<em>",
          "Stressed text; browsers show it in italics.",
          "I <em>really</em> mean it.",
        ],
        ["<a>", "A link to another page or place.", '<a href="/help">Help</a>'],
        [
          "<br>",
          "A line break inside text, like in an address.",
          "Line one<br>Line two",
        ],
        [
          "<code>",
          "A piece of code inside a sentence.",
          "Type <code>npm start</code>.",
        ],
        [
          "<blockquote>",
          "A quotation from somewhere else.",
          "<blockquote>Less is more.</blockquote>",
        ],
        ["<hr>", "A break between topics, drawn as a line.", "<hr>"],
      ]),
      playground("Change the text, add a tag, watch the page", [
        "<h1>My notes</h1>",
        "<p>This is <strong>important</strong> and this is <em>stressed</em>.</p>",
        "<p>First line<br>Second line</p>",
        '<p>Read the <a href="#">guide</a>.</p>',
      ]),
      quickCheck(
        "Which tag marks text as *important*?",
        ["`<em>`", "`<strong>`", "`<p>`"],
        1,
        "`<strong>` means important (shown bold); `<em>` means stressed (shown in italics).",
      ),
    ),
    lesson(
      "attributes",
      "Attributes: extra settings",
      3,
      explain(
        'An [[attribute]] adds a setting to an element, written inside the opening tag as `name="value"`.',
      ),
      code(
        "html",
        "attributes",
        [
          '<a href="/notes">My notes</a>',
          '<img src="cat.jpg" alt="A sleeping cat">',
        ],
        {
          1: "href: where the link goes",
          2: "src: which picture; alt: what it shows",
        },
      ),
      explain(
        "`<img>` has no closing tag: it has no content, only attributes. That makes it a [[void-element|void element]].",
      ),
    ),
    lesson(
      "common-attributes",
      "Attributes you'll use everywhere",
      3,
      reference("Everyday attributes", [
        ["id", "A unique name for one element on the page.", '<h2 id="intro">'],
        [
          "class",
          "A group name for styling or scripts; many elements can share it.",
          '<p class="note">',
        ],
        ["href", "Where a link goes.", '<a href="/notes">'],
        [
          "src",
          "Which file to show, for images, video and scripts.",
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
          "Extra text shown on hover; don't rely on it alone.",
          '<abbr title="HyperText…">HTML</abbr>',
        ],
        [
          "lang",
          "The language of the page or a part of it.",
          '<html lang="en">',
        ],
      ]),
      quickCheck(
        "Several notes on a page should share the same look. Which attribute groups them?",
        ["`id`", "`class`", "`name`"],
        1,
        "An `id` must be unique; a `class` can be shared by many elements.",
      ),
    ),
    lesson(
      "nesting",
      "Elements inside elements",
      3,
      explain(
        "Elements can contain other elements. This [[nesting]] is how a page gets its structure: a list holds items, an article holds a heading and paragraphs.",
      ),
      code(
        "html",
        "nesting",
        ["<p>", "  This is <strong>very</strong> important.", "</p>"],
        { 2: "<strong> sits inside the <p>" },
      ),
      quickCheck(
        "Which of these is nested correctly?",
        [
          "`<p><strong>Hi</p></strong>`",
          "`<p><strong>Hi</strong></p>`",
          "`<p><strong>Hi</p>`",
        ],
        1,
        "Close the inner element first: the last tag opened is the first one closed.",
      ),
    ),
    lesson(
      "block-and-inline",
      "Boxes and words: block and inline",
      3,
      explain(
        "Most elements are either [[block-inline|block or inline]]. A block element, like `<p>` or `<h1>`, starts on a new line and takes the whole width. An inline element, like `<strong>` or `<a>`, sits inside a line of text.",
      ),
      explain(
        "[[div-span|`<div>` and `<span>`]] are the plain versions: a `<div>` is a block box and a `<span>` an inline piece, with no meaning of their own. Use them only when no element with a meaning fits.",
      ),
      playground("Blocks stack, inline pieces flow", [
        "<div>A div is a block</div>",
        "<div>so this one starts on a new line.</div>",
        "<p>A <span>span</span> and a <strong>strong</strong> stay in the line.</p>",
      ]),
      quickCheck(
        "Which one starts on a new line by itself?",
        ["`<span>`", "`<a>`", "`<p>`"],
        2,
        "`<p>` is a block element; `<span>` and `<a>` are inline.",
      ),
    ),
    lesson(
      "page-skeleton",
      "The page skeleton",
      4,
      code(
        "html",
        "every page starts like this",
        [
          "<!doctype html>",
          '<html lang="en">',
          "  <head>",
          "    <title>My notes</title>",
          "  </head>",
          "  <body>",
          "    <h1>My notes</h1>",
          "  </body>",
          "</html>",
        ],
        {
          1: "this is modern HTML",
          2: "the page's language",
          3: "about the page (not shown)",
          6: "everything you see",
        },
      ),
      playground("Your first page: edit the body", [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        "    <title>My notes</title>",
        "  </head>",
        "  <body>",
        "    <h1>My notes</h1>",
        "    <p>Write anything here.</p>",
        "  </body>",
        "</html>",
      ]),
      quickCheck(
        "Where does the text you see on the page go?",
        ["In `<head>`", "In `<body>`", "Before `<!doctype html>`"],
        1,
        "`<body>` holds everything visible; `<head>` describes the page.",
      ),
    ),
    lesson(
      "the-head",
      "The head: about the page",
      3,
      explain(
        "`<head>` holds information for the browser: the character set, the tab title, links to style sheets and the [[viewport-meta|viewport meta tag]] that makes phones show the page at their real width.",
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
          2: "how letters are stored",
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
    lesson(
      "headings-and-text",
      "Headings and paragraphs",
      3,
      explain(
        "A [[heading]] titles a page or a part of it: `<h1>` for the main title, `<h2>` for sections, `<h3>` inside those. Text goes in `<p>` paragraphs.",
      ),
      code(
        "html",
        "headings and text",
        [
          "<h1>My notes</h1>",
          "<h2>Shopping</h2>",
          "<p>Milk, bread and eggs.</p>",
        ],
        { 1: "one main title", 2: "a section" },
      ),
      keyPoints(
        "Pick a heading by its level, not its size: CSS changes sizes.",
        "One `<h1>` per page.",
        "Screen reader users jump from heading to heading.",
      ),
    ),
    lesson(
      "lists",
      "Lists",
      3,
      explain(
        "A [[html-list|list]] groups items: `<ul>` shows bullets, `<ol>` shows numbers, and each item is an `<li>`.",
      ),
      code(
        "html",
        "two kinds of list",
        [
          "<ul>",
          "  <li>Milk</li>",
          "  <li>Bread</li>",
          "</ul>",
          "<ol>",
          "  <li>Preheat the oven</li>",
          "  <li>Bake</li>",
          "</ol>",
        ],
        { 1: "order doesn't matter", 5: "order matters" },
      ),
      playground("Make your own lists", [
        "<h2>Shopping</h2>",
        "<ul>",
        "  <li>Milk</li>",
        "  <li>Bread</li>",
        "</ul>",
        "<h2>Pancakes</h2>",
        "<ol>",
        "  <li>Mix</li>",
        "  <li>Fry</li>",
        "</ol>",
      ]),
      quickCheck(
        "Recipe steps must be done in order. Which list?",
        ["`<ul>`", "`<ol>`", "Separate `<p>` paragraphs"],
        1,
        "`<ol>` is an ordered [[html-list|list]]: its numbers tell the reader the order matters.",
      ),
    ),
    lesson(
      "links",
      "Links",
      3,
      explain(
        "A [[anchor|link]] is an `<a>` element. Its `href` [[attribute]] is the address to go to, and its content is the clickable text.",
      ),
      code(
        "html",
        "links",
        [
          '<a href="/notes">My notes</a>',
          '<a href="https://example.com">Another site</a>',
        ],
        { 1: "a page on this site", 2: "a page on another site" },
      ),
      quickCheck(
        "Which link text is best?",
        ["“Click here”", "“Read the setup guide”", "“Link”"],
        1,
        "Link text should say where it goes; screen reader users often hear only the list of links.",
      ),
    ),
    lesson(
      "images",
      "Images and alt text",
      3,
      explain(
        "`<img>` shows a picture from its `src`. Its `alt` [[attribute]] is the [[alt-text]]: words that stand in for the picture when it can't be seen.",
      ),
      code(
        "html",
        "an image",
        ['<img src="team.jpg" alt="Four people around a laptop, laughing">'],
        { 1: "describe what matters in the picture" },
      ),
      keyPoints(
        "Screen readers read the alt text aloud.",
        "Browsers show it when the image fails to load.",
        'A purely decorative image gets `alt=""`, so it is skipped.',
      ),
    ),
    formsModule,
    lesson(
      "comments-and-whitespace",
      "Comments and spaces",
      2,
      explain(
        "A [[html-comment|comment]], `<!-- like this -->`, is a note for people that the browser ignores. Extra spaces and line breaks are ignored too: the browser shows one space.",
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
    lesson(
      "tag-cheat-sheet",
      "Your everyday tag cheat sheet",
      3,
      reference("Everyday tags beyond text", [
        [
          "<div> <span>",
          "Plain block and inline boxes, when nothing more meaningful fits.",
          "<div>…</div>  <span>…</span>",
        ],
        [
          "<ul> <ol> <li>",
          "Bulleted and numbered lists, and their items.",
          "<ul><li>Milk</li></ul>",
        ],
        [
          "<img>",
          "An image; needs `src` and `alt`.",
          '<img src="a.png" alt="…">',
        ],
        [
          "<video> <audio>",
          "Video and sound with controls.",
          '<video src="a.mp4" controls></video>',
        ],
        [
          "<form>",
          "Groups fields to send together.",
          '<form action="/notes" method="post">',
        ],
        [
          "<label> <input>",
          "A field and its visible name.",
          '<label for="t">Title</label>\n<input id="t">',
        ],
        [
          "<textarea>",
          "A box for several lines of text.",
          '<textarea rows="4"></textarea>',
        ],
        [
          "<select> <option>",
          "A drop-down list of choices.",
          "<select><option>Newest</option></select>",
        ],
        [
          "<button>",
          "Something to click that does an action.",
          '<button type="submit">Save</button>',
        ],
        [
          "<table> <tr> <td>",
          "Data in rows and columns.",
          "<table><tr><td>A</td></tr></table>",
        ],
        [
          "<header> <main> <footer>",
          "The big regions of a page (more in Intermediate).",
          "<main>…</main>",
        ],
      ]),
      playground("Build a small form", [
        "<form>",
        '  <label for="title">Title</label>',
        '  <input id="title" name="title">',
        '  <label for="text">Note</label>',
        '  <textarea id="text" rows="3"></textarea>',
        '  <button type="submit">Save</button>',
        "</form>",
      ]),
      quickCheck(
        "You need a box for a long, multi-line note. Which tag?",
        ["`<input>`", "`<textarea>`", "`<p>`"],
        1,
        "`<input>` holds one line; `<textarea>` holds several.",
      ),
    ),
    lesson(
      "the-notes-app-page",
      "The Notes App's page",
      3,
      inTheNotesApp(
        'The Notes App\'s `index.html` is a full skeleton with an almost empty body: one `<div id="root">` that React fills, and one script.',
        { fileId: "frontend/index.html" },
      ),
      keyPoints(
        "`<head>`: charset, viewport and the title “Notes”.",
        "`<body>`: one empty `<div>` and a `<script>`.",
        "Everything else is HTML that React writes into the div.",
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
    levelCheck("basic-check", "Basic check", [
      ["html-basic-closing-tag", "elements-and-tags"],
      ["html-basic-nesting", "nesting"],
      ["html-basic-head", "page-skeleton"],
      ["html-basic-ordered-list", "lists"],
      ["html-basic-alt", "images"],
      ["html-basic-label", "forms"],
      ["html-basic-block-inline", "block-and-inline"],
    ]),
  ],
};
