import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const exchangeScene: Scene = {
  id: "request-response-pieces",
  title: "A request and its response, piece by piece",
  actors: [
    { id: "client", label: "Your code", sub: "notesApi.js" },
    { id: "server", label: "The API", sub: "Express" },
    { id: "route", label: "The route", sub: "POST /api/notes" },
    { id: "handler", label: "The handler", sub: "createNote()" },
  ],
  steps: [
    {
      from: "client",
      to: "server",
      message: "POST /api/notes",
      caption:
        "The request line: a method saying what to do, and a URL naming what to do it to.",
      detail: "POST means create; /api/notes is the collection of notes.",
    },
    {
      from: "client",
      to: "server",
      message: "Content-Type: application/json",
      caption:
        "Headers describe the message: here, that the body is JSON. The login cookie goes too.",
      detail: "Headers are name: value lines before the body.",
    },
    {
      from: "client",
      to: "server",
      message: '{ "title": "Milk" }',
      caption: "The body carries the data: the new note, as JSON text.",
      detail: "JSON.stringify turned the object into text.",
    },
    {
      from: "server",
      to: "route",
      message: "match method + path",
      caption:
        "The API finds the route for this method and path, after its middleware has read the JSON.",
      detail: "express.json() turned the body back into req.body.",
    },
    {
      from: "route",
      to: "handler",
      message: "createNote(req, res)",
      caption:
        "The handler checks the data. A missing title would get a 400 and an error, and stop here.",
      detail: "The server always checks, whatever the browser did.",
    },
    {
      from: "handler",
      to: "client",
      message: "201 Created",
      caption:
        "Saved: the status code says how it went, and the body is the note as stored, with its new id.",
      detail: "fetch resolves; response.ok is true for any 2xx.",
    },
  ],
};

// HTTP & APIs: every step is a module. Counts and numbering are in the
// level files.
export const httpPath: TopicPath = {
  topicId: "http",
  summary: {
    what: "An API is a set of URLs that programs call over HTTP to read and change data, such as the Notes App's /api/notes.",
    does: "It lets a front end, a phone app or another server use your data and features without knowing how they're built.",
    how: "Each request names a method and a URL and may carry headers and a JSON body; each response answers with a status code, headers and usually JSON.",
  },
  overviewSceneId: "request-response-pieces",
  scenes: [exchangeScene],
  levels: { basic, intermediate, advanced },
};
