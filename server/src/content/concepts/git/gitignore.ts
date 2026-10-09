import type { Concept } from "@fsl/shared";

export const gitignore: Concept = {
  id: "gitignore",
  slug: "gitignore",
  title: ".gitignore",
  topicId: "git",
  summary:
    "A text file that lists the files and folders Git should never track, such as secrets and generated files.",
  basics: [
    "A Git repository records the files in your project folder. `git status` shows every file that is new or changed, and `git add .` stages all of them for the next commit.",
    "Not every file in the folder is something you wrote. Installing packages with npm creates a huge `node_modules/` folder, a build creates a `dist/` folder, and programs write log files.",
    "Some files contain secrets, like the database password in a `.env` file (a file of environment variables, settings the app reads when it starts). Once a file is pushed to GitHub, anyone with access can read it, and it stays in the history.",
  ],
  what: [
    "`.gitignore` is a plain text file, usually in the root of the repository, where each line is a pattern for files Git should ignore. Ignored files do not appear in `git status` and are skipped by `git add .`.",
    "The file itself is committed, so everyone on the team ignores the same things automatically.",
  ],
  why: [
    "Secrets must never enter the history. If `.env` is committed, the password is exposed to everyone who can see the repository, and removing it later does not erase it from old commits; you have to change the password.",
    "Generated files are noise. `node_modules/` can contain tens of thousands of files that anyone can recreate with `npm install`, and `dist/` is recreated by every build. Tracking them makes the repository huge and fills every diff with changes nobody wrote.",
  ],
  howItWorks: [
    "A name ending in `/`, like `node_modules/` or `dist/`, ignores that folder and everything inside it, wherever it appears in the project.",
    "A plain name like `.env` ignores files with exactly that name. A `*` matches any characters, so `*.log` ignores every file ending in `.log`.",
    "A line starting with `!` makes an exception: `!.env.example` keeps `.env.example` tracked even if an earlier pattern would match it. Lines starting with `#` are comments.",
    "`.gitignore` only affects files Git is not tracking yet. A file that was already committed stays tracked until you remove it from the index with `git rm --cached`.",
  ],
  basicExample: {
    language: "bash",
    fileName: ".gitignore",
    code: `# Dependencies, recreated with npm install
node_modules/

# Build output, recreated by every build
dist/

# Secrets: never commit
.env
.env.*
!.env.example

# Logs
*.log`,
    caption:
      "Each line is a pattern; `!.env.example` is an exception so the safe template file is still committed.",
  },
  internals: [
    "Whenever Git looks for new files, for `git status` or `git add`, it checks each untracked path against the patterns in `.gitignore`, from top to bottom. The last matching line wins, which is why the `!` exception must come after the rule it overrides.",
    "Git only ignores untracked files. Once a file is in a commit, Git keeps tracking it, because the history already contains it. `git rm --cached .env` removes it from the next commit while leaving your local file in place.",
    "A repository can have `.gitignore` files in subfolders too; their patterns apply only inside that folder. `git check-ignore -v <file>` tells you which line is ignoring a file.",
  ],
  howToCreate: [
    {
      text: "In the root of your repository, create a file named exactly `.gitignore` (with the dot, no other extension).",
      code: {
        language: "bash",
        fileName: ".gitignore",
        code: `node_modules/
dist/
.env
*.log
!.env.example`,
      },
    },
    {
      text: "Create a few test files: a secret file, a safe template and a log.",
      code: {
        language: "bash",
        code: `echo "DB_PASSWORD=secret123" > .env
echo "DB_PASSWORD=" > .env.example
echo "debug" > server.log`,
      },
    },
    {
      text: "To check it worked, run `git status`. You should see `.gitignore` and `.env.example`, but not `.env` or `server.log`. `git check-ignore -v .env` names the line that ignores it.",
      code: {
        language: "bash",
        code: `git status
git check-ignore -v .env`,
      },
    },
    {
      text: "If a file was committed before you ignored it, stop tracking it (your local copy stays), then commit the change.",
      code: {
        language: "bash",
        code: `git rm --cached .env
git commit -m "chore: stop tracking .env"`,
      },
    },
  ],
  whereUsed: [
    "Every JavaScript project ignores at least `node_modules/`, build output like `dist/`, and `.env` files.",
    "Editor and system files, such as `.DS_Store` on macOS, so personal clutter does not end up in the shared repository.",
  ],
  connectsTo: [
    "Git repositories, where `.gitignore` decides what can be tracked.",
    "Environment variables: `.env` holds the real values and stays ignored, `.env.example` lists the names and is committed.",
    "npm packages: `node_modules/` is ignored, while `package.json` and `package-lock.json` are committed so `npm install` recreates the exact same packages.",
    "Commits, because ignored files can never be swept into one by `git add .`.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App ignores `node_modules/`, build output in `dist/` and `.env` files, so the database password never reaches GitHub.",
    },
    {
      explanation:
        "Instead of `.env`, the repository commits `.env.example` with the variable names and no real values, so a new developer knows exactly what to fill in. `package-lock.json` is committed too, so everyone installs the same package versions.",
    },
  ],
  commonMistakes: [
    "Adding `.env` to `.gitignore` after it was already committed and expecting it to disappear. Run `git rm --cached .env` and commit, and change any secret that was pushed, since it is still in the history.",
    "Ignoring `package-lock.json` because it is generated. It records the exact package versions, so it must be committed; only `node_modules/` is ignored.",
    "Naming the file wrongly, such as `gitignore` without the dot or `.gitignore.txt`. Git only reads a file named exactly `.gitignore`.",
    "Putting the `!` exception before the rule it should override. Git uses the last matching line, so write `!.env.example` after `.env.*`.",
  ],
  relatedConcepts: [
    "git-repository",
    "git-commit",
    "environment-variables",
    "npm-packages",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
