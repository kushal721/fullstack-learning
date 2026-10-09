import type { Concept } from "@fsl/shared";

export const httpPutDelete: Concept = {
  id: "http-put-delete",
  slug: "http-put-delete",
  title: "HTTP PUT, PATCH and DELETE",
  topicId: "http",
  summary:
    "The HTTP methods a client uses to change or remove something that already exists on the server, such as editing or deleting one note.",
  basics: [
    "The browser sends requests to the server, and each request starts with a method that says what kind of action is wanted. GET reads data and POST creates new data; this concept covers the methods for changing and removing it.",
    "Each thing the server stores, such as one note, is a resource with its own address. The address usually ends with the item's id, the unique number the database gave it, like `/api/notes/42` for the note with id 42.",
    "To change or delete something, the server needs to know exactly which one. Putting the id in the path answers that question before the body is even read.",
  ],
  what: [
    "PUT replaces a resource with the complete new version sent in the body, and PATCH changes only the fields included in the body. `PUT /api/notes/42` with a title and content replaces note 42; `PATCH /api/notes/42` with only a title changes just the title.",
    "DELETE removes the resource named in the path. `DELETE /api/notes/42` deletes note 42 and needs no body.",
  ],
  why: [
    "Giving each kind of change its own method makes the API easy to read and lets the server send each one to a different function. A request like `DELETE /api/notes/42` is clear to anyone who sees it.",
    "PUT and DELETE are idempotent: sending the same request again changes nothing more. That matters on unreliable networks, because if a request times out the client can simply send it again without worrying about doing the action twice.",
  ],
  howItWorks: [
    "The client sends the method and the path with the id, such as `PUT /api/notes/42`. For PUT and PATCH, the body holds the new data as JSON, with the `Content-Type: application/json` header.",
    "The server reads the id from the path (Express puts it in `req.params.id`), checks that the item exists and that the user may change it, then runs an SQL `UPDATE` or `DELETE`.",
    "A successful update usually answers `200 OK` with the updated item. A successful delete usually answers `204 No Content`, which means it worked and there is nothing to send back. If no item has that id, either one answers `404 Not Found`.",
  ],
  basicExample: {
    language: "http",
    code: `PUT /api/notes/42 HTTP/1.1
Content-Type: application/json

{ "title": "Shopping", "content": "Milk, bread and eggs" }

HTTP/1.1 200 OK
Content-Type: application/json

{ "id": 42, "title": "Shopping", "content": "Milk, bread and eggs" }

DELETE /api/notes/42 HTTP/1.1

HTTP/1.1 204 No Content`,
    caption:
      "A PUT that replaces note 42 and returns the new version, followed by a DELETE that removes it and answers 204 with no body.",
  },
  internals: [
    "Idempotent describes the effect on the server, not the response. The first `DELETE /api/notes/42` answers `204` and the second answers `404`, but after both the note is simply gone, the same as after one.",
    "PATCH is not guaranteed to be idempotent: a patch that says add one to the counter gives a different result each time. That is why clients do not retry PATCH automatically.",
    "With PUT, any field you leave out is meant to be replaced too, so the client should send the whole item. With PATCH, fields you leave out stay as they were.",
    '`req.params.id` is always a string, like `"42"`. Convert it with `Number()` before comparing it with numeric ids in JavaScript; SQL parameters handle the conversion for you.',
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
      text: "Create `server.js` with PUT, PATCH and DELETE routes for notes kept in an array.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";

const app = express();
app.use(express.json());

let notes = [{ id: 42, title: "Shopping", content: "Milk" }];

app.put("/api/notes/:id", (req, res) => {
  const index = notes.findIndex((n) => n.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Note not found" });
  const { title, content } = req.body ?? {};
  notes[index] = { id: notes[index].id, title, content }; // full replacement
  res.json(notes[index]);
});

app.patch("/api/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Note not found" });
  Object.assign(note, req.body, { id: note.id }); // only the fields sent
  res.json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  const before = notes.length;
  notes = notes.filter((n) => n.id !== Number(req.params.id));
  if (notes.length === before) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.status(204).end();
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with `node server.js`, then in a second terminal change only the title with PATCH, replace the whole note with PUT, and delete it twice.",
      code: {
        language: "bash",
        code: `curl -i -X PATCH http://localhost:3000/api/notes/42 -H "Content-Type: application/json" -d '{"title":"Groceries"}'
curl -i -X PUT http://localhost:3000/api/notes/42 -H "Content-Type: application/json" -d '{"title":"Todo"}'
curl -i -X DELETE http://localhost:3000/api/notes/42
curl -i -X DELETE http://localhost:3000/api/notes/42`,
      },
    },
    {
      text: 'Check the results: PATCH kept `"content":"Milk"` and changed only the title. PUT sent no content, so the replaced note has no `content` at all. The first DELETE answers `HTTP/1.1 204 No Content` and the second `404 Not Found`, yet the note stays deleted either way.',
    },
  ],
  whereUsed: [
    "Edit forms, such as saving changes to a note, a profile or a setting.",
    "Delete buttons, usually after asking the user to confirm.",
    "Any REST API, where items are changed and removed through their own path, like `/api/users/7` or `/api/notes/42`.",
  ],
  connectsTo: [
    '`fetch()` with `method: "PUT"`, `"PATCH"` or `"DELETE"`.',
    'Express routes with a path parameter, like `router.put("/:id", ...)`, and `req.params.id`.',
    "SQL `UPDATE` and `DELETE` statements with a `WHERE` clause that picks the one row.",
    "Status codes `200`, `204` and `404`, which tell the client how the change went.",
  ],
  projectUsage: [
    {
      explanation:
        '`backend/src/routes/notes.js` registers `router.put("/:id", notesController.updateNote)` and `router.delete("/:id", notesController.deleteNote)`, mounted at `/api/notes`, so the paths are `PUT /api/notes/:id` and `DELETE /api/notes/:id`. The Notes App uses PUT, not PATCH, because the edit form always sends the whole note.',
    },
    {
      explanation:
        "`updateNote` answers `200` with the updated note, and `deleteNote` answers `204` with no body. Both answer `404` when no note with that id exists for the logged-in user, so nobody can edit or delete someone else's note.",
    },
    {
      explanation:
        '`frontend/src/services/notesApi.js` sends these requests with `fetch()`, setting `method: "PUT"` or `method: "DELETE"` and `credentials: "include"` so the login cookie goes along.',
    },
  ],
  commonMistakes: [
    "Calling `response.json()` after a `204 No Content` response, which throws because there is no body to read. Check `response.status` and skip reading the body for 204.",
    "Forgetting to check that the item belongs to the logged-in user, which lets anyone change any note by guessing ids. Include the user id in the `WHERE` clause, like `WHERE id = $1 AND user_id = $2`.",
    "Sending only some fields with PUT and accidentally wiping the others. Send the whole item with PUT, or use PATCH for partial changes.",
    "Comparing `req.params.id` (a string) with a number using `===`, so nothing ever matches. Convert it with `Number(req.params.id)` first.",
  ],
  relatedConcepts: [
    "http-methods",
    "http-post",
    "http-status-codes",
    "express-route",
    "js-fetch",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
