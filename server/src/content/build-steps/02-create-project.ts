import type { BuildStep } from "@fsl/shared";

export const createProjectStep: BuildStep = {
  id: "create-project",
  slug: "create-project",
  order: 2,
  title: "Create the project",
  goal: "Create the frontend project with Vite and see it running in the browser.",
  why: "Every app needs a project: a folder with its settings, its packages and a command to run it. Browsers can't run JSX directly, so we also need a tool that turns it into plain JavaScript. Vite does both and gives a working React project in seconds.",
  problemSolved:
    "Setting up a React project by hand means configuring a build tool, a development server and JSX compilation yourself before you can see a single line on screen.",
  prerequisites: ["understand-the-application"],
  explanation: [
    "**Vite** is a build tool. During development it runs a small web server on your computer, turns your JSX into JavaScript the browser understands, and reloads the page the moment you save a file. For production it bundles everything into a few small files (step 14).",
    "**npm** is the package manager that comes with Node.js. `npm create vite@latest` downloads Vite's project generator and runs it; `npm install` downloads the packages listed in `package.json` (React, Vite…) into a `node_modules` folder and records the exact versions in `package-lock.json`.",
    "The generator creates a demo app with logos and a counter. We remove the demo so only the files the Notes App needs are left: `index.html` (the one HTML page), `src/main.jsx` (starts React), `src/App.jsx` (the top component), `src/index.css` (all styles), `vite.config.js` and `package.json`.",
    'How the page appears: the browser loads `index.html`, which contains an empty `<div id="root">` and a `<script>` for `src/main.jsx`. `main.jsx` tells React to render the `App` component inside that div. Everything you will see in the Notes App is drawn by React inside `#root`.',
  ],
  howToCreate: [
    {
      text: "Inside the `notes-app` folder, create the frontend with Vite's React template. The `--` passes `--template react` to Vite instead of to npm.",
      code: {
        language: "bash",
        code: "npm create vite@latest frontend -- --template react",
        caption:
          "If npm asks to install `create-vite`, answer `y`. If Vite asks questions, choose React and JavaScript.",
      },
    },
    {
      text: "Go into the new folder, install the packages and start the development server.",
      code: {
        language: "bash",
        code: "cd frontend\nnpm install\nnpm run dev",
      },
    },
    {
      text: "Open the address it prints, usually http://localhost:5173. You should see the Vite + React demo page. Leave `npm run dev` running in this terminal and open a second terminal (in `notes-app/frontend`) for the next commands.",
    },
    {
      text: "Remove the demo files the Notes App doesn't use: the demo styles, the images and the template's README and lint setup.",
      code: {
        language: "bash",
        code: "rm -r src/App.css src/assets public README.md .oxlintrc.json\nnpm uninstall oxlint @types/react @types/react-dom",
        caption:
          "On Windows PowerShell use `Remove-Item -Recurse` instead of `rm -r`. The `@types` packages are only for TypeScript; this project uses plain JavaScript. Keep `.gitignore`: it stops `node_modules` from being saved in git.",
      },
    },
    {
      text: 'Open `package.json`. Rename the project, set a version and delete the `"lint"` line from `scripts` (we just removed the linter). The dependency versions are filled in by npm; yours may be newer.',
      code: {
        language: "json",
        code: '{\n  "name": "notes-app-frontend",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^19.2.8",\n    "react-dom": "^19.2.8"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^6.1.1",\n    "vite": "^8.3.0"\n  }\n}',
        fileName: "frontend/package.json",
        caption: "Step 13 adds a `test` script and the testing packages.",
      },
    },
    {
      text: "Replace `index.html` with this version: the title is now *Notes* and the icon link is gone because we deleted `public/`.",
      code: {
        language: "html",
        code: '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Notes</title>\n  </head>\n  <body>\n    <!-- React renders the whole app inside this element (see src/main.jsx). -->\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>',
        fileName: "frontend/index.html",
      },
    },
    {
      text: "Replace `src/main.jsx`. It is the template's file with the imports in a clearer order: first React, then our App, then the styles.",
      code: {
        language: "jsx",
        code: 'import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\nimport "./index.css";\n\ncreateRoot(document.getElementById("root")).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);',
        fileName: "frontend/src/main.jsx",
      },
    },
    {
      text: "Replace `src/App.jsx` with the smallest possible component. It no longer imports the deleted `App.css` or images.",
      code: {
        language: "jsx",
        code: "export default function App() {\n  return <h1>Notes</h1>;\n}",
        fileName: "frontend/src/App.jsx",
        caption:
          "First version. Step 3 adds the Navbar, and step 11 turns App into the switch between the login and notes pages.",
      },
    },
    {
      text: "Replace everything in `src/index.css` with the base styles of the Notes App: sizing rules, the colour palette as CSS variables and the page font.",
      code: {
        language: "css",
        code: "/* All styles for the Notes App. Written mobile-first: the base rules are\n   for small screens, and media queries add columns on wider ones. */\n\n*,\n*::before,\n*::after {\n  /* Width includes padding and border, so boxes are the size we set. */\n  box-sizing: border-box;\n}\n\n:root {\n  --color-text: #1f2328;\n  --color-muted: #59636e;\n  --color-border: #d0d7de;\n  --color-background: #f6f8fa;\n  --color-primary: #1d4ed8;\n  --color-danger: #b42318;\n}\n\nbody {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  line-height: 1.5;\n  color: var(--color-text);\n  background: var(--color-background);\n}",
        fileName: "frontend/src/index.css",
        caption:
          "The beginning of the final file. Later steps add styles for the navbar, buttons, cards and forms below these.",
      },
    },
    {
      text: "Check it worked: the browser tab (still running `npm run dev`) now shows a plain **Notes** heading on a light grey page, with no errors in the terminal or the browser console. `vite.config.js` stays exactly as the template made it for now.",
    },
  ],
  fromScratch: [
    "Install Node.js 22 or newer, then in an empty folder run `npm create vite@latest <name> -- --template react` (or `react-ts` for TypeScript).",
    "Run `npm install` once after creating the project and whenever `package.json` changes; run `npm run dev` every time you start working.",
    "Delete the demo content (`App.css`, `src/assets`, the demo markup in `App.jsx`) so the project contains only your code.",
    "Commit `package.json` and `package-lock.json` to git, but never `node_modules`: anyone can recreate it with `npm install`.",
  ],
  filesCreated: [
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/index.html",
    "frontend/vite.config.js",
    "frontend/src/main.jsx",
    "frontend/src/App.jsx",
    "frontend/src/index.css",
  ],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["vite", "npm-packages", "html-document"],
  codeExamples: [
    {
      language: "html",
      code: '<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>',
      fileName: "frontend/index.html",
      caption: "The empty `#root` div is where React draws the whole app.",
    },
    {
      language: "jsx",
      code: 'createRoot(document.getElementById("root")).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);',
      fileName: "frontend/src/main.jsx",
      caption:
        "Finds the `#root` div and renders the `App` component inside it. `StrictMode` adds extra checks during development only.",
    },
  ],
  relationshipIds: [],
  enables:
    "Run a React app on your own computer at http://localhost:5173 and see every change the moment you save.",
  commonMistakes: [
    "Running `npm run dev` in the wrong folder. It must run in `notes-app/frontend`, where `package.json` is; otherwise npm says it can't find the file.",
    "Opening `index.html` by double-clicking it. The browser can't run JSX, so the page stays blank; always use the address `npm run dev` prints.",
    'Deleting `src/App.css` or `src/assets` but leaving their `import` lines in `App.jsx`. Vite then shows a "Failed to resolve import" error; replace `App.jsx` as shown.',
    "Committing the `node_modules` folder to git. It is huge and can be recreated at any time with `npm install`.",
  ],
  nextStepId: "create-frontend-structure",
  nextWhy:
    "The project runs, but everything would end up in one App component. Next we give the frontend a folder structure and build the first layout component, the Navbar.",
};
