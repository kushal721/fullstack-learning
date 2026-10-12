import type { Concept } from "@fsl/shared";

export const jsErrorHandling: Concept = {
  id: "js-error-handling",
  slug: "js-error-handling",
  title: "Error handling (try, catch, throw)",
  topicId: "javascript",
  summary:
    "The way JavaScript code reports that something went wrong and lets other code decide what to do about it.",
  basics: [
    "A program runs its statements one after another. Sometimes a statement cannot do its job: the network is down, the server says no, or the data is broken.",
    "When that happens, JavaScript creates an error: an object that describes the problem, with a `message` (a short description) and a `stack` (the list of functions that were running, which helps developers find where it happened).",
    "If nothing deals with the error, the current work stops. In the browser it shows up as a red message in the developer console; in Node.js the whole program can crash.",
  ],
  what: [
    '`throw` reports a problem: `throw new Error("Title is required")` creates an error and immediately stops the current function. The error then travels up to whichever code called it.',
    "`try { ... } catch (error) { ... }` catches errors: if anything inside `try` throws, JavaScript jumps straight to `catch` and gives you the error object. An optional `finally { ... }` block runs afterwards in both cases, success or failure.",
  ],
  why: [
    'Without error handling, one failed request can leave a screen stuck on "Saving..." forever, or crash a server for every user. Catching errors lets the program recover and keep running.',
    "It also separates two jobs: the low-level code that notices a problem (and throws) and the higher-level code that knows how to react (show a message, try again, log it). Neither has to know the details of the other.",
  ],
  howItWorks: [
    "When `throw` runs, JavaScript stops the current function and looks at the function that called it, then that function's caller, and so on, until it finds a surrounding `try` block.",
    "The first `try` it finds has its `catch` block run with the thrown error. Code after the `catch` continues normally, as if nothing had gone wrong.",
    "With `async` functions, a rejected promise counts as a throw at the `await` line. So `try { await saveNote() } catch (error) { ... }` catches failures from the network or from the server, just like ordinary errors.",
    "`finally` runs whether `try` succeeded or `catch` ran, which makes it the right place for clean-up such as turning off a loading spinner.",
  ],
  basicExample: {
    language: "js",
    code: `function checkTitle(title) {
  if (title === "") {
    throw new Error("Title is required");
  }
  return title;
}

try {
  checkTitle("");
  console.log("This line is skipped");
} catch (error) {
  console.log("Problem:", error.message);
} finally {
  console.log("Check finished");
}`,
    caption:
      "The `throw` jumps straight to `catch`, skipping the rest of `try`; `finally` runs either way.",
  },
  internals: [
    "`new Error(message)` builds an object that stores the message and records the stack at that moment, which is why the stack points at the line where the error was created.",
    "You can throw any value, even a plain string, but only `Error` objects carry a `stack`. Always throw `new Error(...)` so whoever catches it gets the full picture.",
    'A promise that rejects without anyone catching it becomes an "unhandled rejection". Browsers print it in the console, and recent versions of Node.js stop the program, so every awaited call should be inside a `try` somewhere up the chain.',
  ],
  howToCreate: [
    {
      text: "Create a file called `errors-demo.mjs` with an async function that fails when it gets an empty title, like a server rejecting bad input.",
      code: {
        language: "js",
        fileName: "errors-demo.mjs",
        code: `async function saveNote(title) {
  if (title === "") {
    throw new Error("Please give your note a title.");
  }
  return { id: 1, title };
}`,
      },
    },
    {
      text: "Below it, call the function with `await` inside `try/catch`. Show a friendly message for the user and log the full error for the developer.",
      code: {
        language: "js",
        fileName: "errors-demo.mjs",
        code: `async function handleSave(title) {
  try {
    const note = await saveNote(title);
    console.log("Saved:", note.title);
  } catch (error) {
    console.error(error);
    console.log("Message for the user:", error.message);
  } finally {
    console.log("Done saving");
  }
}

await handleSave("Shopping");
await handleSave("");`,
      },
    },
    {
      text: "Run the file with Node.js.",
      code: {
        language: "bash",
        code: `node errors-demo.mjs`,
      },
    },
    {
      text: "Check the output: the first call prints `Saved: Shopping`, the second prints the full error with its stack and then the friendly message, and both print `Done saving`. The program did not crash.",
    },
  ],
  whereUsed: [
    "Around every network request, because the network or the server can fail at any time.",
    "When checking input: a function throws if the data is invalid and the caller decides how to tell the user.",
    "On servers, around database calls, so one failed query returns an error response instead of crashing the server for everyone.",
  ],
  connectsTo: [
    "`async`/`await` and promises, where a rejected promise becomes a thrown error at the `await`.",
    "`fetch()`, which only rejects on network failure, so your code must check `response.ok` and throw for server errors itself.",
    "React state, where the caught message is stored and shown on the screen.",
    "Server logs, where the detailed error is written for developers to read later.",
  ],
  projectUsage: [
    {
      explanation:
        '`frontend/src/services/request.js` checks `response.ok`; when it is false, it reads the server\'s `{ "error": "..." }` body and throws `new Error(data?.error ?? "Something went wrong")` so the calling code knows the request failed and why.',
      fileId: "frontend/src/services/request.js",
      match: 'throw new Error(data?.error ?? "Something went wrong");',
    },
    {
      explanation:
        "`handleSave` in `frontend/src/components/NoteForm.jsx` wraps the save call in `try/catch` and shows the error's message under the form instead of leaving the user wondering what happened.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "setError(err.message);",
    },
    {
      explanation:
        "The backend controllers in `backend/src/` don't catch database errors themselves; the central error handler in `app.js` logs the full details on the server and replies `500` with a generic message, never the stack trace, which could reveal how the server is built.",
      fileId: "backend/src/app.js",
      match: 'res.status(500).json({ error: "Something went wrong" });',
    },
  ],
  commonMistakes: [
    "Swallowing errors with an empty `catch {}`: the problem disappears silently and nobody can find it later. At least log the error, and tell the user something went wrong.",
    "Showing raw technical details such as a stack trace or SQL message to users. Show a short, friendly message and keep the details in the logs.",
    "Calling an async function without `await` inside `try`, so the `catch` never sees the failure. Write `await` in front of the call.",
    'Throwing a plain string like `throw "failed"`, which has no stack. Throw `new Error("failed")` instead.',
  ],
  relatedConcepts: [
    "js-async-await",
    "js-promise",
    "js-fetch",
    "react-usestate",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
