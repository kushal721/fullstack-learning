# Full-Stack Learning

An interactive platform that teaches beginners how full-stack web development
actually works, by guiding them through building a real application (a Notes
App) from an empty project to a deployed website.

> **Don't just learn what to write. Understand what happens when you write it.**

The product specification lives in
[`FULLSTACK_LEARNING_PROJECT_SPEC.md`](./FULLSTACK_LEARNING_PROJECT_SPEC.md).

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
```

Running the client and API is set up in upcoming issues; see the
[roadmap milestones](https://github.com/kushal721/fullstack-learning/milestones).

## Scripts

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run lint`         | Lint the whole repo with ESLint         |
| `npm run format`       | Format files with Prettier              |
| `npm run format:check` | Check formatting without changing files |
| `npm run typecheck`    | Type-check every workspace              |
| `npm test`             | Run tests in every workspace            |
| `npm run build`        | Build every workspace                   |
