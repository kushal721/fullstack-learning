import type { BuildStep } from "@fsl/shared";

export const createFrontendStructureStep: BuildStep = {
  id: "create-frontend-structure",
  slug: "create-frontend-structure",
  order: 3,
  title: "Create the frontend structure",
  goal: "Give the frontend a folder structure and build its first layout component, the Navbar.",
  why: "Folders with a clear job make code easy to find: when something is wrong with a button you know to look in `components/`. A layout component like the Navbar shows how a page is assembled from smaller parts.",
  problemSolved:
    "With everything in `App.jsx`, the file grows to hundreds of lines and every change risks breaking something unrelated.",
  prerequisites: ["create-project"],
  explanation: [
    "React apps are built from **components**: JavaScript functions that return what should appear on the screen (written in JSX, which looks like HTML). A component can be used inside another component, just like an HTML element.",
    "The Notes App's frontend uses four folders inside `src/`, each with one job: `components/` for reusable pieces of the screen (Navbar, Button, NoteCard…), `pages/` for whole screens (Dashboard, Login, Register), `hooks/` for reusable state logic and `services/` for code that talks to the API. We create each folder when its first file arrives; this step adds `components/`.",
    "The Navbar is the bar at the top of every screen. It lives in its own file and is **exported**, so `App.jsx` can **import** it and place it with `<Navbar />`. Each file is a module: it shares only what it exports.",
    "Using semantic HTML matters: the Navbar renders a `<header>` and the page content goes in a `<main>`. Screen readers and search engines use these elements to understand the page.",
  ],
  howToCreate: [
    {
      text: "In `notes-app/frontend`, create the folder for components.",
      code: {
        language: "bash",
        code: "mkdir src/components",
      },
    },
    {
      text: "Create `src/components/Navbar.jsx`. A component name starts with a capital letter, so React can tell it apart from HTML elements like `<header>`. `className` sets the CSS class (in JSX `class` is a reserved word).",
      code: {
        language: "jsx",
        code: 'export default function Navbar() {\n  return (\n    <header className="navbar">\n      <span className="navbar-title">Notes</span>\n    </header>\n  );\n}',
        fileName: "frontend/src/components/Navbar.jsx",
        caption:
          "First version. In step 11 the Navbar receives the logged-in user and shows their email and a Log out button.",
      },
    },
    {
      text: "Replace `src/App.jsx` so it imports the Navbar and places it above the page content. The empty `<>…</>` is a fragment: it groups elements without adding an extra element to the page.",
      code: {
        language: "jsx",
        code: 'import Navbar from "./components/Navbar.jsx";\n\nexport default function App() {\n  return (\n    <>\n      <Navbar />\n      <main className="page-message">\n        <p>Your notes will appear here.</p>\n      </main>\n    </>\n  );\n}',
        fileName: "frontend/src/App.jsx",
      },
    },
    {
      text: "Add the Navbar and page-width styles to the end of `src/index.css`. Flexbox puts the title and (later) the user menu on one line, pushed to opposite sides.",
      code: {
        language: "css",
        code: "/* Navbar: app name on the left, user and Log out on the right. */\n.navbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 0.75rem 1rem;\n  background: white;\n  border-bottom: 1px solid var(--color-border);\n}\n\n.navbar-title {\n  font-weight: 700;\n}\n\n.navbar-user {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  color: var(--color-muted);\n}\n\n.dashboard,\n.auth-page,\n.page-message {\n  max-width: 60rem;\n  margin: 0 auto;\n  padding: 1.5rem 1rem;\n}",
        fileName: "frontend/src/index.css",
      },
    },
    {
      text: 'Check it worked: the browser shows a white bar with **Notes** at the top and the text *Your notes will appear here.* below it, centred with space around it. Right-click the bar → Inspect: it is a `<header class="navbar">`.',
    },
  ],
  fromScratch: [
    "Create `src/components/` for reusable pieces of UI and `src/pages/` for full screens; add `hooks/` and `services/` when you first need them.",
    "Give every component its own file named after it (`Navbar.jsx` exports `Navbar`), starting with a capital letter.",
    'Use `export default function Name()` in the component file and `import Name from "./components/Name.jsx"` where you use it.',
    "Build the layout (header, main area) first and fill it with content afterwards.",
  ],
  filesCreated: ["frontend/src/components/Navbar.jsx"],
  filesModified: ["frontend/src/App.jsx", "frontend/src/index.css"],
  filesRemoved: [],
  conceptIds: ["react-component", "html-semantic-structure"],
  codeExamples: [
    {
      language: "jsx",
      code: 'import Navbar from "./components/Navbar.jsx";\n\n// …\n<Navbar />',
      fileName: "frontend/src/App.jsx",
      caption:
        "Import the component once at the top of the file, then use it like an HTML element.",
    },
  ],
  relationshipIds: ["component:App->renders->component:Navbar"],
  enables:
    "Split the screen into components, each in its own file, and assemble them in App.",
  commonMistakes: [
    "Naming a component with a lowercase letter (`navbar`). React then treats `<navbar />` as an unknown HTML element and your component never runs.",
    'Forgetting `export default` in `Navbar.jsx`, or importing with the wrong path or without `.jsx`. Vite shows an error such as "does not provide an export named default" or "Failed to resolve import".',
    'Writing `class="navbar"` instead of `className="navbar"` in JSX. React warns in the console and older versions ignore the class.',
    "Returning two elements side by side from a component without wrapping them. JSX must return one element, so wrap them in a fragment `<>…</>`.",
  ],
  nextStepId: "create-first-component",
  nextWhy:
    "With a place for components, we build the first one the app is really about: the card that shows a note, using a reusable Button.",
};
