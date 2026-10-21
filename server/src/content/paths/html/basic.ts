import type { LevelPlan } from "@fsl/shared";
import {
  analogy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";

// Basic: steps 1–16. Tags, elements and attributes, the page skeleton,
// text, lists, links, images and simple forms.
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
      keyPoints(
        "`<head>`: information about the page, like its title.",
        "`<body>`: the content people see.",
        "`lang` tells screen readers which language to speak.",
      ),
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
    lesson(
      "forms",
      "Forms",
      3,
      explain(
        "A [[html-form|form]] groups fields and a button, so what someone types can be sent together: a login, a search, a new note.",
      ),
      diagram([
        ["Fields", "what you type"],
        ["Button", "Send"],
        ["Request", "to the server"],
      ]),
      quickCheck(
        "What does a form do when it's submitted?",
        [
          "Sends its fields' values together",
          "Saves them in the HTML file",
          "Clears the page",
        ],
        0,
        "A [[html-form|form]] collects every named field and sends them in one request.",
      ),
    ),
    lesson(
      "inputs-and-labels",
      "Inputs and labels",
      3,
      explain(
        "An [[html-input|input]] is a box to type in or a control to tick. Every input needs a [[label]] that says what to type; `for` on the label matches `id` on the input.",
      ),
      code(
        "html",
        "a labelled field",
        [
          '<label for="email">Email</label>',
          '<input id="email" name="email" type="email">',
        ],
        {
          1: "for= points at the input's id",
          2: "name= is the key it's sent under",
        },
      ),
      inTheNotesApp(
        "The Notes App's `Input` component always pairs a label with its field this way.",
        { fileId: "frontend/src/components/Input.jsx" },
      ),
    ),
    lesson(
      "buttons",
      "Buttons",
      2,
      explain(
        'A [[html-button|button]] triggers an action. Inside a form, a button sends the form; `type="button"` makes one that does nothing until code listens to it.',
      ),
      quickCheck(
        "Something you click to *go to another page* should be…",
        ["A `<button>`", "A link (`<a>`)", "A `<div>`"],
        1,
        "Links go places; buttons do things. Using the right one keeps the keyboard and screen readers working.",
      ),
    ),
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
      ["html-basic-label", "inputs-and-labels"],
    ]),
  ],
};
