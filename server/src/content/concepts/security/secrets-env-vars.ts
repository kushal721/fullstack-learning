import type { Concept } from "@fsl/shared";

export const secretsEnvVars: Concept = {
  id: "secrets-env-vars",
  slug: "secrets-env-vars",
  title: "Keeping secrets out of the code",
  topicId: "security",
  summary:
    "Passwords, signing keys and database addresses are given to the app through environment variables at runtime, never written into the code, committed to Git or shipped to the browser.",
  basics: [
    "A secret is any value that gives access to something: the database password, the key that signs login tokens, an API key for a payment service.",
    "Code gets copied to many places: your laptop, GitHub, your teammates' computers, the build server, Docker images. Anything written in the code goes everywhere the code goes, and Git keeps every old version forever.",
    "An environment variable is a named setting given to a program when it starts, outside the code (see environment variables). That makes it the natural place for secrets.",
  ],
  what: [
    "The rule: secrets live only in the environment of the running app, such as a `.env` file on your computer that is never committed, or the host's settings page in production. The code reads them by name, for example `process.env.JWT_SECRET`.",
    "A committed `.env.example` lists every variable the app needs with harmless placeholder values, so a new developer knows what to set without seeing anyone's real secrets.",
  ],
  why: [
    "Anyone who has `JWT_SECRET` can sign a token for any user and log in as them. Anyone who has the database URL with its password can read and change every row. These values are as powerful as an administrator account.",
    "Secrets pushed to a public repository are found by automated scanners within minutes. Even in a private repository, every past and future collaborator, and every service with access, can read them.",
    "Keeping them outside the code also means each environment can have its own: a throwaway secret for development, a different strong one in production, and changing one never needs a code change.",
  ],
  howItWorks: [
    "Development: you copy `.env.example` to `.env` and fill it in. `.gitignore` excludes `.env`, so Git never commits it. `node --env-file=.env` loads it into `process.env` when the backend starts.",
    "Production: you enter the same names on the host's settings page (on Render, the service's Environment tab). The host gives them to the app as environment variables; there is no `.env` file at all.",
    "At startup, the Notes App checks that `DATABASE_URL` and `JWT_SECRET` are set and stops immediately with a clear message if not, instead of failing later on the first request.",
    "Docker: `.dockerignore` keeps `.env` out of the image, so a published image doesn't contain your development secrets either.",
  ],
  basicExample: {
    language: "js",
    code: `// UNSAFE: the secret is in the code, in Git history and on GitHub
const token = jwt.sign({ sub: user.id }, "my-super-secret-key");

// SAFE (the Notes App): the code only knows the name
const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});
// .env (never committed):  JWT_SECRET=6f1c…a long random string…9e2b`,
    caption:
      "The safe version's code can be public without giving anything away.",
    highlightLines: [2, 5],
  },
  internals: [
    "If a secret is ever committed, deleting it in a new commit isn't enough: it is still in the history and in every clone. Treat it as leaked: create a new secret, replace it everywhere, and only then clean up.",
    "Nothing in the frontend is secret. Everything the browser downloads, including variables built into the JavaScript bundle (in Vite, those starting with `VITE_`), can be read by any visitor. Secrets belong only on the server.",
    "A strong signing secret is long and random. `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` prints 64 random hex characters, far more than anyone could guess.",
    "Don't log secrets or whole configuration objects, and don't put them in error messages. Logs are read by more people and tools than the code.",
  ],
  howToCreate: [
    {
      text: "Create a small project that reads a secret from the environment and refuses to start without it.",
      code: {
        language: "bash",
        code: `mkdir secrets-demo && cd secrets-demo
npm init -y
npm pkg set type=module
printf ".env\\n" > .gitignore
printf "# Copy to .env and fill in.\\nAPI_SECRET=change-me\\n" > .env.example`,
      },
    },
    {
      text: "Create `app.js`. It checks the variable at startup, like the Notes App's `server.js`.",
      code: {
        language: "js",
        fileName: "app.js",
        code: `const secret = process.env.API_SECRET;
if (!secret) {
  console.error("Missing environment variable: API_SECRET");
  console.error("Copy .env.example to .env and fill it in.");
  process.exit(1);
}
console.log(\`Started with a secret of \${secret.length} characters.\`);`,
      },
    },
    {
      text: "Run it without a `.env`: it stops with a clear message. Then create `.env` with a random secret and run it with `--env-file`. Finally, `git init` and `git status` show that `.env` would never be committed, while `.env.example` would.",
      code: {
        language: "bash",
        code: `node app.js
echo "API_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" > .env
node --env-file=.env app.js
git init -q && git status --short`,
      },
    },
  ],
  whereUsed: [
    "Every backend: database passwords, signing keys, API keys for email, payments or storage.",
    "CI/CD pipelines, which keep deploy keys as encrypted repository secrets instead of in workflow files.",
    "Hosting platforms, which all have a settings page for environment variables.",
  ],
  connectsTo: [
    "Environment variables and environment configuration, the general mechanism.",
    "JWTs: `JWT_SECRET` signs the Notes App's login tokens.",
    "`.gitignore`, which keeps `.env` out of Git.",
    "Docker, where `.dockerignore` keeps it out of images.",
  ],
  projectUsage: [
    {
      explanation:
        "`.env.example` lists the variables with placeholders and says `.env` is never committed. Its `JWT_SECRET` line reminds you to use a long random string in production.",
      fileId: "backend/.env.example",
      match:
        "# Copy this file to .env and change the values. .env is never committed.",
    },
    {
      explanation:
        "`server.js` refuses to start when `DATABASE_URL` or `JWT_SECRET` is missing.",
      fileId: "backend/src/server.js",
      match: 'const required = ["DATABASE_URL", "JWT_SECRET"];',
    },
    {
      explanation:
        "The code only ever reads the secret by name, when signing and when verifying tokens.",
      fileId: "backend/src/middleware/authMiddleware.js",
      match: "const payload = jwt.verify(token, process.env.JWT_SECRET);",
    },
    {
      explanation:
        "The development script loads `.env` with Node's built-in `--env-file`, so no extra package is needed.",
      fileId: "backend/package.json",
      match: '"dev": "node --env-file=.env --watch src/server.js",',
    },
    {
      explanation: "`.dockerignore` keeps `.env` out of the Docker image.",
      fileId: "backend/.dockerignore",
      match: ".env",
    },
  ],
  commonMistakes: [
    "Committing `.env` before adding it to `.gitignore`. Add the ignore rule first, and check `git status` before every first commit.",
    "Putting a secret in frontend code or a `VITE_` variable. Everyone who opens the site can read it.",
    "Using the same secret in development and production, or keeping the example value in production.",
    "Deleting a leaked secret from the code without replacing it. It is still in Git history; generate a new one.",
  ],
  relatedConcepts: [
    "environment-variables",
    "environment-config",
    "gitignore",
    "jwt",
    "dockerfile",
  ],
  relatedFiles: [],
  relatedBuildSteps: ["deploy"],
};
