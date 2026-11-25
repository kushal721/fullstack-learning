import {
  analogy,
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Code review. Why review, what to look for, reading a pull request,
// kinds of comment, suggestions, a review step by step, giving feedback,
// receiving it, the Notes App, mistakes, practice and a recap.
export const codeReviewModule = moduleLesson(
  "code-review",
  "Code review: reading each other's changes",
  40,
  [
    "Explain what code review is for, beyond catching bugs.",
    "Review a pull request in a useful order, and know what to look for.",
    "Write clear, kind comments, and label how much each one matters.",
    "Respond to review on your own pull requests.",
  ],

  part(
    "why-review",
    "Why review code?",
    explain(
      "[[code-review|Code review]] means a teammate reads your change before it's merged. It catches bugs, but that's not all: it spreads knowledge of the code, keeps the style consistent, and gives everyone a second pair of eyes on security. The reviewer learns the change; the author learns from the reviewer.",
    ),
    analogy(
      "Like having a friend read your essay before you hand it in: they spot the typo you can't see, and ask what you meant by the paragraph you thought was clear.",
    ),
  ),

  part(
    "what-to-look-for",
    "What to look for",
    explain(
      "Automated checks catch formatting and failing tests, so a human reviewer can focus on what tools can't judge: does the change do the right thing, is it safe, and will the next person understand it?",
    ),
    reference("A reviewer's checklist", [
      [
        "Correctness",
        "Does it do what the PR says? Edge cases?",
        "empty title?",
      ],
      ["Tests", "Is the new behaviour tested?", "a test per case"],
      [
        "Security",
        "Input checked? Data scoped to the user?",
        "user_id in queries",
      ],
      ["Readability", "Clear names, small functions.", "note, not n"],
      ["Scope", "Only what the PR is about.", "no stray refactor"],
    ]),
  ),

  part(
    "reading-a-pr",
    "Reading a pull request",
    explain(
      "Read in an order that builds understanding: the description first (what and why), then the tests (what it should do), then the code. For anything you can't judge by reading, check out the branch and run it. The **Files changed** tab shows the diff; tick **Viewed** on each file as you go.",
    ),
    code(
      "bash",
      "trying a pull request locally",
      [
        "$ gh pr checkout 42",
        "Switched to branch 'feature/search'",
        "$ npm install",
        "$ npm test",
        "$ npm run dev",
      ],
      {
        1: "fetch the PR's branch and switch to it",
        4: "do the tests pass for you too?",
        5: "click around: does it behave as described?",
      },
    ),
  ),

  part(
    "kinds-of-comment",
    "Kinds of comment",
    explain(
      "Not every comment matters equally. A short label at the start tells the author whether it must change before merging or is just a thought. Many teams use these:",
    ),
    reference("Comment labels", [
      ["blocking:", "Must change before merging.", "a bug, a security hole"],
      ["question:", "You don't understand; not a demand.", "why a Set here?"],
      ["suggestion:", "A better way, the author decides.", "extract a helper?"],
      ["nit:", "Tiny and optional.", "typo in a comment"],
      ["praise:", "Something done well.", "nice test names!"],
    ]),
    quickCheck(
      "A query returns every user's notes, not just the logged-in user's. How should the comment start?",
      ["`nit:`", "`blocking:`", "`praise:`"],
      1,
      "Leaking other users' data must be fixed before merging.",
    ),
  ),

  part(
    "suggestions",
    "Suggestions you can apply",
    explain(
      "On GitHub, a review comment can contain a **suggested change**: the replacement lines in a `suggestion` block. The author applies it with one click, and it becomes a commit on the branch:",
    ),
    anatomy(
      "A suggestion in a review comment",
      [
        "nit: clearer name",
        "```suggestion",
        "const note = await res.json();",
        "```",
      ],
      [
        ["nit:", "label", "How much it matters: optional."],
        ["```suggestion", "start", "Everything until ``` replaces the line."],
        [
          "const note = await res.json();",
          "the new line",
          "What the line should say.",
        ],
        ["```", "end", "The author clicks Commit suggestion."],
      ],
    ),
  ),

  part(
    "step-by-step",
    "A review, step by step",
    explain(
      "Step through Alex reviewing Sam's pull request that adds searching notes:",
    ),
    trace(
      "Reviewing PR #42",
      [
        "read the description",
        "read the tests",
        "read the code",
        "line 18: all users' notes",
        "comment: blocking: …",
        "line 30: name `d`",
        "comment: nit: suggestion",
        "submit: Request changes",
        "Sam pushes fixes",
        "re-review: Approve",
      ],
      [
        {
          line: 2,
          note: "The description says what search should do; the tests show which cases were thought of. One is missing: an empty search.",
          vars: [["comments", "0"]],
        },
        {
          line: 5,
          note: "The search query forgets `user_id`, so it would return everyone's notes. That must be fixed: a blocking comment, explaining why.",
          vars: [
            ["comments", "1"],
            ["blocking", "1"],
          ],
        },
        {
          line: 7,
          note: "A variable called `d` is hard to read. Optional, so it's a nit, with a suggestion Sam can apply in one click.",
          vars: [
            ["comments", "2"],
            ["blocking", "1"],
          ],
        },
        {
          line: 8,
          note: "Because one comment is blocking, Alex submits the review as **Request changes**, not Approve.",
          vars: [["review", "changes requested"]],
        },
        {
          line: 10,
          note: "Sam fixes the query, adds the missing test, applies the suggestion. Alex checks the new commits and approves.",
          vars: [["review", "approved"]],
          output: "✓ Approved · ready to merge",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "giving-feedback",
    "Giving feedback well",
    explain(
      "Review the code, not the person. Say *why* something is a problem, so the author learns rather than just obeys. Ask questions when you're unsure; you might be the one who's missing something. And say what's good: reviews that only list problems wear people down.",
    ),
    keyPoints(
      "About the code: “this query”, not “you forgot”.",
      "Explain why, and suggest a fix.",
      "Ask when unsure: “what happens if…?”",
      "Label each comment: blocking, nit, question.",
    ),
  ),

  part(
    "receiving-feedback",
    "Receiving feedback",
    explain(
      "Comments on your code aren't comments on you. Reply to each one: fix it and say so, or explain why you'd keep it as it is. Push fixes as new commits so the reviewer can see exactly what changed, and resolve each conversation once it's settled. If a thread goes back and forth, talk it over instead.",
    ),
    reference("Responding to review", [
      ["Fixed", "Push a commit; reply “done”.", "resolve the thread"],
      ["Disagree", "Explain your reasoning, kindly.", "decide together"],
      ["Suggestion", "Commit suggestion, one click.", "on GitHub"],
      ["Long thread", "Talk it over, write the outcome.", "a quick call"],
    ]),
  ),

  part(
    "notes-app",
    "Reviewing the Notes App",
    explain(
      "The most important check in a Notes App review is security: every query must include `user_id`, so nobody sees or changes another user's notes. `notesController.js` shows the pattern every new query must follow; a reviewer should block any query that skips it.",
    ),
    inTheNotesApp(
      "`notesController.js` scopes every query to the logged-in user: the line a reviewer checks first.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Approving without reading",
      language: "bash",
      wrong: ["# 400 lines changed · LGTM ✓ (2 minutes later)"],
      problem:
        "A rubber-stamp approval gives false confidence: everyone thinks the change was checked, and nobody did.",
      right: ["# read description, tests, code; run it if unsure"],
      why: "If you can't review it properly now, say so, or ask for a smaller pull request.",
    }),
    mistake({
      title: "Nitpicking what tools should catch",
      language: "bash",
      wrong: ["nit: missing semicolon", "nit: use double quotes"],
      problem:
        "Human attention goes on formatting instead of logic, and the author feels nagged over trivia.",
      right: ["# let Prettier and ESLint decide style in CI"],
      why: "Automate style. Spend review on correctness, security and clarity.",
    }),
    mistake({
      title: "Vague blocking comments",
      language: "bash",
      wrong: ["blocking: this is wrong"],
      problem:
        "The author doesn't know what's wrong, why, or how to fix it, so the pull request stalls.",
      right: [
        "blocking: this returns every user's notes;",
        "add `user_id = $1` to the WHERE.",
      ],
      why: "Say what, why and a way forward.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Label the comment",
      task: "Replace each `?` with the right label: `blocking`, `question`, `nit` or `praise`.",
      starter: [
        '<p>The delete route doesn\'t check who owns the note: <span id="a">?</span></p>',
        '<p>Typo in a comment: “recieve”: <span id="b">?</span></p>',
        '<p>Why does this need a second request?: <span id="c">?</span></p>',
        '<p>These test names read like a spec. Lovely: <span id="d">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A security hole blocks",
          selector: "#a",
          text: "blocking",
        },
        {
          kind: "text",
          label: "A typo is a nit",
          selector: "#b",
          text: "nit",
        },
        {
          kind: "text",
          label: "Not understanding is a question",
          selector: "#c",
          text: "question",
        },
        {
          kind: "text",
          label: "Say what's good",
          selector: "#d",
          text: "praise",
        },
      ],
      hint: "Must it change before merging? Is it tiny? Are you asking? Are you pleased?",
      solution: [
        '<p>The delete route doesn\'t check who owns the note: <span id="a">blocking</span></p>',
        '<p>Typo in a comment: “recieve”: <span id="b">nit</span></p>',
        '<p>Why does this need a second request?: <span id="c">question</span></p>',
        '<p>These test names read like a spec. Lovely: <span id="d">praise</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Spot the problem",
      task: "Review the diff. Replace each `?`: the line number of the security problem, and the review decision to submit: `Approve` or `Request changes`.",
      starter: [
        "<pre>1  export async function deleteNote(req, res) {",
        "2    const id = noteId(req);",
        '3    await pool.query("DELETE FROM notes WHERE id = $1", [id]);',
        "4    res.status(204).end();",
        "5  }</pre>",
        '<p>Problem on line: <span id="line">?</span></p>',
        '<p>Decision: <span id="decision">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The query without user_id",
          selector: "#line",
          text: "3",
        },
        {
          kind: "text",
          label: "A security bug blocks the merge",
          selector: "#decision",
          text: "Request changes",
        },
      ],
      hint: "Whose notes can this delete? Compare it with the rule: every query includes `user_id`.",
      solution: [
        "<pre>1  export async function deleteNote(req, res) {",
        "2    const id = noteId(req);",
        '3    await pool.query("DELETE FROM notes WHERE id = $1", [id]);',
        "4    res.status(204).end();",
        "5  }</pre>",
        '<p>Problem on line: <span id="line">3</span></p>',
        '<p>Decision: <span id="decision">Request changes</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Code review cheat sheet", [
      ["why", "Bugs, shared knowledge, consistency.", "two pairs of eyes"],
      ["order", "Description, tests, code; run it.", "gh pr checkout 42"],
      ["look for", "Correctness, tests, security, clarity.", "user_id"],
      ["labels", "blocking, question, suggestion, nit.", "nit: typo"],
      ["suggestion", "A one-click change.", "```suggestion"],
      ["decisions", "Comment, Approve, Request changes.", "submit review"],
      ["giving", "About the code; explain why.", "kind and specific"],
      ["receiving", "Reply to each; push fixes.", "resolve threads"],
    ]),
    quickCheck(
      "What should a human reviewer spend most attention on?",
      [
        "Spaces and semicolons",
        "Correctness, security and whether the next person will understand it",
        "The commit author's name",
      ],
      1,
      "Formatting is for tools. People judge what tools can't.",
    ),
  ),
);
