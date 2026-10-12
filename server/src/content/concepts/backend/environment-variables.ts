import type { Concept } from "@fsl/shared";

export const environmentVariables: Concept = {
  id: "environment-variables",
  slug: "environment-variables",
  title: "Environment variables",
  topicId: "backend",
  summary:
    "Named settings handed to a program when it starts, used for values that differ between computers, like the port, the database address and secret keys.",
  basics: [
    "The same backend code runs in several places: on your laptop while you build it, on a teammate's laptop, and on a hosting server for real users. Each place has a different database, and possibly a different port.",
    "Some values are secrets: a database password or the key used to sign login tokens. Anyone who has them can read your users' data or pretend to be any user.",
    "Code is shared — it goes into Git, gets pushed to GitHub, and is read by other people. So these values must not be written into the code itself.",
  ],
  what: [
    "An environment variable is a name and a text value, like `PORT=3000`, that the operating system gives to a program when it starts. Every running program has its own set.",
    'In Node.js you read them from the `process.env` object: `process.env.PORT` is `"3000"`, and a variable that was not set is `undefined`.',
  ],
  why: [
    "The code stays the same everywhere and only the settings change. Your laptop points `DATABASE_URL` at a local database and the hosting server points it at the real one, without editing a single line of code.",
    "Secrets stay out of Git. If a password is written in the code, everyone who can see the repository — now or ever, since Git keeps history — has it. In an environment variable, it lives only on the machines that need it.",
  ],
  howItWorks: [
    "Typing variables before every command is tedious, so in development they are kept in a `.env` file, one `NAME=value` per line. Node.js 22 can load it itself: `node --env-file=.env server.js` puts each line into `process.env` before your code runs, with no extra package needed.",
    "`.env` holds your real values and is listed in `.gitignore`, so it is never committed. A `.env.example` file with the same names and harmless placeholder values is committed, so others know which variables to set.",
    "On a hosting service there is no `.env` file to upload. Instead you enter each variable in the service's settings page, and it sets them when it starts your app.",
    'Values are always strings. `process.env.PORT` is `"3000"`, not `3000`, and a missing variable is `undefined`, so code often supplies a default: `process.env.PORT ?? 3000`.',
  ],
  basicExample: {
    language: "js",
    fileName: "server.js",
    code: `// .env (never committed):
//   PORT=4000
//   JWT_SECRET=a-long-random-string

const port = process.env.PORT ?? 3000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

console.log("Starting on port", port);`,
    caption:
      "Run with `node --env-file=.env server.js`: the port comes from the file, and the app refuses to start without its secret.",
  },
  internals: [
    "Every process on your computer gets a copy of its parent's environment when it starts. Your terminal has variables like `PATH` and `HOME`, and `node` inherits them, plus anything you set on the command line or load with `--env-file`.",
    "Because each process gets its own copy, changing `process.env` in one program does not affect any other, and editing `.env` while the server runs changes nothing until you restart it.",
    "Frontend code is different: it is sent to the user's browser, where anyone can read it. Vite only puts variables whose names start with `VITE_` into the frontend bundle, and only so you can use non-secret settings there. A secret in a `VITE_` variable is published to every visitor.",
  ],
  howToCreate: [
    {
      text: "Create a project with a `.env` file, a `.env.example` file and a `.gitignore`.",
      code: {
        language: "bash",
        code: `mkdir env-demo && cd env-demo
npm init -y
npm pkg set type=module
printf "PORT=4000\\nGREETING=Hello from .env\\n" > .env
printf "PORT=3000\\nGREETING=change-me\\n" > .env.example
echo ".env" > .gitignore`,
      },
    },
    {
      text: "Create `server.js` that reads both variables.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import http from "node:http";

const port = process.env.PORT ?? 3000;
const greeting = process.env.GREETING ?? "No greeting set";

http
  .createServer((req, res) => res.end(greeting))
  .listen(port, () => console.log("http://localhost:" + port));`,
      },
    },
    {
      text: "Start it twice: first without the file, then with it.",
      code: {
        language: "bash",
        code: `node server.js
# Ctrl+C, then:
node --env-file=.env server.js`,
      },
    },
    {
      text: "The first run listens on port 3000 and answers `No greeting set`. The second listens on port 4000 and answers `Hello from .env` — check with `curl http://localhost:4000`. Same code, different settings.",
    },
  ],
  whereUsed: [
    "Database connection strings, such as `DATABASE_URL`.",
    "Secrets: keys for signing tokens, API keys for payment or email services.",
    "Settings that hosting services decide for you, such as `PORT`, which many hosts set themselves.",
  ],
  connectsTo: [
    "Node.js, which exposes them as `process.env`.",
    "The database connection, which is created from `DATABASE_URL`.",
    "Authentication, which signs and checks login tokens with a secret key.",
    "Vite on the frontend, which exposes only `VITE_` variables to the browser.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/.env.example` lists `PORT=3000`, `DATABASE_URL=postgres://...`, `JWT_SECRET=change-me-to-a-long-random-string` and `NODE_ENV=development`. You copy it to `.env` and fill in real values; `.env` is never committed.",
      fileId: "backend/.env.example",
      match: "PORT=3000",
    },
    {
      explanation:
        "In development the backend starts with `node --env-file=.env --watch src/server.js`. `server.js` listens on `process.env.PORT ?? 3000` and `db.js` creates the `pg` pool from `process.env.DATABASE_URL`.",
      fileId: "backend/src/server.js",
      match: "const port = Number(process.env.PORT ?? 3000);",
    },
    {
      explanation:
        "`requireAuth` in `middleware/authMiddleware.js` verifies the login token with `process.env.JWT_SECRET`. The secret never reaches the frontend, which only ever sees the `httpOnly` cookie.",
      fileId: "backend/src/middleware/authMiddleware.js",
      match: "const payload = jwt.verify(token, process.env.JWT_SECRET);",
    },
  ],
  commonMistakes: [
    "Committing `.env`. Add it to `.gitignore` before the first commit; if a secret was ever pushed, treat it as leaked and replace it with a new one, because Git history keeps the old value.",
    "Putting a secret in frontend code or a `VITE_` variable, where every visitor can read it. Keep secrets on the backend and let the frontend call the backend.",
    "Forgetting `--env-file=.env`, or running the command from the wrong folder, so every `process.env` value is `undefined`. Check that the path to `.env` is correct from where you run the command.",
    'Treating values as booleans or numbers. `if (process.env.DEBUG)` is true even when `DEBUG=false`, because any non-empty string counts as true. Compare strings explicitly (`process.env.DEBUG === "true"`) and convert numbers with `Number(...)`.',
  ],
  relatedConcepts: ["nodejs", "npm-packages", "express", "vite"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
