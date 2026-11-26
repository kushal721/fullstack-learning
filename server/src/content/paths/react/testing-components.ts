import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Testing components: test what the user sees, the tools, a test taken
// apart, finding elements by role and label, acting like a user, waiting
// for things that appear later, replacing the API with a mock, a test run
// step by step, what to test, the Notes App, mistakes, practice, a recap.
export const testingComponentsModule = moduleLesson(
  "testing-components",
  "Testing components",
  55,
  [
    "Test a component the way a user uses it, not how it's built inside.",
    "Render a component and find elements by role, label and text.",
    "Act like a user with user-event, and wait for things that appear later.",
    "Replace the API with a mock so tests need no server.",
    "Choose what's worth testing in a component.",
  ],

  part(
    "why",
    "Test what the user sees",
    explain(
      "A component test renders a component, does what a user would do, typing, clicking, and checks what ends up on screen. It shouldn't care whether the component uses one state or three, a reducer or a hook: those can change while the behaviour stays right. Tests that only check behaviour survive refactors and catch real bugs.",
    ),
  ),

  part(
    "tools",
    "The tools",
    explain(
      "A React project made with Vite usually tests with four pieces working together. [[react-testing-library|React Testing Library]] is the one you'll call most.",
    ),
    reference("A component-testing setup", [
      ["Vitest", "Runs the tests; gives describe, it, expect.", "npm test"],
      ["jsdom", "A fake browser page in Node.js.", 'environment: "jsdom"'],
      [
        "React Testing Library",
        "Renders components and finds elements.",
        "render, screen",
      ],
      [
        "user-event",
        "Types and clicks like a real user.",
        "await userEvent.click(button)",
      ],
      ["jest-dom", "Readable checks on elements.", "toHaveValue, toBeDisabled"],
    ]),
  ),

  part(
    "anatomy",
    "A test, taken apart",
    explain(
      "Most component tests have the same shape: render, act, check. `screen` finds elements in what was rendered, the way a user or a screen reader would.",
    ),
    anatomy(
      "Render, act, check",
      [
        "render(<Counter />);",
        "await userEvent.click(",
        '  screen.getByRole("button", { name: "Add" }));',
        'expect(screen.getByText("1")).toBeVisible();',
      ],
      [
        [
          "render(<Counter />)",
          "render",
          "Draws the component into a fake page.",
        ],
        [
          "await userEvent.click",
          "act",
          "Clicks like a user. It's async: await it.",
        ],
        [
          'getByRole("button", { name: "Add" })',
          "find",
          "The button whose accessible name is Add.",
        ],
        ["expect(", "check", "Fails the test if what's on screen is wrong."],
      ],
    ),
  ),

  part(
    "queries",
    "Finding elements",
    explain(
      "Find elements the way people do: by their role and name, by a form field's label, by visible text. If a button can't be found by its role and name, a screen reader user can't find it either, so these queries test [[accessibility|accessibility]] for free. A test id is the last resort.",
    ),
    reference("Queries, best first", [
      [
        "getByRole",
        "Role and accessible name.",
        'getByRole("button", { name: "Save" })',
      ],
      [
        "getByLabelText",
        "A form field by its label.",
        'getByLabelText("Title")',
      ],
      ["getByText", "Visible text.", 'getByText("No notes yet")'],
      ["getByTestId", "Last resort: a data-testid.", 'getByTestId("chart")'],
      ["getBy…", "Exactly one, or the test fails.", "the normal choice"],
      ["queryBy…", "null if missing.", "check something isn't there"],
      ["findBy…", "Waits for it to appear.", 'await findByRole("alert")'],
    ]),
    quickCheck(
      "You want to check that an error message is *not* shown. Which query?",
      [
        '`getByRole("alert")`',
        '`queryByRole("alert")`, expecting null',
        '`findByRole("alert")`',
      ],
      1,
      "getBy throws when nothing matches and findBy waits for a match. queryBy returns null, so you can expect it not to be there.",
    ),
  ),

  part(
    "mocks",
    "No server in tests",
    explain(
      "A form that saves calls the API. Tests shouldn't need a running server: it's slow, and its data changes. Replace the API module with a [[mock-function|mock]]: a fake function you control. Tell it what to return, then check how the component called it.",
    ),
    code(
      "jsx",
      "Replacing the API",
      [
        'import { createNote } from "../services/notesApi.js";',
        "",
        'vi.mock("../services/notesApi.js", () => ({',
        "  createNote: vi.fn(),",
        "}));",
        "",
        'createNote.mockResolvedValue({ id: 1, title: "Milk" });',
        "// …later",
        'expect(createNote).toHaveBeenCalledWith({ title: "Milk" });',
      ],
      {
        3: "every import of this module now gets the fake",
        7: "this test: saving succeeds with this note",
        9: "and the component sent the right data",
      },
    ),
  ),

  part(
    "step-by-step",
    "A test run, step by step",
    explain(
      "Here's a test for a note form, close to the Notes App's own. Follow what happens in the fake page as it runs:",
    ),
    trace(
      "Saving a note, tested",
      [
        'it("saves and clears", async () => {',
        "  createNote.mockResolvedValue(saved);",
        "  const onSaved = vi.fn();",
        "  render(<NoteForm onSaved={onSaved} />);",
        '  const title = screen.getByLabelText("Title");',
        '  await userEvent.type(title, "Milk");',
        "  await userEvent.click(",
        '    screen.getByRole("button", { name: "Save" }),',
        "  );",
        "  expect(createNote).toHaveBeenCalledWith(",
        '    { title: "Milk", content: "" });',
        "  expect(onSaved).toHaveBeenCalledWith(saved);",
        '  expect(title).toHaveValue("");',
        "});",
      ],
      [
        {
          line: 4,
          note: 'The API mock will succeed with `saved`, `{ id: 1, title: "Milk" }`, and `onSaved` is a mock that records calls. The form is rendered in jsdom.',
          vars: [["page", "empty form"]],
        },
        {
          line: 6,
          note: "user-event finds the input by its label and types M, i, l, k: four key presses, four onChange calls, just like a person.",
          vars: [["title", '"Milk"']],
        },
        {
          line: 7,
          note: "Clicking Save submits the form. The component calls the mocked `createNote`, which resolves straight away.",
          vars: [["createNote calls", "1"]],
        },
        {
          line: 10,
          note: "Check the form sent what was typed.",
          output: "✓ createNote called with the title and empty content",
        },
        {
          line: 13,
          note: "And that it told its parent and cleared the field: the behaviour a user relies on, with no peeking at state.",
          output: "✓ 1 test passed",
        },
      ],
    ),
  ),

  part(
    "async",
    "Waiting for things to appear",
    explain(
      "Some things appear after a promise settles: an error from a failed save, notes after loading. `getBy` looks once, right now, and fails. `findBy` keeps looking until the element appears or a timeout passes; it returns a promise, so await it.",
    ),
    code(
      "jsx",
      "An error that appears later",
      [
        'createNote.mockRejectedValue(new Error("Title is required"));',
        "render(<NoteForm onSaved={vi.fn()} />);",
        'await userEvent.click(screen.getByRole("button", { name: "Save" }));',
        "",
        'const alert = await screen.findByRole("alert");',
        'expect(alert).toHaveTextContent("Title is required");',
      ],
      {
        1: "this time, saving fails",
        5: "waits for the error to render",
      },
    ),
  ),

  part(
    "what",
    "What's worth testing",
    explain(
      "Test what would hurt if it broke: the main flow works, errors are shown, things are disabled when they should be, empty and loading states appear. Leave out what React or the browser already guarantees, and anything a user can't see.",
    ),
    reference("Worth a test, or not", [
      ["✓ The main flow", "Type, save, see the result.", "saves and clears"],
      [
        "✓ Errors",
        "Failure shows a message, keeps input.",
        "role=alert appears",
      ],
      ["✓ States", "Loading, empty, disabled.", "“No notes yet”"],
      ["✗ Internals", "State names, hook calls.", "expect(state.title)"],
      ["✗ Styling details", "Exact classes and markup.", 'className === "btn"'],
    ]),
  ),

  part(
    "notes-app",
    "The Notes App's tests",
    explain(
      "`NoteForm.test.jsx` has two tests: one where saving works (the note is sent, reported with `onSaved`, and the form is cleared), and one where it fails (the error appears in an alert and the typed text stays). The API is mocked with `vi.mock`, so `npm test` needs no server.",
    ),
    inTheNotesApp(
      "`NoteForm.test.jsx` tests saving and failing the way a user sees them, with the API mocked.",
      { fileId: "frontend/src/components/NoteForm.test.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Testing the inside",
      language: "jsx",
      wrong: ['expect(component.state.title).toBe("Milk");'],
      problem:
        "It breaks when you rename or restructure state, even though nothing changed for users. And it can pass while the screen is wrong.",
      right: ['expect(screen.getByLabelText("Title")).toHaveValue("Milk");'],
      why: "Check what's on screen, the way a user would.",
    }),
    mistake({
      title: "Forgetting await",
      language: "jsx",
      wrong: [
        "userEvent.click(saveButton);",
        "expect(onSaved).toHaveBeenCalled();",
      ],
      problem:
        "The check runs before the click has finished, so it fails, or worse, passes by luck.",
      right: [
        "await userEvent.click(saveButton);",
        "expect(onSaved).toHaveBeenCalled();",
      ],
      why: "user-event and findBy are async: always await them.",
    }),
    mistake({
      title: "getBy for something that appears later",
      language: "jsx",
      wrong: ['expect(screen.getByRole("alert")).toBeInTheDocument();'],
      problem:
        "The alert renders after the rejected promise, but getBy looks only once, immediately.",
      right: ['expect(await screen.findByRole("alert")).toBeInTheDocument();'],
      why: "Use findBy for anything that shows up asynchronously.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Exactly one match",
      task: 'Write `getByRole(elements, role, name)` over a list like `[{ role: "button", name: "Save" }]`. Return the one match; throw if there are none or more than one, like Testing Library\'s `getBy`.',
      starter: ["function getByRole(elements, role, name) {", "", "}"],
      tests: [
        [
          'getByRole([{ role: "button", name: "Save" }, { role: "textbox", name: "Title" }], "button", "Save")',
          '{ role: "button", name: "Save" }',
        ],
        [
          '(() => { try { getByRole([], "button", "Save"); return "no error"; } catch { return "threw"; } })()',
          '"threw"',
        ],
        [
          '(() => { const two = [{ role: "button", name: "Ok" }, { role: "button", name: "Ok" }]; try { getByRole(two, "button", "Ok"); return "no error"; } catch { return "threw"; } })()',
          '"threw"',
        ],
      ],
      hint: "`filter` by role and name. If the result's length isn't 1, `throw new Error(…)`; otherwise return `matches[0]`.",
      solution: [
        "function getByRole(elements, role, name) {",
        "  const matches = elements.filter(",
        "    (el) => el.role === role && el.name === name,",
        "  );",
        "  if (matches.length !== 1) {",
        "    throw new Error(`Found ${matches.length} ${role} named ${name}`);",
        "  }",
        "  return matches[0];",
        "}",
      ],
    }),
    pageYourTurn({
      title: "A test that catches the bug",
      task: 'Two versions of a counter are on the page; one is broken. Finish `testCounter(root)`: click its button twice, then return `"pass"` if its `output` says `2`, otherwise `"fail"`.',
      starter: [
        '<div id="good"><button>Add</button> <output>0</output></div>',
        '<div id="broken"><button>Add</button> <output>0</output></div>',
        '<p>Good: <span id="r1"></span> · Broken: <span id="r2"></span></p>',
        "<script>",
        "  function mount(root, step) {",
        "    let n = 0;",
        '    root.querySelector("button").onclick = () => {',
        '      root.querySelector("output").textContent = n += step;',
        "    };",
        "  }",
        '  mount(document.querySelector("#good"), 1);',
        '  mount(document.querySelector("#broken"), 2);',
        "  function testCounter(root) {",
        "",
        "  }",
        '  document.querySelector("#r1").textContent = testCounter(document.querySelector("#good"));',
        '  document.querySelector("#r2").textContent = testCounter(document.querySelector("#broken"));',
        "</script>",
      ],
      checks: [
        {
          kind: "text",
          label: "The good one passes",
          selector: "#r1",
          text: "pass",
        },
        {
          kind: "text",
          label: "The broken one fails",
          selector: "#r2",
          text: "fail",
        },
      ],
      hint: 'Get the button with `root.querySelector("button")` and call `.click()` twice. Then compare `root.querySelector("output").textContent` with `"2"`.',
      solution: [
        '<div id="good"><button>Add</button> <output>0</output></div>',
        '<div id="broken"><button>Add</button> <output>0</output></div>',
        '<p>Good: <span id="r1"></span> · Broken: <span id="r2"></span></p>',
        "<script>",
        "  function mount(root, step) {",
        "    let n = 0;",
        '    root.querySelector("button").onclick = () => {',
        '      root.querySelector("output").textContent = n += step;',
        "    };",
        "  }",
        '  mount(document.querySelector("#good"), 1);',
        '  mount(document.querySelector("#broken"), 2);',
        "  function testCounter(root) {",
        '    root.querySelector("button").click();',
        '    root.querySelector("button").click();',
        '    return root.querySelector("output").textContent === "2" ? "pass" : "fail";',
        "  }",
        '  document.querySelector("#r1").textContent = testCounter(document.querySelector("#good"));',
        '  document.querySelector("#r2").textContent = testCounter(document.querySelector("#broken"));',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Testing components cheat sheet", [
      [
        "render",
        "Draw the component in jsdom.",
        "render(<NoteForm onSaved={fn} />)",
      ],
      [
        "screen.getByRole",
        "Find by role and name.",
        'getByRole("button", { name: "Save" })',
      ],
      ["getByLabelText", "Find a form field.", 'getByLabelText("Title")'],
      [
        "userEvent",
        "Type and click like a user; await it.",
        'await userEvent.type(input, "Milk")',
      ],
      ["findBy…", "Wait for something to appear.", 'await findByRole("alert")'],
      [
        "queryBy…",
        "Check something isn't there.",
        'expect(queryByRole("alert")).toBeNull()',
      ],
      [
        "vi.mock",
        "Replace a module, like the API.",
        'vi.mock("../services/notesApi.js")',
      ],
      [
        "vi.fn",
        "A fake function that records calls.",
        "expect(fn).toHaveBeenCalledWith(…)",
      ],
      [
        "Behaviour",
        "Test what users see, not internals.",
        "no peeking at state",
      ],
    ]),
    quickCheck(
      'A test finds the Save button with `getByTestId("save-btn")`. What\'s a better query, and why?',
      [
        '`getByText("Save")`, because it is shorter',
        '`getByRole("button", { name: "Save" })`: it finds it the way users and screen readers do',
        '`querySelector(".save")`, because classes are stable',
      ],
      1,
      "Role queries check the element really is a button with that accessible name, so the test also catches accessibility breakage.",
    ),
  ),
);
