import type { Concept } from "@fsl/shared";

export const hosting: Concept = {
  id: "hosting",
  slug: "hosting",
  title: "Hosting",
  topicId: "deployment",
  summary:
    "Renting computers on the internet that keep your frontend, backend and database running so anyone can reach them.",
  basics: [
    'While you build, everything runs on your laptop: `localhost` means "this computer", so only you can open it, and it stops when you close the lid.',
    "For other people to use your app it has to run on a computer that is always on, connected to the internet, and reachable at a public address. Those computers are called servers, and they live in data centres.",
    "A full-stack app has three parts that need a home: the frontend (HTML, CSS and JavaScript files the browser downloads), the backend (a program like an Express server that must keep running) and the database (which must keep data safe for years).",
  ],
  what: [
    "Hosting is paying a company (or using a free tier) to run those parts for you. You give the host your code or a Docker image, and it gives you a public address where the app answers.",
    "There are three common kinds: static hosting for files that never change on the server, an app or container host that keeps a backend process running, and a managed database where the provider runs PostgreSQL for you, including backups and updates.",
  ],
  why: [
    "Running your own server at home means keeping a machine on day and night, configuring your router, renewing certificates, installing security updates and restarting things when they crash. A host does that work so you can focus on the app.",
    "Hosts are built for failure: if your process crashes they restart it, if the hardware dies they move you to another machine, and if traffic grows they can run more copies. Doing that yourself takes a team.",
  ],
  howItWorks: [
    "For the frontend, `npm run build` turns your React code into plain files in a `dist/` folder. A static host copies those files to many servers around the world (a CDN, content delivery network) and sends them to browsers quickly. There is no program running, so it is cheap or free.",
    "For the backend, you connect the host to your repository or give it a Docker image. It starts your process with the command you choose, passes it the environment variables you set in its dashboard, and forwards internet traffic to the port your app listens on.",
    "For the database, you create a PostgreSQL instance in the provider's dashboard and receive a connection string. You put that string into the backend's `DATABASE_URL`, and the database is never exposed to browsers.",
    "A simpler variant runs everything in one process: the backend serves the API under `/api` and also sends the built frontend files for every other path. Then you host one service instead of two, and the browser and API share one address.",
  ],
  basicExample: {
    language: "js",
    fileName: "backend/src/server.js",
    code: `import express from "express";
import path from "node:path";

const app = express();
const distDir = path.resolve("../frontend/dist");

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Everything that is not /api: the built React app.
app.use(express.static(distDir));
app.use((req, res) => res.sendFile(path.join(distDir, "index.html")));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(\`Listening on \${port}\`));`,
    caption:
      "One Express process serves both the API and the built frontend, and listens on the port the host gives it in PORT — the easiest shape to host.",
    highlightLines: [10, 11, 13],
  },
  internals: [
    "A host runs your process inside an isolated container or small virtual machine. It sets `PORT` and expects your app to listen on it; a router in front of your container receives the HTTPS traffic for your address and forwards it there.",
    "The host terminates HTTPS: it holds the certificate, decrypts the request and passes plain HTTP to your process on its private network. That is why your Express code does not need to deal with certificates.",
    "Health checks keep things running. The host regularly requests a URL such as `/api/health`; if it stops answering, the host restarts the process. During a deploy it starts the new version, waits until the health check passes, and only then sends traffic to it.",
    "Your process's disk is usually temporary: files written there can disappear on the next restart or deploy. That is why data belongs in the database and uploaded files in a storage service, never in local files.",
  ],
  howToCreate: [
    {
      text: "Make your backend host-friendly: listen on `process.env.PORT`, read every setting from environment variables, and add a health route.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
const app = express();

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(\`Listening on \${port}\`));`,
      },
    },
    {
      text: "Make sure `package.json` has a `start` script — this is the command most hosts run.",
      code: {
        language: "json",
        fileName: "package.json",
        code: `{
  "type": "module",
  "scripts": {
    "start": "node server.js"
  }
}`,
      },
    },
    {
      text: "Run it the way a host would: with a different port set from outside and no development tools.",
      code: {
        language: "bash",
        code: `npm install express
PORT=8080 npm start
curl http://localhost:8080/api/health`,
      },
    },
    {
      text: 'Check it worked: `curl` prints `{"status":"ok"}` and the log says `Listening on 8080`, proving the app takes its port from the environment. Push the project to GitHub, create a web service on a host of your choice pointing at the repository with the start command `npm start`, and open the public URL it gives you followed by `/api/health`.',
    },
  ],
  whereUsed: [
    "Every website and API you use: personal portfolios on static hosts, startups on app platforms, large companies on cloud providers with their own operations teams.",
    "Choosing a host as a beginner: pick one that can run a Node.js app or Docker image, offers managed PostgreSQL, sets up HTTPS automatically, shows logs, and has a free or low-cost tier. Check what happens when you outgrow the free tier — some sleep after inactivity or delete free databases after a while.",
  ],
  connectsTo: [
    "The production build, which creates the static files the frontend host serves.",
    "Docker images, which many hosts accept as the exact package to run.",
    "Configuration per environment: the host's dashboard is where production environment variables live.",
    "Domains and DNS, which give your hosted app a memorable name instead of the host's default address.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App is deployed in build step 14 as a Docker image built from `backend/Dockerfile` that runs the backend with `node`, a managed PostgreSQL database, and the frontend built with `npm run build` into `frontend/dist/`. The host provides HTTPS and the environment variables.",
    },
    {
      explanation:
        "This learning platform uses the one-process approach: its multi-stage `Dockerfile` builds one small `node:22-alpine` image in which a single Node.js process serves the API under `/api` and the built React client for everything else, with a `HEALTHCHECK` on `/api/health`. It is planned to be deployed to Render.",
    },
  ],
  commonMistakes: [
    "Hard-coding the port (`app.listen(3000)`). Many hosts choose the port and pass it in `PORT`; if you ignore it, the host's health check never reaches your app and the deploy fails.",
    "Saving data to files on the server's disk. They vanish on restart or redeploy; store data in the database.",
    "Exposing the database to the whole internet with a weak password. Use the provider's private connection where possible and let only the backend connect.",
    "Choosing a host by marketing alone. Compare the boring details instead: does it run your stack, can you see logs, is HTTPS automatic, what are the limits of the free tier.",
  ],
  relatedConcepts: [
    "production-build",
    "docker-image-container",
    "environment-config",
    "domain-dns",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
