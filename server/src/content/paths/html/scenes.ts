import type { Scene } from "@fsl/shared";

export const pageScene: Scene = {
  id: "page",
  title: "Text becomes a page",
  actors: [
    { id: "file", label: "HTML file", sub: "text with tags" },
    { id: "browser", label: "Browser", sub: "reads it" },
    { id: "dom", label: "Element tree", sub: "the DOM" },
    { id: "screen", label: "Screen", sub: "what you see" },
  ],
  steps: [
    {
      from: "file",
      to: "browser",
      message: "<h1>My notes</h1>",
      caption: "The browser receives the HTML file as plain text.",
      detail: "It reads it from top to bottom.",
    },
    {
      from: "browser",
      to: "dom",
      message: "h1 element",
      caption: "Each tag pair becomes an element in a tree.",
      detail: "Elements inside elements become children.",
    },
    {
      from: "browser",
      to: "file",
      message: "need style.css",
      caption: "A <link> or <script> in the HTML asks for more files.",
      detail: "Styles and scripts arrive as their own requests.",
    },
    {
      from: "dom",
      to: "screen",
      message: "draw",
      caption: "The browser draws the tree on screen.",
      detail: "CSS decides how each element looks.",
    },
  ],
};
