import type { Concept } from "@fsl/shared";

export const crud: Concept = {
  id: "crud",
  slug: "crud",
  title: "CRUD",
  topicId: "databases",
  summary:
    "The four basic things an app does with stored data: Create, Read, Update and Delete.",
  basics: [
    "A full-stack app has three layers. The frontend runs in the browser and shows the screen. The backend is a server program that receives HTTP requests from the frontend. The database stores the data permanently.",
    "The frontend talks to the backend with HTTP requests, and each request has a method that says what kind of action it is, such as GET or POST. The backend talks to the database with SQL statements such as `SELECT` or `INSERT`.",
    "A resource is one kind of thing the app manages, like notes or users. Each resource usually gets its own set of URLs on the backend, such as `/api/notes`.",
  ],
  what: [
    "CRUD is short for Create, Read, Update, Delete: the four operations almost every piece of stored data needs. Adding a note is Create, showing the list is Read, editing is Update and removing is Delete.",
    "It is a way of thinking, not a library. Each CRUD operation has a matching HTTP method and a matching SQL statement, so one user action lines up neatly through all three layers.",
  ],
  why: [
    "Most features are just CRUD on some resource. Once you can build these four operations for notes, you can build them for comments, tasks or products the same way.",
    "Using the same mapping everywhere makes code predictable. A developer who sees `PUT /api/notes/7` immediately knows it updates note 7, and expects an `UPDATE` statement somewhere behind it.",
  ],
  howItWorks: [
    "Create: the frontend sends `POST /api/notes` with the new note as JSON. The backend runs `INSERT` and answers `201 Created` with the saved note.",
    "Read: the frontend sends `GET /api/notes`. The backend runs `SELECT` and answers `200 OK` with an array of notes.",
    "Update: the frontend sends `PUT /api/notes/7` with the new title and content. The backend runs `UPDATE` for note 7 and answers `200` with the changed note, or `404` if there is no such note.",
    "Delete: the frontend sends `DELETE /api/notes/7`. The backend runs `DELETE` and answers `204 No Content`, a success with an empty body, or `404` if nothing was deleted.",
  ],
  basicExample: {
    language: "sql",
    code: `-- CRUD     SQL       HTTP                     Notes App controller
-- Create   INSERT    POST   /api/notes        createNote  -> 201
-- Read     SELECT    GET    /api/notes        listNotes   -> 200
-- Update   UPDATE    PUT    /api/notes/:id    updateNote  -> 200 or 404
-- Delete   DELETE    DELETE /api/notes/:id    deleteNote  -> 204 or 404

INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *;
SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC;
UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 AND user_id = $4 RETURNING *;
DELETE FROM notes WHERE id = $1 AND user_id = $2;`,
    caption:
      "The table at the top connects each CRUD operation to its SQL statement, HTTP method and URL, and Notes App controller function; below are the real queries the controller runs.",
  },
  internals: [
    "Each layer only knows its neighbour. The browser never sees SQL, and the database never sees HTTP. The controller in the middle translates: it reads the HTTP request, runs the matching SQL, and turns the result into an HTTP response.",
    "The `$1, $2` placeholders are filled in by the `pg` package with values the controller passes separately, such as `req.user.id` and `req.body.title`. This keeps user input from being run as SQL.",
    "The database reports how many rows a write touched. If an `UPDATE` or `DELETE` matched zero rows, the note did not exist or belonged to someone else, which is how the controller knows to answer `404`.",
    "Read is safe to repeat and changes nothing; Create, Update and Delete change the data. That is why browsers and caches may repeat GET requests but never repeat POST requests on their own.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL and create a small `notes` table in `psql`.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
docker exec -it notes-db psql -U postgres -c "CREATE TABLE notes (id SERIAL PRIMARY KEY, title TEXT NOT NULL);"`,
      },
    },
    {
      text: "In a new folder, set up a Node.js project with Express and `pg`.",
      code: {
        language: "bash",
        code: `npm init -y
npm pkg set type=module
npm install express pg`,
      },
    },
    {
      text: "Create `server.js` with one route per CRUD operation.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(express.json());

app.post("/api/notes", async (req, res) => {
  const result = await pool.query(
    "INSERT INTO notes (title) VALUES ($1) RETURNING *",
    [req.body.title]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/api/notes", async (req, res) => {
  const result = await pool.query("SELECT id, title FROM notes ORDER BY id");
  res.json(result.rows);
});

app.put("/api/notes/:id", async (req, res) => {
  const result = await pool.query(
    "UPDATE notes SET title = $1 WHERE id = $2 RETURNING *",
    [req.body.title, req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: "Note not found" });
  res.json(result.rows[0]);
});

app.delete("/api/notes/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Note not found" });
  res.status(204).end();
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with the database address, then try all four operations from a second terminal.",
      code: {
        language: "bash",
        code: `DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres node server.js

curl -X POST localhost:3000/api/notes -H "Content-Type: application/json" -d '{"title":"Shopping"}'
curl localhost:3000/api/notes
curl -X PUT localhost:3000/api/notes/1 -H "Content-Type: application/json" -d '{"title":"Groceries"}'
curl -i -X DELETE localhost:3000/api/notes/1`,
      },
    },
    {
      text: 'You should see the created note with `"id":1`, then a list containing it, then the renamed note, then `HTTP/1.1 204 No Content`. Run the DELETE again and you get `404`, because the row is already gone.',
    },
  ],
  whereUsed: [
    "Almost every app: to-do lists, shops, blogs, admin panels and social networks are mostly CRUD on different resources.",
    "REST APIs, which are usually designed as CRUD endpoints for each resource.",
    "Admin tools and database GUIs, which give you create, view, edit and delete buttons for every table.",
  ],
  connectsTo: [
    "HTTP methods: POST, GET, PUT and DELETE.",
    "Express routes, which match each method and path to a function.",
    "Controllers, which turn a request into SQL and the result into a response.",
    "The SQL statements `INSERT`, `SELECT`, `UPDATE` and `DELETE`.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/routes/notes.js` maps `GET /` to `listNotes`, `POST /` to `createNote`, `PUT /:id` to `updateNote` and `DELETE /:id` to `deleteNote`, giving the full set of CRUD endpoints under `/api/notes`.",
    },
    {
      explanation:
        "`backend/src/controllers/notesController.js` runs one SQL statement per function, each with `req.user.id`, so every operation only touches the logged-in user's notes.",
    },
    {
      explanation:
        "The frontend's notes service calls those four endpoints, and the notes page shows the list (Read), the form (Create and Update) and a delete button (Delete).",
    },
  ],
  commonMistakes: [
    "Using GET for an action that changes data, such as `GET /api/notes/7/delete`. Browsers and link previews may call GET URLs by themselves; use DELETE, PUT or POST for changes.",
    "Answering `200` or `204` even when the `UPDATE` or `DELETE` matched no row. Check `rowCount` and answer `404` when it is 0.",
    "Updating or deleting by `id` alone, which lets any logged-in user change anyone's note by guessing ids. Add `AND user_id = $n` with the logged-in user's id.",
    "Forgetting that Update needs the id in the URL, as in `PUT /api/notes/7`, while Create does not, because the database chooses the new id.",
  ],
  relatedConcepts: [
    "http-methods",
    "express-route",
    "controller",
    "sql-insert",
    "sql-select",
    "sql-update-delete",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
