import type { Topic } from "@fsl/shared";

// The Learning Tree (spec §4.1): the order a beginner should learn in.
// Content only — lookups live in lib/learning-tree.ts.

type TopicInput = Pick<Topic, "id" | "title" | "summary"> & Partial<Topic>;

/** Fills the fields that start empty, so each topic below stays readable. */
function topic(order: number, input: TopicInput): Topic {
  return {
    slug: input.id,
    order,
    overview: [],
    children: [],
    conceptIds: [],
    buildStepIds: [],
    ...input,
  };
}

const topics: TopicInput[] = [
  {
    id: "how-the-web-works",
    title: "How the Web Works",
    summary:
      "What happens between typing an address in the browser and seeing a page: browsers, servers, URLs and requests.",
  },
  {
    id: "html",
    title: "HTML",
    summary:
      "The structure of a web page: the elements that tell the browser what each piece of content is.",
  },
  {
    id: "css",
    title: "CSS",
    summary:
      "How a page looks: colours, spacing and layout, and how the same page adapts to different screens.",
  },
  {
    id: "javascript",
    title: "JavaScript",
    summary:
      "The language that makes pages respond to the user: variables, functions, events and talking to servers.",
  },
  {
    id: "git",
    title: "Git & GitHub",
    summary:
      "Saving the history of your project, working on changes safely in branches, and sharing code through pull requests.",
  },
  {
    id: "react",
    title: "React",
    summary:
      "Building the interface from reusable components that update automatically when the application's data changes.",
  },
  {
    id: "http",
    title: "HTTP & APIs",
    summary:
      "How the frontend and backend talk: requests, responses, methods, status codes and JSON.",
  },
  {
    id: "backend",
    title: "Backend",
    summary:
      "The server side with Node.js and Express: receiving requests, applying rules and sending responses.",
  },
  {
    id: "databases",
    title: "Databases",
    summary:
      "Storing data so it survives a restart: tables, rows, relationships and SQL queries.",
  },
  {
    id: "authentication",
    title: "Authentication",
    summary:
      "Knowing who the user is: registering, logging in, protecting passwords and remembering a logged-in user.",
  },
  {
    id: "security",
    title: "Security",
    summary:
      "Keeping users and data safe: authorization, validating input and avoiding common attacks.",
  },
  {
    id: "testing",
    title: "Testing",
    summary:
      "Checking automatically that the application still works after every change.",
  },
  {
    id: "deployment",
    title: "Deployment",
    summary:
      "Turning the project on your computer into a live website anyone can visit.",
  },
  {
    id: "how-everything-connects",
    title: "How Everything Connects",
    summary:
      "Following one action from the button, through the backend and database, and back to the screen.",
  },
];

export const learningTree: Topic = topic(0, {
  id: "full-stack-development",
  title: "Full-Stack Development",
  summary:
    "Everything needed to build a web application, from an empty folder to a deployed website.",
  children: topics.map((input, index) => topic(index + 1, input)),
});
