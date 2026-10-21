import type { LevelPlan } from "@fsl/shared";
import {
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";

// Intermediate: steps 21–34. Meaningful structure, real forms, tables,
// accessibility and what the browser builds from HTML.
export const intermediate: LevelPlan = {
  outcome:
    "Structure a page so browsers, search engines and screen readers all understand it, with forms that check themselves.",
  steps: [
    lesson(
      "semantic-structure",
      "Meaningful structure",
      3,
      explain(
        "[[html-semantic-structure|Semantic HTML]] picks the element that says what a part *is*: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`. Each main region is a [[landmark]].",
      ),
      code(
        "html",
        "a page's landmarks",
        [
          "<header>…</header>",
          "<nav>…</nav>",
          "<main>",
          "  <article>…</article>",
          "</main>",
          "<footer>…</footer>",
        ],
        { 3: "the one main content area" },
      ),
      quickCheck(
        'Why prefer `<nav>` over `<div class="nav">`?',
        [
          "It looks better",
          "Browsers and screen readers know it's navigation",
          "It loads faster",
        ],
        1,
        "A `<div>` means nothing; `<nav>` is a [[landmark]] people can jump to.",
      ),
    ),
    lesson(
      "structure-tags",
      "The structure tags",
      4,
      reference("Tags that say what a part of the page is", [
        [
          "<header>",
          "The top of the page or of a section: logo, title, main links.",
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
          "A themed part of a page, with its own heading.",
          "<section><h2>Today</h2>…</section>",
        ],
        [
          "<article>",
          "Something that makes sense on its own: a note, a post.",
          "<article><h3>Milk</h3></article>",
        ],
        [
          "<aside>",
          "Content beside the main point: tips, related links.",
          "<aside>Tip: …</aside>",
        ],
        [
          "<footer>",
          "The bottom of the page or a section: credits, links.",
          "<footer>© 2026</footer>",
        ],
        [
          "<figure>",
          "An image or diagram with its `<figcaption>`.",
          "<figure><img …><figcaption>…</figcaption></figure>",
        ],
        [
          "<time>",
          "A date or time machines can read.",
          '<time datetime="2026-10-21">Today</time>',
        ],
      ]),
      playground("Lay out a page with landmarks", [
        "<header><h1>Notes</h1></header>",
        '<nav><a href="#">All</a> · <a href="#">Starred</a></nav>',
        "<main>",
        "  <article><h2>Shopping</h2><p>Milk, bread.</p></article>",
        "  <aside>Tip: star important notes.</aside>",
        "</main>",
        "<footer>Made by you</footer>",
      ]),
      quickCheck(
        "Each note in a list makes sense on its own. Which element wraps one note?",
        ["`<aside>`", "`<article>`", "`<nav>`"],
        1,
        "An `<article>` is self-contained: a note, a post, a comment.",
      ),
    ),
    lesson(
      "heading-outline",
      "The heading outline",
      2,
      explain(
        "Headings form the page's [[outline]], like a table of contents. Go down one level at a time: `<h2>` inside an `<h1>` section, `<h3>` inside an `<h2>`.",
      ),
      keyPoints(
        "One `<h1>`: what the whole page is about.",
        "Don't skip levels to get a smaller font.",
        "Sizes are CSS's job; levels are HTML's.",
      ),
      inTheNotesApp(
        "The Notes App's header uses `<header>` with a `<nav>` inside for the logged-in user's controls.",
        { fileId: "frontend/src/components/Navbar.jsx" },
      ),
    ),
    lesson(
      "form-validation",
      "Forms that check themselves",
      3,
      explain(
        'Browsers do [[form-validation]] for you: `required` stops an empty field, `type="email"` wants an email address, `maxlength` caps the length.',
      ),
      code(
        "html",
        "built-in checks",
        [
          '<input id="title" required maxlength="100">',
          '<input id="email" type="email" required>',
        ],
        {
          1: "must be filled, at most 100 letters",
          2: "must look like an email",
        },
      ),
      quickCheck(
        "The browser checks `required`. Does the server still need to check?",
        [
          "No, the browser already did",
          "Yes: anyone can send a request without the form",
          "Only for passwords",
        ],
        1,
        "Browser checks help the user; only the server's checks protect the data.",
      ),
    ),
    lesson(
      "input-types",
      "All the input types",
      4,
      explain(
        "The `type` [[attribute]] turns one `<input>` into many controls. Each of the [[input-type|input types]] gives the right keyboard on phones and its own built-in check.",
      ),
      reference("Input types", [
        ["text", "One line of any text (the default).", '<input type="text">'],
        [
          "email",
          "An email address; phones show an @ key.",
          '<input type="email">',
        ],
        ["password", "Hidden characters.", '<input type="password">'],
        [
          "number",
          "A number, with up and down arrows.",
          '<input type="number" min="1">',
        ],
        ["date", "A date, with a calendar picker.", '<input type="date">'],
        ["checkbox", "A yes/no tick.", '<input type="checkbox">'],
        [
          "radio",
          "One choice from a group.",
          '<input type="radio" name="sort">',
        ],
        ["file", "Pick a file to upload.", '<input type="file">'],
        [
          "range",
          "A slider between two values.",
          '<input type="range" max="10">',
        ],
        ["search", "A search box.", '<input type="search">'],
        ["url", "A web address.", '<input type="url">'],
        [
          "tel",
          "A phone number; phones show a number pad.",
          '<input type="tel">',
        ],
      ]),
      playground("Try the types: click and type in each", [
        '<label>Email <input type="email"></label><br>',
        '<label>Date <input type="date"></label><br>',
        '<label>Count <input type="number" min="1" max="5"></label><br>',
        '<label>Level <input type="range" max="10"></label><br>',
        '<label><input type="checkbox"> Remember me</label>',
      ]),
      quickCheck(
        "Which type makes a phone show a number pad for a phone number?",
        ['`type="text"`', '`type="tel"`', '`type="number"`'],
        1,
        "`tel` is for phone numbers: a number pad, but no arrows and no maths.",
      ),
    ),
    lesson(
      "choices",
      "Checkboxes, radio buttons and selects",
      3,
      explain(
        "For picking instead of typing, use [[choice-inputs|choice inputs]]: a checkbox for yes or no, radio buttons for one of a few, a `<select>` for one of many.",
      ),
      code(
        "html",
        "a radio group",
        [
          "<fieldset>",
          "  <legend>Sort notes by</legend>",
          '  <label><input type="radio" name="sort" value="new"> Newest</label>',
          '  <label><input type="radio" name="sort" value="title"> Title</label>',
          "</fieldset>",
        ],
        { 2: "names the group", 3: "same name: only one can be chosen" },
      ),
      keyPoints(
        "`<fieldset>` and `<legend>` group related choices.",
        "Radio buttons share a `name`; checkboxes don't have to.",
        "Every choice still needs a label.",
      ),
    ),
    lesson(
      "tables",
      "Tables, for data",
      3,
      explain(
        "A [[html-table|table]] shows data in rows and columns. `<th>` cells are headers; `<td>` cells hold the data.",
      ),
      code(
        "html",
        "a small table",
        [
          "<table>",
          '  <tr><th scope="col">Note</th><th scope="col">Edited</th></tr>',
          "  <tr><td>Shopping</td><td>Today</td></tr>",
          "</table>",
        ],
        { 2: "headers, each for its column", 3: "one row of data" },
      ),
      quickCheck(
        "When should you use a table?",
        [
          "To place things side by side on the page",
          "For data that has rows and columns",
          "Never",
        ],
        1,
        "Tables are for data; layout is CSS's job.",
      ),
    ),
    lesson(
      "media",
      "Video, audio and embedded pages",
      3,
      explain(
        "[[media-element|`<video>` and `<audio>`]] play media with the browser's own controls. An [[iframe]] shows another whole page inside yours, like a map or a video from another site.",
      ),
      reference("Media tags", [
        [
          "<video>",
          "A video; `controls` shows play, pause and volume.",
          '<video src="intro.mp4" controls></video>',
        ],
        [
          "<audio>",
          "Sound with controls.",
          '<audio src="hello.mp3" controls></audio>',
        ],
        [
          "<track>",
          "Captions for a video, as a text file.",
          '<track kind="captions" src="en.vtt">',
        ],
        [
          "<iframe>",
          "Another page inside this one.",
          '<iframe src="https://…" title="Map"></iframe>',
        ],
      ]),
      quickCheck(
        "Why give an `<iframe>` a `title`?",
        [
          "It shows as a heading",
          "Screen readers use it to say what the embedded page is",
          "It makes the frame load faster",
        ],
        1,
        "The `title` is the frame's name for people who can't see what's inside.",
      ),
    ),
    lesson(
      "accessibility",
      "Pages for everyone",
      3,
      explain(
        "[[accessibility]] means people who can't see, can't use a mouse or zoom in can still use the page. A [[screen-reader]] reads the page's structure aloud, so good HTML does most of the work.",
      ),
      keyPoints(
        "Real buttons and links work with the keyboard for free.",
        "Labels, alt text and headings are what people hear.",
        "Try it: use a page with only Tab, Enter and Space.",
      ),
      diagram([
        ["HTML", "what each thing is"],
        ["Screen reader", "reads it aloud"],
        ["Person", "uses the page"],
      ]),
    ),
    lesson(
      "accessible-names",
      "Names for everything",
      3,
      explain(
        "Every control needs an [[accessible-name]]: what a screen reader calls it. A button's text, a field's label and an image's alt are names.",
      ),
      code(
        "html",
        "a button with only an icon",
        [
          '<button type="button">✕</button>',
          '<button type="button" aria-label="Close">✕</button>',
        ],
        {
          1: "announced as “multiplication sign, button”",
          2: "announced as “Close, button”",
        },
      ),
      quickCheck(
        "A search box has a placeholder “Search…” but no label. What's the problem?",
        [
          "None",
          "Placeholders vanish when typing and aren't a reliable name",
          "Placeholders make the page slow",
        ],
        1,
        "Use a real [[label]] (it can be visually hidden); a placeholder is only a hint.",
      ),
    ),
    lesson(
      "meta-tags",
      "Meta tags and link previews",
      2,
      explain(
        "[[meta-tag|Meta tags]] in `<head>` describe the page to others: `description` is the snippet under a search result, and `og:` tags shape the preview when the link is shared.",
      ),
      code(
        "html",
        "describing a page",
        [
          '<meta name="description" content="Write and keep your notes.">',
          '<meta property="og:title" content="Notes">',
          '<meta property="og:image" content="https://notes.app/preview.png">',
        ],
        { 1: "the search snippet", 2: "the shared link's title and picture" },
      ),
      keyPoints(
        "They're invisible on the page itself.",
        "Each page should have its own title and description.",
        "This platform sets them per page on the server.",
      ),
    ),
    lesson(
      "special-characters",
      "Special characters",
      3,
      explain(
        "`<` and `&` start tags and codes, so to show them as text you write a [[html-entity|character entity]]: `&lt;` shows <, `&amp;` shows &.",
      ),
      reference("Entities you'll need", [
        [
          "&lt;  &gt;",
          "The < and > signs, for showing tags as text.",
          "&lt;p&gt; shows <p>",
        ],
        ["&amp;", "The & sign.", "Tom &amp; Jerry"],
        [
          "&quot;",
          "A double quote inside an attribute value.",
          'title="Say &quot;hi&quot;"',
        ],
        ["&nbsp;", "A space that never breaks the line.", "10&nbsp;km"],
        ["&copy;  &mdash;", "Symbols like © and —.", "&copy; 2026"],
      ]),
      playground("Show code as text", [
        "<p>To make a paragraph, write &lt;p&gt;Hello&lt;/p&gt;.</p>",
        "<p>Salt &amp; pepper</p>",
        "<p>Distance: 10&nbsp;km</p>",
      ]),
      quickCheck(
        "You want the page to show the text `<b>` instead of making bold text. What do you write?",
        ["`<b>`", "`&lt;b&gt;`", "`\\<b\\>`"],
        1,
        "`&lt;` and `&gt;` show the angle brackets as text, so the browser doesn't read a tag.",
      ),
    ),
    lesson(
      "the-dom",
      "From HTML to the DOM",
      3,
      explain(
        "The browser turns the HTML into a tree of objects, the [[dom]]: every element becomes a node, and [[nesting]] becomes parents and children. JavaScript and screen readers work with this tree, not the file.",
      ),
      diagram([
        ["HTML text", "the file"],
        ["DOM tree", "live objects"],
        ["Page", "drawn from the tree"],
      ]),
      quickCheck(
        "JavaScript adds an element to the page. What changes?",
        [
          "The HTML file on the server",
          "The DOM in the browser",
          "Nothing until you reload",
        ],
        1,
        "Scripts change the [[dom]]; the file on the server stays the same.",
      ),
    ),
    levelCheck("intermediate-check", "Intermediate check", [
      ["html-intermediate-main", "semantic-structure"],
      ["html-intermediate-required", "form-validation"],
      ["html-intermediate-radio", "choices"],
      ["html-intermediate-icon-button", "accessible-names"],
      ["html-intermediate-entity", "special-characters"],
    ]),
  ],
};
