import type { LevelPlan } from "@fsl/shared";
import { code, explain, lesson, levelCheck, quickCheck } from "../blocks.js";
import { animationsModule } from "./animations.js";
import { modernCssModule } from "./modern-css.js";

// Advanced: steps 16–19. Modern CSS and animations and transforms
// (modules), then utility CSS and Tailwind.
export const advanced: LevelPlan = {
  outcome:
    "Build themeable, component-friendly styles with variables, modern selectors, animation and dark mode.",
  steps: [
    modernCssModule,
    animationsModule,
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
    levelCheck("advanced-check", "Advanced check", [
      ["css-advanced-var", "modern-css"],
      ["css-advanced-has", "modern-css"],
      ["css-advanced-container", "modern-css"],
      ["css-advanced-dark", "modern-css"],
    ]),
  ],
};
