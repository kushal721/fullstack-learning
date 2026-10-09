# Full-Stack Learning

An interactive platform that teaches beginners how full-stack web development
actually works, by guiding them through building a real application (a Notes
App) from an empty project to a deployed website.

> **Don't just learn what to write. Understand what happens when you write it.**

- [PROJECT.md](./PROJECT.md) — vision, systems, architecture, roadmap
- [CONTRIBUTING.md](./CONTRIBUTING.md) — workflow, conventions, checks
- [Product specification](./FULLSTACK_LEARNING_PROJECT_SPEC.md) — the source of truth

## Stack

- **Client:** React + TypeScript (Vite)
- **API:** Node.js + Express + TypeScript
- **Shared:** TypeScript types used by both
- npm workspaces monorepo, ESLint, Prettier, Docker, GitHub Actions

## Requirements

- Node.js 22 (see `.nvmrc`) and npm
- Docker (optional)

## Getting started

```bash
npm install
npm run dev
```

- Client (Vite): <http://localhost:5173>, which forwards `/api` requests to the API
- API (Express): <http://localhost:3000/api/health>

## Run with Docker

### Development (hot reload)

```bash
docker compose up
```

- Client: <http://localhost:5173> (forwards `/api` to the server container)
- API: <http://localhost:3000/api/health>

Your source folder is mounted into the containers, so saving a file reloads
the server or updates the page. Dependencies are installed inside the
containers (in Docker volumes) because some packages need Linux builds. After
changing dependencies, run `docker compose run --rm deps` (or
`docker compose down -v` to start fresh).

### Production image

The production image runs one Node.js process that serves the API under
`/api` and the built React app for every other path.

```bash
docker compose --profile prod up --build app   # http://localhost:8080
```

or without Compose:

```bash
docker build -t fullstack-learning .
docker run --rm -p 3000:3000 fullstack-learning   # http://localhost:3000
```

The container reports its health using `/api/health`.

## How changes reach production

```text
issue → branch → pull request → CI (format, lint, typecheck, test, build,
Docker build) → review → merge to main → Docker image published to GitHub
Container Registry → deployed to Render → health check
```

CI is set up in #122, image publishing in #123 and deployment in #124.

See the [roadmap milestones](https://github.com/kushal721/fullstack-learning/milestones)
for what comes next.

## Scripts

| Command                | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Run client and API together with reload                         |
| `npm run lint`         | Lint the whole repo with ESLint                                 |
| `npm run format`       | Format files with Prettier                                      |
| `npm run format:check` | Check formatting without changing files                         |
| `npm run typecheck`    | Type-check every workspace                                      |
| `npm test`             | Run tests in every workspace                                    |
| `npm run build`        | Build every workspace                                           |
| `npm run validate`     | Check learning content ids and references                       |
| `npm run check`        | Run every CI check (format, lint, types, content, tests, build) |

### Make (optional)

If you have `make`, the same tasks have short names. Run `make` on its own to
list them. Every target just calls the npm script or Docker command above, so
npm works everywhere (including Windows) and `make` is a convenience.

| Command            | What it does                                      |
| ------------------ | ------------------------------------------------- |
| `make install`     | `npm ci` — install exactly what the lockfile says |
| `make dev`         | Run the API and client with reload                |
| `make check`       | Run every CI check                                |
| `make test`        | Run all tests                                     |
| `make docker-dev`  | Dev stack in Docker (`docker compose up`)         |
| `make docker-prod` | Production image with Compose on :8080            |
| `make docker-run`  | Build and run the production image on :3000       |
| `make clean`       | Delete build output and coverage                  |
