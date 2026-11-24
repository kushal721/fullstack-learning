import type { LevelPlan } from "@fsl/shared";
import {
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";
import { cookiesAndCachingModule } from "./cookies-and-caching.js";
import { portsAndTcpModule } from "./ports-and-tcp.js";

// Intermediate: steps 8–15. How it really works, enough to build the Notes
// App: connections, headers, cookies, caching, APIs and where code runs.
export const intermediate: LevelPlan = {
  outcome:
    "Read real requests and responses, and know how cookies, caching and APIs fit in.",
  steps: [
    portsAndTcpModule,
    cookiesAndCachingModule,
    lesson(
      "apis-and-json",
      "APIs and JSON",
      4,
      explain(
        "Pages are for people. An [[api]] is for programs: URLs that return data instead of a page, usually as [[json-data|JSON]].",
      ),
      code(
        "http",
        "the Notes App API",
        [
          "GET /api/notes HTTP/1.1",
          "",
          "HTTP/1.1 200 OK",
          "Content-Type: application/json",
          "",
          '[{"id":7,"title":"Shopping","done":false}]',
        ],
        { 1: "a program asks", 6: "data, not a page" },
      ),
      inTheNotesApp(
        "The React client asks the API for your notes, gets JSON and draws the list itself.",
        { flowId: "list-notes" },
      ),
      quickCheck(
        "What does an API usually send back?",
        [
          "Data for a program to use, often JSON",
          "A finished page with styling",
          "An IP address",
        ],
        0,
        "An [[api]] returns data; the client decides how to show it.",
      ),
    ),
    lesson(
      "hosting",
      "Where servers live: hosting",
      3,
      explain(
        "Your server has to run somewhere that's always on and connected: that's [[web-hosting|hosting]]. Most apps rent machines in the [[cloud]] instead of owning them.",
      ),
      keyPoints(
        "You pay for what you use, by the hour or month.",
        "Your domain's DNS points at the host's IP address.",
        "The Notes App ships as a Docker image to a cloud host.",
      ),
    ),
    lesson(
      "cdns",
      "CDNs: closer to you",
      3,
      explain(
        "A [[cdn]] keeps copies of your files on servers all over the world. A visitor gets them from the nearest one, which cuts the waiting time.",
      ),
      diagram([
        ["Visitor in Tokyo", "asks for app.js"],
        ["CDN in Tokyo", "has a copy"],
        ["Your server", "asked only once"],
      ]),
      quickCheck(
        "What does a CDN mainly save?",
        [
          "Waiting time, by serving files from nearby",
          "Disk space on the visitor's phone",
          "The need for HTTPS",
        ],
        0,
        "Being close cuts the distance every [[request]] travels.",
      ),
    ),
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
