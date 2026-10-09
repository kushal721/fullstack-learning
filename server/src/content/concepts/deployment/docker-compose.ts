import type { Concept } from "@fsl/shared";

export const dockerCompose: Concept = {
  id: "docker-compose",
  slug: "docker-compose",
  title: "Docker Compose",
  topicId: "deployment",
  summary:
    "A Docker tool that starts several containers together, such as a frontend, a backend and a database, from one `compose.yaml` file.",
  basics: [
    "A container is one running program packaged with everything it needs, started with `docker run`. Each container should do one job: one runs the backend, another runs the database.",
    "A full-stack app needs several of them at once. The Notes App has a frontend, a backend and a PostgreSQL database, and the backend must be able to talk to the database.",
    "Starting each one with a long `docker run` command full of ports, settings and names is slow and easy to get wrong, and every teammate would have to type the same commands.",
    "YAML is a simple text format for settings that uses indentation to show what belongs to what, a bit like an outline. Compose files are written in YAML.",
  ],
  what: [
    "Docker Compose reads a file called `compose.yaml` that describes all the containers of an app, called services, and how they connect. One command, `docker compose up`, starts them all and `docker compose down` stops and removes them.",
    "For each service the file says which image to use or which Dockerfile to build (`image` or `build`), which ports to publish (`ports`), which settings to pass (`environment`), which data to keep (`volumes`) and what it needs started first (`depends_on`).",
  ],
  why: [
    "The whole development setup lives in one file in the repository. A new teammate clones the project, runs `docker compose up` and has the same frontend, backend and database running in a minute, without installing PostgreSQL.",
    "Compose also creates a private network for the services, so they can find each other by name. The backend connects to `postgres:5432` and it works the same on every computer.",
  ],
  howItWorks: [
    "`docker compose up` creates a network for the project, builds any images that have a `build:` entry, then starts the containers in the order `depends_on` requires and shows all their logs in one terminal.",
    "Every service name becomes a hostname on that network. Inside the backend container, `postgres` means the database container, so the connection string is `postgres://notes:notes@postgres:5432/notes`. `localhost` there would mean the backend container itself.",
    "A named volume such as `pgdata` is storage that Docker keeps outside the container. PostgreSQL writes its data there, so your notes survive `docker compose down` and come back on the next `up`.",
    "`docker compose down` stops and removes the containers and the network but keeps named volumes. Only `docker compose down -v` deletes the volumes too, and with them the database.",
  ],
  basicExample: {
    language: "bash",
    fileName: "compose.yaml",
    code: `services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: notes
      POSTGRES_PASSWORD: notes
      POSTGRES_DB: notes
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://notes:notes@postgres:5432/notes
      JWT_SECRET: dev-only-secret
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  pgdata:`,
    caption:
      "A development stack for the Notes App: the backend reaches the database by its service name, and the pgdata volume keeps the data between restarts.",
    highlightLines: [9, 14, 19],
  },
  internals: [
    "Compose is a front end for the same Docker you already use: for each service it does what `docker run` would do with the right options, and labels everything with the project name so `down` knows what to remove.",
    "The project network has its own small DNS server. When the backend looks up the name `postgres`, Docker answers with that container's private address, even if the container was recreated and got a new one.",
    "`depends_on` only waits for the other container to start, not for the program inside to be ready. PostgreSQL needs a few seconds before it accepts connections, so add a `healthcheck` to the database service and use `condition: service_healthy`, or let the backend retry its first connection.",
    "A volume like `./frontend:/app` is a bind mount: the container sees your project folder directly, so when you save a file the dev server inside notices and reloads. A path with no source, like `/app/node_modules`, gives the container its own copy of that folder, so packages installed for Linux in the container do not clash with the ones on your computer.",
  ],
  howToCreate: [
    {
      text: "Take a small Express app with a `Dockerfile` (as in the Dockerfile concept) and install the PostgreSQL client package.",
      code: {
        language: "bash",
        code: `npm install pg`,
      },
    },
    {
      text: "Replace `server.js` with a route that asks the database for the current time, using the address from an environment variable.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

app.get("/api/time", async (req, res) => {
  const result = await pool.query("SELECT NOW() AS now");
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log("Listening on port 3000"));`,
      },
    },
    {
      text: "Create `compose.yaml` next to it with two services. The connection string uses the service name `postgres` as the hostname.",
      code: {
        language: "bash",
        fileName: "compose.yaml",
        code: `services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    environment:
      DATABASE_URL: postgres://postgres:secret@postgres:5432/postgres
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  pgdata:`,
      },
    },
    {
      text: "Start everything with one command, and stop it again with Ctrl+C followed by `docker compose down`.",
      code: {
        language: "bash",
        code: `docker compose up --build`,
      },
    },
    {
      text: "Open http://localhost:3000/api/time. You see the time reported by PostgreSQL, which proves the api container reached the database by its service name. If the very first request fails, the database was still starting; refresh after a few seconds.",
    },
  ],
  whereUsed: [
    "Local development: one command gives every developer the same database and services, without installing them.",
    "Running integration or end-to-end tests against a real database in a throwaway container.",
    "Trying out the production image locally before it is deployed.",
  ],
  connectsTo: [
    "Docker images and containers: each service is one container, started from an image or from a `Dockerfile`.",
    "Environment variables: the `environment` section is where settings like `DATABASE_URL` are passed in.",
    "The database: PostgreSQL runs as a service and stores its data in a named volume.",
    "Hosting: in production, a managed database and the host's settings usually replace Compose.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App's `compose.yaml` runs three services for local development: `frontend`, `backend` and `postgres`. The backend's `DATABASE_URL` points at `postgres:5432`, and a named volume keeps the database's data between restarts. In production the database is a managed PostgreSQL service instead.",
    },
    {
      explanation:
        "This learning platform's `compose.yaml` starts a development setup with hot reload: a `deps` service runs `npm ci` once, then `server` (Express on port 3000) and `client` (Vite on port 5173) start, both using `depends_on` to wait for it. The source folder is bind-mounted into the containers, so edits on your computer reload instantly, while `node_modules` live in named volumes so Linux packages never mix with your computer's.",
    },
    {
      explanation:
        "In that file the client is given `API_URL: http://server:3000`, so Vite forwards `/api` requests to the server by its service name. A `prod` profile adds an `app` service that builds the real production image and runs it on port 8080: `docker compose --profile prod up app`.",
    },
  ],
  commonMistakes: [
    "Using `localhost` to reach another service, e.g. `postgres://...@localhost:5432`. Inside a container that means the container itself; use the service name, `postgres:5432`.",
    "Running `docker compose down -v` without meaning to. The `-v` deletes the volumes and all the data in the database; use plain `down` to keep it.",
    "Assuming `depends_on` waits until the database is ready. It only waits for the container to start; add a health check with `condition: service_healthy` or retry the connection.",
    "Writing real production secrets into `compose.yaml`, which is committed to Git. Use throwaway values for development and set real secrets as environment variables on the host.",
  ],
  relatedConcepts: [
    "docker-image-container",
    "dockerfile",
    "environment-variables",
    "database",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
