import type { Concept } from "@fsl/shared";

export const reactReusableComponent: Concept = {
  id: "react-reusable-component",
  slug: "react-reusable-component",
  title: "Reusable components",
  topicId: "react",
  summary:
    "A small component, such as a button or an input, written once with flexible props and used in many places so the whole app looks and behaves the same.",
  basics: [
    "A React component is a function that returns what should appear on the screen. You use it like an HTML tag, `<Button />`, and you can use the same component as many times as you like.",
    "Props are the inputs you give a component, written like HTML attributes. The component receives them as one object, which is often destructured right in the parameter list: `function Button({ variant })`.",
    "Whatever you put between a component's opening and closing tags arrives as a special prop called `children`. In `<Button>Save</Button>`, `children` is the text `Save`.",
    "The rest syntax `...props` collects every property you did not name into a new object. The spread syntax `{...props}` in JSX does the opposite: it passes every property in that object on to an element as attributes.",
  ],
  what: [
    "A reusable component is a component designed to be used in many places with different content. It wraps a common piece of UI, like a `button` or a labelled `input`, and adds the styling and behaviour every copy should share.",
    "Its props are its public settings: `children` for the content, a few named props like `variant` or `label` for the choices that differ, and `...props` to pass any other standard attribute, such as `type`, `onClick` or `disabled`, straight through to the HTML element.",
  ],
  why: [
    "Copying the same markup into ten files means ten places to update when the design changes, and one of them is always forgotten. With a shared component there is exactly one place to change, and every screen follows.",
    'It also makes the rest of the code shorter and easier to read. `<Button variant="danger">Delete</Button>` says what it is for; a `button` with a long class list and accessibility attributes says how it is built, which the reader rarely needs.',
  ],
  howItWorks: [
    "You write the component once, usually in its own file in `src/components/`, and export it.",
    "Every place that needs it imports it and renders it with its own props. React calls the same function for each use, with different props each time.",
    "Inside, the component pulls out the props it cares about, builds its output from them, and spreads the remaining props onto the underlying element so anything a normal `button` or `input` supports still works.",
    "When you change the component's file, for example its class name or a new default, every use of it changes on the next render, because they all call the same function.",
  ],
  basicExample: {
    language: "jsx",
    code: `function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={"button button-" + variant} {...props}>
      {children}
    </button>
  );
}

function Toolbar({ onDelete }) {
  return (
    <div>
      <Button type="submit">Save</Button>
      <Button variant="danger" onClick={onDelete}>Delete</Button>
    </div>
  );
}`,
    caption:
      "`children` is the label, `variant` picks the style, and `...props` forwards `type` and `onClick` to the real button.",
    highlightLines: [1, 3],
  },
  internals: [
    "A reusable component is not special to React; it is an ordinary function component. What makes it reusable is how its props are designed: few required props, sensible defaults, and pass-through for everything else.",
    'Default values in the parameter list, like `variant = "primary"`, apply only when the prop is missing (`undefined`). Callers can leave out the common case and specify only what is different.',
    "The order of the spread matters. Attributes written after `{...props}` override what the caller passed, and attributes written before can be overridden by the caller. Put fixed values you never want replaced after the spread.",
    "Each use of the component gets its own separate state and its own place in the tree. Ten `Input` components on a page are ten independent inputs that happen to share the same code.",
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
      text: "Create `src/components/Button.jsx` with the shared button.",
      code: {
        language: "jsx",
        fileName: "src/components/Button.jsx",
        code: `export default function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={"button button-" + variant} {...props}>
      {children}
    </button>
  );
}`,
      },
    },
    {
      text: "Add the two styles to the end of `src/index.css`.",
      code: {
        language: "css",
        fileName: "src/index.css",
        code: `.button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
.button-primary { background: #2563eb; }
.button-danger { background: #dc2626; }`,
      },
    },
    {
      text: "Replace `src/App.jsx` and use the button three times with different props.",
      code: {
        language: "jsx",
        fileName: "src/App.jsx",
        code: `import Button from "./components/Button.jsx";

export default function App() {
  return (
    <div>
      <Button onClick={() => alert("Saved")}>Save</Button>
      <Button variant="danger" onClick={() => alert("Deleted")}>
        Delete
      </Button>
      <Button disabled>Not yet</Button>
    </div>
  );
}`,
      },
    },
    {
      text: 'Open http://localhost:5173: you see a blue, a red and a disabled button. Now change `border-radius: 6px` to `border-radius: 999px` in `index.css`, or add `title="Click me"` inside `Button.jsx`, and save. All three buttons change at once, because they are all the same component.',
    },
  ],
  whereUsed: [
    "Basic building blocks used across many screens: buttons, text inputs, cards, modals, loading spinners and error messages.",
    "Component libraries and design systems, which are large collections of reusable components shared by a whole team or company.",
    "Not everywhere: if a piece of UI appears only once, keep it inline. Wait until the same pattern shows up two or three times before extracting it, because then you know which parts really vary and which props it actually needs.",
  ],
  connectsTo: [
    "Props, including the special `children` prop, which are the reusable component's whole interface.",
    "JavaScript destructuring, default values and the rest and spread syntax for objects.",
    "Event handlers such as `onClick` and `onChange`, which callers pass in and the component forwards.",
    "CSS classes, which give every use the same look from one stylesheet.",
  ],
  projectUsage: [
    {
      explanation:
        '`Button.jsx` is `Button({ children, variant = "primary", ...props })` and renders a `button` with the class `button` plus `button-` and the variant. Login, Register, NoteForm and NoteCard all use it, for example `<Button type="submit">Save</Button>` in the form and a Delete button in each card.',
    },
    {
      explanation:
        "`Input.jsx` is `Input({ label, id, ...props })` and renders a label linked to its input through `id`, so every field in Login, Register and NoteForm is accessible without anyone remembering to add the link by hand.",
    },
    {
      explanation:
        "Changing the button style in `index.css` or adding a default inside `Button.jsx` updates every button in the app at once: the login form, the register form, the note form and every note card.",
    },
  ],
  commonMistakes: [
    "Copying and pasting the same markup instead of making a component, so the copies slowly drift apart. Once a pattern repeats, extract it and replace the copies.",
    "Extracting too early, or adding a prop for every possible case, until the component is harder to use than plain HTML. Start small, with only the props the existing uses need, and add more when a real use requires it.",
    "Forgetting to forward the rest of the props, so `type`, `onClick` or `disabled` silently do nothing. Collect them with `...props` and spread them onto the element.",
    "Spreading props after your own fixed attributes when those must not change, or before attributes the caller should be able to override. Decide which wins and order the spread accordingly.",
  ],
  relatedConcepts: [
    "react-component",
    "react-props",
    "html-button",
    "html-input",
    "react-component-communication",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
