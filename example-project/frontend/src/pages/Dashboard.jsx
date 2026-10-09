import NoteCard from "../components/NoteCard.jsx";
import NoteForm from "../components/NoteForm.jsx";
import { useNotes } from "../hooks/useNotes.js";

// The closest common parent of the form and the cards: it holds the shared
// notes (through useNotes) and passes data down and callbacks down to them.
export default function Dashboard() {
  const { notes, isLoading, error, addNote, replaceNote, removeNote } =
    useNotes();

  return (
    <main className="dashboard">
      <h1>Your notes</h1>
      <NoteForm onSaved={addNote} />
      {isLoading && <p>Loading notes…</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!isLoading && !error && notes.length === 0 && (
        <p>No notes yet. Write your first one above.</p>
      )}
      <section className="notes-grid" aria-label="Notes">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdated={replaceNote}
            onDelete={removeNote}
          />
        ))}
      </section>
    </main>
  );
}
