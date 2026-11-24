import type { LevelPlan } from "@fsl/shared";
import {
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";
import { apisAndJsonModule } from "./apis-and-json.js";
import { cookiesAndCachingModule } from "./cookies-and-caching.js";
import { hostingAndCdnsModule } from "./hosting-and-cdns.js";
import { portsAndTcpModule } from "./ports-and-tcp.js";

// Intermediate: steps 8–14. How it really works, enough to build the Notes
// App: connections, headers, cookies, caching, APIs and where code runs.
export const intermediate: LevelPlan = {
  outcome:
    "Read real requests and responses, and know how cookies, caching and APIs fit in.",
  steps: [
    portsAndTcpModule,
    cookiesAndCachingModule,
    apisAndJsonModule,
    hostingAndCdnsModule,
    lesson(
      "rendering",
      "How the page is drawn",
      3,
      explain(
        "[[rendering]] is how the browser turns text into pixels. It reads the HTML into the [[dom]], applies the CSS, works out where everything goes and paints it.",
      ),
      diagram([
        ["HTML", "read"],
        ["DOM", "a tree"],
        ["+ CSS", "styles"],
        ["Layout", "sizes, places"],
        ["Paint", "pixels"],
      ]),
      explain(
        "When JavaScript changes the DOM, the browser redoes the later steps for the parts that changed.",
      ),
    ),
    lesson(
      "devtools",
      "Look inside: DevTools",
      3,
      explain(
        "Every browser has [[devtools]]. The Network tab shows each request the page made, with its status, headers and time.",
      ),
      keyPoints(
        "Open it with F12, or ⌥⌘I on a Mac.",
        "Reload the page and watch the list fill up.",
        "Click a request to see its headers and response.",
      ),
      inTheNotesApp(
        "Open the Notes App with the Network tab open and create a note: you'll see its POST request and the 201 answer.",
        { flowId: "create-note" },
      ),
      quickCheck(
        "Where do you see every request a page made?",
        [
          "In DevTools' Network tab",
          "In the page's HTML",
          "In the address bar",
        ],
        0,
        "The Network tab in [[devtools]] lists each [[request]] with its status and timing.",
      ),
    ),
    levelCheck("intermediate-check", "Intermediate check", [
      ["web-intermediate-port", "ports-and-tcp"],
      ["web-intermediate-stateless", "cookies-and-caching"],
      ["web-intermediate-no-store", "cookies-and-caching"],
      ["web-intermediate-api", "apis-and-json"],
    ]),
  ],
};
