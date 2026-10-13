import type { FixExercise } from "@fsl/shared";

// What's wrong with this code? Each snippet has one real bug.
export const fixExercises: FixExercise[] = [
  {
    id: "fix-delete-any-note",
    mode: "fix",
    title: "Deleting someone else's note",
    prompt:
      "With this version of `deleteNote`, any logged-in user can delete any note by changing the id in the URL. Which change fixes it?",
    snippet: {
      language: "js",
      code: 'export async function deleteNote(req, res) {\n  const id = noteId(req);\n  if (!id) return res.status(404).json({ error: "Note not found" });\n  const result = await pool.query("DELETE FROM notes WHERE id = $1", [id]);\n  if (result.rowCount === 0) {\n    return res.status(404).json({ error: "Note not found" });\n  }\n  res.status(204).end();\n}',
      fileName: "backend/src/controllers/notesController.js",
      highlightLines: [4],
    },
    choices: [
      {
        id: "add-user-filter",
        text: 'Add the owner to the condition: `"DELETE FROM notes WHERE id = $1 AND user_id = $2", [id, req.user.id]`.',
      },
      {
        id: "check-number",
        text: "Check that the id is a number before deleting.",
      },
      {
        id: "hide-button",
        text: "Only show the Delete button on the user's own notes.",
      },
      {
        id: "try-catch",
        text: "Wrap the query in `try`/`catch` and answer `500` when it fails.",
      },
    ],
    correctChoiceId: "add-user-filter",
    conceptIds: ["authentication-vs-authorization", "sql-update-delete"],
    buildStepId: "add-security",
    hints: [
      "The user is logged in, so authentication works. Which question is never asked?",
      "Which value says who is asking, and where is it missing?",
    ],
    explanation:
      "The query only matches the id, so it deletes whichever note has it. Adding `AND user_id = $2` with `req.user.id`, the id from the verified login, means the row is only deleted if it belongs to the person asking; anyone else's note gives `rowCount` 0 and `404`. `noteId` already checks the number, hiding the button doesn't stop a request sent without it, and `try`/`catch` doesn't change which rows match.",
  },
];
