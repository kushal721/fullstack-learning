import type { Concept } from "@fsl/shared";

export const npmPackages: Concept = {
  id: "npm-packages",
  slug: "npm-packages",
  title: "npm and packages",
  topicId: "backend",
  summary:
    "The tool that installs other people's code (packages) into your project and records exactly which ones and which versions it needs.",
  basics: [
    "A package is a folder of reusable code that someone published for others to use — for example Express, which makes writing a web server much easier. Using it saves you from writing and maintaining that code yourself.",
    "npm (Node Package Manager) is a command-line tool that comes with Node.js. It downloads packages from the npm registry, a huge public online library of packages, and puts them in your project.",
    "A dependency is a package your project needs in order to work. Packages often have their own dependencies, so installing one package can bring in dozens more.",
  ],
  what: [
    "`package.json` is your project's description file: its name, the commands you can run (`scripts`), and the packages it depends on with the versions it accepts. `npm init -y` creates one.",
    "`npm install <name>` downloads a package into the `node_modules` folder and records it in `package.json`. npm also writes `package-lock.json`, which lists the exact version of every package that was installed, including the dependencies of your dependencies.",
  ],
  why: [
    "`node_modules` can hold thousands of files, and anyone can recreate it, so you never commit it to Git. `package.json` and `package-lock.json` are small and describe it completely: a teammate runs one command and gets the same packages you have.",
    "Without the lock file, two installs a month apart could pick different versions, and code that worked on your computer could break on the server. The lock file makes every install identical.",
  ],
  howItWorks: [
    "`dependencies` are packages the app needs when it runs, like `express` and `pg`. `devDependencies` (installed with `npm install --save-dev <name>`) are only needed while developing, like a code formatter or a test tool; a production install can skip them.",
    'Versions use semver (semantic versioning): `MAJOR.MINOR.PATCH`, like `5.1.0`. A patch fixes bugs, a minor adds features without breaking anything, and a major may break existing code. `^5.1.0` in `package.json` means "5.1.0 or any newer 5.x", never 6.',
    '`scripts` are named commands. With `"dev": "node --watch src/server.js"` in `package.json`, `npm run dev` runs that command. `npm start` is a shortcut for the `start` script.',
    "`npm ci` installs exactly what `package-lock.json` says, after deleting any existing `node_modules`. It is the command to use on servers and in automated builds; `npm install` is for adding or updating packages.",
  ],
  basicExample: {
    language: "json",
    fileName: "package.json",
    code: `{
  "name": "notes-backend",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "prettier": "^3.3.3"
  }
}`,
    caption:
      "A small package.json: two scripts, one runtime dependency and one development-only tool.",
  },
  internals: [
    "When you run `npm install express`, npm asks the registry which versions exist, picks the newest one that matches the range, does the same for every dependency of Express, downloads them all and records the result in `package-lock.json`.",
    'When your code says `import express from "express"`, Node.js looks for a folder called `express` inside `node_modules` (and in parent folders\' `node_modules` if needed), reads its `package.json` to find the entry file and loads it.',
    "Packages can run install scripts and always run inside your app with full access to your files and environment variables. A package you install is code you are trusting, so its quality and safety matter as much as your own code's.",
  ],
  howToCreate: [
    {
      text: "Create a project and install Express as a dependency and Prettier as a development dependency.",
      code: {
        language: "bash",
        code: `mkdir npm-demo && cd npm-demo
npm init -y
npm pkg set type=module
npm install express
npm install --save-dev prettier`,
      },
    },
    {
      text: "Create `server.js`, which imports the package you just installed.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.get("/", (req, res) => res.json({ ok: true }));
app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Create a `.gitignore` so `node_modules` is never committed, add a `dev` script, and run it.",
      code: {
        language: "bash",
        code: `echo "node_modules" > .gitignore
npm pkg set scripts.dev="node --watch server.js"
npm run dev`,
      },
    },
    {
      text: 'Open http://localhost:3000 to see `{"ok":true}`. Then open `package.json`: `express` is under `dependencies` and `prettier` under `devDependencies`. Finally delete `node_modules` and run `npm ci` — everything comes back exactly as before.',
    },
  ],
  whereUsed: [
    "Every Node.js backend, to install a framework like Express and a database driver like `pg`.",
    "Every modern frontend, to install React, Vite and their tools.",
    "Running project commands in a standard way: `npm run dev`, `npm start`, `npm test`.",
  ],
  connectsTo: [
    "Node.js, which comes with npm and loads installed packages from `node_modules`.",
    "`import` statements, which name the packages your code uses.",
    "Express and the other libraries the backend is built on.",
    "Git, which tracks `package.json` and `package-lock.json` but ignores `node_modules`.",
  ],
  projectUsage: [
    {
      explanation:
        '`backend/package.json` sets `"type": "module"`, lists the runtime dependencies (`express` and the `pg` database driver among them) and defines the `dev` and `start` scripts that run `src/server.js` with `node --env-file=.env`.',
      fileId: "backend/package.json",
      match: '"dependencies": {',
    },
    {
      explanation:
        "`node_modules` is git-ignored and `package-lock.json` is committed, so a fresh clone needs only `npm ci` in `backend/` before `npm run dev` works.",
    },
    {
      explanation:
        "The frontend has its own `package.json` with React and Vite. Frontend and backend each install their own packages in their own `node_modules`.",
      fileId: "frontend/package.json",
      match: '"react": "^19.3.0",',
    },
  ],
  commonMistakes: [
    "Committing `node_modules`. Add it to `.gitignore`; if it was already committed, remove it with `git rm -r --cached node_modules`.",
    'Not committing `package-lock.json`, or deleting it to "fix" an error. Commit it and install with `npm ci` so everyone gets the same versions.',
    "Installing a package without checking it. Look at its npm page first — weekly downloads, last update, linked source code — and double-check the spelling, because look-alike names are a known trick for spreading malicious code.",
    "Running `node server.js` and getting `Cannot find package 'express'`. You forgot `npm install` (or ran it in a different folder); run it in the folder that contains `package.json`.",
  ],
  relatedConcepts: [
    "nodejs",
    "express",
    "js-module-import-export",
    "environment-variables",
    "vite",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
