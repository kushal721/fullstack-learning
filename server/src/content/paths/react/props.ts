import {
  analogy,
  anatomy,
  code,
  diagram,
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

// Props: why components take inputs, passing them, receiving them (taken
// apart), the props object step by step, children, read-only props and
// one-way data flow, functions as props, passing the rest along, the
// Notes App, mistakes, practice and a recap.
export const propsModule = moduleLesson(
  "props",
  "Props: passing data into components",
  45,
  [
    "Pass data into a component as props, as text or as any JavaScript value.",
    "Receive props by destructuring, with default values for optional ones.",
    "Wrap content with the children prop.",
    "Explain why props are read-only and data flows one way, down the tree.",
    "Pass functions as props, and pass the remaining props on with spread.",
  ],

  part(
    "why",
    "Same component, different data",
    explain(
      "A `NoteCard` that always showed “Milk” would be useless. [[react-props|Props]] are a component's inputs: the parent decides what to show, and the component decides how. One `NoteCard` can then draw every note, each with its own title.",
    ),
    analogy(
      "Props are to a component what arguments are to a function. `NoteCard` is the recipe; `note={note}` is the ingredient you hand it this time.",
    ),
  ),

  part(
    "passing",
    "Passing props",
    explain(
      "Props are written like HTML attributes on the component's tag. Plain text goes in quotes. Anything else, a number, a variable, an object, an array or a function, goes in curly braces.",
    ),
    code(
      "jsx",
      "Passing four kinds of prop",
      [
        "<NoteCard",
        '  label="Pinned"',
        "  maxLines={3}",
        "  note={note}",
        "  onDelete={removeNote}",
        "/>",
      ],
      {
        2: "text: in quotes",
        3: "a number: in braces, or it would be the text “3”",
        4: "an object",
        5: "a function the card can call later",
      },
    ),
  ),

  part(
    "receiving",
    "Receiving props, taken apart",
    explain(
      "React collects every prop into one object and passes it as the component's first argument. Most components destructure it straight away in the brackets, which also lists, at a glance, what the component expects. An `=` gives a default for a prop the parent leaves out.",
    ),
    anatomy(
      "A component's props",
      [
        "function Button({",
        '  label, variant = "primary" }) {',
        "  return <button className={variant}>",
        "    {label}</button>;",
      ],
      [
        ["Button", "component", "Called by React with one object: the props."],
        [
          "label,",
          "destructured",
          "Takes props.label out into its own variable.",
        ],
        [
          'variant = "primary"',
          "default",
          "Used when the parent doesn't pass variant.",
        ],
        ["{label}", "used", "Shown inside the button."],
      ],
    ),
  ),

  part(
    "step-by-step",
    "From tag to function call",
    explain(
      'What does React actually do with `<Button label="Delete" variant="danger" />`? Step through it, then compare with a button whose variant is left out.',
    ),
    trace(
      "Two buttons",
      [
        "function Button({",
        "  label,",
        '  variant = "primary",',
        "}) {",
        "  return (",
        "    <button className={variant}>",
        "      {label}",
        "    </button>",
        "  );",
        "}",
        "",
        '<Button label="Delete" variant="danger" />',
        '<Button label="Save" />',
      ],
      [
        {
          line: 12,
          note: "React gathers the attributes into one object and calls `Button` with it.",
          vars: [["props", '{ label: "Delete", variant: "danger" }']],
        },
        {
          line: 3,
          note: "Destructuring takes each prop into a variable. `variant` was passed, so the default isn't used.",
          vars: [
            ["label", '"Delete"'],
            ["variant", '"danger"'],
          ],
        },
        {
          line: 6,
          note: 'The button gets `className="danger"` and the text Delete.',
          output: '<button class="danger">Delete</button>',
        },
        {
          line: 13,
          note: "The second button passes only `label`.",
          vars: [["props", '{ label: "Save" }']],
        },
        {
          line: 3,
          note: "`variant` is missing, so the default kicks in.",
          vars: [
            ["label", '"Save"'],
            ["variant", '"primary"'],
          ],
          output: '<button class="primary">Save</button>',
        },
      ],
    ),
  ),

  part(
    "children",
    "children: what's between the tags",
    explain(
      "Whatever you put between a component's opening and closing tags arrives as a special prop, `children`. It lets you write wrappers: a `Card` that draws the border and shadow, around whatever you put in it.",
    ),
    code(
      "jsx",
      "A wrapper",
      [
        "function Card({ children }) {",
        '  return <section className="card">{children}</section>;',
        "}",
        "",
        "<Card>",
        "  <h2>Milk</h2>",
        "  <p>2 litres</p>",
        "</Card>",
      ],
      {
        2: "put the children wherever they belong",
        6: "these two elements are Card's children",
      },
    ),
  ),

  part(
    "one-way",
    "Read-only, and flowing down",
    explain(
      "A component must never change its props: they belong to the parent. Data moves one way, from parents down to children: [[one-way-data-flow|one-way data flow]]. To change something, a child calls a function the parent passed down; the parent changes its data and new props flow down: [[react-component-communication|props down, events up]].",
    ),
    diagram([
      ["Dashboard", "owns the notes"],
      ["note={note} ↓", "data goes down"],
      ["NoteCard", "shows it"],
      ["onDelete(id) ↑", "requests go up"],
    ]),
    quickCheck(
      "A `NoteCard` wants its note removed. What should it do?",
      [
        "Remove the note from its `note` prop",
        "Call the `onDelete` function its parent passed in",
        "Change the page with `remove()`",
      ],
      1,
      "The note belongs to the parent, so the card asks the parent through a function prop.",
    ),
  ),

  part(
    "spread",
    "Passing the rest along",
    explain(
      "A [[react-reusable-component|reusable component]] like a button can't list every attribute a `<button>` accepts. Collect the props it doesn't use with `...props` (rest syntax) and spread them onto the real element: `type`, `onClick`, `disabled` and the rest pass straight through.",
    ),
    code(
      "jsx",
      "Take what you need, pass on the rest",
      [
        "function Button({ children, variant, ...props }) {",
        "  return (",
        "    <button className={variant} {...props}>",
        "      {children}",
        "    </button>",
        "  );",
        "}",
      ],
      {
        1: "props = everything except children and variant",
        3: "type, onClick, disabled… land on the button",
      },
    ),
  ),

  part(
    "notes-app",
    "Props in the Notes App",
    explain(
      'The Notes App\'s `Button` is exactly this: `children` for the label, a `variant` that defaults to `"primary"`, and `...props` passed to the real `<button>`. Every Save, Edit, Delete and Log out button in the app is this one component with different props.',
    ),
    inTheNotesApp(
      "`Button` takes `children`, a default `variant`, and spreads the rest onto the `<button>`.",
      { fileId: "frontend/src/components/Button.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Changing a prop",
      language: "jsx",
      wrong: [
        "function NoteCard({ note }) {",
        "  note.title = note.title.trim();",
      ],
      problem:
        "The object belongs to the parent. Changing it can make the screen and the data disagree, and React won't re-render.",
      right: [
        "function NoteCard({ note }) {",
        "  const title = note.title.trim();",
      ],
      why: "Treat props as read-only. Work out new values in new variables.",
    }),
    mistake({
      title: "A number in quotes",
      language: "jsx",
      wrong: ['<Stars count="3" />'],
      problem: '`count` is the text "3", so `count + 1` is "31".',
      right: ["<Stars count={3} />"],
      why: "Only text goes in quotes. Numbers, booleans, objects and functions go in braces.",
    }),
    mistake({
      title: "Forgetting the braces",
      language: "jsx",
      wrong: ["function NoteCard(note) {", "  return <h2>{note.title}</h2>;"],
      problem:
        "`note` here is the whole props object, so `note.title` is undefined; the note is at `note.note`.",
      right: [
        "function NoteCard({ note }) {",
        "  return <h2>{note.title}</h2>;",
      ],
      why: "Destructure the props object to get the prop out.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A default prop",
      task: 'Write `Greeting({ name, greeting })` so it returns text like `"Hello, Sam!"`. When `greeting` isn\'t passed, it should default to `"Hello"`.',
      starter: ["function Greeting({ name, greeting }) {", "", "}"],
      tests: [
        ['Greeting({ name: "Sam" })', '"Hello, Sam!"'],
        ['Greeting({ name: "Ana", greeting: "Welcome" })', '"Welcome, Ana!"'],
      ],
      hint: 'Give the default in the brackets: `{ name, greeting = "Hello" }`, then return a template literal.',
      solution: [
        'function Greeting({ name, greeting = "Hello" }) {',
        "  return `${greeting}, ${name}!`;",
        "}",
      ],
    }),
    pageYourTurn({
      title: "One button, many looks",
      task: "Make `Button({ label, variant })` return a `<button>` with the class `button button-` plus the variant (default `primary`), and the label as its text.",
      starter: [
        '<div id="root"></div>',
        "<script>",
        "  function Button({ label, variant }) {",
        '    return "";',
        "  }",
        '  document.querySelector("#root").innerHTML =',
        '    Button({ label: "Save" }) +',
        '    Button({ label: "Delete", variant: "danger" });',
        "</script>",
      ],
      checks: [
        {
          kind: "count",
          label: "Two buttons",
          selector: "#root button",
          count: 2,
        },
        {
          kind: "attr",
          label: "Save uses the default",
          selector: "button:first-child",
          name: "class",
          value: "button button-primary",
        },
        {
          kind: "attr",
          label: "Delete is danger",
          selector: "button:last-child",
          name: "class",
          value: "button button-danger",
        },
        {
          kind: "text",
          label: "Labels are shown",
          selector: "button:last-child",
          text: "Delete",
        },
      ],
      hint: '`function Button({ label, variant = "primary" })`, then return `` `<button class="button button-${variant}">${label}</button>` ``.',
      solution: [
        '<div id="root"></div>',
        "<script>",
        '  function Button({ label, variant = "primary" }) {',
        '    return `<button class="button button-${variant}">${label}</button>`;',
        "  }",
        '  document.querySelector("#root").innerHTML =',
        '    Button({ label: "Save" }) +',
        '    Button({ label: "Delete", variant: "danger" });',
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Props cheat sheet", [
      ["Pass text", "In quotes.", '<Button label="Save" />'],
      ["Pass anything else", "In curly braces.", "count={3} note={note}"],
      ["Receive", "Destructure the props object.", "function Card({ note })"],
      ["Default", "For a prop that's left out.", '{ variant = "primary" }'],
      ["children", "What's between the tags.", "<Card>…</Card>"],
      [
        "Function prop",
        "Lets a child ask the parent.",
        "onDelete={removeNote}",
      ],
      ["...props", "Pass the rest on.", "<button {...props}>"],
      ["Read-only", "Never change a prop.", "const t = note.title.trim()"],
    ]),
    quickCheck(
      "`<Badge count={2} />` and `function Badge({ count = 0 })`. What is `count` inside Badge?",
      ["0", "2", 'The text "2"'],
      1,
      "The parent passed `count` as the number 2, so the default isn't used. Defaults only apply when a prop is left out.",
    ),
  ),
);
