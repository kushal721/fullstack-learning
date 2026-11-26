import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const stateScene: Scene = {
  id: "state-to-screen",
  title: "State changes → screen updates",
  actors: [
    { id: "user", label: "You", sub: "click Delete" },
    { id: "handler", label: "Event handler", sub: "your function" },
    { id: "state", label: "React state", sub: "the notes" },
    { id: "component", label: "Component", sub: "Dashboard()" },
    { id: "screen", label: "The page", sub: "real HTML" },
  ],
  steps: [
    {
      from: "user",
      to: "handler",
      message: "onClick",
      caption: "You click Delete on a note, and React calls its handler.",
      detail: "The handler was passed to the button as a prop.",
    },
    {
      from: "handler",
      to: "state",
      message: "setNotes(fewer)",
      caption: "The handler doesn't touch the page: it sets new state.",
      detail: "A new array, without the deleted note.",
    },
    {
      from: "state",
      to: "component",
      message: "render again",
      caption: "New state, so React calls the component again.",
      detail: "It returns JSX for the notes as they are now.",
    },
    {
      from: "component",
      to: "screen",
      message: "update the DOM",
      caption: "React compares with last time and changes only what differs.",
      detail: "One card is removed; the rest stay as they were.",
    },
  ],
};

// React: every step is a module. Counts and numbering are in the level
// files.
export const reactPath: TopicPath = {
  topicId: "react",
  summary: {
    what: "React is a JavaScript library for building a page out of components.",
    does: "You describe what the screen should show for the current data, and React keeps the page matching it as the data changes.",
    how: "Components are functions that return JSX. They get inputs as props, remember data as state, and React re-renders them when that state changes.",
  },
  overviewSceneId: "state-to-screen",
  scenes: [stateScene],
  levels: { basic, intermediate, advanced },
};
