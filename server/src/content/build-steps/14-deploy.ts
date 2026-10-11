import type { BuildStep } from "@fsl/shared";

export const deployStep: BuildStep = {
  id: "deploy",
  slug: "deploy",
  order: 14,
  title: "Deploy",
  goal: "Build the app for production, package the backend in a Docker image and run the database, backend and frontend on a host people can visit over HTTPS.",
  why: "An app is only useful when others can use it. Deployment turns the project on your laptop into a live website, with production settings that are faster and safer than development.",
  problemSolved:
    "An app that only runs on your own computer, with development settings.",
  prerequisites: ["test"],
  explanation: [
    "In production nothing runs `npm run dev`. The frontend is turned into plain files by `npm run build` (a **production build**: JSX compiled, code minified, file names with content hashes so browsers can cache them) and the backend runs with `node src/server.js` and `NODE_ENV=production`.",
    "A **Docker image** packages the backend with the exact Node.js version and packages it needs, so it runs the same on your laptop and on the host. The **Dockerfile** is the recipe; a **container** is a running copy of the image. `.dockerignore` keeps `node_modules`, `.env` and tests out of the image.",
    "The Notes App uses three hosted pieces: a **managed PostgreSQL** database (the host runs, backs up and updates it), a **web service** that runs the backend image, and a **static site** that serves the files in `frontend/dist/` from a CDN.",
    "The browser must see one website (one **origin**), like the Vite proxy did in development: then relative URLs like `/api/notes` keep working and the login cookie is sent normally. The static site gets a **rewrite** rule that forwards every `/api/*` request to the web service, without the browser noticing.",
    "**HTTPS** encrypts everything between the browser and the host, so nobody on the network can read passwords or steal the login cookie. Hosts like Render provide certificates automatically. In production the cookie is marked `secure`, so the browser only sends it over HTTPS.",
    "Production settings live in the host's environment variables, never in git: `DATABASE_URL` (the host's database), a new long random `JWT_SECRET` and `NODE_ENV=production`.",
  ],
  howToCreate: [
    {
      text: "Build the frontend. In the second terminal (in `notes-app/frontend`), create the production files.",
      code: {
        language: "bash",
        code: "npm run build",
        caption:
          "Expected: Vite lists `dist/index.html` and a JS and CSS file in `dist/assets/`, a few hundred KB in total.",
      },
    },
    {
      text: "Try the production build locally. `npm run preview` serves `dist/` (http://localhost:4173) and uses the same `/api` proxy as development, so with the backend running you can log in and use the built app.",
      code: {
        language: "bash",
        code: "npm run preview",
        caption: "Stop it with Ctrl+C afterwards.",
      },
    },
    {
      text: "Now the backend image. In the second terminal, go to the backend folder.",
      code: {
        language: "bash",
        code: "cd ../backend",
      },
    },
    {
      text: "Create the `Dockerfile`.",
      code: {
        language: "bash",
        code: '# Production image for the Notes API.\nFROM node:22-alpine\n\nWORKDIR /app\nENV NODE_ENV=production\n\n# Copy only the package files first: Docker reuses this layer (and the\n# installed packages) until the dependencies change.\nCOPY package.json package-lock.json ./\nRUN npm ci --omit=dev\n\nCOPY src ./src\n\n# Don\'t run as root inside the container.\nUSER node\nEXPOSE 3000\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD node -e "fetch(\'http://localhost:3000/api/health\').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"\n\nCMD ["node", "src/server.js"]',
        fileName: "backend/Dockerfile",
        caption:
          "Final version. Each line is explained in its comment; the order makes rebuilds fast because the slow `npm ci` layer is reused until `package.json` changes.",
      },
    },
    {
      text: "Create `.dockerignore`, so local packages, secrets and tests never end up in the image.",
      code: {
        language: "bash",
        code: "node_modules\n.env\n*.test.js",
        fileName: "backend/.dockerignore",
        caption: "Final version.",
      },
    },
    {
      text: "Build the image and run it locally against your development database. `host.docker.internal` is how a container reaches your computer; port 3001 avoids a clash with the backend still running on 3000.",
      code: {
        language: "bash",
        code: "docker build -t notes-api .\ndocker run --rm --name notes-api -p 3001:3000 --env-file .env -e NODE_ENV=production -e DATABASE_URL=postgres://postgres:dev@host.docker.internal:5432/notes notes-api",
        caption:
          'On Linux add `--add-host=host.docker.internal:host-gateway`. Expected: `Notes API listening on http://localhost:3000` (inside the container). In another terminal `curl http://localhost:3001/api/health` answers `{"status":"ok"}`. Stop it with Ctrl+C.',
      },
    },
    {
      text: "Put the project on GitHub. In the `notes-app` folder, create a git repository and the first commit. The `.gitignore` from step 8 keeps `node_modules`, `.env` and `dist` out.",
      code: {
        language: "bash",
        code: 'cd ..\ngit init -b main\ngit add .\ngit commit -m "Notes App"',
        caption: "Check with `git status` that no `.env` file was added.",
      },
    },
    {
      text: "Create an empty repository on github.com (no README), then connect it and push. Replace `YOUR-NAME` with your GitHub user name.",
      code: {
        language: "bash",
        code: "git remote add origin https://github.com/YOUR-NAME/notes-app.git\ngit push -u origin main",
      },
    },
    {
      text: "Create the database: on render.com choose **New → Postgres**, give it a name and create it. When it is ready, copy its **External Database URL** and create the tables from your computer, using the PostgreSQL client inside Docker.",
      code: {
        language: "bash",
        code: 'docker run --rm -i postgres:16 psql "PASTE-EXTERNAL-DATABASE-URL" < database/schema.sql',
        caption:
          "Expected: `CREATE TABLE` twice and `CREATE INDEX`. Don't run `seed.sql` in production: it creates a demo account with a published password.",
      },
    },
    {
      text: "Create the backend: **New → Web Service**, connect your GitHub repository, set **Root Directory** to `backend` and **Language** to Docker. Under **Environment** add `DATABASE_URL` = the database's **Internal Database URL**, `JWT_SECRET` = a new value from the command below, `NODE_ENV` = `production` and `PORT` = `3000`. Set **Health Check Path** to `/api/health` and create the service.",
      code: {
        language: "bash",
        code: "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
        caption:
          'Use a different secret from your development `.env`. When the deploy finishes, open `https://YOUR-API.onrender.com/api/health` — it answers `{"status":"ok"}`.',
      },
    },
    {
      text: "Create the frontend: **New → Static Site**, same repository, **Root Directory** `frontend`, **Build Command** `npm ci && npm run build`, **Publish Directory** `dist`. After creating it, open **Redirects/Rewrites** and add a rule: Source `/api/*`, Destination `https://YOUR-API.onrender.com/api/*`, Action **Rewrite**.",
    },
    {
      text: 'Check it worked: open `https://YOUR-SITE.onrender.com` (note the padlock: HTTPS). `https://YOUR-SITE.onrender.com/api/health` answers `{"status":"ok"}` through the rewrite. Register, log in and create a note. In the developer tools → Application → Cookies, a `token` cookie exists for your site, marked *HttpOnly* and *Secure*. Reload: you are still logged in and the note is still there.',
    },
  ],
  fromScratch: [
    "Make the app configurable only through environment variables, with a health route and a check that stops startup when a required variable is missing.",
    "Write a small Dockerfile for the backend: an official slim Node image, `npm ci --omit=dev`, copy the source, run as a non-root user, add a health check.",
    "Build the frontend with `npm run build` and serve `dist/` from a static host, on the same origin as the API (a rewrite or the backend serving the files).",
    "Create the database first, then the backend with its environment variables, then the frontend; check each piece before the next.",
    "Use a new random secret per environment, never deploy seed data, and only deploy from `main` after the tests pass.",
  ],
  filesCreated: ["backend/Dockerfile", "backend/.dockerignore"],
  filesModified: [],
  filesRemoved: [],
  conceptIds: [
    "production-build",
    "dockerfile",
    "docker-image-container",
    "environment-config",
    "hosting",
    "deploying-a-full-stack-app",
  ],
  codeExamples: [
    {
      language: "bash",
      code: "COPY package.json package-lock.json ./\nRUN npm ci --omit=dev\n\nCOPY src ./src",
      fileName: "backend/Dockerfile",
      caption:
        "Packages first, code second: changing your code doesn't reinstall the packages.",
    },
    {
      language: "bash",
      code: "docker build -t notes-api .\ndocker run --rm --name notes-api -p 3001:3000 --env-file .env -e NODE_ENV=production -e DATABASE_URL=postgres://postgres:dev@host.docker.internal:5432/notes notes-api",
      caption:
        "Build the image, then run it with production settings; the host does the same with its own variables.",
    },
  ],
  relationshipIds: [],
  enables:
    "Visit your Notes App on the internet over HTTPS, and share it with anyone.",
  commonMistakes: [
    "Deploying `frontend/src/` or running `npm run dev` on the host. Production serves the built files in `dist/` and runs the backend with `node`.",
    "Forgetting an environment variable on the host. The backend stops with *Missing environment variables*; read the host's logs and add it.",
    "Using the database's **External** URL for the web service, or the **Internal** one from your computer. Internal works only inside the host; External is for your computer.",
    "Skipping the `/api/*` rewrite. The site loads, but every API call answers with the static site's 404 page and the app shows *Something went wrong*.",
    "Copying `.env` into the image or committing it. Secrets belong in the host's environment settings; `.dockerignore` and `.gitignore` keep them out.",
    "Running `seed.sql` in production, which creates an account whose password is published in your repository.",
  ],
};
