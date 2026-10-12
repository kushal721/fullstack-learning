import type { Concept } from "@fsl/shared";

export const merge: Concept = {
  id: "merge",
  slug: "merge",
  title: "Merging",
  topicId: "git",
  summary:
    "Combining the commits of one branch into another, so that work done separately becomes part of the same history.",
  basics: [
    "A commit is a saved snapshot of the project's files with a message. Each commit points to the commit before it, so the commits form a chain: the history.",
    "A branch is a name that points to the newest commit of one line of work. When you create `feature/x` from `main` and commit on it, the two branches start to grow apart: `feature/x` has commits that `main` does not.",
    "Work on a branch is invisible on `main` until it is brought over. Bringing it over is called merging, and it is the last step of every feature.",
  ],
  what: [
    "Merging takes the changes from one branch (for example `feature/x`) and adds them to another (usually `main`). In a terminal you switch to the branch that should receive the changes and run `git merge feature/x`.",
    "There are three common results: a fast-forward, a merge commit, or a squash merge. They all bring the same file changes into `main`; they differ in what the history looks like afterwards.",
  ],
  why: [
    "Branches let you work without breaking `main`, but that is only useful if the finished work can be combined back. Merging is how parallel work, yours and other people's, ends up in one project.",
    "Understanding the three kinds of merge explains the history you see in `git log`. This project squash-merges, so `main` reads like a clean list: one commit per pull request.",
  ],
  howItWorks: [
    "Fast-forward: if `main` has not changed since you created the branch, Git simply moves the `main` label forward to your newest commit. No new commit is made, because there was nothing to combine.",
    "Merge commit: if both branches have new commits, Git creates one extra commit with two parents that joins the two lines of history. All the branch's individual commits are kept.",
    "Squash merge: Git takes all the changes of the branch and makes them into one single new commit on `main`. The small work-in-progress commits are not copied; on GitHub, the pull request title becomes the message of that commit.",
    "A merge conflict happens when both branches changed the same lines of the same file. Git cannot know which version is right, so it stops and asks you to decide.",
  ],
  basicExample: {
    language: "bash",
    code: `git switch main
git pull
git merge feature/x
# if Git reports a conflict:
git status
# edit the file, keep the right lines, remove the markers, then:
git add src/notes.js
git commit`,
    caption:
      "Merge feature/x into main; if both branches changed the same lines, git status lists the conflicted file, you fix it, add it and commit.",
    highlightLines: [3],
  },
  internals: [
    "To merge, Git finds the merge base: the last commit both branches have in common. It compares each branch with that base to see what each side changed, and combines changes that touch different places automatically.",
    "When both sides changed the same lines, Git writes both versions into the file between conflict markers: the line `<<<<<<< HEAD` starts your current branch's version, `=======` separates them, and `>>>>>>> feature/x` ends the incoming branch's version.",
    'While a merge is unfinished, Git remembers it. `git status` shows "You have unmerged paths" and lists each conflicted file under "both modified", and tells you what to do next. `git merge --abort` cancels and puts everything back as it was.',
    "A squash merge loses the link to the branch's individual commits, so Git no longer considers the branch merged. That is why the branch is deleted after a squash merge instead of being reused.",
  ],
  howToCreate: [
    {
      text: "In a fresh test repository, create a file on `main` and commit it.",
      code: {
        language: "bash",
        code: `mkdir merge-practice && cd merge-practice
git init -b main
echo "title: Shopping" > note.txt
git add note.txt
git commit -m "feat: add note"`,
      },
    },
    {
      text: "Change the same line on a branch and on `main`, so both sides disagree.",
      code: {
        language: "bash",
        code: `git switch -c feature/rename
echo "title: Groceries" > note.txt
git commit -am "feat: rename note to groceries"
git switch main
echo "title: Weekly shopping" > note.txt
git commit -am "feat: rename note to weekly shopping"`,
      },
    },
    {
      text: "Merge the branch into `main`. Git reports a conflict, and `note.txt` now contains both versions between the markers `<<<<<<< HEAD`, `=======` and `>>>>>>> feature/rename`.",
      code: {
        language: "bash",
        code: `git merge feature/rename
git status`,
      },
    },
    {
      text: "Open `note.txt`, keep the line you want (for example `title: Groceries`), and delete the three marker lines and the other version. Then mark the conflict as resolved and finish the merge.",
      code: {
        language: "bash",
        code: `git add note.txt
git commit -m "fix: resolve note title conflict"`,
      },
    },
    {
      text: 'Check that it worked: `git status` says "nothing to commit, working tree clean", and `git log --oneline --graph` shows the two lines of history joined by your merge commit.',
    },
  ],
  whereUsed: [
    "At the end of every pull request, when the branch is merged into `main` with the merge button.",
    "Bringing the latest `main` into a long-running branch (`git merge main` while on the branch) to fix conflicts before the pull request is merged.",
    "Every `git pull`, which is a download followed by a merge of the remote branch into yours.",
  ],
  connectsTo: [
    "Branches: a merge always combines two of them.",
    "Commits: a merge creates a merge commit or, with squash, one new commit.",
    "Pull requests: on GitHub you choose the kind of merge on the PR's merge button.",
    "`git status`, which guides you through a conflict step by step.",
  ],
  projectUsage: [
    {
      explanation:
        "This learning platform squash-merges every pull request into `main`. Each feature arrives as one commit whose message is the PR title, such as `feat: add note form`, so `git log --oneline` on `main` reads like a changelog.",
    },
    {
      explanation:
        "After the squash merge the branch, for example `feature/note-form`, is deleted, and the next piece of work starts from a fresh `main` after `git pull`.",
    },
    {
      explanation:
        "If GitHub says a pull request has conflicts, you merge the latest `main` into the branch locally, resolve the conflicts as above, commit and push; the checks run again and the PR becomes mergeable.",
    },
  ],
  commonMistakes: [
    "Committing a file that still contains `<<<<<<<`, `=======` or `>>>>>>>`. The code breaks; search the files for the markers and remove them before `git add`.",
    "Resolving a conflict by keeping both versions without reading them. Understand what each side meant, combine them correctly, and run the app or tests before committing.",
    "Panicking in the middle of a conflict. Nothing is lost: run `git status` to see where you are, or `git merge --abort` to go back to before the merge.",
    "Reusing a branch after it was squash-merged. Git does not see its commits on `main` and shows confusing conflicts; delete it and create a new branch from the updated `main`.",
  ],
  relatedConcepts: [
    "git-branch",
    "git-commit",
    "pull-request",
    "conventional-commit",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
