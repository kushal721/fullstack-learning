import { useState } from "react";
import { updateNote } from "../services/notesApi.js";
import Button from "./Button.jsx";
import Input from "./Input.jsx";

export default function NoteCard({ note, onUpdated, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [error, setError] = useState(null);

  function startEditing() {
    // Start from the saved values, not from an earlier unsaved edit.
    setTitle(note.title);
    setContent(note.content);
    setError(null);
    setIsEditing(true);
  }

  async function handleUpdate(event) {
    event.preventDefault();
    try {
      const updated = await updateNote(note.id, { title, content });
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (isEditing) {
    return (
      <article className="note-card">
        <form onSubmit={handleUpdate}>
          <Input
            id={`title-${note.id}`}
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            required
          />
          <Input
            id={`content-${note.id}`}
            label="Note"
            multiline
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="note-actions">
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="note-card">
      <h2>{note.title}</h2>
      {/* React escapes this text, so a note containing HTML is shown as
          text and can never run as code (no XSS). */}
      <p>{note.content}</p>
      <div className="note-actions">
        <Button type="button" variant="secondary" onClick={startEditing}>
          Edit
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
