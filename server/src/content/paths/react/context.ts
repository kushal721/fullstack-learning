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

// Context: prop drilling, context as a broadcast, the three parts taken
// apart, a provider that holds state, reading the nearest provider (step
// by step), when to use context and when props are better, the Notes App,
// mistakes, practice and a recap.
export const contextModule = moduleLesson(
  "context",
  "Context: sharing data without passing props",
  45,
  [
    "Recognise prop drilling: props passed through components that don't use them.",
    "Create a context, provide a value and read it with useContext.",
    "Put state in a provider component so any component below can read and change it.",
    "Explain which provider a component reads, and what happens with none.",
    "Decide between context and plain props, and keep context updates cheap.",
  ],

  part(
    "drilling",
    "Passing props down, and down",
    explain(
      "The logged-in user is needed by the navbar, a settings page and a comment box deep in the tree. With props alone, every component between `App` and them must take `user` and pass it on, even ones that never use it. That's called [[prop-drilling|prop drilling]]: tedious, and every layer has to change if the data does.",
    ),
    diagram([
      ["App", "has user"],
      ["Layout", "passes user"],
      ["Sidebar", "passes user"],
      ["Avatar", "finally uses it"],
    ]),
  ),

  part(
    "broadcast",
    "Context: put it on the air",
    explain(
      "[[react-context|Context]] lets a component make a value available to every component below it, however deep, without passing props through the middle. Any component that needs it reads it directly. Good fits are things the whole app cares about: the current user, the colour theme, the language.",
    ),
    analogy(
      "Props are passing a note hand to hand down a row of desks. Context is the announcement over the speakers: anyone in the building who wants it can listen.",
    ),
  ),

  part(
    "anatomy",
    "The three parts, taken apart",
    explain(
      "Using context takes three steps: create the context once, wrap part of the tree in its provider with a value, and read it anywhere below with `useContext`. (Before React 19 the provider was written `<Theme.Provider>`; you'll see both.)",
    ),
    anatomy(
      "Create, provide, read",
      [
        'const Theme = createContext("light");',
        '<Theme value="dark"><App /></Theme>',
        "const theme = useContext(Theme);",
      ],
      [
        ["createContext", "create", "Once, in its own file, exported."],
        [
          '"light"',
          "default",
          "What readers get when there's no provider above them.",
        ],
        [
          '<Theme value="dark">',
          "provide",
          'Everything inside can read "dark".',
        ],
        [
          "useContext(Theme)",
          "read",
          "The value from the nearest provider above.",
        ],
      ],
    ),
  ),

  part(
    "provider-state",
    "A provider that holds state",
    explain(
      "A context value is usually state, so readers re-render when it changes. Wrap the state and the provider in one component, and pass an object with the value and the functions that change it. A small hook like `useAuth` hides the `useContext` call.",
    ),
    code(
      "jsx",
      "AuthProvider and useAuth",
      [
        "const AuthContext = createContext(null);",
        "",
        "export function AuthProvider({ children }) {",
        "  const [user, setUser] = useState(null);",
        "  const value = { user, setUser };",
        "  return <AuthContext value={value}>{children}</AuthContext>;",
        "}",
        "",
        "export function useAuth() {",
        "  return useContext(AuthContext);",
        "}",
      ],
      {
        4: "the shared state lives here",
        6: "children: the whole app, wrapped in main.jsx",
        9: "any component: const { user } = useAuth()",
      },
    ),
  ),

  part(
    "step-by-step",
    "Which value do I get?",
    explain(
      "`useContext` looks up the tree for the nearest provider of that context. Step through three readers in different places:",
    ),
    trace(
      "Three readers",
      [
        'const Theme = createContext("light");',
        "",
        "function Badge() {",
        "  const theme = useContext(Theme);",
        "  return <span className={theme}>New</span>;",
        "}",
        "",
        "<>",
        "  <Badge />",
        '  <Theme value="dark">',
        "    <Badge />",
        '    <Theme value="blue"><Badge /></Theme>',
        "  </Theme>",
        "</>",
      ],
      [
        {
          line: 9,
          note: "The first Badge has no provider above it, so it gets the default from `createContext`.",
          vars: [["theme", '"light"']],
          output: '<span class="light">',
        },
        {
          line: 11,
          note: "The second is inside the dark provider.",
          vars: [["theme", '"dark"']],
          output: '<span class="dark">',
        },
        {
          line: 12,
          note: "The third is inside both. The nearest one wins: blue.",
          vars: [["theme", '"blue"']],
          output: '<span class="blue">',
        },
        {
          line: 10,
          note: "If the dark provider's value changes, React re-renders every Badge reading it, however deep, even if the parents in between don't re-render.",
          vars: [["re-render", "Badges 2 and 3's readers"]],
        },
      ],
    ),
  ),

  part(
    "when",
    "Context or props?",
    explain(
      "Context hides where data comes from, so use it sparingly. Passing props two or three levels is fine and clearer. Reach for context when many components at different depths need the same thing. Before that, try passing components as `children`: the layer in the middle then doesn't need the data at all.",
    ),
    reference("Choosing", [
      ["Props", "A few levels, or one reader.", "<Avatar user={user} />"],
      [
        "children",
        "Middle layers don't need the data.",
        "<Layout><Avatar user={user} /></Layout>",
      ],
      ["Context", "App-wide: user, theme, language.", "useAuth()"],
      [
        "Split contexts",
        "Separate values that change separately.",
        "AuthContext, ThemeContext",
      ],
    ]),
    quickCheck(
      "Only `Dashboard` and its direct child need the notes. Should they go in context?",
      [
        "Yes, context is always cleaner",
        "No: passing them as a prop one level is simpler and clearer",
        "Yes, or the child can't re-render",
      ],
      1,
      "Context is for data needed widely and deeply. For one level, a prop makes the data's source obvious.",
    ),
  ),

  part(
    "notes-app",
    "Context and the Notes App",
    explain(
      "The Notes App passes `user` and `onLogout` from `App` to `Navbar` as props: one level, so context would add nothing. If more screens grew to need the user, say a profile page and a comment author, an `AuthProvider` with a `useAuth` hook would replace those props.",
    ),
    inTheNotesApp(
      "`Navbar` gets `user` and `onLogout` as props from `App`: the case where props are still the right choice.",
      { fileId: "frontend/src/components/Navbar.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Reading outside the provider",
      language: "jsx",
      wrong: [
        "createRoot(root).render(<App />);",
        "// inside: const { user } = useAuth();",
      ],
      problem:
        "No provider above, so `useAuth()` returns the default, `null`, and destructuring it throws.",
      right: [
        "createRoot(root).render(",
        "  <AuthProvider><App /></AuthProvider>,",
        ");",
      ],
      why: "Wrap everything that reads the context in its provider.",
    }),
    mistake({
      title: "Context for everything",
      language: "jsx",
      wrong: ["<NotesContext value={notes}>", "  <Dashboard />"],
      problem:
        "Data only one screen uses is now hidden in context: harder to follow, and every reader re-renders on every change.",
      right: ["<Dashboard notes={notes} />"],
      why: "Start with props. Use context for data many parts of the app need.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "The nearest provider",
      task: "`createContext` keeps a stack of provided values. Finish `read()`: return the most recently provided value (the nearest provider), or `defaultValue` if nothing is being provided.",
      starter: [
        "function createContext(defaultValue) {",
        "  const stack = [];",
        "  return {",
        "    provide(value, render) {",
        "      stack.push(value);",
        "      const result = render();",
        "      stack.pop();",
        "      return result;",
        "    },",
        "    read() {",
        "",
        "    },",
        "  };",
        "}",
      ],
      tests: [
        ['createContext("light").read()', '"light"'],
        [
          '(() => { const T = createContext("light"); return T.provide("dark", () => T.read()); })()',
          '"dark"',
        ],
        [
          '(() => { const T = createContext("light"); return T.provide("dark", () => T.provide("blue", () => T.read())); })()',
          '"blue"',
        ],
        [
          '(() => { const T = createContext("light"); T.provide("dark", () => 0); return T.read(); })()',
          '"light"',
        ],
      ],
      hint: "`return stack.length > 0 ? stack[stack.length - 1] : defaultValue;`",
      solution: [
        "function createContext(defaultValue) {",
        "  const stack = [];",
        "  return {",
        "    provide(value, render) {",
        "      stack.push(value);",
        "      const result = render();",
        "      stack.pop();",
        "      return result;",
        "    },",
        "    read() {",
        "      return stack.length > 0 ? stack.at(-1) : defaultValue;",
        "    },",
        "  };",
        "}",
      ],
    }),
    pageYourTurn({
      title: "One value, every reader",
      task: "Every `.card` reads the theme. Make `render()` give each card the class `card` plus `state.theme`, and make the button switch `state.theme` between `light` and `dark`, then render.",
      starter: [
        '<button id="toggle">Switch theme</button>',
        '<div class="card">Milk</div>',
        '<div class="card">Eggs</div>',
        "<script>",
        '  const state = { theme: "light" };',
        "  function render() {",
        "",
        "  }",
        '  document.querySelector("#toggle").addEventListener("click", () => {',
        "",
        "  });",
        "  render();",
        "</script>",
      ],
      checks: [
        {
          kind: "attr",
          label: "Light at first",
          selector: ".card",
          name: "class",
          value: "card light",
        },
        { kind: "click", label: "Switch", selector: "#toggle" },
        {
          kind: "attr",
          label: "The last card is dark",
          selector: ".card:last-of-type",
          name: "class",
          value: "card dark",
        },
        { kind: "click", label: "Switch back", selector: "#toggle" },
        {
          kind: "attr",
          label: "Light again",
          selector: ".card",
          name: "class",
          value: "card light",
        },
      ],
      hint: 'In `render`: `document.querySelectorAll(".card").forEach((c) => (c.className = "card " + state.theme));`',
      solution: [
        '<button id="toggle">Switch theme</button>',
        '<div class="card">Milk</div>',
        '<div class="card">Eggs</div>',
        "<script>",
        '  const state = { theme: "light" };',
        "  function render() {",
        '    for (const card of document.querySelectorAll(".card")) {',
        '      card.className = "card " + state.theme;',
        "    }",
        "  }",
        '  document.querySelector("#toggle").addEventListener("click", () => {',
        '    state.theme = state.theme === "light" ? "dark" : "light";',
        "    render();",
        "  });",
        "  render();",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Context cheat sheet", [
      [
        "Prop drilling",
        "Passing props through layers that don't use them.",
        "App → Layout → Avatar",
      ],
      [
        "createContext",
        "Make a context with a default.",
        "createContext(null)",
      ],
      [
        "Provide",
        "A value for everything inside.",
        "<AuthContext value={value}>",
      ],
      [
        "useContext",
        "Read the nearest provider's value.",
        "useContext(AuthContext)",
      ],
      [
        "Provider component",
        "State plus provider, in one place.",
        "<AuthProvider>",
      ],
      ["Custom hook", "Hide useContext behind a name.", "useAuth()"],
      ["Default", "Used with no provider above.", 'createContext("light")'],
      [
        "Use sparingly",
        "Props first; context for app-wide data.",
        "user, theme, language",
      ],
    ]),
    quickCheck(
      "A component calls `useContext(ThemeContext)` but no `ThemeContext` provider is above it. What does it get?",
      [
        "undefined, always",
        "The default value passed to createContext",
        "An error is thrown",
      ],
      1,
      "With no provider above, React uses the default from `createContext(…)`. That's why a missing provider can fail quietly.",
    ),
  ),
);
