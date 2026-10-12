import type { Concept } from "@fsl/shared";

export const httpMethods: Concept = {
  id: "http-methods",
  slug: "http-methods",
  title: "HTTP methods",
  topicId: "http",
  summary:
    "The verb at the start of every HTTP request, such as GET or DELETE, that tells the server what kind of action the client wants.",
  basics: [
    "Every HTTP request is a message from a client (usually the browser) to a server. Its first line names an action and a target, like `DELETE /api/notes/42`: the action is the method, the target is the path.",
    "A resource is any thing the server manages that has its own address, such as the list of notes at `/api/notes` or one note at `/api/notes/42`. The method says what to do with that resource.",
    "The same path can mean different things with different methods. `GET /api/notes` reads the notes, while `POST /api/notes` adds a new one, so the server looks at both the method and the path to decide which code to run.",
  ],
  what: [
    "The five methods you will use most are GET (read), POST (create), PUT (replace), PATCH (change part of) and DELETE (remove). There are others, such as HEAD and OPTIONS, that browsers mostly use behind the scenes.",
    "Each method also carries two promises. A safe method only reads and never changes anything on the server. An idempotent method has the same effect whether you send it once or ten times: deleting note 42 twice still leaves note 42 deleted.",
  ],
  why: [
    "Using the matching method makes an API predictable: a developer who sees `DELETE /api/notes/42` knows what it does without reading the code, and the server can send each method to a different function.",
    "Browsers, caches and other tools rely on those promises. A safe GET may be cached, repeated or even fetched in advance by a browser preloading links, and an idempotent request may be retried automatically if the connection drops. If a GET deleted data, a preloaded link could delete a note nobody clicked; if POSTs were retried automatically, a note could be saved twice. That is why those helpers only repeat requests whose method promises it is harmless.",
  ],
  howItWorks: [
    "GET asks for a resource and is safe and idempotent. POST sends data to create something new and is neither: sending it twice usually creates two items.",
    "PUT sends a complete new version of a resource to replace the old one, and is idempotent because replacing with the same data twice gives the same result. PATCH sends only the fields to change; it is not guaranteed to be idempotent, because a patch like add one to a counter gives a different result each time.",
    "DELETE removes a resource and is idempotent: after the first call it is gone, and later calls change nothing more, even though they may answer `404 Not Found`.",
    "On the server, Express has one function per method (`app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`), so each method and path pair runs its own handler.",
  ],
  basicExample: {
    language: "http",
    code: `GET    /api/notes      (read all my notes)
POST   /api/notes      (create a new note)
PUT    /api/notes/42   (replace note 42)
PATCH  /api/notes/42   (change part of note 42)
DELETE /api/notes/42   (delete note 42)`,
    caption:
      "The same two paths combined with different methods give five different actions. Only GET is safe; GET, PUT and DELETE are idempotent.",
  },
  internals: [
    "The method is just the first word of the request line, written in capital letters. The server reads it before anything else, and Express makes it available as `req.method`.",
    "An HTML `<form>` can only send GET or POST. `fetch()` can send any method through its `method` option and uses GET when you leave it out.",
    "Safe and idempotent are promises about the effect on the server, not about the response. A second DELETE may answer `404` instead of `204`, but the note is still deleted either way, so the method is still idempotent.",
    "These promises are not enforced by anyone. If you write a GET route that deletes data, nothing stops it from running, which is why choosing the right method is your responsibility.",
  ],
  howToCreate: [
    {
      text: "Create a project with Express and switch it to ES modules.",
      code: {
        language: "bash",
        code: `mkdir api && cd api && npm init -y && npm install express
npm pkg set type=module`,
      },
    },
    {
      text: "Create `server.js` with one route per method, keeping notes in an array (it is emptied each time the server restarts).",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.use(express.json());

let notes = [];
let nextId = 1;

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.post("/api/notes", (req, res) => {
  const note = { id: nextId++, title: req.body?.title ?? "" };
  notes.push(note);
  res.status(201).json(note);
});

app.put("/api/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Note not found" });
  note.title = req.body?.title ?? "";
  res.json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  notes = notes.filter((n) => n.id !== Number(req.params.id));
  res.status(204).end();
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with `node server.js`. In a second terminal, run the same POST twice, then list the notes.",
      code: {
        language: "bash",
        code: `curl -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d '{"title":"Milk"}'
curl -X POST http://localhost:3000/api/notes -H "Content-Type: application/json" -d '{"title":"Milk"}'
curl http://localhost:3000/api/notes`,
      },
    },
    {
      text: "Now run the same PUT twice and the same DELETE twice, listing the notes after each pair.",
      code: {
        language: "bash",
        code: `curl -X PUT http://localhost:3000/api/notes/1 -H "Content-Type: application/json" -d '{"title":"Bread"}'
curl -X PUT http://localhost:3000/api/notes/1 -H "Content-Type: application/json" -d '{"title":"Bread"}'
curl http://localhost:3000/api/notes
curl -i -X DELETE http://localhost:3000/api/notes/2
curl -i -X DELETE http://localhost:3000/api/notes/2
curl http://localhost:3000/api/notes`,
      },
    },
    {
      text: "Check the results: two POSTs created two notes (ids 1 and 2), two PUTs left one note titled Bread, and two DELETEs left note 2 gone with both answering `204 No Content`. Repeating PUT and DELETE changed nothing extra; repeating POST did.",
    },
  ],
  whereUsed: [
    "Every REST API, where the method says what to do and the path says to which resource.",
    "Browsers and caches, which decide what may be cached, preloaded or retried based on the method.",
    "Express routes, which are registered per method with `router.get`, `router.post`, `router.put` and `router.delete`.",
  ],
  connectsTo: [
    "The request line of an HTTP request, where the method is the first word.",
    "`fetch()`, whose `method` option chooses the method (GET by default).",
    "Express routes, where `router.get(...)`, `router.post(...)` and friends connect a method and path to a handler.",
    "SQL on the server: GET usually runs a `SELECT`, POST an `INSERT`, PUT or PATCH an `UPDATE`, and DELETE a `DELETE`.",
  ],
  projectUsage: [
    {
      explanation:
        '`backend/src/routes/notes.js` maps each note action to a method: `router.get("/")` lists notes, `router.post("/")` creates one, `router.put("/:id")` updates one and `router.delete("/:id")` deletes one. Mounted at `/api/notes` in `server.js`, these become `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id` and `DELETE /api/notes/:id`.',
      fileId: "backend/src/routes/notes.js",
      match: 'notesRoutes.get("/", notesController.listNotes);',
    },
    {
      explanation:
        "The Notes App uses PUT rather than PATCH for editing, because the edit form always sends the whole note (title and content), so the request is a full replacement.",
      fileId: "frontend/src/services/notesApi.js",
      match: 'method: "PUT",',
    },
    {
      explanation:
        "Register, login and logout are all POST (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`) because they send data or change the login state, so they must never be GET requests a browser might repeat or preload.",
      fileId: "backend/src/routes/auth.js",
      match: 'authRoutes.post("/register", authController.register);',
    },
  ],
  commonMistakes: [
    "Changing data in a GET route, such as `GET /api/notes/42/delete`. A browser preloading the link or a crawler following it would delete the note. Use `DELETE /api/notes/42` instead.",
    "Using POST for everything. It works, but loses the meaning and the safe retries that PUT and DELETE give. Pick the method that matches the action.",
    'Registering a route with one method and calling it with another, for example `router.put` on the server but `method: "PATCH"` in `fetch()`, which ends in `404`. Make the client and server use the same method and path.',
    "Forgetting the `method` option in `fetch()`, which then sends a GET. Always set `method` for anything that is not a read.",
  ],
  relatedConcepts: [
    "http-request-response",
    "http-get",
    "http-post",
    "http-put-delete",
    "rest-endpoint",
    "express-route",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
