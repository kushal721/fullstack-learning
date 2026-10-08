# Full-Stack Learning

An interactive platform that teaches beginners how full-stack web development
actually works — by guiding them through building a real application (a Notes
App) from an empty project to a deployed website.

> **Don't just learn what to write. Understand what happens when you write it.**

The full product specification lives in
[`FULLSTACK_LEARNING_PROJECT_SPEC.md`](./FULLSTACK_LEARNING_PROJECT_SPEC.md).

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React
- TypeScript (strict)
- Tailwind CSS
- ESLint

## Getting started

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Scripts

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Create a production build            |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | Run ESLint                           |
| `npm run typecheck` | Run the TypeScript compiler (no emit) |

## Development workflow

Work is issue-driven: every change starts from a GitHub Issue, happens on its
own branch (`feature/…`, `fix/…`, `docs/…`, `chore/…`), and lands through a
pull request. See the
[milestones](https://github.com/kushal721/fullstack-learning/milestones) for
the roadmap.
