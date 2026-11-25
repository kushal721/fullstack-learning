import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const changeScene: Scene = {
  id: "change-to-github",
  title: "A change travels to GitHub",
  actors: [
    { id: "editor", label: "Your editor", sub: "the working folder" },
    { id: "staging", label: "Staging area", sub: "git add" },
    { id: "local", label: "Your repository", sub: "the history" },
    { id: "github", label: "GitHub", sub: "the shared copy" },
  ],
  steps: [
    {
      from: "editor",
      to: "staging",
      message: "git add NoteForm.jsx",
      caption: "You edit a file and choose it for the next snapshot.",
      detail: "Saving only changes your folder; adding stages the change.",
    },
    {
      from: "staging",
      to: "local",
      message: 'git commit -m "feat: …"',
      caption: "You commit: the staged change becomes a snapshot in history.",
      detail: "The commit gets an id, your name, the date and a message.",
    },
    {
      from: "local",
      to: "github",
      message: "git push",
      caption: "You push: your new commits are copied to GitHub.",
      detail: "Now they're backed up, and your team can see them.",
    },
    {
      from: "github",
      to: "local",
      message: "git pull",
      caption: "Later, you pull your teammates' commits down.",
      detail: "Everyone's copy ends up with the same history.",
    },
  ],
};

// Git & GitHub: every step is a module. Counts and numbering are in the
// level files.
export const gitPath: TopicPath = {
  topicId: "git",
  summary: {
    what: "Git records every saved version of a project; GitHub keeps a shared copy online.",
    does: "It lets you undo mistakes, see who changed what and why, and work on the same code as others without overwriting each other.",
    how: "You save snapshots called commits, work on branches, and push them to GitHub, where pull requests review and merge them.",
  },
  overviewSceneId: "change-to-github",
  scenes: [changeScene],
  levels: { basic, intermediate, advanced },
};
