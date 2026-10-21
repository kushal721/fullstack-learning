import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "CSS" topic.
export const cssGlossary: GlossaryEntry[] = [
  {
    id: "css-selector",
    topicId: "css",
    term: "CSS selector",
    aliases: ["selector", "class selector", "pseudo-class"],
    kind: "concept",
    short:
      "The part of a CSS rule that picks which elements to style, such as every button or every `.note-card`.",
    body: "`p` matches every paragraph, `.button` every element with that class, `#title` the one element with that id. Combine them: `.note-card h3` matches headings inside a note card, and `:hover` matches while the mouse is over an [[html-element|element]].",
    conceptPageId: "css-selector",
  },
  {
    id: "css-box-model",
    topicId: "css",
    term: "CSS box model",
    aliases: ["box model", "padding", "margin", "border"],
    kind: "concept",
    short:
      "Every element is drawn as a box of four layers: content, padding, border and margin.",
    body: "From the inside out: the content, padding (space inside the box), the border, and margin (space that pushes other boxes away). Each layer has its own property, set for all sides at once or one side at a time. Layout tools like [[css-flexbox|flexbox]] arrange these boxes.",
    analogy:
      "A framed picture: the picture, the mount around it, the frame, and the gap to the next frame on the wall.",
    conceptPageId: "css-box-model",
  },
  {
    id: "css-flexbox",
    topicId: "css",
    term: "Flexbox",
    aliases: ["flex", "display: flex", "css flexbox"],
    kind: "concept",
    short:
      "A CSS layout mode that lines elements up in a row or a column and controls their spacing and alignment.",
    body: "`display: flex` on a parent makes its children line up in a row. `flex-direction` switches to a column, `justify-content` and `align-items` align them, `gap` spaces them and `flex: 1` lets one grow. It is the everyday tool for [[css-responsive|responsive]] layouts.",
    conceptPageId: "css-flexbox",
  },
  {
    id: "css-responsive",
    topicId: "css",
    term: "Responsive design",
    aliases: ["responsive", "media query", "media queries", "mobile layout"],
    kind: "concept",
    short:
      "One page whose layout adapts to every screen size, from a small phone to a wide monitor.",
    body: "It rests on four tools: the viewport meta tag in the [[html-document|document]], relative units like `rem` and `%`, limits like `max-width`, and media queries: CSS that applies only when the screen is, say, at least 768 pixels wide.",
    conceptPageId: "css-responsive",
  },
];
