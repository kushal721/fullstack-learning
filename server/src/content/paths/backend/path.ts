import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const requestScene: Scene = {
  id: "request-reaches-code",
  title: "A request reaches your code",
  actors: [
    { id: "client", label: "The browser", sub: "fetch()" },
    { id: "node", label: "Node.js", sub: "server.js" },
    { id: "middleware", label: "Middleware", sub: "json, auth" },
    { id: "controller", label: "Controller", sub: "createNote()" },
    { id: "database", label: "Database", sub: "PostgreSQL" },
  ],
  steps: [
    {
      from: "client",
      to: "node",
      message: "POST /api/notes",
      caption:
        "A request arrives on the port your Node.js process is listening on.",
      detail: "server.js started Express with app.listen(3000).",
    },
    {
      from: "node",
      to: "middleware",
      message: "express.json()",
      caption:
        "Express runs the middleware in order. The JSON body becomes req.body.",
      detail: "Then cookieParser() reads the Cookie header.",
    },
    {
      from: "middleware",
      to: "middleware",
      message: "requireAuth → next()",
      caption:
        "The login check finds the user and calls next(). Without a valid cookie it answers 401 and stops.",
      detail: "Middleware either responds or passes the request on.",
    },
    {
      from: "middleware",
      to: "controller",
      message: "route matched",
      caption:
        "The router finds POST / under /api/notes and calls its controller.",
      detail: "routes/notes.js maps each method and path to a function.",
    },
    {
      from: "controller",
      to: "database",
      message: "INSERT … RETURNING",
      caption:
        "The controller validates the body, then asks the database to save the note.",
      detail: "Invalid data gets a 400 before the database is touched.",
    },
    {
      from: "controller",
      to: "client",
      message: "201 + the note",
      caption:
        "The controller sends one response. If anything threw, the error handler would send a 500 instead.",
      detail: "res.status(201).json(note)",
    },
  ],
};

// Backend: every step is a module. Counts and numbering are in the level
// files.
export const backendPath: TopicPath = {
  topicId: "backend",
  summary: {
    what: "A backend is the program on a server that receives requests, applies the app's rules and answers, like the Notes App's Express API.",
    does: "It keeps the rules and data that can't be trusted to the browser: who may see which notes, what a valid note is, and how it's stored.",
    how: "Node.js runs JavaScript on the server; Express sends each request through middleware to the route's controller, which checks it, uses the database and responds.",
  },
  overviewSceneId: "request-reaches-code",
  scenes: [requestScene],
  levels: { basic, intermediate, advanced },
};
