import type { Concept } from "@fsl/shared";

export const vite: Concept = {
  id: "vite",
  slug: "vite",
  title: "Vite",
  topicId: "react",
  summary:
    "The build tool that runs a React project during development and turns it into small, fast files the browser can load in production.",
  basics: [
    "A browser understands only three kinds of files: HTML for structure, CSS for style and JavaScript for behaviour. Whatever you write, the browser must eventually receive those.",
    "React components are written in JSX, the HTML-like syntax inside JavaScript such as `return <h1>Hello</h1>`. JSX is not valid JavaScript, so a browser that loads a `.jsx` file directly stops with a syntax error. Something has to translate it into plain JavaScript calls first.",
    "A server is a program that answers requests from the browser by sending back files or data. A development server, or dev server, is a small server that runs on your own computer while you work and serves your project at an address such as http://localhost:5173.",
    "A build tool is a program that prepares your source files for the browser: it translates JSX, follows the `import` lines between files, and in the end produces optimized files ready to put online. Vite is the build tool used by most new React projects.",
  ],
  what: [
    "Vite (French for fast, pronounced veet) is two tools in one. During development it is a dev server that translates each file the moment the browser asks for it and updates the page instantly when you save.",
    "For production, `npm run build` turns the whole project into a few small, optimized HTML, CSS and JavaScript files in a `dist/` folder, which any web server can host.",
  ],
  why: [
    "Without a tool like Vite you would have to translate JSX by hand or set up several separate programs and configuration files. Vite does it with one command and almost no configuration, so you can start writing components right away.",
    "Feedback speed matters while learning and working. Vite starts in about a second and shows a change in the browser almost as soon as you save the file, without reloading the page or losing what you typed into a form.",
  ],
  howItWorks: [
    "`index.html` in the project root is the entry point. It contains a `div` with the id `root` and a `script` tag pointing at `src/main.jsx`. Vite serves this page first.",
    "When the browser requests `src/main.jsx`, Vite translates the JSX into plain JavaScript and sends it. The browser reads its `import` lines and requests those files too, and Vite translates each one on demand.",
    "When you save a file, Vite notices, re-translates only that file, and tells the open page through a live connection. The page swaps in the new code without a full reload. This is called hot module replacement, or HMR.",
    "`npm run build` does everything up front instead: it follows every import from `index.html`, translates and combines the code into a few files, removes unused code and spaces, adds content hashes to the file names, and writes the result to `dist/`.",
  ],
  basicExample: {
    language: "html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Notes</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    caption:
      "`index.html` is where Vite starts: the script tag loads `src/main.jsx`, and React draws the app inside the root div.",
    highlightLines: [8, 9],
  },
  internals: [
    'In development Vite does not bundle your code. It relies on the browser\'s built-in support for JavaScript modules (`type="module"`): each `import` becomes a separate request, and Vite only translates the files actually requested. That is why startup stays fast even in large projects.',
    "Packages from `node_modules`, such as React itself, are pre-bundled once with a very fast tool called esbuild and cached, so the browser does not have to fetch hundreds of tiny files.",
    "For the production build Vite uses a bundler to combine the modules into a few files, because many small requests are slow over a real network. The hash in names like `index-3f9a1c.js` changes whenever the content changes, so browsers can cache files forever and still get updates.",
    "The dev server can also act as a proxy: when the page requests a path like `/api/notes`, Vite forwards the request to another server, such as the Express backend on port 3000, and passes the answer back. To the browser it looks like one site, so it does not block the request as coming from a different origin.",
  ],
  howToCreate: [
    {
      text: "In a terminal, create a new React project with Vite.",
      code: {
        language: "bash",
        code: `npm create vite@latest my-notes -- --template react
cd my-notes
npm install`,
      },
    },
    {
      text: "Start the dev server and open the address it prints, usually http://localhost:5173.",
      code: {
        language: "bash",
        code: `npm run dev`,
      },
    },
    {
      text: "Edit the heading text in `src/App.jsx` and save. The browser updates within a moment without reloading the page. Click the counter button a few times first and you will see its count survive the edit, thanks to hot module replacement.",
    },
    {
      text: "To prepare for a backend later, open `vite.config.js` and add a proxy so every request starting with `/api` goes to a server on port 3000. Restart `npm run dev` after changing this file.",
      code: {
        language: "js",
        fileName: "vite.config.js",
        code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});`,
        highlightLines: [6, 7, 8, 9, 10],
      },
    },
    {
      text: "Stop the dev server with Ctrl+C and run the production build. Look inside the new `dist/` folder: one `index.html` and a few hashed files in `dist/assets/`. Run `npm run preview` to serve them at http://localhost:4173 and check the built app works.",
      code: {
        language: "bash",
        code: `npm run build
npm run preview`,
      },
    },
  ],
  whereUsed: [
    "Most new React projects, and many Vue, Svelte and plain JavaScript projects, use Vite as their dev server and build tool.",
    "Every day while developing: `npm run dev` runs the whole time you work on the frontend.",
    "Before deploying: `npm run build` creates the `dist/` folder that is uploaded to a host or served by the backend.",
  ],
  connectsTo: [
    "JSX, which Vite translates into plain JavaScript the browser can run.",
    "JavaScript modules and `import` and `export`, which Vite follows to find every file in the app.",
    "npm, which installs Vite and runs its commands through the scripts in `package.json`.",
    "The backend API, reached during development through the `/api` proxy in `vite.config.js`.",
  ],
  projectUsage: [
    {
      explanation:
        'The Notes App frontend lives in `frontend/` and is a Vite project. `frontend/index.html` contains the root div, and `src/main.jsx` calls `createRoot(document.getElementById("root")).render(...)` with `<App />` inside `<StrictMode>` to start React there.',
      fileId: "frontend/index.html",
      match: '<div id="root"></div>',
    },
    {
      explanation:
        '`frontend/vite.config.js` proxies `/api` to the Express API on http://localhost:3000. That is why `notesApi.js` can simply call `request("/api/notes")` (which uses `fetch`) while the page itself is served by Vite at http://localhost:5173.',
      fileId: "frontend/vite.config.js",
      match: '"/api": "http://localhost:3000",',
    },
    {
      explanation:
        "During development you run `npm run dev` in `frontend/`; for production `npm run build` writes the finished app to `frontend/dist/`.",
      fileId: "frontend/package.json",
      match: '"dev": "vite",',
    },
  ],
  commonMistakes: [
    "Opening `index.html` directly from the file system by double-clicking it. The browser cannot run JSX, so the page stays blank. Always use the address that `npm run dev` prints.",
    "Changing `vite.config.js` and expecting the running server to pick it up. Config changes need a restart: stop with Ctrl+C and run `npm run dev` again.",
    "Calling the backend with its full address, like `http://localhost:3000/api/notes`, from the frontend during development, which the browser blocks as a cross-origin request unless the server allows it. Use the relative path `/api/notes` and let the proxy forward it.",
    "Uploading the `src/` folder instead of `dist/` when deploying. Hosts must serve the built files; run `npm run build` and deploy what is in `dist/`.",
  ],
  relatedConcepts: ["jsx", "js-module-import-export", "react-why", "js-fetch"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
