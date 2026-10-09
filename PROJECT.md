# Project overview

This document explains **what** the Full-Stack Learning platform is, **how
it is built**, and **where it is going**. The complete product specification
is [`FULLSTACK_LEARNING_PROJECT_SPEC.md`](./FULLSTACK_LEARNING_PROJECT_SPEC.md);
when the two disagree, the specification wins.

## Vision

Beginners are usually taught full-stack development as a list of
technologies and definitions. This platform teaches it by **building a real
application** — a Notes App — from an empty folder to a deployed website, and
by making every connection visible:

- Why does this file or folder exist?
- Where is this function defined, who calls it, and what does it call?
- How does a click in the browser become an HTTP request, a database query,
  and finally an updated screen?
- Where do authentication, authorization and validation happen?

> **Don't just learn what to write. Understand what happens when you write it.**

Every step answers: _what are we doing, why, what problem does it solve,
what are we creating, where does it belong, what does it connect to, what
changed, how do I create it from scratch, and what comes next?_

## The main systems

| System                  | What it gives the learner                                                     |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Learning Tree**       | A map of the 14 topics, from "How the Web Works" to "How Everything Connects" |
| **Concept Explorer**    | Each concept explained the same way, from the basics, linked to real code     |
| **Build Journey**       | The Notes App built step by step, each step an interactive lesson             |
| **Project Evolution**   | The project's files before and after every step                               |
| **File Explorer**       | The Notes App source, with why each file exists                               |
| **Connection Tracer**   | Click a function or component: defined in, called by, calls, leads to         |
| **Data & Request Flow** | A request followed from the button to the database and back                   |
| **Practice**            | Predict, trace, find, fix and build exercises on the same data                |
| **Search**              | One search across concepts, files, functions, steps and flows                 |

## Architecture

The platform is itself a small full-stack application, so its structure
mirrors what the learner builds.

```text
Browser
  │  React + TypeScript client (client/)
  │    pages/      one component per URL (React Router)
  │    components/ feature components + shared ui/
  │    hooks/      useApi
  │    services/   api.ts — the only code that calls fetch()
  │
  │  HTTP  GET /api/...
  ▼
Node.js + Express API (server/)
  │    routes/     one router per resource, mounted under /api
  │    lib/        logic: lookups, graph queries, snapshots, search
  │    content/    the learning content as TypeScript data
  │
  ▼
shared/ — TypeScript types for content and API responses, used by both sides
example-project/ — the Notes App source the platform teaches from (spec: docs/NOTES_APP.md)
```

- **One process in production.** The Docker image runs Express, which serves
  the API under `/api` and the built React app for every other path.
- **No database yet.** Content is structured TypeScript data on the server.
  PostgreSQL is only added if accounts or saved progress need it (M11).

### Data-driven content and one source of truth

Lessons are **not** written inside React components. Topics, concepts,
build steps, files, symbols, relationships and flows are data on the server,
and every view reads the same data through the API. A relationship such as
"`handleSave` calls `createNote`" is written once and reused by the concept
page, the file explorer, the connection graph, the build journey and the
request flow. `npm run validate` checks that every id referenced anywhere
exists.

Relationships between code symbols are written by hand in V1 — there is
deliberately no code parser yet (spec §24).

### Request path (example)

```text
TopicPage ─ useApi("/topics/html") ─ services/api.ts ─ fetch("/api/topics/html")
   → Express route (routes/topics.ts) → lib/learning-tree.ts → content/learning-tree.ts
   ← JSON (type from shared/) ← … ← rendered page
```

## MVP scope

Included: Learning Tree, Concept Explorer, Build Journey with project
evolution, the Notes App (frontend, backend, database, representative
code), File Explorer, Code Viewer, Connection Tracer, data flow and
frontend → backend → database flow.

Not in the first MVP: accounts, saved progress, an AI tutor, advanced
practice, automatic code parsing, multiple frameworks, collaboration,
gamification.

## Roadmap

Work is tracked as GitHub issues grouped into
[milestones](https://github.com/kushal721/fullstack-learning/milestones):

| Milestone                          | Outcome                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| M1 — Foundation                    | Monorepo, client, API, tests, Docker, CI/CD, docs, application shell |
| M2 — Learning Tree                 | Topic data, validation, topics API, tree UI, topic pages             |
| M3 — Concept Explorer              | Concept model and API, concept pages, the concept library            |
| M4 — Example Project               | Notes App spec and source, files API, file explorer, code viewer     |
| M5 — Project Evolution             | Build steps, snapshots and diffs, build journey, step content        |
| M6 — Connection Tracer             | Symbols and relationships, graph API, interactive connection graph   |
| M7 — Data & Request Flow           | Flow model and API, flow visualization, HTTP details                 |
| M8 — Security                      | Authentication/authorization flows and security concepts             |
| M9 — Practice                      | Exercise model, server-side checking, five practice modes            |
| M10 — Polish                       | Search, error states, API hardening, responsive, a11y, performance   |
| M11 — Optional Database & Accounts | Only if accounts/progress are actually needed                        |

Issues are numbered by milestone and parent (for example `[M06.2.1]`) and
grouped into **waves**: an issue's wave is one more than the highest wave
of the issues it depends on. See [CONTRIBUTING.md](./CONTRIBUTING.md).
