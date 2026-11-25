import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Signed commits and protected branches: trusting the history. Anyone can
// be the author, signing a commit, setting it up, the settings taken
// apart, GitHub's badges, protected branches, a push against the rules
// step by step, signed tags, the Notes App, mistakes, practice and a
// recap.
export const signedCommitsModule = moduleLesson(
  "signed-commits",
  "Signed commits and protected branches",
  40,
  [
    "Explain why a commit's author name proves nothing on its own.",
    "Sign commits with an SSH key, and read GitHub's Verified badges.",
    "Protect main with rules: pull requests, reviews, checks and signatures.",
    "Sign release tags.",
  ],

  part(
    "anyone-can-be-author",
    "Anyone can be the author",
    explain(
      "A commit's author is just whatever name and email are in your Git settings. Nothing checks them: anyone can make a commit that claims to be from anyone. On a project that matters, you want proof that a commit really came from who it says, and rules about how changes reach `main`.",
    ),
    code(
      "bash",
      "an author is only a setting",
      [
        '$ git config user.name "Famous Developer"',
        '$ git config user.email "famous@example.com"',
        '$ git commit -m "fix: trust me"',
        "$ git log -1 --format='%an <%ae>'",
        "Famous Developer <famous@example.com>",
      ],
      {
        2: "any name and email you like",
        5: "the history now claims they made it",
      },
    ),
  ),

  part(
    "signing",
    "Signing a commit",
    explain(
      "A [[signed-commit|signed commit]] carries a cryptographic signature made with a private key that only you have. Anyone can check it with your **public** key. Upload that public key to GitHub, and GitHub marks your signed commits **Verified**: proof the commit came from your key and wasn't changed since.",
    ),
    diagram([
      ["Your private key", "signs the commit"],
      ["The commit", "carries the signature"],
      ["GitHub", "checks it with your public key"],
      ["Verified", "really from you, unchanged"],
    ]),
  ),

  part(
    "setting-up",
    "Setting up signing",
    explain(
      "The simplest way is to sign with the SSH key you may already use for pushing. Tell Git to use SSH for signing, which key to use, and to sign every commit. Then add the same public key on GitHub under **Settings → SSH and GPG keys**, as a *signing* key.",
    ),
    code(
      "bash",
      "signing every commit with an SSH key",
      [
        "$ git config --global gpg.format ssh",
        "$ git config --global user.signingkey \\",
        "    ~/.ssh/id_ed25519.pub",
        "$ git config --global commit.gpgsign true",
        "",
        '$ git commit -m "feat: tags"',
        "$ git push",
      ],
      {
        1: "sign with SSH keys (not GPG)",
        3: "the public half of your key",
        4: "sign every commit from now on",
        7: "on GitHub, this commit shows Verified",
      },
    ),
  ),

  part(
    "settings-anatomy",
    "The signing settings, taken apart",
    explain(
      "`git config --global --list` shows the settings the commands above wrote. Four lines make every commit and tag signed:",
    ),
    anatomy(
      "git config --global --list (signing)",
      [
        "gpg.format=ssh",
        "user.signingkey=~/.ssh/id_ed25519.pub",
        "commit.gpgsign=true",
        "tag.gpgsign=true",
      ],
      [
        ["gpg.format=ssh", "format", "Sign with SSH keys."],
        ["user.signingkey", "key", "Which public key identifies you."],
        ["commit.gpgsign=true", "commits", "Sign every commit automatically."],
        ["tag.gpgsign=true", "tags", "Sign every annotated tag too."],
      ],
    ),
  ),

  part(
    "badges",
    "Verified, Unverified",
    explain(
      "GitHub shows a badge beside every commit it can judge. Turning on **vigilant mode** in your settings marks your *unsigned* commits too, so a commit pretending to be you stands out.",
    ),
    reference("GitHub's commit badges", [
      ["Verified", "Signed with a key on the author's account.", "trust it"],
      [
        "Unverified",
        "Signed, but the key isn't theirs, or it's broken.",
        "be suspicious",
      ],
      ["No badge", "Not signed (vigilant mode off).", "can't tell"],
      [
        "Unverified (vigilant)",
        "Unsigned, under a vigilant account.",
        "not from them",
      ],
    ]),
    quickCheck(
      "A commit claims to be from you, but shows **Unverified**. You always sign. What does that suggest?",
      [
        "Nothing: badges are decoration",
        "Someone else made it using your name",
        "GitHub is down",
      ],
      1,
      "Your commits are signed with your key, so one that isn't verified didn't come from you.",
    ),
  ),

  part(
    "protected-branches",
    "Protecting main",
    explain(
      "A [[protected-branch|protected branch]] (GitHub calls the newer version a **ruleset**) sets rules for how changes reach it. Protecting `main` turns team habits into guarantees: nobody can push to it directly, force-push it or delete it, and every change arrives through a reviewed pull request with green checks.",
    ),
    reference("Rules for main", [
      ["Require a pull request", "No direct pushes.", "everything via PRs"],
      ["Require approvals", "At least N reviews.", "1 approval"],
      ["Require status checks", "CI must be green.", "CI / test"],
      ["Require signed commits", "Only Verified commits.", "commit.gpgsign"],
      ["Block force pushes", "History can't be rewritten.", "on by default"],
      ["Restrict deletions", "main can't be deleted.", "on by default"],
    ]),
  ),

  part(
    "step-by-step",
    "A push against the rules, step by step",
    explain(
      "`main` is protected: pull requests, one approval, green CI and signed commits. Step through a change getting there:",
    ),
    trace(
      "Getting a change into protected main",
      [
        "git push origin main",
        "✗ protected: needs a PR",
        "push branch, open PR",
        "CI ✓ · 1 approval ✓",
        "✗ commits must be signed",
        "git config commit.gpgsign true",
        "git commit --amend -S --no-edit",
        "git push --force-with-lease",
        "Verified ✓ · merge enabled",
      ],
      [
        {
          line: 2,
          note: "Pushing straight to `main` is refused. The rule says every change must come through a pull request.",
          vars: [["main", "unchanged"]],
          output:
            "! [remote rejected] main -> main (protected branch hook declined)",
        },
        {
          line: 4,
          note: "On a branch with a pull request, CI passes and a reviewer approves. Two rules satisfied.",
          vars: [
            ["checks", "✓"],
            ["approvals", "1"],
            ["signed", "no"],
          ],
        },
        {
          line: 5,
          note: "The merge button stays disabled: the commit isn't signed.",
          vars: [["merge", "blocked"]],
        },
        {
          line: 8,
          note: "Signing turned on, the commit is re-made with a signature (`-S`). It's a new commit on your own branch, so a guarded force push replaces it.",
          vars: [
            ["signed", "yes"],
            ["merge", "checking…"],
          ],
        },
        {
          line: 9,
          note: "Every rule passes. The commit shows Verified and the pull request can be merged.",
          vars: [
            ["checks", "✓"],
            ["approvals", "1"],
            ["signed", "Verified"],
          ],
          output: "All checks passed · Merge pull request",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "signed-tags",
    "Signed tags and releases",
    explain(
      "A **tag** is a permanent name for one commit, usually a version like `v1.2.0`. An annotated tag can be signed like a commit, so people installing a release know it came from you. GitHub turns tags into **releases**, with notes and downloads.",
    ),
    code(
      "bash",
      "tagging and signing a release",
      [
        '$ git tag -s v1.2.0 -m "Notes App 1.2.0"',
        "$ git push origin v1.2.0",
        '$ gh release create v1.2.0 --notes "Search notes"',
      ],
      {
        1: "an annotated, signed tag on the current commit",
        2: "tags aren't pushed with commits: push it by name",
        3: "a GitHub release from the tag",
      },
    ),
  ),

  part(
    "notes-app",
    "Protecting the Notes App",
    explain(
      "The Notes App deploys from `main`: whatever lands there goes to production. So `main` is the branch to protect: pull requests only, CI required (so `notes.test.js` must pass), one approval, no force pushes. Releases get a signed tag, so a deploy can always be traced to a verified commit.",
    ),
    inTheNotesApp(
      "The `Dockerfile` builds what's deployed from `main`, which is why `main` is protected.",
      { fileId: "backend/Dockerfile" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Your personal email in public commits",
      language: "bash",
      wrong: ['$ git config --global user.email "sam.smith@gmail.com"'],
      problem:
        "Every commit in a public repository shows that address to anyone, including spammers who scrape GitHub.",
      right: [
        "$ git config --global user.email \\",
        '    "12345+sam@users.noreply.github.com"',
      ],
      why: "Use the private noreply address GitHub gives you under Settings → Emails.",
    }),
    mistake({
      title: "Turning protection off to push quickly",
      language: "bash",
      wrong: ["# disable rules on main · git push · re-enable"],
      problem:
        "That push skipped every check the rules exist for: no review, no CI. It's exactly the change most likely to break production.",
      right: ["# hotfix branch · PR · fast review · merge"],
      why: "Make the process fast, not optional. An urgent fix still goes through a pull request.",
    }),
    mistake({
      title: "A signing key GitHub doesn't know",
      language: "bash",
      wrong: ["# commit.gpgsign true, but the key isn't on GitHub"],
      problem:
        "The commits are signed, but GitHub can't match the key to you, so they show Unverified and protected merges stay blocked.",
      right: [
        "# GitHub → Settings → SSH and GPG keys",
        "# New SSH key → Key type: Signing key",
      ],
      why: "Add the public key as a *signing* key, not only as an authentication key.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the badge",
      task: "Replace each `?` with the badge GitHub shows: `Verified`, `Unverified` or `none` (vigilant mode is off).",
      starter: [
        '<p>Signed with your key, which is on your GitHub account: <span id="a">?</span></p>',
        "<p>Signed with a key that isn't on the author's account: <span id=\"b\">?</span></p>",
        '<p>Not signed at all: <span id="c">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A known key",
          selector: "#a",
          text: "Verified",
        },
        {
          kind: "text",
          label: "An unknown key",
          selector: "#b",
          text: "Unverified",
        },
        {
          kind: "text",
          label: "No signature, vigilant off",
          selector: "#c",
          text: "none",
        },
      ],
      hint: "Verified needs a signature *and* a key GitHub links to the author.",
      solution: [
        '<p>Signed with your key, which is on your GitHub account: <span id="a">Verified</span></p>',
        "<p>Signed with a key that isn't on the author's account: <span id=\"b\">Unverified</span></p>",
        '<p>Not signed at all: <span id="c">none</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Which rule?",
      task: "Replace each `?` with the rule that prevents it: `require a pull request`, `require status checks`, `require signed commits` or `block force pushes`.",
      starter: [
        '<p>Someone pushes straight to main: <span id="direct">?</span></p>',
        '<p>A pull request with failing tests is merged: <span id="ci">?</span></p>',
        '<p>Someone rewrites main\'s history: <span id="force">?</span></p>',
        '<p>A commit pretending to be from you is merged: <span id="sign">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "No direct pushes",
          selector: "#direct",
          text: "require a pull request",
        },
        {
          kind: "text",
          label: "CI must pass",
          selector: "#ci",
          text: "require status checks",
        },
        {
          kind: "text",
          label: "History is permanent",
          selector: "#force",
          text: "block force pushes",
        },
        {
          kind: "text",
          label: "Only verified commits",
          selector: "#sign",
          text: "require signed commits",
        },
      ],
      hint: "Match each problem to the rule that names it: pushes, checks, rewriting, identity.",
      solution: [
        '<p>Someone pushes straight to main: <span id="direct">require a pull request</span></p>',
        '<p>A pull request with failing tests is merged: <span id="ci">require status checks</span></p>',
        '<p>Someone rewrites main\'s history: <span id="force">block force pushes</span></p>',
        '<p>A commit pretending to be from you is merged: <span id="sign">require signed commits</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Trust cheat sheet", [
      ["author", "Just a setting; proves nothing.", "user.email"],
      ["signed commit", "Signature from your private key.", "git commit -S"],
      ["gpg.format=ssh", "Sign with an SSH key.", "simplest setup"],
      ["commit.gpgsign", "Sign every commit.", "true"],
      ["Verified", "Signed with the author's known key.", "GitHub badge"],
      ["vigilant mode", "Flags your unsigned commits.", "Settings"],
      ["protected branch", "Rules for main.", "PRs, checks, reviews"],
      ["git tag -s", "A signed release tag.", "v1.2.0"],
    ]),
    quickCheck(
      "What does a Verified badge prove?",
      [
        "The code has no bugs",
        "The commit was signed with a key on the author's account, and hasn't changed since",
        "A reviewer approved it",
      ],
      1,
      "Verified is about identity and integrity, not quality: reviews and CI cover that.",
    ),
  ),
);
