import type { Scene } from "@fsl/shared";

export const journeyScene: Scene = {
  id: "journey",
  title: "What happens when you open a website",
  actors: [
    { id: "you", label: "You", sub: "the person" },
    { id: "browser", label: "Browser", sub: "Chrome, Safari…" },
    { id: "dns", label: "DNS", sub: "the internet's phone book" },
    { id: "server", label: "Web server", sub: "a computer far away" },
  ],
  steps: [
    {
      from: "you",
      to: "browser",
      message: "notes.app ⏎",
      caption: "You type an address and press Enter.",
      detail: "The address (URL) names the website you want.",
    },
    {
      from: "browser",
      to: "dns",
      message: "Where is notes.app?",
      caption: "The browser asks DNS where that website lives.",
      detail:
        "Computers find each other by number (an IP address), not by name.",
    },
    {
      from: "dns",
      to: "browser",
      message: "76.76.21.21",
      caption: "DNS answers with the server's address.",
      detail: "Like looking up a name in a phone book and getting the number.",
    },
    {
      from: "browser",
      to: "server",
      message: "GET /",
      caption: "The browser sends a request to that server.",
      detail: "An HTTP request: “please send me the page at /”.",
    },
    {
      from: "server",
      to: "browser",
      message: "200 OK · HTML",
      caption: "The server answers with the page's HTML.",
      detail: "An HTTP response: a status (200 = OK) and the content.",
    },
    {
      from: "browser",
      to: "server",
      message: "GET app.css, app.js",
      caption:
        "The HTML mentions more files, so the browser asks for them too.",
      detail: "Styles (CSS) and behaviour (JavaScript) are separate files.",
    },
    {
      from: "server",
      to: "browser",
      message: "CSS + JavaScript",
      caption: "The server sends those files back.",
      detail: "Each one is its own request and response.",
    },
    {
      from: "browser",
      to: "you",
      message: "page on screen",
      caption: "The browser builds the page and shows it to you.",
      detail: "HTML gives structure, CSS the look, JavaScript the behaviour.",
    },
  ],
};

export const httpScene: Scene = {
  id: "http-exchange",
  title: "Saving a note, then loading the list",
  actors: [
    { id: "browser", label: "Browser", sub: "the Notes App" },
    { id: "server", label: "API server", sub: "Express" },
    { id: "database", label: "Database", sub: "PostgreSQL" },
  ],
  steps: [
    {
      from: "browser",
      to: "server",
      message: "POST /api/notes",
      caption: "You click Save, and the browser sends a request.",
      detail: "Method POST (create), path /api/notes, the note as a JSON body.",
    },
    {
      from: "server",
      to: "database",
      message: "INSERT note",
      caption: "The server checks the note, then stores it.",
      detail: "The browser never talks to the database; only the server does.",
    },
    {
      from: "database",
      to: "server",
      message: "saved: id 8",
      caption: "The database saves it and gives it an id.",
      detail: "This is the server's own business, not part of HTTP.",
    },
    {
      from: "server",
      to: "browser",
      message: "201 Created · JSON",
      caption: "The server answers: status 201 and the saved note.",
      detail: "One request, one response. 201 means something new was made.",
    },
    {
      from: "browser",
      to: "server",
      message: "GET /api/notes",
      caption: "Later, the app asks for the whole list.",
      detail: "GET only reads, so it never changes anything.",
    },
    {
      from: "server",
      to: "browser",
      message: "200 OK · [notes]",
      caption: "The server sends the list back, newest first.",
      detail: "200 means it worked; the body is the notes as JSON.",
    },
  ],
};

export const dnsScene: Scene = {
  id: "dns-lookup",
  title: "Finding the server's address",
  actors: [
    { id: "browser", label: "Browser", sub: "asks" },
    { id: "resolver", label: "DNS resolver", sub: "your provider's" },
    { id: "nameserver", label: "Name server", sub: "knows notes.app" },
  ],
  steps: [
    {
      from: "browser",
      to: "resolver",
      message: "notes.app?",
      caption: "The browser asks a DNS resolver for the address.",
      detail: "Your internet provider (or e.g. 1.1.1.1) runs one.",
    },
    {
      from: "resolver",
      to: "nameserver",
      message: "notes.app?",
      caption: "The resolver asks the name server responsible for notes.app.",
      detail: "Each domain says which name server knows its addresses.",
    },
    {
      from: "nameserver",
      to: "resolver",
      message: "76.76.21.21",
      caption: "The name server answers with the IP address.",
      detail: "This is the record the website's owner set up.",
    },
    {
      from: "resolver",
      to: "browser",
      message: "76.76.21.21",
      caption: "The resolver passes it on and remembers it for a while.",
      detail: "Next time it can answer at once (caching).",
    },
  ],
};
