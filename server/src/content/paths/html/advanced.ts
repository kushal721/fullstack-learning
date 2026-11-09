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
import { reactModule } from "./react.js";
import { searchModule } from "./search.js";

// Advanced: steps 16–21. Search engines and link previews, loading
// scripts, web components, built-in interactive elements and how HTML looks
// inside React.
export const advanced: LevelPlan = {
  outcome:
    "Make custom widgets accessible, help search engines and keep pages fast to load.",
  steps: [
    searchModule,
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
    reactModule,
    levelCheck("advanced-check", "Advanced check", [
      ["html-advanced-defer", "script-loading"],
      ["html-advanced-htmlfor", "html-in-react"],
      ["html-advanced-details", "details-and-dialog"],
      ["html-advanced-custom-element", "web-components"],
    ]),
  ],
};
