import type { Concept } from "@fsl/shared";

export const gitRepository: Concept = {
  id: "git-repository",
  slug: "git-repository",
  title: "Git repository",
  topicId: "git",
  summary:
    "A project folder whose full history of changes is recorded by Git, so you can see, undo and share every change.",
  basics: [
    "A project is just a folder of files. When you edit a file and save it, the old version is gone. If you break something, you have to remember what it looked like before, and if two people edit the same project, they have to email files around and hope nobody overwrites the other.",
    "Version control is a tool that records the state of your files over time. Each saved state is like a photo of the whole project that you can look at again or go back to later.",
    "Git is the version control tool almost every team uses. It is a program you run in a terminal (the text window where you type commands). A command always starts with `git`, followed by what you want it to do, like `git status`.",
  ],
  what: [
    "A Git repository (often shortened to repo) is a project folder that Git is tracking. It contains your normal files plus a hidden folder named `.git` where Git stores the whole history.",
    "You turn any folder into a repository with `git init`. From then on, Git can tell you which files changed, and you can save snapshots of the project, called commits.",
  ],
  why: [
    "Without history, a mistake can cost hours: you cannot see what you changed or get the working version back. With a repository, every saved state is kept, so you can compare versions and undo a bad change with confidence.",
    "A repository is also how teams work together. Everyone has a copy, each person records their own changes, and Git combines them. The Notes App and this learning platform both live in Git repositories for exactly this reason.",
  ],
  howItWorks: [
    "Your files live in the working directory: the normal folder you see in your editor. Editing a file only changes the working directory; Git notices the change but does not record it yet.",
    "When a change is ready, you put it in the staging area with `git add`. The staging area is a waiting list: it holds exactly the changes that will go into the next snapshot, so you can choose what to save together.",
    "`git commit` takes everything in the staging area and stores it as a commit, a permanent snapshot in the history. At any moment, `git status` tells you which files are changed, which are staged, and which Git is not tracking at all.",
    "The repository on your computer is the local repository; a copy stored on a server such as GitHub is a remote repository, which you send your commits to so others can get them.",
  ],
  basicExample: {
    language: "bash",
    code: `$ git init
Initialized empty Git repository in /Users/sam/notes-app/.git/

$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

nothing added to commit but untracked files present (use "git add" to track)`,
    caption:
      "`git init` creates the hidden `.git` folder; `git status` then shows that `README.md` exists but Git is not tracking it yet.",
  },
  internals: [
    "Everything Git knows lives in the `.git` folder: every version of every file, all commits, all branches and settings. Delete `.git` and the folder is just a normal folder again, with no history. Never edit files inside it by hand.",
    "Git does not store a full copy of the project for each commit when nothing changed. It saves each file's content once, named by a fingerprint of that content (a hash), and a commit simply lists which contents make up the project at that moment.",
    "The staging area is really a file inside `.git` (called the index) that lists the exact file contents for the next commit. That is why changing a file again after `git add` needs another `git add`: the staged version is the one from when you ran it.",
  ],
  howToCreate: [
    {
      text: "Check that Git is installed, then tell it your name and email once. Every commit you make is labelled with them.",
      code: {
        language: "bash",
        code: `git --version
git config --global user.name "Sam Lee"
git config --global user.email "sam@example.com"
git config --global init.defaultBranch main`,
      },
    },
    {
      text: "Create a project folder and turn it into a repository.",
      code: {
        language: "bash",
        code: `mkdir notes-app
cd notes-app
git init`,
      },
    },
    {
      text: "Create a file and ask Git what it sees.",
      code: {
        language: "bash",
        code: `echo "# Notes App" > README.md
git status`,
      },
    },
    {
      text: "Stage the file and check again: `git status` now lists `README.md` under `Changes to be committed`, which means it is in the staging area.",
      code: {
        language: "bash",
        code: `git add README.md
git status`,
      },
    },
    {
      text: "To check it worked, run `ls -a`: you should see the hidden `.git` folder next to `README.md`. If `git status` says `not a git repository`, you are in the wrong folder.",
      code: {
        language: "bash",
        code: `ls -a`,
      },
    },
  ],
  whereUsed: [
    "Every software project, from a one-person side project to huge company codebases. Hosting sites like GitHub are built around repositories.",
    "Anything you want a history of: code, documentation, configuration files, even the content of this learning platform.",
  ],
  connectsTo: [
    "Commits, the snapshots a repository is made of.",
    "Branches, which let you work on separate lines of history inside one repository.",
    "`.gitignore`, which tells the repository which files never to track.",
    "Remote repositories on GitHub, where you push your commits so the team can see them.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App is one repository with three folders: `frontend/`, `backend/` and `database/`. Keeping them together means one change, such as a new field on a note, can update all three parts in a single commit.",
    },
    {
      explanation:
        "This learning platform is also a Git repository, and every change to it starts from a GitHub issue, is made on its own branch and is merged through a pull request.",
    },
  ],
  commonMistakes: [
    "Running `git init` in the wrong folder, such as your home folder, so Git tries to track everything on your computer. Run `git status` first; if a repository already exists higher up, `cd` into the real project folder, and remove an accidental `.git` folder with care.",
    "Creating a repository inside another repository. The outer one then sees the inner folder strangely. Keep one `.git` folder at the root of the project.",
    "Editing a file after `git add` and expecting the new edits to be included. Only the staged version is committed; run `git add` again.",
    "Thinking a local repository is a backup. If your laptop dies, the history dies with it until you push it to a remote such as GitHub.",
  ],
  relatedConcepts: [
    "git-commit",
    "git-branch",
    "gitignore",
    "github-remote-push",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
