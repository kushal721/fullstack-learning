# Contributing

This project teaches how software is built, so the way it is built is part
of the lesson. Please follow this workflow even for small changes.

## Workflow

```text
GitHub issue → branch → implement → run checks → review the diff
  → commit → push → pull request → review → fix feedback → merge
  → delete branch → next issue
```

- Never commit directly to `main`.
- One focused issue per branch and pull request.
- Link the issue in the PR description with `Closes #<number>`.
- Merge with **squash**, using the PR title (a conventional commit) as the
  commit message.

## Branch names

```text
feature/<short-name>    new behaviour
fix/<short-name>        bug fix
refactor/<short-name>   restructuring without behaviour change
docs/<short-name>       documentation only
chore/<short-name>      tooling, config, CI, dependencies
```

Examples: `feature/learning-tree`, `fix/tree-navigation`, `chore/ci-workflow`.

## Commit messages

Use [conventional commits](https://www.conventionalcommits.org/):

```text
feat: add interactive learning tree
fix: preserve selected learning node
refactor: extract reusable tree node
docs: add project architecture
test: cover topic API errors
chore: update dependencies
ci: publish image to GHCR
```

Never use messages like `update`, `changes`, `fix stuff` or `final`.

A **commit-msg** hook (`scripts/check-commit-msg.mjs`) rejects messages that
don't start with one of `feat`, `fix`, `refactor`, `docs`, `test`, `chore`,
`ci`, `build`, `perf`, `style`, `revert`, an optional `(scope)` in lowercase,
an optional `!` for breaking changes, then `: ` and a description — with a
first line under 100 characters. Merge, revert and `fixup!` commits are
allowed. Because PRs are squash-merged, the **PR title** becomes the commit
on `main`, so give it the same format.

## Issues

Every issue has a title prefix and a metadata table.

**Prefix:** `[M06.2.1][FE] Build connection graph`

- `M06` — milestone 6; `.2` — parent issue 2 in that milestone; `.1` —
  sub-issue 1 of that parent. Sub-issues always share their parent's prefix
  and are linked as GitHub sub-issues.
- `[FE]` — area:

| Area                           | Meaning                                               |
| ------------------------------ | ----------------------------------------------------- |
| `FE`                           | Platform client (React)                               |
| `BE`                           | Platform API (Node.js/Express)                        |
| `DATA`                         | Shared types and content data/logic                   |
| `CONTENT`                      | Learning content (written explanations)               |
| `OPS`                          | Tooling, Docker, CI/CD                                |
| `DOCS`                         | Documentation                                         |
| `APP-FE` / `APP-BE` / `APP-DB` | The example Notes App's own frontend/backend/database |

**Metadata:** ID, Type (parent/sub-issue), Parent, Milestone, Area,
**Size** (S ≤ half a day, M ≈ 1 day, L = 2–3 days) and **Wave** (an issue's
wave is one more than the highest wave of the issues it depends on, so all
issues in a wave can be worked on in parallel).

**Sections:** Goal · Why · Requirements · Scope · Acceptance Criteria · Out
of Scope · Dependencies (_Depends on these issues_ / _Blocks these issues_,
also set as GitHub "blocked by" links).

Issues must be small enough for one focused cycle and detailed enough to be
implemented without further questions. Split big work (data model, API, UI,
interaction, content) instead of opening one huge issue.

## Git hooks

`npm install` installs a **pre-commit** hook (with
[simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)). On every
commit, [lint-staged](https://github.com/lint-staged/lint-staged) runs on the
files you are committing only:

- `*.ts, *.tsx, *.js, *.mjs` → `eslint --fix`, then `prettier --write`
- `*.json, *.md, *.yml, *.yaml, *.css, *.html` → `prettier --write`

A second hook, **commit-msg**, checks the commit message format (see
[Commit messages](#commit-messages)).

Fixed files are included in the commit automatically. If ESLint finds a
problem it cannot fix, the commit is stopped and the error is shown — fix it
and commit again. Typecheck, tests and build are not run in the hook (they
are slower); CI runs them.

If the hook is missing (for example after cloning with `--ignore-scripts`),
run `npm run prepare`. Skipping it with `git commit --no-verify` is for
emergencies only; CI will still catch the problem.

Run these from the repository root before opening a PR. CI runs the same
commands and a PR can only merge when they pass.

```bash
npm run format:check   # Prettier (run `npm run format` to fix)
npm run lint           # ESLint for the whole repo
npm run typecheck      # TypeScript in every workspace
npm test               # Vitest in every workspace
npm run build          # production build of client and server
npm run validate       # learning content ids and references
```

CI also runs `npm audit --audit-level=high` and fails on known high or
critical vulnerabilities. If a vulnerable package has no fixed version yet,
pin a safe version with an npm `overrides` entry and explain it in the PR —
never lower the audit level for everything.

`npm run validate` checks the learning content: ids are unique and every
reference (topic → concept, step → file, …) points at something that exists.
It runs `validateContent()` in `server/src/lib/validation.ts`. **Every issue
that adds a kind of content data must extend `validateContent()`** with the
checks for its own ids and references, and add a test for each new error.

## Dependency updates

[Dependabot](.github/dependabot.yml) opens pull requests every Monday for
npm packages (minor/patch updates of dev tools are grouped into one PR), the
Docker base image and GitHub Actions. To review one:

1. Read the linked release notes or changelog, especially for major versions.
2. Wait for CI to pass.
3. Squash-merge. If an update breaks something, fix it on the same branch or
   close the PR with a comment explaining why.

### Client (`client/`)

- Pages in `src/pages/`, feature components in `src/components/<feature>/`,
  shared building blocks in `src/components/ui/`.
- Data comes only from `src/services/api.ts`, usually via the `useApi` hook.
  Components never call `fetch` themselves.
- Use `Loading`, `ErrorState` and `NotFoundState` for those states.
- Accessible by default: semantic HTML, one `<h1>` per page (`PageHeader`),
  keyboard support, visible focus, labels that don't rely on colour alone.

### API (`server/`)

- One router per resource in `src/routes/<resource>.ts`, mounted under `/api`.
- Logic in `src/lib/`, content in `src/content/`; routes stay thin.
- Request/response types live in `shared/` so client and server agree.
- Errors use `{ error: { code, message } }`; unknown ids return 404; the
  central error handler never leaks internal details.
- Every endpoint has Supertest tests (success, 404, invalid input).
- Configuration comes from environment variables via `src/config.ts` only.

### Shared (`shared/`)

- Types only, imported with `import type`. It has no build step; adding
  runtime code here would require one.

### Content

- Beginner-friendly, starts from the basics, technically accurate, explains
  cause and effect, always answers _why_, and connects to the real Notes App
  code (spec §41–44).

## Code principles

1. Prefer reusable components over duplicated UI.
2. Prefer structured data over duplicated content.
3. Separate content from presentation, and visualization logic from data.
4. Never duplicate relationship information — one source of truth.
5. Keep components focused and composable.
6. Don't add an abstraction until a pattern has actually repeated, and never
   just because it looks "professional".
7. Favour understandable code over clever code.
8. Don't add a dependency without explaining why in the PR.

## Working with AI coding agents

AI assistance is welcome, but the developer must understand and review
every change (spec §38–39).

Before implementing an issue the agent should inspect the repository and
related code, find the smallest set of files to change, follow existing
conventions, and reuse existing components and data. After implementing it
should run all checks, inspect the diff, and report what changed and any
unresolved problems. It must not silently redesign the architecture; when a
requirement is ambiguous it picks the simplest option consistent with the
specification and documents the assumption in the PR.
