import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const clickScene: Scene = {
  id: "click",
  title: "A click runs your code",
  actors: [
    { id: "user", label: "You", sub: "click Save" },
    { id: "browser", label: "Browser", sub: "sees the event" },
    { id: "js", label: "Your JavaScript", sub: "the listener" },
    { id: "page", label: "Page", sub: "the DOM" },
  ],
  steps: [
    {
      from: "user",
      to: "browser",
      message: "click",
      caption: "You click the Save button.",
      detail: "The browser turns the click into an event on that button.",
    },
    {
      from: "browser",
      to: "js",
      message: "call listener",
      caption: "It calls the function you registered for clicks.",
      detail: "That's addEventListener: you hand over a function to run later.",
    },
    {
      from: "js",
      to: "browser",
      message: "await fetch(...)",
      caption: "Your code sends the note to the server and waits.",
      detail: "Waiting with await doesn't freeze the page.",
    },
    {
      from: "js",
      to: "page",
      message: "update",
      caption: "When the reply arrives, it changes the page.",
      detail: "The new note appears, without reloading.",
    },
  ],
};

// JavaScript: 20 Basic, 12 Intermediate and 9 Advanced steps, numbered 1–41.
export const javascriptPath: TopicPath = {
  topicId: "javascript",
  summary: {
    what: "JavaScript is the programming language of the web: the part of a page that reacts, calculates and changes.",
    does: "It responds to clicks and typing, checks forms, loads data from servers and updates the page without reloading.",
    how: "The browser runs your code step by step; it waits for events and network replies without freezing, then runs the functions you gave it.",
  },
  overviewSceneId: "click",
  scenes: [clickScene],
  levels: { basic, intermediate, advanced },
};
