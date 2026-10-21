import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "Deployment" topic.
export const deploymentGlossary: GlossaryEntry[] = [
  {
    id: "production-build",
    topicId: "deployment",
    term: "Production build",
    aliases: ["build", "npm run build", "dist", "bundle"],
    kind: "concept",
    short:
      "The step that turns source code into small, fast, ready-to-serve files for real users.",
    body: "`npm run build` writes the finished frontend into `dist/`: one `index.html` plus a few CSS and JavaScript files. They never change while the app runs, so any web server or [[hosting|static host]] can send them. [[vite|Vite]] does this for React.",
    conceptPageId: "production-build",
  },
  {
    id: "environment-config",
    topicId: "deployment",
    term: "Configuration per environment",
    aliases: [
      "environments",
      "config",
      "fail fast",
      "development",
      "production",
    ],
    kind: "concept",
    short:
      "Running the same code in development and production by giving each place its own settings.",
    body: "All settings come from [[environment-variables|environment variables]], so your laptop uses a local database and production the real one with no code change. A good app checks every required variable at startup and refuses to start if one is missing: failing fast.",
    conceptPageId: "environment-config",
  },
  {
    id: "docker-image-container",
    topicId: "deployment",
    term: "Docker image and container",
    aliases: ["docker", "image", "container", "containers"],
    kind: "concept",
    short:
      "An image packages an app with everything it needs; a container is that image running, isolated, on any computer.",
    body: "The image holds a small Linux, Node.js, your packages and code, plus the start command. Build it once from a [[dockerfile|Dockerfile]], copy it anywhere. Each container started from it is a separate running copy.",
    analogy:
      "An image is a recipe with all the ingredients packed in; a container is the meal cooked from it.",
    conceptPageId: "docker-image-container",
  },
  {
    id: "dockerfile",
    topicId: "deployment",
    term: "Dockerfile",
    aliases: ["docker build", "from", "cmd"],
    kind: "concept",
    short:
      "A text file of step-by-step instructions Docker follows to build an image of your app.",
    body: "`FROM` picks a starting image, `WORKDIR` a folder, `COPY` adds your files, `RUN` runs commands like `npm ci`, and `CMD` says how to start. `docker build -t notes-api .` turns it into an [[docker-image-container|image]].",
    conceptPageId: "dockerfile",
  },
  {
    id: "docker-compose",
    topicId: "deployment",
    term: "Docker Compose",
    aliases: ["compose", "compose.yaml", "docker compose up", "services"],
    kind: "concept",
    short:
      "A tool that starts several containers together, like frontend, backend and database, from one file.",
    body: "`compose.yaml` lists each service: its image or Dockerfile, ports, environment variables, stored data and what must start first. `docker compose up` starts everything and `down` stops it. Great for running the whole stack, including the [[database]], locally.",
    conceptPageId: "docker-compose",
  },
  {
    id: "ci-cd",
    topicId: "deployment",
    term: "CI/CD",
    aliases: [
      "ci",
      "cd",
      "continuous integration",
      "continuous deployment",
      "pipeline",
      "github actions",
    ],
    kind: "concept",
    short:
      "Automation that checks every change on a clean machine and, once merged, builds and ships it.",
    body: "CI runs install, lint, type checks, [[unit-test|tests]] and the build on every [[pull-request|pull request]], showing a green tick or a red cross. CD takes each merge to `main`, builds the release (such as a Docker image) and deploys it, automatically or at the press of a button.",
    conceptPageId: "ci-cd",
  },
  {
    id: "hosting",
    topicId: "deployment",
    term: "Hosting",
    aliases: ["host", "server hosting", "render", "cloud"],
    kind: "concept",
    short:
      "Renting computers on the internet that keep your frontend, backend and database running for everyone.",
    body: "Static hosting serves files from a [[production-build|production build]]; an app host keeps a backend or [[docker-image-container|container]] running; a managed database runs PostgreSQL for you. The host gives you a public address, and [[domain-dns|DNS]] gives it a nice name.",
    conceptPageId: "hosting",
  },
  {
    id: "domain-dns",
    topicId: "deployment",
    term: "Domains and DNS",
    aliases: ["dns", "domain", "a record", "cname", "registrar"],
    kind: "concept",
    short:
      "Giving your app a name like notes.example.com and using DNS records to point it at the server.",
    body: "You rent a domain yearly from a registrar. DNS turns names into IP addresses: an `A` record points a name at an address, a `CNAME` makes it an alias of another name, such as your [[hosting|host]]'s address.",
    analogy:
      "Your phone's contacts: you tap a name, and it dials the number behind it.",
    conceptPageId: "domain-dns",
  },
  {
    id: "deploying-a-full-stack-app",
    topicId: "deployment",
    term: "Deploying a full-stack app",
    aliases: ["deploy", "deployment", "going live", "release"],
    kind: "concept",
    short:
      "The path from your laptop to a live app: database, backend, frontend, HTTPS, a smoke test and safe updates.",
    body: "Create the database, run the backend with its settings, build and serve the frontend, connect them, add [[https|HTTPS]] on a domain and test the real thing. Afterwards every change takes the same safe road: pull request, green [[ci-cd|CI]], merge, automatic deploy.",
    conceptPageId: "deploying-a-full-stack-app",
  },
];
