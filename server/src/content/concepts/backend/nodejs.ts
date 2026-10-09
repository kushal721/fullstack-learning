import type { Concept } from "@fsl/shared";

export const nodejs: Concept = {
  id: "nodejs",
  slug: "nodejs",
  title: "Node.js",
  topicId: "backend",
  summary:
    "A program that runs JavaScript outside the browser, so you can use the same language to write servers, scripts and tools.",
  basics: [
    "JavaScript was created to run inside web browsers. Every browser contains an engine — a program that reads JavaScript and executes it. Chrome's engine is called V8.",
    "In the browser, JavaScript can change the page through the DOM (the browser's model of the page, reached through `document`) and the browser window through `window`. For safety it cannot read your files or open arbitrary network ports.",
    "A backend is the program running on a server that answers HTTP requests from the frontend, checks them and talks to the database. It has to run on its own, with no browser around it.",
  ],
  what: [
    "Node.js is the V8 engine taken out of the browser and packaged as a program you run from the terminal. `node server.js` reads the file and runs the JavaScript in it.",
    "Node.js has no page, so there is no `document` and no `window`. Instead it gives JavaScript what a server needs: reading and writing files (`node:fs`), opening network connections (`node:http`), and access to settings like `process.env`.",
  ],
  why: [
    "Without Node.js, the frontend would be JavaScript and the backend would be another language such as Python or Java. With it, you learn one language and use it on both sides — the same syntax, the same `async`/`await`, the same JSON.",
    "A server spends most of its time waiting: for the database, for files, for the network. Node.js is built so that one process can keep answering other requests during that waiting, which makes it a good fit for web APIs.",
  ],
  howItWorks: [
    "You run a file with `node file.js`. Node.js executes the top-level code once, from top to bottom. If that code started something that keeps listening, like a server, the process stays alive; otherwise it exits.",
    "Slow work such as a database query or reading a file is handed off to the operating system. Your code gets a promise (or a callback) and carries on instead of waiting.",
    "The event loop is Node's to-do list. When a piece of slow work finishes, its result is placed in a queue, and the event loop runs the code waiting for it as soon as JavaScript is free. This is how one process can serve many requests at once while each one waits on I/O (input/output: disk, network, database).",
  ],
  basicExample: {
    language: "js",
    fileName: "hello.js",
    code: `import { readFile } from "node:fs/promises";

console.log("Node version:", process.version);

const text = await readFile("hello.js", "utf8");
console.log("This file has", text.split("\\n").length, "lines");`,
    caption:
      'Run with `node hello.js` (with `"type": "module"` in package.json): it prints the Node version and reads its own file from disk — something browser JavaScript cannot do.',
  },
  internals: [
    "V8 compiles your JavaScript to machine code while it runs. Node.js adds a library called libuv around it, which talks to the operating system for files, network and timers, and runs the event loop.",
    "Your JavaScript runs on a single thread: only one piece of your code runs at any moment. That is why heavy calculation (for example a loop over millions of items) blocks every other request — nothing else can run until it finishes.",
    "`await` does not block that thread. It pauses only the current function and lets the event loop run other code until the awaited promise settles, then continues the function where it stopped.",
  ],
  howToCreate: [
    {
      text: "Install Node.js 22 (LTS) from nodejs.org, then check it in a terminal.",
      code: {
        language: "bash",
        code: `node --version
npm --version`,
      },
    },
    {
      text: "Create a folder for a tiny server and tell Node.js to use `import` syntax.",
      code: {
        language: "bash",
        code: `mkdir node-demo && cd node-demo
npm init -y
npm pkg set type=module`,
      },
    },
    {
      text: "Create `server.js` using Node's built-in `http` module. The `setTimeout` pretends to be a slow database query.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import http from "node:http";

const server = http.createServer((req, res) => {
  console.log("Request started:", req.url);
  setTimeout(() => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from Node.js" }));
    console.log("Request finished:", req.url);
  }, 2000);
});

server.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Run `node server.js`, then in a second terminal send two requests at the same time.",
      code: {
        language: "bash",
        code: `curl http://localhost:3000/a & curl http://localhost:3000/b & wait`,
      },
    },
    {
      text: "Both answers arrive after about 2 seconds, not 4, and the server log shows both requests starting before either finishes: one process served both while they waited. Stop the server with Ctrl+C.",
    },
  ],
  whereUsed: [
    "Web servers and APIs, usually with a framework like Express on top of the built-in `http` module.",
    "Developer tools: Vite, Prettier, TypeScript and npm itself are all Node.js programs.",
    "Small scripts that automate tasks, such as creating database tables or importing data.",
  ],
  connectsTo: [
    "npm, which installs the packages a Node.js project uses.",
    "Express, which makes writing HTTP servers on Node.js much simpler.",
    "`process.env`, through which Node.js reads environment variables like the port and database URL.",
    "`async`/`await` and promises, which is how Node.js code waits for slow work without blocking.",
  ],
  projectUsage: [
    {
      explanation:
        'The Notes App backend in `backend/` is a Node.js 22 program. Its `package.json` sets `"type": "module"` so every file uses `import` and `export`, just like the frontend.',
    },
    {
      explanation:
        "Its `npm` scripts start it with `node --env-file=.env src/server.js`. `server.js` creates the Express app and calls `app.listen(process.env.PORT ?? 3000)`, which keeps the process running and waiting for requests.",
    },
    {
      explanation:
        "Every controller `await`s the database through the `pg` pool in `db.js`. While one user's query is running, the event loop keeps serving other users' requests.",
    },
  ],
  commonMistakes: [
    "Using `document` or `window` in backend code and getting `ReferenceError: document is not defined`. Those exist only in the browser; the backend works with requests, files and the database.",
    'Getting `Cannot use import statement outside a module`. Add `"type": "module"` to `package.json` (or use `require`, but do not mix the two styles).',
    "Using a slow synchronous function like `readFileSync` or a huge loop inside a request handler, which freezes every other request. Use the promise-based versions with `await`.",
    "Editing the code and wondering why nothing changed. Node.js reads the file once at start-up, so restart it — or run it with `node --watch` to restart automatically.",
  ],
  relatedConcepts: [
    "npm-packages",
    "express",
    "js-async-await",
    "js-module-import-export",
    "environment-variables",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
