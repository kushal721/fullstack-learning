import type { Concept } from "@fsl/shared";

export const reactControlledForm: Concept = {
  id: "react-controlled-form",
  slug: "react-controlled-form",
  title: "Controlled forms",
  topicId: "react",
  summary:
    "A form whose input values live in React state, so your code always knows what the user typed and decides what happens when the form is sent.",
  basics: [
    "An HTML form is a group of inputs plus a submit button. An `input` element normally remembers its own text: the browser stores what the user types inside the element itself.",
    "State is a value a React component remembers between renders, created with `useState`. When state changes, React redraws the component so the screen matches the data.",
    "An event is something that happens on the page, like a key press or a click. An event handler is a function you give React, such as `onChange` or `onSubmit`, that runs when that event happens and receives an event object describing it.",
    "When a form is submitted, the browser's default behaviour is to send the values to a URL and load a new page. In a React app we cancel that and send the data ourselves with `fetch()`, so the page never reloads.",
  ],
  what: [
    "A controlled input is an input whose `value` comes from state and whose `onChange` handler updates that state: `<input value={title} onChange={(e) => setTitle(e.target.value)} />`. React state is the single source of truth for what the input shows.",
    "A controlled form is a form built from controlled inputs plus an `onSubmit` handler that stops the page reload, checks the values, sends them, and then updates the screen: disabling the button while saving, clearing the fields on success, or showing an error.",
  ],
  why: [
    "Because the values are in state, your code can read them at any moment without searching the page. You can validate as the user types, show how many characters are left, or enable the Save button only when the title is not empty.",
    "Saving takes time and can fail. Keeping the form's situation in state (the values, whether it is saving, the latest error) lets the screen always show the truth: the button cannot be pressed twice, the user sees what went wrong, and the form is cleared only once the note is really saved.",
  ],
  howItWorks: [
    "On render, the input shows whatever is in state, for example an empty string at the start.",
    "When the user types a key, the browser fires an input event, React calls `onChange`, and your handler calls the setter with `e.target.value`, the input's new text. React re-renders and the input shows the new state value.",
    "When the user presses the submit button or Enter, React calls `onSubmit`. The handler calls `event.preventDefault()` to stop the page reload, validates the values, sets an `isSaving` flag, and sends the data.",
    "When the request finishes, the handler either clears the fields (success) or stores an error message in state (failure), and finally turns `isSaving` off. Each of these state changes re-renders the form.",
  ],
  basicExample: {
    language: "jsx",
    code: `import { useState } from "react";

function NameForm() {
  const [name, setName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    alert("Hello, " + name);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Greet</button>
    </form>
  );
}`,
    caption:
      "The input always shows `name` from state; typing updates it, and submitting reads it and then clears it.",
    highlightLines: [4, 7, 14],
  },
  internals: [
    "React listens for typing on the whole page and calls your `onChange` for the input that changed. If your handler does not update state, React puts the old state value back into the input after the event, which is why a controlled input with no working `onChange` looks frozen.",
    '`event.target` is the element the event happened on, here the input, and `event.target.value` is always a string, even for `type="number"` inputs. Convert it with `Number()` if you need a number.',
    "A value of `undefined` or `null` tells React the input is uncontrolled. If the value later becomes a string, React warns that a component is changing an uncontrolled input to be controlled. Always start text state with an empty string.",
    "`await` pauses only your handler, not the page. While the request is in flight React can re-render, which is how the disabled button and the Saving label appear before the response arrives.",
  ],
  howToCreate: [
    {
      text: "Create a React project with Vite in a terminal, then start it.",
      code: {
        language: "bash",
        code: `npm create vite@latest my-notes -- --template react
cd my-notes
npm install
npm run dev`,
      },
    },
    {
      text: 'Replace `src/App.jsx` with a form that keeps the title, a saving flag and an error message in state. A fake `saveNote` function waits one second and fails if the title is "fail", so you can try both outcomes without a backend.',
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import { useState } from "react";

function saveNote(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (title === "fail") reject(new Error("The server said no."));
      else resolve({ id: Date.now(), title });
    }, 1000);
  });
}

export default function App() {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(event) {
    event.preventDefault();
    if (title.trim() === "") {
      setError("Please enter a title.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const note = await saveNote(title);
      console.log("Saved", note);
      setTitle("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}`,
      },
    },
    {
      text: "Open http://localhost:5173 and press Save with the input empty. The validation message appears and nothing is sent.",
    },
    {
      text: "Type a title and press Save. The button shows Saving... and is disabled for one second, then the input is cleared and the developer console (F12 or Cmd+Opt+I) prints the saved note.",
    },
    {
      text: "Type fail and press Save. After a second the error message appears and your text stays in the input, so the user does not lose what they typed.",
    },
  ],
  whereUsed: [
    "Every form that sends data: logging in, registering, creating and editing notes, search boxes and settings pages.",
    "Inputs whose value affects something else on the screen while typing, such as a live search filter or a character counter.",
    "Very large forms sometimes use a form library to reduce boilerplate, but those libraries are built on the same ideas.",
  ],
  connectsTo: [
    "`useState`, which holds each input value, the saving flag and the error message.",
    "The HTML `form`, `input` and `button` elements, and the `submit` event that `onSubmit` handles.",
    "`async` and `await` with `fetch()`, which send the values to the backend as an HTTP POST request.",
    "Callback props such as `onSaved`, which tell the parent component that a new item exists.",
  ],
  projectUsage: [
    {
      explanation:
        '`NoteForm.jsx` keeps `title` and `content` in `useState("")` and passes them to the shared `Input` component as `value` with an `onChange` that calls the setter.',
      fileId: "frontend/src/components/NoteForm.jsx",
      match: 'const [title, setTitle] = useState("");',
    },
    {
      explanation:
        "Its `handleSave(event)` calls `event.preventDefault()`, then `await createNote({ title, content })` from `notesApi.js`, which sends `POST /api/notes`. On success it calls `onSaved(note)` and clears both fields; on failure it stores the error message and shows it above the Save button.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "async function handleSave(event) {",
    },
    {
      explanation:
        "The Login and Register pages follow the same pattern for email and password, sending the values with the functions in `authApi.js`.",
      fileId: "frontend/src/pages/Login.jsx",
      match: 'const [email, setEmail] = useState("");',
    },
  ],
  commonMistakes: [
    "Setting `value` without `onChange`, so the input cannot be typed into and React warns about a read-only field. Add an `onChange` that calls the setter.",
    "Forgetting `event.preventDefault()`, so the browser reloads the page and cancels your request. Call it first thing in the submit handler.",
    "Clearing the form before the request finishes, so the text is lost if saving fails. Clear the fields only after the `await` succeeds.",
    "Leaving the button enabled while saving, so a double click creates two notes. Keep an `isSaving` state, pass `disabled={isSaving}`, and reset it in a `finally` block so it turns off on success and on error.",
  ],
  relatedConcepts: [
    "react-usestate",
    "react-event-handling",
    "html-form",
    "html-input",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
