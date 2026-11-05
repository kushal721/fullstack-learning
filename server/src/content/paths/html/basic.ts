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
import { textModule } from "./text.js";

// Basic: steps 1–7. Tags, elements and attributes (with references of the
// everyday ones and live examples), the page skeleton, text, lists, links,
// images and simple forms.
export const basic: LevelPlan = {
  outcome:
    "Write a simple page by hand: headings, text, lists, links, images and a form.",
  steps: [
    elementsModule,
    skeletonModule,
    textModule,
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
      ["html-basic-ordered-list", "text-lists-links"],
      ["html-basic-entity", "text-lists-links"],
      ["html-basic-alt", "images"],
      ["html-basic-label", "forms"],
      ["html-basic-block-inline", "elements-and-attributes"],
    ]),
  ],
};
