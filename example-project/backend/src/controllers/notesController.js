import { pool } from "../db.js";
import { validateNote } from "../validation/noteValidation.js";

// Every query includes `user_id = $n` with the logged-in user's id, so a
// user can only ever see or change their own notes (authorization).
// Values are always passed separately ($1, $2…), never glued into the SQL,
// so user input can never change the query (no SQL injection).

// Ids in the URL are text. Anything that isn't a positive whole number can't
// be a note, so it is "not found" instead of a database error.
function noteId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function listNotes(req, res) {
  const result = await pool.query(
    `SELECT id, title, content, created_at, updated_at
       FROM notes
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [req.user.id],
  );
  res.json(result.rows);
}

export async function createNote(req, res) {
  const error = validateNote(req.body);
  if (error) return res.status(400).json({ error });

  const { title, content = "" } = req.body;
  const result = await pool.query(
    `INSERT INTO notes (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING id, title, content, created_at, updated_at`,
    [req.user.id, title.trim(), content],
  );
  res.status(201).json(result.rows[0]);
}

export async function updateNote(req, res) {
  const id = noteId(req);
  if (!id) return res.status(404).json({ error: "Note not found" });
  const error = validateNote(req.body);
  if (error) return res.status(400).json({ error });

  const { title, content = "" } = req.body;
  const result = await pool.query(
    `UPDATE notes
        SET title = $1, content = $2, updated_at = now()
      WHERE id = $3 AND user_id = $4
      RETURNING id, title, content, created_at, updated_at`,
    [title.trim(), content, id, req.user.id],
  );
  // No row: the note doesn't exist, or it belongs to someone else. Both get
  // the same answer, so nobody can find out which note ids exist.
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(result.rows[0]);
}

export async function deleteNote(req, res) {
  const id = noteId(req);
  if (!id) return res.status(404).json({ error: "Note not found" });
  const result = await pool.query(
    "DELETE FROM notes WHERE id = $1 AND user_id = $2",
    [id, req.user.id],
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.status(204).end();
}
