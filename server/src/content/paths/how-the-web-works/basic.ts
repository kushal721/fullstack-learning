import type { LevelPlan } from "@fsl/shared";
import {
  analogy,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
  scene,
  tryIt,
} from "../blocks.js";
import { dnsModule } from "./dns.js";
import { httpModule } from "./http.js";

// Basic: steps 1–13. From two computers talking to the whole journey of a
// page, no experience needed.
export const basic: LevelPlan = {
  outcome:
    "Explain everything that happens between typing an address and seeing the page.",
  steps: [
    lesson(
      "two-computers-talking",
      "Two computers talking",
      3,
      explain(
        "Every time you use a website, two computers are talking. Your device **asks** for something; another computer, far away, **answers**. The one that asks is the [[client]]. The one that answers is the [[server]].",
      ),
      analogy(
        "Like a restaurant: you (the client) order from the menu, the kitchen (the server) cooks and sends the food out.",
      ),
      diagram(
        [
          ["Client", "your browser"],
          ["Server", "a computer far away"],
        ],
        true,
      ),
    ),
    lesson(
      "who-is-who",
      "Who is who",
      3,
      keyPoints(
        "A [[client]] asks: your browser or a phone app.",
        "A [[server]] answers: it is always on and has the data.",
        "One server answers many clients at the same time.",
        "This split is the [[client-server|client–server model]].",
      ),
      quickCheck(
        "Which of these is a server?",
        [
          "Your phone's browser",
          "The computer that stores everyone's notes and sends them out",
          "Your keyboard",
        ],
        1,
        "The server is the always-on computer with the data. Your browser is the [[client]] that asks it.",
      ),
    ),
    lesson(
      "internet-and-web",
      "The internet and the web",
      3,
      explain(
        "The [[internet]] is the roads: cables and Wi-Fi joining billions of computers into one huge [[network]]. The [[web]] is one thing that travels on those roads: the pages and apps you open in a [[browser]].",
      ),
      analogy(
        "The internet is the road system; the web is the delivery vans on it. Email and video calls are other vehicles on the same roads.",
      ),
      quickCheck(
        "Are the internet and the web the same thing?",
        [
          "Yes, two names for one thing",
          "No: the web is one service that runs on the internet",
          "No: the internet runs on the web",
        ],
        1,
        "The internet is the network. The web (pages, links, browsers) is one of the things that use it.",
      ),
    ),
    lesson(
      "urls",
      "Addresses: URLs",
      2,
      explain(
        "Every page on the web has an address, called a [[url]]. It tells the browser *which* computer to talk to and *what* to ask it for.",
      ),
      analogy(
        "Like a postal address: the city gets the letter to the right building, the flat number to the right door.",
      ),
      inTheNotesApp(
        "Every screen in the Notes App has its own URL. `App.jsx` decides which page to show for each one.",
        { fileId: "frontend/src/App.jsx" },
      ),
    ),
    lesson(
      "take-a-url-apart",
      "Take a URL apart",
      4,
      tryIt("url-anatomy"),
      keyPoints(
        "[[protocol|Protocol]] (`https://`): how to talk.",
        "[[domain|Domain]] (`notes.app`): which server to talk to.",
        "[[path|Path]] (`/notes/7`): what you want from it.",
        "[[query|Query]] (`?sort=new`): extra options for the request.",
      ),
      quickCheck(
        "In `https://notes.app/notes/7`, which part says *which page* you want?",
        ["`https`", "`notes.app`", "`/notes/7`"],
        2,
        "The [[path]] (`/notes/7`) names the page on that server. `notes.app` only says which server to ask.",
      ),
    ),
    dnsModule,
    httpModule,
    lesson(
      "https",
      "HTTPS and the padlock",
      3,
      explain(
        "[[https-basics|HTTPS]] is HTTP with [[encryption]]. The messages are scrambled on the way, so nobody in between can read or change them.",
      ),
      keyPoints(
        "The padlock in the address bar means HTTPS.",
        "On café Wi-Fi, others see only noise, not your password.",
        "Every real site uses HTTPS; browsers warn when it doesn't.",
      ),
      quickCheck(
        "You log in on café Wi-Fi over HTTPS. What can someone else on the Wi-Fi read?",
        [
          "Your password",
          "Nothing useful: the messages are encrypted",
          "Everything you type",
        ],
        1,
        "With HTTPS everything between you and the server is encrypted.",
      ),
    ),
    lesson(
      "the-browser",
      "The browser's job",
      2,
      explain(
        "The [[browser]] is the client you use every day. It sends the requests, reads what comes back and draws the page.",
      ),
      keyPoints(
        "Finds the server (DNS).",
        "Asks for the page (HTTP).",
        "Builds what comes back into a page you can use.",
      ),
    ),
    lesson(
      "html-css-javascript",
      "HTML, CSS and JavaScript",
      3,
      analogy(
        "Like a house: [[html]] is the walls and rooms, [[css]] the paint and furniture, [[javascript]] the lights and doorbell.",
      ),
      diagram([
        ["HTML", "structure"],
        ["CSS", "looks"],
        ["JavaScript", "behaviour"],
        ["Page", "what you see"],
      ]),
      quickCheck(
        "Which file decides the colour of a button?",
        ["HTML", "CSS", "JavaScript"],
        1,
        "[[css]] controls how things look. [[html]] says a button exists; [[javascript]] says what it does.",
      ),
    ),
    lesson(
      "one-page-many-files",
      "One page, many files",
      3,
      explain(
        "The HTML names other files it needs: styles, scripts, images, fonts. Each [[resource]] is its own request and response.",
      ),
      inTheNotesApp(
        "In the Notes App, `index.html` is almost empty: it loads one JavaScript file, and React builds the notes list from there.",
        { fileId: "frontend/index.html" },
      ),
      keyPoints(
        "A typical page loads dozens of resources.",
        "They load side by side, so they don't wait for each other.",
        "Each one can fail on its own: text without styles means the CSS didn't load.",
      ),
    ),
    lesson(
      "the-full-journey",
      "The full journey",
      4,
      scene("journey"),
      keyPoints(
        "You type a [[url]]; [[dns]] finds the server's [[ip-address]].",
        "The browser sends an HTTP [[request]].",
        "The server sends a [[response]]: HTML, then CSS and JavaScript.",
        "The browser builds the page: [[how-the-web-works|how the web works]].",
      ),
      quickCheck(
        "What happens first when you open a website?",
        [
          "The server sends the HTML",
          "The browser asks DNS for the server's address",
          "The browser draws the page",
        ],
        1,
        "Before any [[http]] can happen, the browser needs the server's address from [[dns]].",
      ),
    ),
    levelCheck("basic-check", "Basic check", [
      ["web-basic-client", "two-computers-talking"],
      ["web-basic-query", "take-a-url-apart"],
      ["web-basic-dns-down", "dns"],
      ["web-basic-status-ok", "http"],
      ["web-basic-no-styles", "html-css-javascript"],
      ["web-basic-first-step", "the-full-journey"],
    ]),
  ],
};
