import type { Concept } from "@fsl/shared";

export const productionBuild: Concept = {
  id: "production-build",
  slug: "production-build",
  title: "Production build",
  topicId: "deployment",
  summary:
    "The step that turns your source code into small, fast, ready-to-serve files for real users instead of the convenient development version.",
  basics: [
    "While you build an app, you run it on your own computer in development mode. `npm run dev` starts a development server that rebuilds the page the moment you save a file and shows detailed error messages. That is great for you, but slow and bulky for visitors.",
    "Production means the real, public version of the app that other people use. Production code should load fast, use little data and never show internal error details.",
    "Browsers only understand plain HTML, CSS and JavaScript. Things you write for comfort, such as JSX in React components, TypeScript or many separate files with `import`, have to be translated and combined first. A tool that does this is called a bundler; Vite is the one the Notes App uses.",
  ],
  what: [
    "A production build is a command, usually `npm run build`, that reads all your frontend source code and writes a finished copy of the app into a folder, with Vite the `dist/` folder. That folder contains one `index.html` plus a few CSS and JavaScript files.",
    "The files in `dist/` are static: they never change while the app runs, so any web server or hosting service can send them to browsers without running your code.",
  ],
  why: [
    "Development mode trades speed for convenience: it sends hundreds of small unminified files and extra checking code. A production build removes everything users do not need, so the page downloads and starts much faster, especially on phones and slow networks.",
    "The build also catches problems early. If an import points to a file that does not exist, the build fails on your computer instead of the app breaking for real users.",
  ],
  howItWorks: [
    "Vite starts at `index.html`, follows every `import` to find all the code the app uses and translates JSX and TypeScript into plain JavaScript.",
    "It bundles the code into a few files and minifies them: it removes spaces, comments and unused code and shortens variable names. A file that was 100 kB in development is often 30 kB after the build.",
    "It gives each file a hashed name such as `index-BqFdo1Ns.js`. The hash is a short fingerprint calculated from the file's contents, so it changes only when the contents change.",
    "Because a hashed name always means the exact same contents, the server can tell browsers to cache those files for a year. When you deploy a new version, the file names change, `index.html` points to the new names and browsers download only what actually changed.",
  ],
  basicExample: {
    language: "bash",
    code: `npm run build

vite building for production...
dist/index.html                   0.46 kB
dist/assets/index-DiwrgTda.css    1.39 kB
dist/assets/index-BqFdo1Ns.js   194.05 kB
built in 812ms`,
    caption:
      "One command turns the whole frontend into three static files in dist/. The random-looking parts of the names are content hashes.",
  },
  internals: [
    "Vite sets `process.env.NODE_ENV` to `production` during the build. Libraries such as React check that value and drop their development-only warnings and checks, which makes them both smaller and faster.",
    "On the backend, `NODE_ENV=production` is an environment variable you set when starting the server. Express and many other packages read it to switch to faster, quieter behaviour, for example by not sending stack traces to the browser, and `npm ci --omit=dev` uses the same idea to skip development-only packages.",
    "Environment variables starting with `VITE_` are copied into the JavaScript at build time. Whatever value they had when you ran `npm run build` is baked into the files, so never put secrets in them: everyone can read the downloaded JavaScript.",
    "`index.html` itself is not hashed, because its address must stay the same. Servers therefore cache it only briefly, so browsers always find out about new hashed file names quickly.",
  ],
  howToCreate: [
    {
      text: "Create a small React project with Vite and install its packages.",
      code: {
        language: "bash",
        code: `npm create vite@latest my-notes -- --template react
cd my-notes
npm install`,
      },
    },
    {
      text: "Build it for production and look at what was created.",
      code: {
        language: "bash",
        code: `npm run build
ls dist dist/assets`,
      },
    },
    {
      text: "Open one of the `.js` files in `dist/assets/` in your editor. It is one long line without comments or spaces: that is minified code. Change some text in `src/App.jsx`, build again and notice that the hash in the JavaScript file name changed.",
    },
    {
      text: "Serve the finished `dist/` folder the way a real server would, without the development server.",
      code: {
        language: "bash",
        code: `npm run preview`,
      },
    },
    {
      text: "Open the address it prints (usually http://localhost:4173). The app works exactly as in development, but in the browser's Network tab you see only a few small files instead of many separate modules. That confirms the build is ready to be deployed.",
    },
  ],
  whereUsed: [
    "Every deployment of a frontend: the hosting service runs `npm run build` and serves the `dist/` folder.",
    "In CI pipelines, where a successful build on every pull request proves the code still compiles.",
    "On the backend whenever the server is written in a language Node.js cannot run directly, such as TypeScript, which is compiled to JavaScript first.",
  ],
  connectsTo: [
    "Vite, the tool that performs the build and also runs the development server.",
    "Environment variables such as `NODE_ENV`, which switch code between development and production behaviour.",
    "Docker images, which often run the build inside the image and keep only the output.",
    "Hosting, which serves the built files to users, and CI/CD, which builds them automatically.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App frontend is built with `npm run build`, which makes Vite write static files to `frontend/dist/`. Those files are what is deployed, never the `src/` folder.",
      fileId: "frontend/package.json",
      match: '"build": "vite build",',
    },
    {
      explanation:
        "The Notes App backend has no build step: it is plain JavaScript that `node` runs directly, started with `NODE_ENV=production` and its other settings as environment variables on the host.",
      fileId: "backend/package.json",
      match: '"start": "node src/server.js",',
    },
    {
      explanation:
        "This learning platform is written in TypeScript, so its server does need a build: `npm run build -w server` compiles it with `tsc` into `server/dist`, and `npm run build -w client` type-checks and builds the React client with Vite.",
    },
  ],
  commonMistakes: [
    "Deploying the development server (`npm run dev`) to production. It is slow and not meant for real traffic; deploy the built `dist/` folder instead.",
    "Testing only in development. Some problems, such as wrong file paths or missing environment variables, only appear in the build, so run `npm run build` and `npm run preview` before deploying.",
    "Putting secrets in `VITE_` variables. They are copied into public JavaScript; keep secrets on the backend only.",
    "Caching `index.html` for a long time. Users then keep loading old file names after a deploy; cache only the hashed files long and `index.html` briefly.",
  ],
  relatedConcepts: ["vite", "environment-variables", "hosting", "ci-cd"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
