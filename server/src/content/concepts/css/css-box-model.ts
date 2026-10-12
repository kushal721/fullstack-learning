import type { Concept } from "@fsl/shared";

export const cssBoxModel: Concept = {
  id: "css-box-model",
  slug: "css-box-model",
  title: "CSS box model",
  topicId: "css",
  summary:
    "The rule that every element on a web page is drawn as a rectangle made of content, padding, border and margin.",
  basics: [
    "HTML describes what is on a page (a heading, a paragraph, a button). CSS, short for Cascading Style Sheets, describes how it looks: colours, sizes, fonts and spacing. A CSS rule picks some elements with a selector and sets properties on them, like `.note-card { color: navy; }`.",
    "The browser does not see a page as text or pictures. To decide where things go, it turns every element into a rectangle, called a box, and places the boxes one after another. Even a round button or a single word lives inside an invisible rectangle.",
    "Sizes in CSS are usually written in pixels, such as `16px`. A pixel here is a small, fixed unit of length on the screen, so `16px` of space is roughly the height of normal text.",
  ],
  what: [
    "The box model is the set of four layers every box is made of. From the inside out: the content (the text or image itself), the padding (space inside the box, around the content), the border (a line around the padding) and the margin (space outside the border that pushes other boxes away).",
    "Each layer has its own CSS property: `width` and `height` for the content, `padding`, `border` and `margin`. You can set all four sides at once (`padding: 16px`) or one side at a time (`padding-top: 8px`).",
  ],
  why: [
    "Almost every layout question is really a box model question: why is this card wider than I asked, why are these two paragraphs so far apart, why does the text touch the edge? Knowing the four layers tells you exactly which property to change.",
    "Spacing is what makes a page readable. Padding gives content room to breathe inside a card or button, and margin keeps separate things apart. Without them, everything would be squeezed together edge to edge.",
  ],
  howItWorks: [
    "By default, `width` sets only the content area. The browser then adds the padding and border on top. A box with `width: 200px`, `padding: 20px` and `border: 2px solid` therefore takes up 244 pixels on the screen (200 + 20 + 20 + 2 + 2), which surprises almost everyone.",
    "Setting `box-sizing: border-box` changes that rule: `width` now includes the padding and the border, and the content shrinks to fit. The same box is then exactly 200 pixels wide, which is what most people expect.",
    "Margin is never part of the width. It is empty space outside the border, so a background colour does not show in the margin, while it does show in the padding.",
    "When the bottom margin of one block element meets the top margin of the next one, the browser does not add them together. It keeps only the bigger one. This is called margin collapsing and explains why two `20px` margins give a `20px` gap, not `40px`.",
  ],
  basicExample: {
    language: "css",
    code: `*,
*::before,
*::after {
  box-sizing: border-box;
}

.note-card {
  width: 300px;
  padding: 16px;
  border: 1px solid #ccc;
  margin-bottom: 24px;
}`,
    caption:
      "With border-box, each card is exactly 300px wide including padding and border, with 24px of space below it.",
    highlightLines: [4],
  },
  internals: [
    "During layout, the browser calculates four rectangles for every element: the content box, the padding box, the border box and the margin box. Each one wraps the one before it.",
    "The `box-sizing` property only tells the browser which of those rectangles `width` and `height` refer to: `content-box` (the default) means the innermost one, `border-box` means the border box.",
    "The universal selector `*` matches every element, and `::before` and `::after` match the extra pieces some elements generate. Setting `box-sizing: border-box` on all of them at the top of a stylesheet makes the whole page use the easier rule, which is why almost every project starts that way.",
    "Elements also have a display type. Block elements such as `<div>` and `<p>` start on a new line and respect all four layers. Inline elements such as `<span>` sit inside a line of text, and their top and bottom margins are ignored.",
  ],
  howToCreate: [
    {
      text: "Create a folder with a file called `index.html` that links to a stylesheet and contains two cards.",
      code: {
        language: "html",
        fileName: "index.html",
        code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="card">First note</div>
    <div class="card">Second note</div>
  </body>
</html>`,
      },
    },
    {
      text: "Create `styles.css` next to it. Give the cards a width, padding, border and margin, but no `box-sizing` yet.",
      code: {
        language: "css",
        fileName: "styles.css",
        code: `.card {
  width: 200px;
  padding: 20px;
  border: 2px solid steelblue;
  margin-bottom: 16px;
  background: aliceblue;
}`,
      },
    },
    {
      text: "Open `index.html` in your browser, open DevTools (F12 or Cmd+Opt+I), right-click a card and choose Inspect. In the Styles or Computed panel you will see a diagram of nested rectangles: the card is 244 pixels wide, not 200.",
    },
    {
      text: "Add the `border-box` rule at the top of `styles.css` and reload the page.",
      code: {
        language: "css",
        fileName: "styles.css",
        code: `*,
*::before,
*::after {
  box-sizing: border-box;
}`,
      },
    },
    {
      text: "Inspect the card again. The diagram now shows a total width of exactly 200 pixels, the light blue background fills the padding but not the margin, and hovering each layer in the diagram highlights it on the page.",
    },
  ],
  whereUsed: [
    "Everywhere: every element on every page is a box, so every layout uses it.",
    "Cards, buttons and form fields, where padding sets the space inside and margin or `gap` sets the space between them.",
    "Debugging layouts: when something is the wrong size or in the wrong place, the box model diagram in DevTools is the first thing to check.",
  ],
  connectsTo: [
    "CSS selectors, which choose the elements whose boxes you are styling.",
    "Flexbox, which arranges boxes in a row or column and uses their sizes and margins to place them.",
    "Responsive design, where widths, padding and margins change depending on the screen size.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App styles live in plain CSS in `frontend/src/index.css`. Its class names, such as `.note-card`, `.button` and `.form-field`, each describe one kind of box and set things like its padding, border and margin.",
      fileId: "frontend/src/index.css",
      match: ".note-card {",
    },
    {
      explanation:
        "Each `.note-card` uses padding to keep the note text away from its border, and the `gap` in `.notes-grid` spaces the cards apart so they read as separate notes on the Dashboard.",
      fileId: "frontend/src/index.css",
      match: ".note-card {",
    },
    {
      explanation:
        "The `.form-field` rule gives every label and input in the Login, Register and note forms the same spacing, so all forms line up the same way.",
      fileId: "frontend/src/index.css",
      match: ".form-field {",
    },
  ],
  commonMistakes: [
    "Expecting `width: 100%` plus padding to fit its parent. With the default `content-box` the padding is added on top and the box overflows. Set `box-sizing: border-box` for every element.",
    "Using margin when you mean padding. If you want the background or border to grow around the text, use padding; margin only adds empty space outside.",
    "Being confused when two vertical margins of `20px` only make a `20px` gap. That is margin collapsing: use one margin direction consistently (for example only `margin-bottom`) or use `gap` inside a flex container.",
    "Guessing at sizes instead of inspecting. Right-click the element, choose Inspect and read the box model diagram to see exactly which layer is causing the extra space.",
  ],
  relatedConcepts: ["css-selector", "css-flexbox", "css-responsive"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
