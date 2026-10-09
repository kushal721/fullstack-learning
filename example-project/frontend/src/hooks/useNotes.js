import { useEffect, useState } from "react";
import { deleteNote, getNotes } from "../services/notesApi.js";

// Owns the list of notes so components only decide what to show.
export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the notes once, when the component using this hook appears.
  useEffect(() => {
    let ignore = false;
    getNotes()
      .then((loaded) => {
        if (!ignore) setNotes(loaded);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    // If the component disappears first, ignore the late response.
    return () => {
      ignore = true;
    };
  }, []);

  // New arrays every time: React only re-renders when state is a new value.
  function addNote(note) {
    setNotes((current) => [note, ...current]);
  }

  function replaceNote(updated) {
    setNotes((current) =>
      current.map((note) => (note.id === updated.id ? updated : note)),
    );
  }

  async function removeNote(id) {
    await deleteNote(id);
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  return { notes, isLoading, error, addNote, replaceNote, removeNote };
}
