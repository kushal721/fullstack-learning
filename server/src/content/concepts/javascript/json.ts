import type { Concept } from "@fsl/shared";

export const json: Concept = {
  id: "json",
  slug: "json",
  title: "JSON",
  topicId: "javascript",
  summary:
    "A simple text format for writing data, used to send information between the browser and the server.",
  basics: [
    'Inside a running program, data lives in memory as values such as numbers, strings (pieces of text), arrays (ordered lists) and objects (groups of named values, like `{ title: "Shopping" }`).',
    "Memory belongs to one program on one computer. To send data to another program — for example from your browser to a server across the internet — it has to be turned into something that can travel, and the simplest thing that travels everywhere is plain text.",
    "Turning a value into text is called serializing; turning the text back into a value is called parsing. Both sides only need to agree on the rules of the text format.",
  ],
  what: [
    'JSON (JavaScript Object Notation) is a text format for data. It looks almost exactly like JavaScript objects and arrays, for example `{"title": "Shopping", "done": false, "tags": ["home"]}`.',
    "Its rules are stricter than JavaScript: keys must be in double quotes, strings use double quotes only, and there are no functions, no comments, no `undefined` and no trailing comma after the last item. Allowed values are strings, numbers, `true`, `false`, `null`, arrays and objects.",
  ],
  why: [
    "A frontend written in JavaScript often talks to a backend written in another language, such as Python, Java or Go. Every popular language has a built-in or standard way to read and write JSON, so it works as a shared language between them.",
    "Because it is plain text, JSON is also easy for people to read: you can look at a request in the browser's Network tab, or at a config file like `package.json`, and understand it straight away.",
  ],
  howItWorks: [
    "`JSON.stringify(value)` takes a JavaScript value and returns a JSON string. Functions and `undefined` properties are left out, because JSON has no way to write them.",
    "`JSON.parse(text)` takes a JSON string and builds a brand-new JavaScript value from it. If the text breaks any rule (a single quote, a trailing comma), it throws a `SyntaxError` instead of guessing.",
    "In web requests, the sender puts the JSON string in the request or response body and adds the header `Content-Type: application/json`, so the receiver knows to parse it as JSON.",
  ],
  basicExample: {
    language: "js",
    code: `const note = { title: "Shopping", tags: ["home"] };

const text = JSON.stringify(note);
console.log(text); // {"title":"Shopping","tags":["home"]}

const copy = JSON.parse(text);
console.log(copy.title); // Shopping`,
    caption:
      "`JSON.stringify` turns the object into text; `JSON.parse` turns that text back into a new object.",
  },
  internals: [
    "`JSON.stringify` walks through the value: each object becomes `{...}` with quoted keys, each array becomes `[...]`, strings get double quotes and special characters such as new lines are escaped as `\\n`.",
    'A `Date` becomes a string like `"2024-05-01T10:00:00.000Z"`, and `JSON.parse` gives you back that string, not a `Date`. JSON only knows its few basic types, so anything richer has to be converted by your own code.',
    "The result of `JSON.parse` is a completely separate copy. Changing it never changes the original object, because the two only ever shared text, not memory.",
  ],
  howToCreate: [
    {
      text: "Create a file called `json-demo.mjs` in an empty folder and turn an object into JSON text.",
      code: {
        language: "js",
        fileName: "json-demo.mjs",
        code: `const note = { title: "Shopping", content: "Milk, eggs", pinned: false };

const text = JSON.stringify(note);
console.log(text);
console.log(typeof text);`,
      },
    },
    {
      text: "Add lines that parse the text back into an object and read one of its properties.",
      code: {
        language: "js",
        fileName: "json-demo.mjs",
        code: `const back = JSON.parse(text);
console.log(back.content);`,
      },
    },
    {
      text: "Add a broken JSON string (single quotes are not allowed) and see what `JSON.parse` does with it.",
      code: {
        language: "js",
        fileName: "json-demo.mjs",
        code: `try {
  JSON.parse("{'title': 'Oops'}");
} catch (error) {
  console.log("Invalid JSON:", error.message);
}`,
      },
    },
    {
      text: "Run the file with Node.js. You should see the JSON text, the word `string`, the note's content, and an `Invalid JSON` message for the broken string.",
      code: {
        language: "bash",
        code: `node json-demo.mjs`,
      },
    },
  ],
  whereUsed: [
    "The bodies of most web API requests and responses, such as creating a note or loading a list of notes.",
    "Configuration files like `package.json` and `tsconfig.json`.",
    "Saving data as text, for example in the browser's `localStorage`, which can only store strings.",
  ],
  connectsTo: [
    "JavaScript objects and arrays, which it is modelled on.",
    "`fetch()`, which sends JSON in the request body and reads it back with `response.json()`.",
    "HTTP requests like POST, whose `Content-Type: application/json` header says the body is JSON.",
    "Express on the server, where `express.json()` parses the incoming JSON body.",
  ],
  projectUsage: [
    {
      explanation:
        "`frontend/src/services/notesApi.js` sends a new note with `body: JSON.stringify({ title, content })` and reads every response with `await response.json()`, which parses the JSON body into an object.",
    },
    {
      explanation:
        "On the backend, `express.json()` in `backend/src/` parses the JSON request body so controllers can read `req.body.title`, and they answer with `res.json(...)`, which turns the result back into JSON text.",
    },
    {
      explanation:
        'Error replies are JSON too: the backend sends `{ "error": "..." }`, and `notesApi.js` reads that `error` field to show a helpful message.',
    },
  ],
  commonMistakes: [
    "Sending an object directly as a `fetch()` body: it arrives as the text `[object Object]`. Wrap it with `JSON.stringify(...)` first.",
    "Writing JSON by hand with single quotes, unquoted keys or a trailing comma, so `JSON.parse` throws a `SyntaxError`. Use double quotes everywhere and remove the last comma.",
    "Calling `JSON.parse` on something that is already an object (for example the result of `response.json()`). Parse text only once.",
    "Expecting a `Date` or a function to survive a round trip through JSON. Store dates as strings and convert them back with `new Date(text)` when you need them.",
  ],
  relatedConcepts: ["js-object-array", "js-fetch", "http-post"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
