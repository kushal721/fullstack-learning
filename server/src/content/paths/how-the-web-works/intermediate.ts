import type { LevelPlan } from "@fsl/shared";
import {
  analogy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";

// Intermediate: steps 8–19. How it really works, enough to build the Notes
// App: connections, headers, cookies, caching, APIs and where code runs.
export const intermediate: LevelPlan = {
  outcome:
    "Read real requests and responses, and know how cookies, caching and APIs fit in.",
  steps: [
    lesson(
      "ports",
      "Ports: which program?",
      3,
      explain(
        "One server runs many programs. A [[port]] number says which one should get the message, like a flat number in a building.",
      ),
      keyPoints(
        "HTTPS uses port 443; plain HTTP uses 80.",
        "Browsers add those for you, so you rarely see them.",
        "In development the Notes App API listens on port 3000.",
      ),
      quickCheck(
        "Why can one computer run a website and an email server at the same time?",
        [
          "They listen on different ports",
          "They take turns every second",
          "They can't",
        ],
        0,
        "Each program listens on its own [[port]], so messages reach the right one.",
      ),
    ),
    lesson(
      "tcp",
      "TCP: a reliable connection",
      3,
      explain(
        "Before any HTTP is sent, the browser and server open a [[tcp]] connection. TCP cuts data into [[packet|packets]], numbers them and resends any that get lost.",
      ),
      diagram([
        ["Connect", "a quick hello"],
        ["Send", "numbered packets"],
        ["Check", "resend lost ones"],
        ["Deliver", "in order"],
      ]),
      analogy(
        "Like posting a book one numbered page at a time: if page 12 goes missing, you ask for page 12 again.",
      ),
    ),
    lesson(
      "headers-up-close",
      "Headers up close",
      4,
      code(
        "http",
        "a response's headers",
        [
          "HTTP/1.1 200 OK",
          "Content-Type: application/json",
          "Cache-Control: no-store",
          "Set-Cookie: session=abc123; HttpOnly; Secure",
          "Content-Length: 58",
        ],
        {
          2: "what kind of data",
          3: "may it be kept?",
          4: "please remember this",
          5: "how big the body is",
        },
      ),
      explain(
        "[[content-type]] tells the browser what the body is. The others control caching and cookies: the next two steps.",
      ),
      quickCheck(
        "Which header tells the browser the body is JSON?",
        ["`Content-Type`", "`Cache-Control`", "`Set-Cookie`"],
        0,
        "[[content-type]] names the kind of data: `application/json` here.",
      ),
    ),
    lesson(
      "cookies",
      "HTTP forgets: cookies",
      4,
      explain(
        "HTTP is [[stateless]]: each request stands alone and the server doesn't remember the last one. So how do you stay logged in?",
      ),
      explain(
        "When you log in, the server sends a [[cookie]]. The browser sends it back with every later request, and the server uses it to find your [[session]].",
      ),
      diagram([
        ["Log in", "POST /login"],
        ["Set-Cookie", "server → browser"],
        ["Cookie", "sent every time"],
        ["You're known", "the session"],
      ]),
    ),
    lesson(
      "caching",
      "Caching: don't ask twice",
      3,
      explain(
        "A cache keeps a copy of a response so it doesn't have to be fetched again. The [[cache-control]] header says how long a copy may be kept.",
      ),
      keyPoints(
        "`max-age=31536000`: keep it a year (files named after their content).",
        "`no-cache`: keep it, but check with the server first.",
        "`no-store`: never keep it (private data like your notes).",
      ),
      quickCheck(
        "Why should your notes be sent with `no-store`?",
        [
          "They're private and change often",
          "They're too big",
          "Browsers can't cache JSON",
        ],
        0,
        "Private, changing data should never sit in a shared or stale cache.",
      ),
    ),
    lesson(
      "redirects",
      "Redirects",
      2,
      explain(
        "A [[redirect]] is a response that says “what you want is over there”. The browser follows it on its own.",
      ),
      code(
        "http",
        "a redirect",
        [
          "GET /old-page HTTP/1.1",
          "",
          "HTTP/1.1 301 Moved Permanently",
          "Location: https://notes.app/new-page",
        ],
        { 3: "3xx: look elsewhere", 4: "where to go" },
      ),
      keyPoints(
        "`http://` → `https://` is usually a redirect.",
        "301 means permanent; 302 and 307 mean temporary.",
        "You only see the new address in the address bar.",
      ),
    ),
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
      ["web-intermediate-port", "ports"],
      ["web-intermediate-stateless", "cookies"],
      ["web-intermediate-no-store", "caching"],
      ["web-intermediate-api", "apis-and-json"],
    ]),
  ],
};
