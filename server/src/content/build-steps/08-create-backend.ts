import type { BuildStep } from "@fsl/shared";

export const createBackendStep: BuildStep = {
  id: "create-backend",
  slug: "create-backend",
  order: 8,
  title: "Create the backend",
  goal: "Create the Express server that will answer the frontend's requests.",
  why: "The browser can't be trusted with the rules or the data: anyone can change code running in their own browser. A backend is a program on a server that receives every request, checks it and decides what happens.",
  problemSolved:
    "The frontend sends requests to `/api`, but there is no program to receive them, check them or store anything.",
  prerequisites: ["add-api-communication"],
  explanation: [
    "**Node.js** runs JavaScript outside the browser, so the backend can be written in the same language as the frontend. It is a separate program with its own folder and its own `package.json`.",
    "**Express** is a small library for web servers. You create an `app`, tell it which code answers which URL, and start it listening on a **port** — a numbered door on your computer. The frontend's proxy sends `/api` requests to port 3000, so that is where the backend listens.",
    "**Middleware** are functions every request passes through, in order, before reaching a route. `express.json()` reads a JSON request body and puts the result in `req.body`; without it `req.body` is `undefined`.",
    "The code is split in two files on purpose: `app.js` builds the app and `server.js` starts it. Tests (step 13) can then send requests to the app without opening a real port.",
    "Settings such as the port or the database password change between your computer and the server, and some are secret. They live in **environment variables**, read with `process.env.NAME`. During development they come from a `.env` file that is never committed; `.env.example` lists the names (with harmless values) so others know what to set.",
    '`/api/health` is a tiny route that answers `{ "status": "ok" }`. It proves the server is running, and hosting platforms use it later to check the app is alive (step 14).',
  ],
  howToCreate: [
    {
      text: "In your second terminal (the one in `notes-app/frontend` since step 2), go up to `notes-app`, create the backend folder with its own `package.json`, and install Express. Leave the frontend's `npm run dev` running in the first terminal.",
      code: {
        language: "bash",
        code: "cd ..\nmkdir backend\ncd backend\nnpm init -y\nnpm install express",
        caption:
          "This terminal now stays in `notes-app/backend` for the next steps.",
      },
    },
    {
      text: 'Replace `package.json` with this version. `"type": "module"` lets us use `import`/`export` like in the frontend. `npm run dev` starts the server with the settings from `.env` and restarts it whenever you save a file (`--watch`).',
      code: {
        language: "json",
        code: '{\n  "name": "notes-app-backend",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "node --env-file=.env --watch src/server.js",\n    "start": "node src/server.js"\n  },\n  "dependencies": {\n    "express": "^5.3.0"\n  }\n}',
        fileName: "backend/package.json",
        caption:
          "Keep the Express version npm installed. Step 10 adds `pg`, step 11 the login packages and step 13 the test tools.",
      },
    },
    {
      text: "Create the source folder.",
      code: {
        language: "bash",
        code: "mkdir src",
      },
    },
    {
      text: "Create `src/app.js`. It builds the Express app, adds the JSON middleware and the health route.",
      code: {
        language: "js",
        code: 'import express from "express";\n\n// Builds the Express app without starting it, so tests can send requests\n// to it directly (server.js starts it).\nexport function createApp() {\n  const app = express();\n\n  // Middleware runs in this order for every request.\n  app.use(express.json()); // JSON body → req.body\n\n  app.get("/api/health", (req, res) => res.json({ status: "ok" }));\n\n  return app;\n}',
        fileName: "backend/src/app.js",
        caption:
          "First version. Step 9 adds the notes routes, step 11 the login routes and step 12 the error handler.",
      },
    },
    {
      text: "Create `src/server.js`, which starts the app on the port from the environment (3000 if it isn't set).",
      code: {
        language: "js",
        code: 'import { createApp } from "./app.js";\n\nconst port = Number(process.env.PORT ?? 3000);\n\ncreateApp().listen(port, () => {\n  console.log(`Notes API listening on http://localhost:${port}`);\n});',
        fileName: "backend/src/server.js",
        caption:
          "Step 10 makes it stop with a clear message when a required setting is missing.",
      },
    },
    {
      text: "Create `.env.example` in the `backend` folder, listing the settings the backend reads. Lines starting with `#` are comments.",
      code: {
        language: "bash",
        code: "# Copy this file to .env and change the values. .env is never committed.\nPORT=3000\nNODE_ENV=development",
        fileName: "backend/.env.example",
        caption:
          "Step 10 adds the database address and step 11 the secret for login tokens.",
      },
    },
    {
      text: "Copy it to `.env`, the file the server really reads. `.env.example` is the shared template; `.env` holds your own values and is never committed.",
      code: {
        language: "bash",
        code: "cp .env.example .env",
        caption: "On Windows PowerShell: `Copy-Item .env.example .env`.",
      },
    },
    {
      text: "Tell git to ignore installed packages and the secret `.env` file. Create `.gitignore` in the `notes-app` folder (one level up), so it covers the whole project.",
      code: {
        language: "bash",
        code: "printf 'node_modules/\\n.env\\ndist/\\n' > ../.gitignore",
        caption:
          "The Explorer doesn't list this file, because it isn't part of the app's code — but never skip it: a committed `.env` leaks your passwords.",
      },
    },
    {
      text: "Open a third terminal, go to `notes-app/backend` and start the backend there. Keep it running, like the frontend; type the remaining commands in the second terminal.",
      code: {
        language: "bash",
        code: "npm run dev",
      },
    },
    {
      text: 'Check it worked: the terminal prints `Notes API listening on http://localhost:3000`. Open http://localhost:3000/api/health in the browser, or run `curl http://localhost:3000/api/health` in another terminal: the answer is `{"status":"ok"}`. The frontend now reaches a real server, but `/api/notes` doesn\'t exist yet, so it still shows *Something went wrong*.',
    },
  ],
  fromScratch: [
    "Make the backend its own folder with its own `package.json` (`npm init -y`), separate from the frontend.",
    'Install Express, set `"type": "module"`, and add `dev` (`node --env-file=.env --watch src/server.js`) and `start` scripts.',
    "Split `app.js` (builds the app, exports it) from `server.js` (starts listening), so tests can use the app without a port.",
    "Read every setting from `process.env`, keep real values in `.env` (git-ignored) and document the names in `.env.example`.",
    "Add a `/api/health` route first and check it with the browser or `curl` before writing real routes.",
  ],
  filesCreated: [
    "backend/package.json",
    "backend/package-lock.json",
    "backend/src/server.js",
    "backend/src/app.js",
    "backend/.env.example",
  ],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["nodejs", "express", "npm-packages", "environment-variables"],
  codeExamples: [
    {
      language: "js",
      code: 'app.use(express.json()); // JSON body → req.body\n\napp.get("/api/health", (req, res) => res.json({ status: "ok" }));',
      fileName: "backend/src/app.js",
      caption:
        "Middleware first, then routes: every request passes through `express.json()` before reaching a route.",
    },
    {
      language: "js",
      code: "const port = Number(process.env.PORT ?? 3000);",
      fileName: "backend/src/server.js",
      caption:
        "Environment variables are always text, so the port is converted to a number. `??` uses 3000 when `PORT` isn't set.",
    },
  ],
  relationshipIds: [],
  enables:
    "Run an API server on your computer that answers http://localhost:3000/api/health.",
  commonMistakes: [
    "Running backend commands in the `frontend` folder (or the other way round). Each has its own `package.json`; `cd` into the right one first.",
    'Forgetting `"type": "module"` in `package.json`. Node then fails on `import` with "Cannot use import statement outside a module".',
    'Starting `npm run dev` without a `.env` file. `node --env-file=.env` stops with "not found"; copy `.env.example` to `.env` first.',
    "Committing `.env`. It will contain passwords and secrets; it belongs in `.gitignore`, and only `.env.example` is committed.",
    "Another program already using port 3000, so the server fails with `EADDRINUSE`. Stop the other program, or set a different `PORT` in `.env` and in the frontend's proxy.",
  ],
  nextStepId: "create-api-routes",
  nextWhy:
    "The server runs but only answers `/api/health`. Next we add the notes routes the frontend is already calling.",
};
