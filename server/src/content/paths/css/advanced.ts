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
  reference,
} from "../blocks.js";
import { animationsModule } from "./animations.js";

// Advanced: steps 16–23. Variables, modern selectors, container queries,
// animations and transforms (a module), dark mode, utility CSS and layers.
export const advanced: LevelPlan = {
  outcome:
    "Build themeable, component-friendly styles with variables, modern selectors, animation and dark mode.",
  steps: [
    lesson(
      "custom-properties",
      "Custom properties (CSS variables)",
      3,
      explain(
        "A [[custom-property]] names a value once (`--brand: royalblue;`) and reuses it with `var(--brand)`. Change it in one place and everything using it updates.",
      ),
      playground("Change --brand and watch everything follow", [
        "<style>",
        "  :root { --brand: royalblue; --radius: 8px; }",
        "  h1 { color: var(--brand); }",
        "  button { background: var(--brand); color: white; border: 0;",
        "    padding: 8px 16px; border-radius: var(--radius); }",
        "  .card { border: 2px solid var(--brand); border-radius: var(--radius); padding: 12px; }",
        "</style>",
        "<h1>Theme</h1>",
        '<div class="card">A card <button>Save</button></div>',
      ]),
      inTheNotesApp(
        "The Notes App defines its colours as custom properties on `:root`, like `--color-primary`.",
        { fileId: "frontend/src/index.css" },
      ),
    ),
    lesson(
      "modern-selectors",
      "Modern selectors",
      3,
      reference("Newer selectors worth knowing", [
        [
          ":is()",
          "Any of a list, written once.",
          ":is(h1, h2, h3) { margin: 0; }",
        ],
        [
          ":where()",
          "Like :is(), but with zero specificity.",
          ":where(.card) p { … }",
        ],
        [
          ":has()",
          "A parent that contains something.",
          ".card:has(img) { padding: 0; }",
        ],
        [
          ":not()",
          "Everything except.",
          "li:not(:last-child) { border-bottom: 1px solid; }",
        ],
        [
          "[attr]",
          "Elements with an attribute.",
          'a[target="_blank"]::after { content: " ↗"; }',
        ],
      ]),
      quickCheck(
        "Which selector styles only the cards that contain an image?",
        ["`.card img`", "`.card:has(img)`", "`img .card`"],
        1,
        "[[modern-selectors|`:has()`]] selects the parent; `.card img` selects the image itself.",
      ),
    ),
    lesson(
      "container-queries",
      "Container queries",
      3,
      explain(
        "A [[container-query]] styles something by the size of its container, not the window. The same card can be compact in a sidebar and roomy in the main column.",
      ),
      code(
        "css",
        "a card that adapts to its container",
        [
          ".card-holder { container-type: inline-size; }",
          "",
          "@container (min-width: 30rem) {",
          "  .card { display: flex; gap: 1rem; }",
          "}",
        ],
        { 1: "measure this element", 3: "when it is at least 30rem wide" },
      ),
      keyPoints(
        "Media queries ask about the window; container queries about the parent.",
        "Great for reusable components.",
        "Supported in every current browser.",
      ),
    ),
    animationsModule,
    lesson(
      "dark-mode",
      "Dark mode",
      3,
      explain(
        "[[prefers-color-scheme|Dark mode]] follows the system setting. Put the colours in custom properties, then swap them inside `@media (prefers-color-scheme: dark)`.",
      ),
      code(
        "css",
        "one set of colours, two themes",
        [
          ":root { --bg: white; --text: #171717; }",
          "",
          "@media (prefers-color-scheme: dark) {",
          "  :root { --bg: #0a0a0a; --text: #ededed; }",
          "}",
          "",
          "body { background: var(--bg); color: var(--text); }",
        ],
        {
          3: "only when the system is in dark mode",
          7: "every rule just uses the variables",
        },
      ),
      quickCheck(
        "Why put colours in custom properties for dark mode?",
        [
          "Only the variables change; no rule has to be repeated",
          "Variables load faster",
          "Browsers require it",
        ],
        0,
        "Swap a handful of values and the whole site follows.",
      ),
    ),
    lesson(
      "utility-css",
      "Utility CSS and Tailwind",
      3,
      explain(
        "[[utility-css|Utility CSS]] styles with many tiny classes right in the HTML. Each class sets one thing; a build step keeps only the ones you use. Tailwind is the best known; this platform's own pages use it.",
      ),
      code(
        "html",
        "the same card, two ways",
        [
          '<div class="card">…</div>',
          "<!-- with Tailwind: -->",
          '<div class="p-4 rounded-lg border bg-white shadow">…</div>',
        ],
        {
          1: "a class defined in a stylesheet",
          3: "each class is one property",
        },
      ),
      quickCheck(
        "What does `p-4` usually mean in Tailwind?",
        ["Paragraph style 4", "Padding of size 4 (1rem)", "Position 4"],
        1,
        "Utility class names are short codes for one property and value.",
      ),
    ),
    lesson(
      "cascade-layers",
      "Cascade layers",
      3,
      explain(
        "[[cascade-layer|Cascade layers]] group rules with `@layer`. A later layer beats an earlier one whatever the selectors, so a library's styles never fight yours.",
      ),
      code(
        "css",
        "layers decide before specificity",
        [
          "@layer base, components;",
          "",
          "@layer components { .button { background: royalblue; } }",
          "@layer base { #save { background: gray; } }",
        ],
        {
          1: "the order of the layers",
          3: "wins, though the id is more specific",
        },
      ),
      keyPoints(
        "Declare the order once at the top.",
        "Styles outside any layer beat all layers.",
        "Tailwind puts its utilities in a layer.",
      ),
    ),
    levelCheck("advanced-check", "Advanced check", [
      ["css-advanced-var", "custom-properties"],
      ["css-advanced-has", "modern-selectors"],
      ["css-advanced-container", "container-queries"],
      ["css-advanced-dark", "dark-mode"],
    ]),
  ],
};
