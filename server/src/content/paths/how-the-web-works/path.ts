import type { TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";
import { dnsScene, httpScene, journeyScene } from "./scenes.js";

// How the Web Works: 7 Basic, 7 Intermediate and 10 Advanced steps,
// numbered 1–24 straight through.
export const howTheWebWorksPath: TopicPath = {
  topicId: "how-the-web-works",
  summary: {
    what: "The web is billions of computers sending each other messages. Your browser asks for pages; servers send them back.",
    does: "It lets anyone open a page or app from anywhere, by name, without knowing where its computer actually is.",
    how: "Your browser finds the server (DNS), asks it for the page (HTTP request), and builds what comes back (HTML, CSS, JS).",
  },
  overviewSceneId: "journey",
  scenes: [journeyScene, dnsScene, httpScene],
  levels: { basic, intermediate, advanced },
};
