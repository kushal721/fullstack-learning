import { useState } from "react";
import { createNote } from "../services/notesApi.js";
import Button from "./Button.jsx";
import Input from "./Input.jsx";

export default function NoteForm({ onSaved }) {
  // Controlled inputs: the text lives in state, so we can read it on save
  // and clear it afterwards.
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(event) {
    // Stop the browser from reloading the page; we send the data ourselves.
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const note = await createNote({ title, content });
      onSaved(note);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="note-form" onSubmit={handleSave}>
      <Input
        id="note-title"
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={100}
        required
      />
      <Input
        id="note-content"
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
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
