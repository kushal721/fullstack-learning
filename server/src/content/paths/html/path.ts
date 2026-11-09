import type { TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";
import { pageScene } from "./scenes.js";

// HTML: 7 Basic, 9 Intermediate and 6 Advanced steps, numbered 1–22.
export const htmlPath: TopicPath = {
  topicId: "html",
  summary: {
    what: "HTML is the language web pages are written in: it says what each piece of content is, like a heading, a link or a button.",
    does: "It gives a page its structure, so browsers can show it, screen readers can read it aloud and search engines can understand it.",
    how: "Tags mark where elements start and end; the browser reads the file and builds a tree of elements that it draws on screen.",
  },
  overviewSceneId: "page",
  scenes: [pageScene],
  levels: { basic, intermediate, advanced },
};
