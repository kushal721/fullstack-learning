import type { Concept } from "@fsl/shared";

export const deployingAFullStackApp: Concept = {
  id: "deploying-a-full-stack-app",
  slug: "deploying-a-full-stack-app",
  title: "Deploying a full-stack app",
  topicId: "deployment",
  summary:
    "The whole path from code on your laptop to a live app: database, backend, frontend, connecting them, HTTPS, a smoke test and safe updates.",
  basics: [
    "Deploying means taking an app that works on your computer and making it run on servers on the internet, so other people can use it at a public address.",
    "A full-stack app has three parts that depend on each other: the database stores the data, the backend (the server program) reads and writes that data and checks who is logged in, and the frontend (the pages in the browser) talks to the backend over HTTP.",
    "Because of those dependencies the order matters: the backend cannot start without a database to connect to, and the frontend is useless without a backend to call. So you deploy from the bottom up.",
  ],
  what: [
    "Deploying a full-stack app is a sequence of small, checkable steps: create the database and its tables, run the backend with its environment variables, build and serve the frontend, connect the frontend to the API, put it behind HTTPS on a domain, and test that the real thing works.",
    "It does not end with the first release. Afterwards every change should reach production the same safe way: a pull request, green CI, a merge to `main`, and an automatic deploy from `main`.",
  ],
  why: [
    "Deploying everything at once and hoping is how you end up staring at a blank page with no idea which of the three parts is broken. Going layer by layer, and checking each one before the next, tells you exactly where a problem is.",
    "A repeatable process protects real users. When deploys always come from tested code on `main` and always end with the same checks, a bad change is caught early — and if one slips through, you know which version to go back to.",
  ],
  howItWorks: [
    "Database first: create a managed PostgreSQL database on your host, copy its connection string, and run your `schema.sql` against it once to create the tables. The database now exists but is empty.",
    "Backend second: deploy the backend (for example as a Docker image) and set its environment variables on the host — `DATABASE_URL` from step one, a long random `JWT_SECRET`, and `PORT` if the host does not set it. Check its health route before going further.",
    "Frontend third: `npm run build` turns the React code into static files. Either the backend serves them and the API under `/api` on the same address (same origin, simplest), or a static host serves them on a different address and the backend must allow that origin with CORS.",
    "Finally add the domain and HTTPS, run a smoke test — a quick check of the most important paths, like registering and creating a note — and connect `main` to the host so every merge after CI deploys automatically.",
  ],
  basicExample: {
    language: "bash",
    code: `# 1. Database: create the tables once
psql "$DATABASE_URL" -f database/schema.sql

# 2. Backend: build the image (the host runs it with its env vars)
docker build -t notes-api backend/

# 3. Frontend: build static files into frontend/dist/
npm run build --prefix frontend

# 4. Smoke test the live site
curl https://notes.example.com/api/health`,
    caption:
      "The deployment in order: database, backend, frontend, then a check against the real address.",
  },
  internals: [
    "Same origin versus CORS: a browser treats `https://notes.example.com` and `https://api.example.com` as different origins and, for safety, blocks the page from reading API responses from another origin unless the API says it is allowed (CORS headers). Login cookies across origins also need extra settings. Serving the frontend and `/api` from one origin avoids all of this, which is why it is the easier first deployment.",
    "Single-page apps need a fallback: when someone opens `/notes/42` directly, there is no file with that name. The server must answer unknown non-API paths with `index.html` so React Router can show the right page, while unknown `/api` paths should still return a JSON `404`.",
    "During each deploy the host builds the new version, starts it next to the old one, waits for the health check to pass and only then switches traffic. If the new version crashes at startup — for example because a required variable is missing — the old version keeps serving users.",
    "Database changes need care because data stays when code changes. Run new `schema.sql` changes (migrations) before deploying code that needs them, and make them additive (add a column, do not drop one) so the old and new code can both run during the switch.",
  ],
  howToCreate: [
    {
      text: "Create a managed PostgreSQL database on your host, copy its external connection string, and create the tables from your computer.",
      code: {
        language: "bash",
        code: `export DATABASE_URL="postgres://user:password@host:5432/notes"
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -c "\\dt"`,
      },
    },
    {
      text: "Create a web service for the backend from your repository (using `backend/Dockerfile`), and in its settings add the environment variables. Generate a strong secret locally and paste it in; never commit it.",
      code: {
        language: "bash",
        code: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# On the host, set:
# DATABASE_URL = the internal connection string of the database
# JWT_SECRET   = the value printed above
# PORT         = 3000 (only if the host does not set it)`,
      },
    },
    {
      text: "Build the frontend so the backend serves it under the same address as `/api` (or deploy `frontend/dist/` to a static host and allow its origin with CORS). With one origin the frontend can keep calling relative URLs like `/api/notes`.",
      code: {
        language: "bash",
        code: `npm run build --prefix frontend
ls frontend/dist`,
      },
    },
    {
      text: "Add your domain in the host's dashboard, create the DNS record it asks for and wait until the certificate is issued. Then smoke test the live app: health, register, log in, create a note.",
      code: {
        language: "bash",
        code: `SITE=https://notes.example.com
curl $SITE/api/health
curl -X POST $SITE/api/auth/register -H "Content-Type: application/json" \\
  -d '{"email":"smoke@example.com","password":"a-long-password"}'
curl -c cookies.txt -X POST $SITE/api/auth/login -H "Content-Type: application/json" \\
  -d '{"email":"smoke@example.com","password":"a-long-password"}'
curl -b cookies.txt -X POST $SITE/api/notes -H "Content-Type: application/json" \\
  -d '{"title":"Hello from production"}'`,
      },
    },
    {
      text: "Check it worked: health answers `200`, register and login succeed, and creating the note returns `201` with the saved note. Open the site in a browser with the padlock, log in as the same user and see the note in the list. From now on, deploy only from `main` after CI is green.",
    },
  ],
  whereUsed: [
    "Every time a project goes live for the first time, from a portfolio project to a company's new service.",
    "Every update afterwards: the same pipeline and smoke test run on each release, usually automatically after a merge to `main`.",
  ],
  connectsTo: [
    "Hosting, which provides the database, the backend service and HTTPS.",
    "Configuration per environment, which keeps production settings and secrets on the host instead of in the code.",
    "Domains and DNS, which give the app its public name and make the certificate possible.",
    "CI/CD, which checks every change and deploys `main`, and Docker images, which package the backend the same way every time.",
  ],
  projectUsage: [
    {
      explanation:
        "In build step 14 the Notes App goes live this way: a managed PostgreSQL database set up with `database/schema.sql`, the backend as a Docker image from `backend/Dockerfile` with `DATABASE_URL`, `JWT_SECRET` and `PORT` set on the host, the frontend built with `npm run build` into `frontend/dist/`, and one domain with HTTPS where the API lives under `/api`.",
      fileId: "database/schema.sql",
      match: 'psql "$DATABASE_URL" -f database/schema.sql',
    },
    {
      explanation:
        "Before it ships, the tests from build step 13 — the Vitest unit, component and integration tests — are what CI should run, and the smoke test checks the main path by hand against the real site: register, log in, create a note.",
    },
    {
      explanation:
        "This learning platform follows the same idea: its CI runs every check and a Docker build on each pull request, and after a merge to `main` its release workflow publishes the image to GitHub Container Registry, asks Render to deploy that exact image and confirms the release by checking that `/api/health` reports the new commit.",
    },
  ],
  commonMistakes: [
    'Deploying the backend before the tables exist. It starts, but the first request fails with `relation "users" does not exist`; run `schema.sql` first.',
    "Leaving `http://localhost:3000` in the frontend's API URL. It works on your laptop and fails for every visitor, whose own computer has no server there. Use relative `/api` paths on one origin, or a build-time variable for the API address.",
    "Calling an API on another origin without configuring CORS and cookie settings, so the browser blocks the response or never sends the login cookie. Prefer one origin; otherwise allow exactly your frontend's origin.",
    "Fixing things directly on the server or deploying from a laptop. The next deploy from `main` overwrites the fix; make every change through a pull request so it is reviewed, tested and repeatable.",
  ],
  relatedConcepts: [
    "hosting",
    "environment-config",
    "domain-dns",
    "ci-cd",
    "production-build",
    "dockerfile",
    "database",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
