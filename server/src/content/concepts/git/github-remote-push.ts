import type { Concept } from "@fsl/shared";

export const githubRemotePush: Concept = {
  id: "github-remote-push",
  slug: "github-remote-push",
  title: "GitHub, remotes and push",
  topicId: "git",
  summary:
    "How you copy your commits from your own computer to a repository on GitHub, so they are backed up and others can see them.",
  basics: [
    "A Git repository is a project folder whose history Git records. That history is made of commits: saved snapshots of your files, each with a message saying what changed. Until now, all of it lives only on your own computer.",
    "GitHub is a website that stores Git repositories on its servers. It also adds tools around them, such as issues (a to-do list for the project) and pull requests (a way to ask for a change to be merged).",
    "A remote is Git's name for another copy of the same repository that lives somewhere else, usually on GitHub. Your local copy and the remote copy are separate: nothing travels between them until you tell Git to send or fetch commits.",
  ],
  what: [
    "`git remote add origin <url>` tells your local repository where its copy on GitHub is and gives it a short nickname. `origin` is the usual name for the main remote.",
    "`git push` sends your new commits from your computer to the remote, and `git pull` brings commits from the remote down to your computer. Both only move commits; uncommitted changes stay where they are.",
  ],
  why: [
    "A laptop can be lost, stolen or broken. Commits that exist only on it are gone with it; commits you pushed are safe on GitHub. That is why you push often, not only when the work is finished.",
    "Other people (and automatic checks) can only see work that is on GitHub. Pushing your branch is the step that makes it possible to open a pull request, get a review and share your progress.",
  ],
  howItWorks: [
    "A remote is just a name and a URL stored in your repository's settings. `git remote -v` lists them, so you can always check where a push will go.",
    "`git push -u origin feature/x` sends the branch `feature/x` to `origin`. If GitHub does not have that branch yet, it creates it. The `-u` flag remembers the link between your local branch and the remote one, so next time a plain `git push` or `git pull` is enough.",
    "`git pull` first downloads the new commits from the remote and then combines them with your local branch. Running it on `main` before you start new work makes sure you build on the latest version.",
    "GitHub must know who you are before it accepts a push. The easiest way is the GitHub CLI: run `gh auth login` once and follow the prompts, and Git uses that login from then on.",
  ],
  basicExample: {
    language: "bash",
    code: `git remote add origin https://github.com/ana/notes-app.git
git remote -v
git switch -c feature/note-form
git commit -m "feat: add note form"
git push -u origin feature/note-form`,
    caption:
      "Connect the local repository to GitHub once, then push a branch; -u remembers the link so later pushes are just git push.",
    highlightLines: [1, 5],
  },
  internals: [
    "Git keeps a local note of where each remote branch was the last time you talked to it, called a remote-tracking branch, such as `origin/main`. `git status` compares your branch with it and says things like \"Your branch is ahead of 'origin/main' by 2 commits\".",
    "When you push, Git asks the remote which commits it already has and sends only the missing ones. Commits are identified by their hash (a long id calculated from their contents), so the same commit is never stored twice.",
    "A push is refused if the remote branch has commits you don't have, because accepting yours would throw theirs away. Git tells you to pull first; after pulling, your push goes through.",
    "Everything you push stays in the history on GitHub, even if a later commit deletes the file. Deleting a password in a new commit does not remove it from the old one, so a leaked secret must be treated as public and replaced.",
  ],
  howToCreate: [
    {
      text: "On github.com, create a new empty repository (no README, no license), or use the GitHub CLI. Log in first if you have never used `gh` before.",
      code: {
        language: "bash",
        code: `gh auth login
gh repo create notes-app --private`,
      },
    },
    {
      text: "In your local project folder, connect it to the new repository and push `main`. Use the URL GitHub shows you.",
      code: {
        language: "bash",
        code: `git remote add origin https://github.com/<your-name>/notes-app.git
git push -u origin main`,
      },
    },
    {
      text: "Make a change on a branch, commit it and push the branch.",
      code: {
        language: "bash",
        code: `git switch -c docs/readme
echo "# Notes App" > README.md
git add README.md
git commit -m "docs: add readme"
git push -u origin docs/readme`,
      },
    },
    {
      text: "Open the repository on github.com. You should see the branch `docs/readme` with your commit, and `git status` should say your branch is up to date with `origin/docs/readme`.",
    },
  ],
  whereUsed: [
    "Every project that is backed up or shared: open-source libraries, company code and your own portfolio projects all live on a remote such as GitHub.",
    "Automatic deployments and checks: services start building, testing or deploying when a new commit is pushed.",
  ],
  connectsTo: [
    "Commits: push and pull only move commits, so you commit first.",
    "Branches: you push one branch at a time, and its name appears on GitHub.",
    "Pull requests: a pushed branch is what a pull request asks to merge.",
    "`.gitignore` and environment variables: they keep `.env` and other secrets out of commits, so they are never pushed.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App lives in one GitHub repository with `frontend/`, `backend/` and `database/` folders. Each change is made on its own branch, such as `feature/note-form`, and pushed with `git push -u origin feature/note-form`.",
    },
    {
      explanation:
        "Pushing a branch is what makes the next step possible: opening a pull request for it, which runs the automatic checks before anything reaches `main`.",
    },
    {
      explanation:
        "The real secrets for the backend stay in `.env`, which is listed in `.gitignore` and never pushed. Only `.env.example`, with placeholder values, is on GitHub.",
      fileId: "backend/.env.example",
      match: "JWT_SECRET=change-me-to-a-long-random-string",
    },
  ],
  commonMistakes: [
    "Committing and pushing a `.env` file or a password. Deleting it later does not remove it from history; change the secret immediately and add the file to `.gitignore` before the next commit.",
    "Thinking a commit is backed up. `git commit` only saves on your computer; run `git push` to copy it to GitHub.",
    'Running a plain `git push` on a new branch and getting "has no upstream branch". Push it the first time with `git push -u origin <branch-name>`.',
    "Forcing a rejected push with `git push --force`, which deletes other people's commits on the remote. Run `git pull` first, fix any conflicts, then push normally.",
  ],
  relatedConcepts: [
    "git-repository",
    "git-commit",
    "git-branch",
    "pull-request",
    "gitignore",
    "environment-variables",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
