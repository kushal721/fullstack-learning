import type { Flow } from "@fsl/shared";

// Creating a note, from the Save click to the database and back. The
// frontend steps are from M07.1.2; the backend, database and response steps
// follow in M07.1.3–M07.1.5 and the HTTP details in M07.1.6.
export const createNoteFlow: Flow = {
  id: "create-note",
  title: "Create a note",
  summary:
    "Follow a new note from the Save button, through the API and the database, and back onto the screen.",
  group: "request",
  direction: "round-trip",
  steps: [
    // Frontend: from the user's click to the request leaving the browser.
    {
      id: "type-note",
      symbolId: "component:NoteForm",
      layer: "user",
      title: "The user types a note",
      explanation:
        "The title and content fields are controlled inputs: every keystroke calls `setTitle` or `setContent`, so React state always holds exactly what is on screen. That is why `handleSave` can read the note later without looking at the page.",
      dataShape: {
        language: "jsx",
        code: '// NoteForm\'s state after typing\nconst [title, setTitle] = useState("");     // "Shopping"\nconst [content, setContent] = useState(""); // "Milk, bread"',
        fileName: "frontend/src/components/NoteForm.jsx",
        caption: "The values live in React state, not in the input elements.",
      },
    },
    {
      id: "click-save",
      symbolId: "component:Button",
      layer: "user",
      title: "The user clicks Save",
      explanation:
        'Save is the reusable Button with `type="submit"`. A submit button inside a `<form>` doesn\'t run code itself: clicking it (or pressing Enter in a field) asks the browser to submit the form.',
      relationshipId: "component:NoteForm->renders->component:Button",
      dataShape: {
        language: "jsx",
        code: '<Button type="submit" disabled={isSaving}>\n  {isSaving ? "Saving…" : "Save"}\n</Button>',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "submit-event",
      symbolId: "event:noteForm.submit",
      layer: "frontend",
      title: "The browser fires a submit event",
      explanation:
        "The browser creates a `submit` event for the form. Left alone, it would reload the page and send the form the old-fashioned way; React hands the event to the function given as `onSubmit` so our code can decide what happens instead.",
      dataShape: {
        language: "jsx",
        code: '<form className="note-form" onSubmit={handleSave}>',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "handle-save",
      symbolId: "fn:handleSave",
      layer: "frontend",
      title: "handleSave takes over",
      explanation:
        "`event.preventDefault()` stops the page reload, so the app keeps its state. Then `handleSave` marks the form as saving (the button shows Saving… and can't be pressed twice) and clears any old error before calling the API.",
      relationshipId: "fn:handleSave->handles->event:noteForm.submit",
      dataShape: {
        language: "js",
        code: '// NoteForm state while saving\n{ title: "Shopping", content: "Milk, bread", isSaving: true, error: null }',
        caption: "`isSaving` is now `true`, so the Save button is disabled.",
      },
    },
    {
      id: "create-note",
      symbolId: "fn:notesApi.createNote",
      layer: "frontend",
      title: "createNote is called with the note",
      explanation:
        "The component doesn't build HTTP requests itself: it calls `createNote` from the notes service and waits for the result with `await`. Only the service knows the URL and the method.",
      relationshipId: "fn:handleSave->calls->fn:notesApi.createNote",
      dataShape: {
        language: "js",
        code: 'const note = await createNote({ title: "Shopping", content: "Milk, bread" });',
        fileName: "frontend/src/components/NoteForm.jsx",
      },
    },
    {
      id: "request",
      symbolId: "fn:request",
      layer: "frontend",
      title: "request() prepares the HTTP request",
      explanation:
        "`createNote` passes the path, method and body to the shared `request` function, which every API call uses. Writing this once means every request sends the login cookie and JSON in exactly the same way.",
      relationshipId: "fn:notesApi.createNote->calls->fn:request",
      dataShape: {
        language: "js",
        code: 'request("/api/notes", {\n  method: "POST",\n  body: { title: "Shopping", content: "Milk, bread" },\n});',
        fileName: "frontend/src/services/notesApi.js",
      },
    },
    {
      id: "fetch",
      symbolId: "external:fetch",
      layer: "frontend",
      title: "fetch sends it from the browser",
      explanation:
        '`request` turns the object into JSON text with `JSON.stringify`, says so with the `Content-Type` header, and asks the browser to include the login cookie (`credentials: "include"`). `fetch` is the browser\'s built-in way to send it.',
      relationshipId: "fn:request->calls->external:fetch",
      dataShape: {
        language: "js",
        code: 'fetch("/api/notes", {\n  method: "POST",\n  credentials: "include",\n  headers: { "Content-Type": "application/json" },\n  body: \'{"title":"Shopping","content":"Milk, bread"}\',\n});',
        caption:
          "The body is now text: HTTP carries strings, not JavaScript objects.",
      },
    },
    {
      id: "http-request",
      symbolId: "http-request:POST /api/notes",
      layer: "network",
      title: "The HTTP request travels to the backend",
      explanation:
        "The browser sends the request over the network, adding the `token` cookie it stored at login. In development Vite receives it on port 5173 and forwards everything under `/api` to the Express backend on port 3000.",
      relationshipId: "external:fetch->sends->http-request:POST /api/notes",
      dataShape: {
        language: "http",
        code: 'POST /api/notes HTTP/1.1\nHost: localhost:5173\nContent-Type: application/json\nCookie: token=eyJhbGciOiJIUzI1NiIs…\n\n{"title":"Shopping","content":"Milk, bread"}',
        caption: "Method and path, headers, a blank line, then the body.",
      },
    },
  ],
};
