import type { LevelPlan } from "@fsl/shared";
import {
  explain,
  lesson,
  levelCheck,
  playground,
  quickCheck,
} from "../blocks.js";
import { componentsModule } from "./components.js";
import { reactModule } from "./react.js";
import { scriptsModule } from "./scripts.js";
import { searchModule } from "./search.js";

// Advanced: steps 14–19. Search engines and link previews, loading
// scripts, web components, built-in interactive elements and how HTML looks
// inside React.
export const advanced: LevelPlan = {
  outcome:
    "Make custom widgets accessible, help search engines and keep pages fast to load.",
  steps: [
    searchModule,
    scriptsModule,
    componentsModule,
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
