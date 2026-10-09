import type { Concept } from "@fsl/shared";

export const ciCd: Concept = {
  id: "ci-cd",
  slug: "ci-cd",
  title: "CI/CD",
  topicId: "deployment",
  summary:
    "Automation that checks every change on a clean machine and, once it is merged, builds and ships it to production.",
  basics: [
    "A repository is the folder of code tracked by Git. Developers change it in small pieces: they commit their work on a branch, push it to GitHub, and open a pull request (PR) — a request to merge that branch into `main`, the branch that holds the real, shipped version.",
    "Before a change is merged, someone has to make sure it still works: the code is formatted, the tests pass, the app still builds. Doing that by hand on every change is slow, and people forget steps.",
    'A "clean machine" is a computer that has nothing on it except what the project says it needs. Your laptop is not clean: it has files, packages and settings you installed months ago, which is why code can "work on my machine" and fail everywhere else.',
  ],
  what: [
    "CI, continuous integration, means every push and every pull request automatically runs the project's checks — install, format check, lint, type check, tests, build — on a fresh machine in the cloud. The PR shows a green tick when everything passed and a red cross when something failed.",
    "CD means continuous delivery or continuous deployment: once a change is merged into `main`, the pipeline builds the release (for example a Docker image) and delivers it. With continuous delivery a person presses the final deploy button; with continuous deployment it goes live automatically.",
  ],
  why: [
    "A check that runs automatically on every change cannot be forgotten, and a clean machine proves the project works from its files alone, not because of something hidden on one developer's laptop. Problems are found minutes after they are written, while the change is still small and easy to fix.",
    "Shipping by hand means someone remembering a list of commands on a Friday evening. An automated pipeline does the same steps in the same order every time, so releases become boring — which is exactly what you want.",
  ],
  howItWorks: [
    "You describe the pipeline in a workflow file inside the repository. On GitHub this is a YAML file (a simple indented text format for settings) in `.github/workflows/`, and the service that runs it is called GitHub Actions.",
    "When an event happens — a push, a new PR, a merge into `main` — GitHub reads the file, starts a fresh virtual machine called a runner, downloads your code onto it and runs your steps one after another. If any step fails (a command exits with an error), the job stops and is marked as failed.",
    "In the repository settings you can mark jobs as required checks. GitHub then blocks the Merge button on a PR until those checks are green, so broken code cannot reach `main` by accident.",
    "A second workflow, triggered only by pushes to `main`, does the CD part: it builds the release, publishes it, and tells the hosting service to run the new version.",
  ],
  basicExample: {
    language: "bash",
    fileName: ".github/workflows/ci.yml",
    code: `name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`,
    caption:
      "A GitHub Actions workflow (YAML): on every pull request and every push to main, a fresh Ubuntu machine installs the project and runs lint, tests and build.",
    highlightLines: [3, 8, 10, 11, 12, 17],
  },
  internals: [
    "`on` lists the events that start the workflow. `jobs` holds one or more jobs; each job runs on its own fresh machine chosen by `runs-on` (here the latest Ubuntu Linux). Separate jobs run in parallel unless one says it `needs` another.",
    "`steps` run in order inside the job. A step with `uses` runs a ready-made action someone published: `actions/checkout` copies your repository onto the runner and `actions/setup-node` installs Node.js. A step with `run` is a plain shell command, exactly what you would type in a terminal.",
    "Every step's output is saved as a log you can open from the PR. When a step fails, the log shows the same error you would see locally, so you can reproduce it with the same command.",
    "The runner is thrown away after the job. Nothing carries over between runs except what you explicitly cache (like the npm download cache) or upload, which is why CI catches files you forgot to commit.",
  ],
  howToCreate: [
    {
      text: "In a project that is pushed to GitHub and already has `test` and `build` scripts in `package.json`, create the file `.github/workflows/ci.yml` (create the folders too). It runs your checks on every pull request and every push to `main`.",
      code: {
        language: "bash",
        fileName: ".github/workflows/ci.yml",
        code: `name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build`,
      },
    },
    {
      text: "Commit the file on a new branch, push it and open a pull request on GitHub.",
      code: {
        language: "bash",
        code: `git switch -c add-ci
git add .github/workflows/ci.yml
git commit -m "ci: run tests and build on every PR"
git push -u origin add-ci`,
      },
    },
    {
      text: "Make it required: in the repository go to Settings, then Branches (or Rules), add a rule for `main`, enable required status checks and pick `check`. From now on a red PR cannot be merged.",
    },
    {
      text: "Check it worked: on the pull request page the `CI / check` job runs and turns into a green tick; click Details to read each step's log. Then push a commit that breaks a test — the check turns red and the Merge button is blocked.",
    },
  ],
  whereUsed: [
    "Almost every professional project on GitHub, GitLab or similar: no change is merged until CI is green.",
    "Open-source projects, where CI checks pull requests from strangers before a maintainer spends time reviewing them.",
    "Automated dependency updates: tools like Dependabot open small PRs to upgrade packages, and CI is what tells you whether the upgrade broke anything.",
  ],
  connectsTo: [
    "Pull requests and branches: CI runs on each PR and shows its result there.",
    "Your test suite (unit, integration and end-to-end tests) and the production build — CI is only as good as the checks it runs.",
    "Docker images: the CD part usually builds an image and pushes it to a registry, a storage service for images.",
    "The hosting service, which receives the new version and restarts the app with it.",
  ],
  projectUsage: [
    {
      explanation:
        "This learning platform's CI workflow (`.github/workflows/ci.yml`) runs a security audit, format, lint, type check, content validation, tests, the build and a Docker build on every pull request and every push to `main`, and pull requests are only merged when it is green. `npm run check` runs the same checks locally.",
    },
    {
      explanation:
        "For the CD half, `.github/workflows/release.yml` starts when CI succeeds on `main`: it builds that exact commit and publishes the image to GitHub Container Registry as `sha-<commit>` and `latest`, then a deploy job asks Render to run that image and waits until `/api/health` on the live site reports the new commit (the deploy step switches on once the Render service exists). Dependabot opens weekly update PRs for npm packages, the Docker base image and the Actions, and each goes through the same CI.",
    },
    {
      explanation:
        "For the Notes App, a CI workflow would run the Vitest unit and integration tests and `npm run build` for the frontend on every PR, and only a green `main` would be deployed in build step 14.",
    },
  ],
  commonMistakes: [
    "Using `npm install` instead of `npm ci` in CI. `npm install` may change versions; `npm ci` installs exactly what `package-lock.json` says, so CI tests what you will actually ship.",
    "Having CI but not making it a required check, so a red PR can still be merged. Turn on required status checks for `main`.",
    "Putting passwords or tokens directly in the workflow file, where everyone who can read the repository sees them. Store them as repository secrets in the GitHub settings and reference them from the workflow.",
    "Ignoring a flaky (sometimes failing) test by re-running until it passes. It hides a real problem and teaches the team to distrust red; fix or remove the test.",
  ],
  relatedConcepts: [
    "pull-request",
    "unit-test",
    "production-build",
    "docker-image-container",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
