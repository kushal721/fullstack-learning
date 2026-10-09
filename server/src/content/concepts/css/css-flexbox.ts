import type { Concept } from "@fsl/shared";

export const cssFlexbox: Concept = {
  id: "css-flexbox",
  slug: "css-flexbox",
  title: "CSS flexbox",
  topicId: "css",
  summary:
    "A CSS layout mode that lines up elements in a row or a column and controls how they are spaced and aligned.",
  basics: [
    "In CSS every element is a box. Without any layout rules, block elements such as `<div>` stack on top of each other, each taking the full width of the page. That is fine for paragraphs, but not for a navigation bar where items should sit side by side.",
    "An element that contains other elements is called their parent, and the elements inside it are its children. Many layout tools work by setting a rule on the parent that controls how its children are placed.",
    "Flexbox, short for flexible box layout, is one of those tools. It is built into every modern browser, so you only need CSS to use it.",
  ],
  what: [
    "Writing `display: flex` on a parent turns it into a flex container, and its direct children become flex items. The items are then laid out in a single line, a row by default.",
    "A handful of properties on the container decide the rest: `flex-direction` picks row or column, `justify-content` and `align-items` control alignment, `gap` sets the space between items and `flex-wrap` lets items move onto a new line. On an item, `flex: 1` lets it grow to fill free space.",
  ],
  why: [
    "Before flexbox, putting things side by side and centring them needed tricks with floats and margins that broke easily. Flexbox makes common layouts, such as a navigation bar, a row of buttons or a perfectly centred box, take two or three lines of CSS.",
    "Flex items adapt to the space they have. If the screen is narrower, they can shrink or wrap instead of overflowing, which is exactly what you need for pages that work on phones and desktops.",
  ],
  howItWorks: [
    "A flex container has two directions. The main axis is the direction the items flow in: left to right for `flex-direction: row`, top to bottom for `flex-direction: column`. The cross axis is the other direction, at a right angle to it.",
    "`justify-content` places items along the main axis. For example `flex-start` packs them at the start, `center` centres them and `space-between` puts the first at the start, the last at the end and spreads the rest evenly.",
    "`align-items` places items along the cross axis. In a row, `center` lines them up vertically in the middle, which is the classic way to align an icon with text. The default, `stretch`, makes them all as tall as the tallest one.",
    "`gap: 16px` adds 16 pixels between items without adding space at the outer edges. `flex-wrap: wrap` allows items that do not fit to continue on a new line instead of squeezing or overflowing.",
  ],
  basicExample: {
    language: "css",
    code: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
}`,
    caption:
      "The app name is pushed to the left, the links to the right, and everything is vertically centred.",
    highlightLines: [2, 3, 4],
  },
  internals: [
    "When the browser lays out a flex container, it first measures each item's natural size along the main axis. Then it compares the total with the space available.",
    "If there is free space left, items with a `flex-grow` value above zero share it. `flex: 1` is a shorthand that sets `flex-grow: 1`, `flex-shrink: 1` and `flex-basis: 0%`, so all items with `flex: 1` end up the same size.",
    "If there is not enough space, items shrink according to `flex-shrink` (1 by default), but never below the size of their longest word or image unless you set `min-width: 0`. If they still do not fit and wrapping is off, they overflow the container.",
    "Flexbox works in one direction at a time. When you need rows and columns that line up with each other, like a table of cards, CSS grid (`display: grid`) is the better tool because it controls both directions together.",
  ],
  howToCreate: [
    {
      text: "Create a file called `index.html` with a navigation bar that contains a name and two links.",
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
    <nav class="navbar">
      <strong>Notes</strong>
      <div class="links">
        <a href="#">Dashboard</a>
        <a href="#">Log out</a>
      </div>
    </nav>
  </body>
</html>`,
      },
    },
    {
      text: "Create `styles.css` next to it and make both the navigation bar and the links group flex containers.",
      code: {
        language: "css",
        fileName: "styles.css",
        code: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #eef;
}

.links {
  display: flex;
  gap: 16px;
}`,
      },
    },
    {
      text: "Open `index.html` in your browser. The name sits on the left, the links on the right, with 16 pixels between the two links.",
    },
    {
      text: "Open DevTools (F12 or Cmd+Opt+I) and inspect the `nav` element. Click the small flex badge next to it in the Elements panel to see the items outlined. Then change `flex-direction` to `column` in the Styles panel and watch the items stack and the meaning of `justify-content` switch to the vertical direction.",
    },
  ],
  whereUsed: [
    "Navigation bars, toolbars and rows of buttons, where items sit side by side and line up in the middle.",
    "Forms, where `flex-direction: column` with `gap` stacks each label above its input with even spacing.",
    "Centring something inside a box, both horizontally and vertically, with `justify-content: center` and `align-items: center`.",
  ],
  connectsTo: [
    "The box model: flex items are boxes, and their padding, border and margin are part of the size flexbox works with.",
    "CSS selectors, which pick the container and items you apply flex properties to.",
    "Responsive design, where `flex-wrap` and media queries let a row turn into a column on small screens.",
  ],
  projectUsage: [
    {
      explanation:
        "The `.navbar` rule in `frontend/src/index.css` uses `display: flex` with `justify-content: space-between` so the `Navbar` component shows the app name on one side and its links on the other, all in one row.",
    },
    {
      explanation:
        "The `.form-field` rule uses `flex-direction: column` and `gap` so every label in `NoteForm`, `Login` and `Register` sits directly above its input with the same spacing.",
    },
    {
      explanation:
        "Because flexbox handles the spacing with `gap`, the components themselves (`Navbar.jsx`, `NoteForm.jsx`) only need class names; all the layout lives in `index.css`.",
    },
  ],
  commonMistakes: [
    "Putting `display: flex` on the items instead of their parent. Flexbox is switched on by the container; set it on the element that holds the things you want to arrange.",
    "Mixing up `justify-content` and `align-items`. Remember `justify-content` follows the main axis and `align-items` the cross axis; with `flex-direction: column` the two swap from horizontal to vertical.",
    "Adding margins to every item to space them out, then fighting the extra space at the ends. Use `gap` on the container instead.",
    "Letting items overflow on small screens because they cannot wrap. Add `flex-wrap: wrap`, or switch to a column with a media query.",
  ],
  relatedConcepts: ["css-box-model", "css-selector", "css-responsive"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
