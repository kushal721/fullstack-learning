import type { Concept } from "@fsl/shared";

export const dockerfile: Concept = {
  id: "dockerfile",
  slug: "dockerfile",
  title: "Dockerfile",
  topicId: "deployment",
  summary:
    "A text file of step-by-step instructions that Docker follows to build an image of your app.",
  basics: [
    "A Docker image is a package containing your app and everything it needs to run, and a container is that image running. Before you can run a container, the image has to be built.",
    "You could set up a server by hand: install Node.js, copy the code, run `npm install`, start the app. Steps done by hand get forgotten or done slightly differently each time.",
    "A Dockerfile writes those steps down as a recipe. It is a plain text file, literally named `Dockerfile` with no extension, placed in the root of the project it packages.",
  ],
  what: [
    "A Dockerfile is a list of instructions, one per line, each starting with a keyword in capitals: `FROM` picks the starting image, `WORKDIR` sets the folder to work in, `COPY` copies files from your project into the image, `RUN` runs a command while building, `EXPOSE` documents the port the app listens on and `CMD` is the command that starts the app when a container runs.",
    "`docker build -t notes-api .` reads the Dockerfile in the current folder (the `.`) and produces an image named `notes-api`.",
  ],
  why: [
    "The recipe is code: it lives in Git next to the app, is reviewed like any other change and builds the same image on every computer and in every CI run.",
    "How you write it decides how fast builds are, how big the image is and how safe it is. A careless Dockerfile reinstalls every package on each build, ships hundreds of megabytes of tools and runs as an all-powerful user.",
  ],
  howItWorks: [
    "Docker runs the instructions from top to bottom. Each instruction creates a layer, a saved snapshot of the files it changed, and the image is those layers stacked on top of each other.",
    "Docker caches layers. If an instruction and the files it uses are unchanged since the last build, Docker reuses the saved layer instead of running it again. Once one step changes, every step after it runs again.",
    "That is why a good Dockerfile copies `package.json` and `package-lock.json` first and runs `npm ci` before copying the rest of the code. Code changes all the time but dependencies rarely do, so the slow install is usually taken from the cache and a rebuild takes seconds.",
    "`CMD` does not run during the build. It is stored in the image and runs each time a container starts.",
  ],
  basicExample: {
    language: "bash",
    code: `FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
    fileName: "Dockerfile",
    caption:
      "A production Dockerfile for a small Express API: dependencies are installed before the code is copied so they stay cached, and the app runs as the non-root node user.",
    highlightLines: [4, 5, 7, 10],
  },
  internals: [
    "`node:22-alpine` is an official image with Node.js 22 installed on Alpine, a tiny Linux distribution. Starting from a small base keeps your image small, which makes it faster to upload, download and start.",
    "A `.dockerignore` file lists what `COPY . .` must skip, just like `.gitignore`. Without it, your local `node_modules`, `dist` and `.env` files would be sent into the image, making builds slow and possibly leaking secrets.",
    "A multi-stage build uses several `FROM` lines. Early stages contain compilers and development packages to build the app; the last stage starts again from a clean base and copies in only the finished output with `COPY --from=build`. Everything else is thrown away, so the final image stays small.",
    "By default a container runs as `root`, the all-powerful user. If an attacker breaks into your app, `USER node` limits what they can do, because the official Node.js images include an unprivileged user called `node`. `HEALTHCHECK` gives Docker a command to run regularly, so a container that is running but no longer answering requests is marked unhealthy.",
  ],
  howToCreate: [
    {
      text: "Start from a small Express app (`server.js` listening on port 3000, with `express` installed). Add a `.dockerignore` next to it so local files stay out of the image.",
      code: {
        language: "bash",
        fileName: ".dockerignore",
        code: `node_modules
.env
.git`,
      },
    },
    {
      text: "Create the `Dockerfile` in the same folder.",
      code: {
        language: "bash",
        fileName: "Dockerfile",
        code: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
    },
    {
      text: "Build the image and run it.",
      code: {
        language: "bash",
        code: `docker build -t notes-api .
docker run -p 3000:3000 notes-api`,
      },
    },
    {
      text: "Open one of your app's routes, such as http://localhost:3000/api/health, to check it answers from inside the container. Then change a line in `server.js` and run `docker build -t notes-api .` again: the output shows `CACHED` for the `npm ci` step, because `package*.json` did not change, so the rebuild is fast.",
    },
  ],
  whereUsed: [
    "In the root of every backend that is deployed as a container, such as the Notes App's `backend/Dockerfile`.",
    "In CI pipelines and on hosting services, which run `docker build` with it to produce the image that is deployed.",
  ],
  connectsTo: [
    "Docker images and containers: the Dockerfile is the recipe, the image is the result, the container is the image running.",
    "The production build: a multi-stage Dockerfile often runs `npm run build` in one stage and keeps only its output.",
    "Docker Compose, which can build images from Dockerfiles with `build:` and run them together.",
    "Environment variables: `ENV` sets defaults in the image, and the real values are passed when the container starts.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App backend is plain JavaScript with nothing to compile, so `backend/Dockerfile` can stay a simple single-stage recipe like the example above that installs production packages, copies the code and starts it with `node`. Secrets like `JWT_SECRET` are not in the Dockerfile; the host passes them as environment variables.",
    },
    {
      explanation:
        "This learning platform's `Dockerfile` is a real multi-stage example. The `deps` stage installs all packages, the `build` stage compiles the TypeScript server and builds the React client, and the `runtime` stage starts again from `node:22-alpine`, installs only the server's production packages and copies in just the two `dist` folders.",
    },
    {
      explanation:
        "Its runtime stage also sets `NODE_ENV=production`, switches to `USER node` so the app never runs as root, and has a `HEALTHCHECK` that requests `/api/health` every 30 seconds. Its `.dockerignore` keeps `node_modules`, `dist`, `.git` and `.env` files out of the build.",
    },
  ],
  commonMistakes: [
    "Writing `COPY . .` before `RUN npm ci`. Every code change then invalidates the cache and reinstalls all packages; copy `package*.json` and install first.",
    "Forgetting `.dockerignore`, so your local `node_modules` (built for your operating system) and `.env` secrets end up in the image. Add a `.dockerignore` listing them.",
    "Using `RUN` to start the server, e.g. `RUN node server.js`. `RUN` happens during the build, so the build never finishes; start the app with `CMD`.",
    "Shipping build tools and development packages in the final image. Use `npm ci --omit=dev`, or a multi-stage build that copies only the finished output.",
  ],
  relatedConcepts: [
    "docker-image-container",
    "docker-compose",
    "production-build",
    "npm-packages",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
