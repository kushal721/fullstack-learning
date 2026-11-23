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

// Advanced: steps 28–37. Variables, modern selectors, container queries,
// animation, dark mode, utility CSS and layers.
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
    lesson(
      "animations",
      "Keyframe animations",
      3,
      explain(
        "A [[keyframes|keyframes animation]] describes steps in time and can run on its own, repeat or alternate, unlike a transition that needs a change to start.",
      ),
      playground("A loading pulse", [
        "<style>",
        "  @keyframes pulse {",
        "    from { opacity: 1; transform: scale(1); }",
        "    to { opacity: .4; transform: scale(.9); }",
        "  }",
        "  .dot { width: 24px; height: 24px; border-radius: 50%; background: royalblue;",
        "    animation: pulse 800ms ease-in-out infinite alternate; }",
        "</style>",
        '<div class="dot"></div>',
      ]),
      quickCheck(
        "What does `infinite alternate` do?",
        [
          "Runs once",
          "Repeats forever, going forwards then backwards",
          "Runs only on hover",
        ],
        1,
        "`infinite` repeats; `alternate` reverses every other time, so it pulses smoothly.",
      ),
    ),
    lesson(
      "transforms",
      "Transforms",
      3,
      reference("transform functions", [
        [
          "translate()",
          "Move without affecting layout.",
          "transform: translate(10px, -4px);",
        ],
        ["scale()", "Grow or shrink.", "transform: scale(1.1);"],
        ["rotate()", "Turn.", "transform: rotate(8deg);"],
        [
          "transform-origin",
          "The point it turns or scales around.",
          "transform-origin: top left;",
        ],
      ]),
      playground("Hover the cards", [
        "<style>",
        "  .card { display: inline-block; padding: 16px; margin: 8px; background: #eef3ff;",
        "    border-radius: 8px; transition: transform 200ms; }",
        "  .lift:hover { transform: translateY(-6px); }",
        "  .tilt:hover { transform: rotate(-4deg) scale(1.05); }",
        "</style>",
        '<div class="card lift">Lift</div><div class="card tilt">Tilt</div>',
      ]),
      explain(
        "A [[transform]] doesn't move the boxes around it, and browsers animate it cheaply.",
      ),
    ),
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
    lesson(
      "motion-and-contrast",
      "Respect motion and contrast",
      3,
      explain(
        "Some people get dizzy from movement and set their system to [[reduced-motion|reduce motion]]. Turn animations down for them, and keep text contrast high for everyone.",
      ),
      code(
        "css",
        "turning motion off when asked",
        [
          "@media (prefers-reduced-motion: reduce) {",
          "  *, *::before, *::after {",
          "    animation-duration: .01ms !important;",
          "    transition-duration: .01ms !important;",
          "  }",
          "}",
        ],
        { 1: "only for people who asked for less motion" },
      ),
      quickCheck(
        "Who is `prefers-reduced-motion` for?",
        [
          "People whose system asks for less movement",
          "Slow computers",
          "Phones only",
        ],
        0,
        "It's an accessibility setting; this platform turns motion off for it too.",
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
