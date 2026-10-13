import type { PredictExercise } from "@fsl/shared";

// What happens when…? One outcome is right; the others are common guesses.
export const predictExercises: PredictExercise[] = [
  {
    id: "predict-blank-title",
    mode: "predict",
    title: "A title of only spaces",
    prompt:
      "In the note form, the user types three spaces as the title and clicks Save. What happens?",
    code: {
      language: "jsx",
      code: '<Input\n  id="note-title"\n  label="Title"\n  value={title}\n  onChange={(event) => setTitle(event.target.value)}\n  maxLength={100}\n  required\n/>',
      fileName: "frontend/src/components/NoteForm.jsx",
    },
    choices: [
      {
        id: "browser-blocks",
        text: "The browser refuses to submit the form, because the input is `required`.",
      },
      {
        id: "saved-blank",
        text: "The note is saved with a blank title.",
      },
      {
        id: "server-400",
        text: "The request is sent, the server answers `400 Title is required`, and the form shows that message.",
      },
      {
        id: "crash-500",
        text: "The server crashes and answers `500 Something went wrong`.",
      },
    ],
    correctChoiceId: "server-400",
    conceptIds: ["input-validation", "react-controlled-form"],
    buildStepId: "add-security",
    hints: [
      "For `required`, does a field containing spaces count as empty?",
      "Look at the first line of `validateNote`: what does it do to the title before checking it?",
    ],
    explanation:
      "`required` only stops an empty field, and three spaces aren't empty, so the browser sends the request. On the server, `validateNote` trims the title first, finds nothing left and returns `Title is required`. The controller answers `400` with it, `request()` turns that into an `Error`, and `handleSave` catches it and shows the message under the form. This is why the server always checks again.",
  },
];
