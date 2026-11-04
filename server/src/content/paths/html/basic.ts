import type { LevelPlan } from "@fsl/shared";
import {
  code,
  explain,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";
import { elementsModule } from "./elements.js";
import { formsModule } from "./forms.js";
import { skeletonModule } from "./skeleton.js";

// Basic: steps 1–10. Tags, elements and attributes (with references of the
// everyday ones and live examples), the page skeleton, text, lists, links,
// images and simple forms.
export const basic: LevelPlan = {
  outcome:
    "Write a simple page by hand: headings, text, lists, links, images and a form.",
  steps: [
    elementsModule,
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
    skeletonModule,
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
    levelCheck("basic-check", "Basic check", [
      ["html-basic-closing-tag", "elements-and-attributes"],
      ["html-basic-nesting", "elements-and-attributes"],
      ["html-basic-head", "page-skeleton"],
      ["html-basic-ordered-list", "lists"],
      ["html-basic-alt", "images"],
      ["html-basic-label", "forms"],
      ["html-basic-block-inline", "elements-and-attributes"],
    ]),
  ],
};
