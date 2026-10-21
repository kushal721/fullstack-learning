import type { LevelPlan } from "@fsl/shared";
import {
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";

// Advanced: steps 27–34. ARIA, search engines, loading, images, web
// components and how HTML looks inside React.
export const advanced: LevelPlan = {
  outcome:
    "Make custom widgets accessible, help search engines and keep pages fast to load.",
  steps: [
    lesson(
      "aria",
      "ARIA: describing custom widgets",
      3,
      explain(
        '[[aria]] attributes tell screen readers what a custom widget is and what state it\'s in: `role="tab"`, `aria-expanded="true"`, `aria-current="page"`.',
      ),
      code(
        "html",
        "a menu button",
        [
          '<button aria-expanded="false" aria-controls="menu">Menu</button>',
          '<ul id="menu" hidden>…</ul>',
        ],
        { 1: "says whether the menu is open, and which list it opens" },
      ),
      quickCheck(
        "What does `aria-expanded` change?",
        [
          "Whether the menu opens",
          "What a screen reader announces",
          "The button's colour",
        ],
        1,
        "[[aria]] adds no behaviour; your code must still open and close the menu.",
      ),
    ),
    lesson(
      "first-rule-of-aria",
      "The first rule of ARIA",
      3,
      explain(
        'If a real HTML element does the job, use it. A `<div>` with `role="button"` still needs keyboard handling, focus and an [[accessible-name]]; a `<button>` has all of that already.',
      ),
      code(
        "html",
        "the same button, twice",
        [
          '<div role="button" tabindex="0" onclick="save()">Save</div>',
          '<button type="button" onclick="save()">Save</button>',
        ],
        {
          1: "still no Enter or Space key",
          2: "keyboard, focus and name for free",
        },
      ),
      keyPoints(
        "No ARIA is better than wrong ARIA.",
        "Use ARIA for states (expanded, current, selected) and live updates.",
        "Test with a keyboard and a screen reader.",
      ),
    ),
    lesson(
      "seo",
      "Search engines read HTML",
      3,
      explain(
        "[[seo]] is mostly good HTML: a clear `<title>`, a description, real headings, descriptive links and pages that show their content without waiting for clicks.",
      ),
      keyPoints(
        "One page, one topic, one `<h1>`.",
        "Every page has its own title and description.",
        "Fast pages rank better and keep visitors.",
      ),
      quickCheck(
        "Which helps search engines most?",
        [
          "Hiding keywords in white text",
          "A clear title and headings that match the content",
          "Many pages with the same title",
        ],
        1,
        "Search engines reward pages whose [[heading|headings]] and title honestly describe them.",
      ),
    ),
    lesson(
      "script-loading",
      "Loading scripts without blocking",
      3,
      explain(
        "A plain `<script>` stops the browser reading the HTML until it has downloaded and run. [[script-loading|`defer` and `async`]] let the page keep loading meanwhile.",
      ),
      code(
        "html",
        "three ways to load a script",
        [
          '<script src="app.js"></script>',
          '<script src="app.js" defer></script>',
          '<script type="module" src="/src/main.jsx"></script>',
        ],
        {
          1: "blocks the page while it loads",
          2: "runs after the HTML is read",
          3: "modules are deferred too",
        },
      ),
      inTheNotesApp(
        "The Notes App loads its code with a module script, so the page never waits for it.",
        { fileId: "frontend/index.html" },
      ),
    ),
    lesson(
      "responsive-images",
      "Images for every screen",
      3,
      explain(
        "[[responsive-images]] offer several sizes of one picture; the browser downloads the smallest that looks sharp on that screen.",
      ),
      code(
        "html",
        "srcset and sizes",
        [
          "<img",
          '  src="photo-800.jpg"',
          '  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"',
          '  sizes="(max-width: 600px) 100vw, 600px"',
          '  alt="Notes on a desk" loading="lazy">',
        ],
        {
          3: "the files and their widths",
          4: "how wide it will be shown",
          5: "wait until it's near the screen",
        },
      ),
      quickCheck(
        'What does `loading="lazy"` do?',
        [
          "Loads the image only when it's about to be seen",
          "Makes the image blurry",
          "Loads it before the HTML",
        ],
        0,
        "Images far down the page wait, so the first screen loads sooner.",
      ),
    ),
    lesson(
      "web-components",
      "Your own elements",
      3,
      explain(
        "A [[web-component]] is an element you define yourself, like `<note-card>`, built into the browser. JavaScript registers it with `customElements.define`.",
      ),
      code(
        "js",
        "a tiny custom element",
        [
          "class NoteCard extends HTMLElement {",
          "  connectedCallback() {",
          '    this.innerHTML = `<p>${this.getAttribute("title")}</p>`;',
          "  }",
          "}",
          'customElements.define("note-card", NoteCard);',
        ],
        { 6: 'now <note-card title="…"> works' },
      ),
      keyPoints(
        "Names must contain a hyphen: `note-card`, not `notecard`.",
        "They work in any page, with or without a framework.",
        "React components are different: they exist only inside React.",
      ),
    ),
    lesson(
      "html-in-react",
      "HTML inside React",
      3,
      explain(
        "In React you write HTML-like tags in JavaScript. Almost everything is the same, but a few attribute names change because they clash with JavaScript words.",
      ),
      code(
        "jsx",
        "the Notes App's Input",
        [
          "<label htmlFor={id}>{label}</label>",
          '<input id={id} className="field" />',
        ],
        {
          1: "for becomes htmlFor",
          2: "class becomes className; void elements need />",
        },
      ),
      quickCheck(
        'In React, how do you write `<label for="email">`?',
        [
          '`<label for="email">`',
          '`<label htmlFor="email">`',
          '`<label name="email">`',
        ],
        1,
        "`for` is a JavaScript keyword, so React calls it `htmlFor`. It ends up as `for` in the real page.",
      ),
    ),
    levelCheck("advanced-check", "Advanced check", [
      ["html-advanced-aria", "aria"],
      ["html-advanced-div-button", "first-rule-of-aria"],
      ["html-advanced-defer", "script-loading"],
      ["html-advanced-htmlfor", "html-in-react"],
    ]),
  ],
};
