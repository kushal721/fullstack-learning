import type { LevelPlan } from "@fsl/shared";
import {
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
} from "../blocks.js";

// Advanced: steps 17–22. Search engines, loading scripts, web components,
// built-in interactive elements and how HTML looks inside React.
export const advanced: LevelPlan = {
  outcome:
    "Make custom widgets accessible, help search engines and keep pages fast to load.",
  steps: [
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
      "details-and-dialog",
      "Built-in interactive elements",
      3,
      explain(
        "Some elements are interactive with no JavaScript at all. [[details-dialog|`<details>` and `<dialog>`]]: `<details>` opens and closes a section when its `<summary>` is clicked; `<dialog>` is a pop-up box with focus handled for you.",
      ),
      playground("Click the summary to open it", [
        "<details>",
        "  <summary>What is HTML?</summary>",
        "  <p>The language web pages are written in.</p>",
        "</details>",
        "<details open>",
        "  <summary>This one starts open</summary>",
        "  <p>Add or remove the open attribute.</p>",
        "</details>",
      ]),
      quickCheck(
        "Why use `<details>` for a FAQ instead of a `<div>` and a script?",
        [
          "It looks nicer",
          "It opens and closes by itself, with keyboard and screen reader support",
          "It loads faster",
        ],
        1,
        "Built-in elements bring the behaviour and the accessibility for free.",
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
      ["html-advanced-defer", "script-loading"],
      ["html-advanced-htmlfor", "html-in-react"],
      ["html-advanced-details", "details-and-dialog"],
      ["html-advanced-custom-element", "web-components"],
    ]),
  ],
};
