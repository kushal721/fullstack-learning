import type { Concept } from "@fsl/shared";

export const environmentConfig: Concept = {
  id: "environment-config",
  slug: "environment-config",
  title: "Configuration per environment",
  topicId: "deployment",
  summary:
    "Running the exact same code in development, test and production by giving each place its own settings through environment variables.",
  basics: [
    "An environment is one place where your app runs, with everything around it. Development is your own laptop while you build. Test is where automated tests run, often in CI. Production is the real server that real users visit.",
    "Configuration is every value that changes between those places but is not logic: which database to connect to, which port to listen on, secret keys, how much to log, the public URL of the site.",
    "An environment variable is a named text value that the operating system hands to a program when it starts, like `PORT=3000`. In Node.js you read it with `process.env.PORT`. Every environment can set different values without anyone touching the code.",
  ],
  what: [
    "Configuration per environment means the code reads all its settings from environment variables, and each environment supplies its own values. The same files run on your laptop with a local database and in production with the real one.",
    "Good setups add one more rule: the app checks at startup that every required variable is present and valid, and refuses to start with a clear message if one is missing. This is called failing fast.",
  ],
  why: [
    'Writing values into the code — `const db = "postgres://localhost/notes"` — means changing and redeploying code to move it anywhere else, and it makes it easy to point tests at the production database by mistake. Keeping settings outside the code makes each environment safe and separate.',
    "Secrets such as a database password or `JWT_SECRET` (the key that signs login tokens) must never be in the repository: everyone with access to it, and its whole history forever, would see them. Environment variables keep them only on the machines that need them.",
  ],
  howItWorks: [
    "Each environment sets its variables in its own way. On your laptop you usually keep them in a `.env` file that a tool loads at startup and that Git ignores. In CI they come from the workflow and its stored secrets. In production you type them into the hosting dashboard, which passes them to your app when it starts.",
    "The code reads them in one place, often a `config.js` file, and the rest of the app imports values from there instead of touching `process.env` everywhere.",
    "That config file checks the required values first. If `DATABASE_URL` is missing it throws an error with the variable's name and the process exits before it serves a single request.",
    "Optional settings get safe defaults (for example `PORT` falls back to `3000` and the log level to `info`), while dangerous ones like secrets never get a default.",
  ],
  basicExample: {
    language: "js",
    fileName: "backend/src/config.js",
    code: `const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(\`Missing environment variables: \${missing.join(", ")}\`);
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  logLevel: process.env.LOG_LEVEL ?? "info",
};`,
    caption:
      "All settings are read in one file; the app stops at startup with the names of any missing variables instead of crashing later.",
    highlightLines: [2, 4, 5, 6],
  },
  internals: [
    'When a process starts, the operating system copies a list of name/value pairs into it — its environment. Node.js exposes that list as the object `process.env`. Every value is a string, so `"3000"` must be turned into a number and `"false"` is not the boolean `false`.',
    "A `.env` file is not magic: it is a plain text file of `NAME=value` lines. A loader such as Node's `--env-file=.env` option (or the `dotenv` package) reads it and puts the values into `process.env` before your code runs. Production hosts usually skip the file and set the variables directly.",
    "Failing fast matters because a missing value otherwise shows up much later as a confusing error, for example a crash on the first login because `JWT_SECRET` is `undefined`. A clear message at startup also makes the host mark the deploy as failed, so the old version keeps running.",
    "Values a browser can see are different: anything built into the frontend (for example with Vite's `VITE_` variables) ends up in the public JavaScript files. Never put secrets there; secrets belong only to the backend.",
  ],
  howToCreate: [
    {
      text: "In a small Node.js project, create `config.js` that reads and checks the settings.",
      code: {
        language: "js",
        fileName: "config.js",
        code: `const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(\`Missing environment variables: \${missing.join(", ")}\`);
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
};

console.log(\`Starting on port \${config.port}\`);`,
      },
    },
    {
      text: "Create a `.env` file for development and add it to `.gitignore` so it is never committed. Commit a `.env.example` with the same names but no real values, so others know what to set.",
      code: {
        language: "bash",
        fileName: ".env",
        code: `DATABASE_URL=postgres://postgres:postgres@localhost:5432/notes
JWT_SECRET=dev-only-not-a-real-secret
PORT=3000`,
      },
    },
    {
      text: "Run it without the file, then with it, to see both outcomes.",
      code: {
        language: "bash",
        code: `node config.js
node --env-file=.env config.js`,
      },
    },
    {
      text: "Check it worked: the first command prints `Missing environment variables: DATABASE_URL, JWT_SECRET` and exits; the second prints `Starting on port 3000`. Now try `PORT=4000 node --env-file=.env config.js` — a variable set in the shell wins over the file, which is how a host overrides values.",
    },
  ],
  whereUsed: [
    "Every deployed backend: database connection strings, API keys for email or payment services, signing secrets, allowed origins for CORS.",
    "Tests, which point `DATABASE_URL` at a separate test database so they can create and delete data freely.",
    "Switching behaviour between environments, such as detailed logs in development and quieter logs in production (`NODE_ENV`, `LOG_LEVEL`).",
  ],
  connectsTo: [
    "Environment variables, the operating-system feature this whole approach is built on.",
    "The hosting dashboard, where production values are entered and stored.",
    "CI, which stores its secrets separately and sets test values for each run.",
    "Docker: `docker run -e NAME=value` and `environment:` in `compose.yaml` set variables for a container.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App backend needs `DATABASE_URL`, `JWT_SECRET` and `PORT`. In development they come from a local `.env` file, in the integration tests `DATABASE_URL` points at the separate `notes_test` database, and in production they are set on the host, never in code.",
    },
    {
      explanation:
        "This learning platform reads all its settings in one place, `server/src/config.ts`, so the rest of the server never touches `process.env`. Its `Dockerfile` sets production defaults such as `NODE_ENV=production`, `PORT=3000` and `CLIENT_DIST`, the folder of the built website, which is left unset in development because Vite serves the website there.",
    },
  ],
  commonMistakes: [
    "Committing a `.env` file with real secrets. Add `.env` to `.gitignore` before the first commit; if a secret was ever pushed, treat it as leaked and replace it, because Git history keeps it.",
    'Giving secrets a fallback like `process.env.JWT_SECRET ?? "secret"`. Production then runs silently with a guessable key. Required secrets should stop the app when missing.',
    "Reading `process.env` all over the code. Typos like `DATABSE_URL` give `undefined` with no error. Read and check every variable in one config file.",
    "Using the same database for development, tests and production. A test that empties a table would empty real users' data; give each environment its own.",
  ],
  relatedConcepts: [
    "environment-variables",
    "hosting",
    "ci-cd",
    "docker-compose",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
