import type { Concept } from "@fsl/shared";

export const dockerImageContainer: Concept = {
  id: "docker-image-container",
  slug: "docker-image-container",
  title: "Docker images and containers",
  topicId: "deployment",
  summary:
    "A Docker image packages an app together with everything it needs to run, and a container is that image running as an isolated program on any computer.",
  basics: [
    "To run a Node.js server, a computer needs the right version of Node.js, the app's code, its installed packages and sometimes system tools. Your laptop has all of that set up; a server or a teammate's computer may have a different version or something missing.",
    'That is where the classic excuse "it works on my machine" comes from: the code is the same, but the environment around it is different, so it behaves differently or does not start at all.',
    "Docker is a tool that solves this by packaging the environment together with the code. To use it on your computer you install Docker Desktop, which provides the `docker` command in the terminal.",
  ],
  what: [
    "An image is a read-only package that contains your app plus its runtime: a minimal Linux file system, Node.js, your `node_modules` and your code, together with the command that starts it. You build it once and can copy it to any computer that has Docker.",
    "A container is a running image. Starting an image creates a container, a normal program that sees only the files from its image. You can start many containers from the same image, just as you can open many windows of the same app.",
  ],
  why: [
    "The image is identical everywhere, so if it works on your laptop it works on a teammate's laptop, in the CI pipeline and on the production server. Nobody has to install the right Node.js version by hand.",
    "Containers are isolated from each other and from your computer, so two apps that need different versions of Node.js or PostgreSQL can run side by side without conflicts, and removing a container leaves nothing behind.",
  ],
  howItWorks: [
    "You describe how to build the image in a file called a `Dockerfile`, then run `docker build -t notes-api .`, which creates the image and gives it the name (tag) `notes-api`.",
    "`docker run -p 3000:3000 notes-api` starts a container from it. Inside the container the app listens on port 3000, but the container has its own private network, so nothing outside can reach it yet.",
    "The `-p 3000:3000` option publishes the port: the left number is the port on your computer, the right number is the port inside the container. With it, http://localhost:3000 on your computer is forwarded into the container. `-p 8080:3000` would make it reachable on port 8080 instead.",
    "`docker ps` lists the running containers with their ids and ports, and `docker stop` followed by an id or name stops one.",
  ],
  basicExample: {
    language: "bash",
    code: `docker build -t notes-api .
docker run -d --name api -p 3000:3000 notes-api
docker ps
# CONTAINER ID  IMAGE      STATUS        PORTS                    NAMES
# 3f2c9a1b7d4e  notes-api  Up 5 seconds  0.0.0.0:3000->3000/tcp   api
docker stop api`,
    caption:
      "Build an image, run it as a container in the background (-d) with port 3000 published, see it listed, then stop it.",
    highlightLines: [2],
  },
  internals: [
    "A container is not a separate computer. It is an ordinary process on the host that the Linux kernel isolates: it gets its own view of the file system, network and process list, and limits on how much memory and CPU it can use.",
    "That is the difference from a virtual machine. A virtual machine simulates a whole computer with its own operating system, which takes gigabytes and minutes to start; containers share the host's kernel, so they start in about a second and an image is often well under 200 MB.",
    "Containers need a Linux kernel. On macOS and Windows, Docker Desktop quietly runs one small Linux virtual machine and starts all your containers inside it.",
    "An image is made of layers, one for each step that built it. A container adds a thin writable layer on top. Files the app writes there disappear when the container is removed, which is why databases store their data in volumes instead.",
  ],
  howToCreate: [
    {
      text: "Make a tiny Express app in a new folder.",
      code: {
        language: "bash",
        code: `npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js` with one route.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
const app = express();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Listening on port 3000"));`,
      },
    },
    {
      text: "Create a `Dockerfile` next to it. Each line is explained in the Dockerfile concept; for now it says: start from Node.js 22, copy the app in, install packages and run `server.js`.",
      code: {
        language: "bash",
        fileName: "Dockerfile",
        code: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
    },
    {
      text: "With Docker Desktop running, build the image and start a container from it.",
      code: {
        language: "bash",
        code: `docker build -t notes-api .
docker run -p 3000:3000 notes-api`,
      },
    },
    {
      text: 'Open http://localhost:3000/api/health and you see `{"status":"ok"}`, served from inside the container. In a second terminal, `docker ps` shows it running; `docker stop` with the id from that list stops it, and the page no longer loads.',
    },
  ],
  whereUsed: [
    "Deploying backends: hosting services take an image and run it as a container, so production runs exactly what you tested.",
    "Running services you need during development, such as PostgreSQL, without installing them on your computer.",
    "CI pipelines, which build the image on every change to prove it still builds and starts.",
  ],
  connectsTo: [
    "The `Dockerfile`, the recipe an image is built from.",
    "Docker Compose, which starts several containers together, for example a backend and its database.",
    "Environment variables, passed with `docker run -e NAME=value`, which give the same image different settings in development and production.",
    "Hosting and CI/CD, which build images and run them as containers for you.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App backend is packaged as a Docker image built from `backend/Dockerfile`. The host runs it as a container with `DATABASE_URL`, `JWT_SECRET` and `PORT` set as environment variables, so the same image works with any database.",
    },
    {
      explanation:
        "This learning platform runs as one container: its image contains the Express server and the built React client, and it listens on port 3000 inside the container. Its CI workflow builds that image on every pull request.",
    },
  ],
  commonMistakes: [
    "Forgetting `-p`. The app runs inside the container, but http://localhost:3000 does not load. Publish the port with `-p 3000:3000`.",
    "Making the app listen only on `localhost` inside the container. Then it accepts connections only from inside the container itself; listen on all addresses (`0.0.0.0`), which Express does by default, and start dev servers like Vite with `--host 0.0.0.0`.",
    "Changing the code and expecting the running container to update. The image is a snapshot; run `docker build` again and start a new container.",
    "Storing important data inside a container. It is lost when the container is removed; store it in a volume or a managed database.",
  ],
  relatedConcepts: [
    "dockerfile",
    "docker-compose",
    "hosting",
    "environment-variables",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
