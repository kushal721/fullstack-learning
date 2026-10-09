import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createNote } from "../services/notesApi.js";
import NoteForm from "./NoteForm.jsx";

// Replace the real API call, so the test needs no server.
vi.mock("../services/notesApi.js", () => ({ createNote: vi.fn() }));

describe("NoteForm", () => {
  it("saves the note, reports it and clears the form", async () => {
    const saved = { id: 1, title: "Shopping", content: "Milk" };
    createNote.mockResolvedValue(saved);
    const onSaved = vi.fn();
    render(<NoteForm onSaved={onSaved} />);

    await userEvent.type(screen.getByLabelText("Title"), "Shopping");
    await userEvent.type(screen.getByLabelText("Note"), "Milk");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(createNote).toHaveBeenCalledWith({
      title: "Shopping",
      content: "Milk",
    });
    expect(onSaved).toHaveBeenCalledWith(saved);
    expect(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("shows the error and keeps the text when saving fails", async () => {
    createNote.mockRejectedValue(new Error("Title is required"));
    render(<NoteForm onSaved={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("Title"), "Draft");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Title is required",
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Draft");
  });
});
