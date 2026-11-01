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

const fetchScene: Scene = {
  id: "fetch",
  title: "fetch: asking a server for data",
  actors: [
    { id: "js", label: "Your code", sub: "an async function" },
    { id: "browser", label: "Browser", sub: "sends requests" },
    { id: "server", label: "Server", sub: "the API" },
    { id: "page", label: "Page", sub: "the DOM" },
  ],
  steps: [
    {
      from: "js",
      to: "browser",
      message: 'fetch("/api/notes")',
      caption:
        "Your code asks for the notes and gets a pending promise at once.",
      detail: "await pauses only this function; the page keeps working.",
    },
    {
      from: "browser",
      to: "server",
      message: "GET /api/notes",
      caption: "The browser sends an HTTP request to the server.",
      detail: "This is the slow part: it travels over the network.",
    },
    {
      from: "server",
      to: "browser",
      message: "200 OK + JSON",
      caption: "The server answers with a status code and a JSON body.",
      detail: "A 404 or 500 is an answer too, so fetch doesn't reject.",
    },
    {
      from: "browser",
      to: "js",
      message: "response",
      caption: "The promise is fulfilled, and your function carries on.",
      detail: "Check response.ok, then await response.json() for the data.",
    },
    {
      from: "js",
      to: "page",
      message: "show the notes",
      caption: "Your code puts the notes on the page.",
      detail: "Until now the page showed a loading message.",
    },
  ],
};

// JavaScript: 11 Basic, 6 Intermediate and 9 Advanced steps, numbered 1–26.
export const javascriptPath: TopicPath = {
  topicId: "javascript",
  summary: {
    what: "JavaScript is the programming language of the web: the part of a page that reacts, calculates and changes.",
    does: "It responds to clicks and typing, checks forms, loads data from servers and updates the page without reloading.",
    how: "The browser runs your code step by step; it waits for events and network replies without freezing, then runs the functions you gave it.",
  },
  overviewSceneId: "click",
  scenes: [clickScene, fetchScene],
  levels: { basic, intermediate, advanced },
};
