import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// HTML in React in depth: JSX is HTML written inside JavaScript, a JSX
// element (anatomy), the attribute names that change, curly braces,
// stricter rules, style objects, lists and keys, a step-through of JSX
// turning into HTML, escaped text, semantics still matter (the Notes App),
// mistakes, practice and a recap.
export const reactModule = moduleLesson(
  "html-in-react",
  "HTML in React",
  40,
  [
    "Explain how JSX in a React component becomes real HTML in the page.",
    "Translate between HTML and JSX: className, htmlFor, camelCase and closed tags.",
    "Put JavaScript values in markup with curly braces, including lists with keys.",
    "Explain why React shows text safely, and when that protection is switched off.",
    "Keep components semantic and accessible: React renders whatever HTML you write.",
  ],

  part(
    "why",
    "HTML, written inside JavaScript",
    explain(
      "In a React app you write the page's HTML inside JavaScript, as [[jsx|JSX]]. It looks almost exactly like HTML, and it ends up as real HTML elements in the page, so everything in this topic still applies: meaningful elements, labels, alt text, headings. A build tool ([[vite|Vite]]) turns the JSX into JavaScript, and React uses that to create and update the elements.",
    ),
    diagram([
      ["you write JSX", '<h2 className="title">{note.title}</h2>'],
      ["Vite turns it into JavaScript", "a call that describes the element"],
      ["React creates the element", "with the value filled in"],
      ["the browser shows HTML", '<h2 class="title">Milk</h2>'],
    ]),
  ),

  part(
    "anatomy",
    "A JSX element",
    explain(
      "A JSX element reads like an HTML tag, with three differences you'll see everywhere: some attribute names change, values in curly braces are JavaScript, and every element must be closed.",
    ),
    anatomy(
      "An input, in JSX",
      [
        "<input",
        "  id={id}",
        '  className="field"',
        "  onChange={handleChange} />",
      ],
      [
        [
          "id={id}",
          "a JavaScript value",
          "Curly braces: the value of the variable `id`, not the text “id”.",
        ],
        [
          'className="field"',
          "a renamed attribute",
          "`class` is a JavaScript word, so JSX calls it `className`.",
        ],
        [
          "onChange={handleChange}",
          "an event handler",
          "A function, not a string. React calls it on every change.",
        ],
        ["/>", "a closed tag", "JSX closes even void elements like `<input>`."],
      ],
    ),
  ),

  part(
    "attribute-names",
    "Attribute names that change",
    explain(
      "JSX attributes are really JavaScript property names, so a few HTML attributes are spelled differently. Two clash with JavaScript words (`class`, `for`), and multi-word ones use camelCase. Two kinds keep their dashes: `aria-*` and `data-*`. In the real page, they all turn back into normal HTML.",
    ),
    reference("HTML → JSX", [
      ['class="note"', 'className="note"', "`class` is a JavaScript keyword"],
      ['for="email"', 'htmlFor="email"', "`for` is a JavaScript keyword"],
      [
        'onclick="save()"',
        "onClick={save}",
        "camelCase, and a function, not a string",
      ],
      ['tabindex="0"', "tabIndex={0}", "camelCase"],
      ['maxlength="100"', "maxLength={100}", "camelCase; a number in braces"],
      [
        'style="color: red"',
        'style={{ color: "red" }}',
        "an object, not a string",
      ],
      ['aria-label="Close"', 'aria-label="Close"', "unchanged, as are data-*"],
    ]),
    quickCheck(
      'In React, how do you write `<label for="email">`?',
      [
        '`<label for="email">`',
        '`<label htmlFor="email">`',
        '`<label name="email">`',
      ],
      1,
      "`for` is a JavaScript keyword, so React calls it `htmlFor`. It ends up as `for` in the real page.",
    ),
  ),

  part(
    "curly-braces",
    "Curly braces: JavaScript inside",
    explain(
      "Anything in `{ }` is a JavaScript expression: a variable, a calculation, a function call. Use it for text, for attribute values, and to show something only sometimes: `{error && <p>…</p>}` shows the paragraph only when there's an error. A boolean attribute like `required` can be written alone, as in HTML, or as `required={isRequired}`.",
    ),
    code(
      "jsx",
      "from the Notes App's NoteCard",
      [
        "<h2>{note.title}</h2>",
        "<Input id={`title-${note.id}`} maxLength={100} required />",
        "{error && (",
        '  <p className="form-error" role="alert">{error}</p>',
        ")}",
      ],
      {
        1: "the note's title, as text",
        2: "a computed id, a number and a boolean",
        3: "only shown when there's an error",
      },
    ),
  ),

  part(
    "stricter-rules",
    "Rules HTML lets you break",
    explain(
      "Browsers forgive sloppy HTML; JSX doesn't. Every element must be closed, including void ones (`<img />`, `<br />`). A component returns **one** element, so two siblings need a wrapper: a meaningful element, or an empty fragment `<>…</>` that adds nothing to the page. And comments are JavaScript comments in braces.",
    ),
    code(
      "jsx",
      "JSX's stricter rules",
      [
        "return (",
        "  <>",
        "    <h1>Your notes</h1>",
        '    <img src="logo.svg" alt="" />',
        "    {/* a comment in JSX */}",
        "  </>",
        ");",
      ],
      {
        2: "a fragment: two siblings, no extra element",
        4: "void elements close with />",
        5: "not <!-- -->",
      },
    ),
    keyPoints(
      "Close every element; void ones with `/>`.",
      "Return one element, or a `<>…</>` fragment.",
      "Comments are `{/* … */}`.",
    ),
  ),

  part(
    "style",
    "Inline styles are objects",
    explain(
      "In HTML, `style` is a string of CSS. In JSX it's a JavaScript object: property names in camelCase (`fontSize`, not `font-size`), values as strings, and plain numbers taken as pixels. Most styling should still live in a CSS file with `className`; inline styles are for values that change while the page runs.",
    ),
    code(
      "jsx",
      "the same style, twice",
      [
        '<p style="font-size: 20px; color: red">  <!-- HTML -->',
        '<p style={{ fontSize: 20, color: "red" }}>  {/* JSX */}',
      ],
      {
        2: "outer braces: JavaScript; inner: the object. 20 means 20px",
      },
    ),
  ),

  part(
    "lists-and-keys",
    "Lists and key",
    explain(
      "To show a list, `map` over an array and return an element for each item. Each one needs a `key` that's unique among its siblings, usually the item's id, so React can tell which item is which when the list changes. The [[react-lists-keys|key]] is for React only: it never appears in the HTML.",
    ),
    code(
      "jsx",
      "the Notes App's Dashboard",
      [
        '<section className="notes-grid" aria-label="Notes">',
        "  {notes.map((note) => (",
        "    <NoteCard key={note.id} note={note} />",
        "  ))}",
        "</section>",
      ],
      {
        2: "one element per note",
        3: "the key: React's name for this one, not in the HTML",
      },
    ),
  ),

  part(
    "how-jsx-becomes-html",
    "How JSX becomes HTML",
    explain(
      "Step through React rendering a note card, for a note whose title is `Milk` and whose text is `<b>2 litres</b>`. Watch what ends up in the page:",
    ),
    trace(
      "Rendering a card, move by move",
      [
        '<article className="note-card">',
        "  <h2>{note.title}</h2>",
        "  <p>{note.content}</p>",
        '  <button type="button" onClick={startEditing}>Edit</button>',
        "</article>",
      ],
      [
        {
          line: 1,
          note: "React creates an `<article>` element. `className` becomes the HTML `class` attribute.",
          vars: [["page", '<article class="note-card">']],
        },
        {
          line: 2,
          note: "The braces are evaluated: `note.title` is `Milk`, so that's the heading's text.",
          vars: [["page", '<article class="note-card"><h2>Milk</h2>']],
        },
        {
          line: 3,
          note: "`note.content` contains `<b>`, but React puts it in as **text**: the page shows the angle brackets, nothing turns bold, and no code can run.",
          vars: [["page", "…<h2>Milk</h2><p>&lt;b&gt;2 litres&lt;/b&gt;</p>"]],
        },
        {
          line: 4,
          note: "`onClick` doesn't become an attribute. React attaches `startEditing` as a click listener, so the HTML is a plain button.",
          vars: [["page", '…<button type="button">Edit</button>']],
        },
        {
          line: 5,
          note: "The article closes. What's in the page is ordinary, meaningful HTML: an article with a heading, a paragraph and a real button.",
          vars: [["page", "<article class=…><h2>…<p>…<button>…</article>"]],
          output: '<article class="note-card"> … </article>',
        },
      ],
    ),
  ),

  part(
    "escaped-text",
    "Text is shown safely",
    explain(
      "Whatever you put in `{ }` as text is **escaped**: `<` becomes `&lt;`, so a note containing `<script>` is shown as those characters, never run. That's what protects React apps from [[xss|XSS]] by default. The escape hatch is called `dangerouslySetInnerHTML`, and the name is the warning: it inserts raw HTML, so never use it with text a user typed.",
    ),
    inTheNotesApp(
      "`NoteCard` shows each note with `<p>{note.content}</p>`, and its comment explains why that's safe: React escapes the text, so a note containing HTML is shown as text and can never run as code.",
      { symbolId: "component:NoteCard" },
    ),
    quickCheck(
      'A user saves a note whose text is `<img src=x onerror="alert(1)">`. The card shows it with `<p>{note.content}</p>`. What happens?',
      [
        "The alert runs",
        "The text is shown as typed; nothing runs",
        "React refuses to show the note",
      ],
      1,
      "React escapes text in braces, so the HTML is shown as characters, not turned into elements.",
    ),
  ),

  part(
    "semantics",
    "Semantics still matter",
    explain(
      "React renders exactly the HTML you write, so a component built from `<div>`s produces div soup, with no landmarks, no real buttons and no labels. Components are the best place to get this right **once**: build the `Button` component on a real `<button>` and every button in the app is focusable and works with the keyboard.",
    ),
    inTheNotesApp(
      "The Notes App's `Button` renders a real `<button>` and passes `type`, `onClick` and `disabled` straight through, and `Input` always pairs a `<label htmlFor={id}>` with its field. Every form and card gets good HTML for free.",
      { symbolId: "component:Button" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "HTML attribute names in JSX",
      language: "jsx",
      wrong: ['<label for="email" class="hint">Email</label>'],
      problem:
        "React warns in the console (“Invalid DOM property `class`. Did you mean `className`?”), because JSX expects the JavaScript names.",
      right: ['<label htmlFor="email" className="hint">Email</label>'],
      why: "In JSX, write `className` and `htmlFor`.",
    }),
    mistake({
      title: "A clickable div",
      language: "jsx",
      wrong: ['<div className="button" onClick={save}>Save</div>'],
      problem:
        "React happily attaches the click, but the div still can't get focus or respond to Enter and Space.",
      right: [
        '<button type="button" className="button" onClick={save}>',
        "  Save",
        "</button>",
      ],
      why: "React doesn't change what HTML elements can do: use the real one.",
    }),
    mistake({
      title: "A list without keys",
      language: "jsx",
      wrong: ["{notes.map((note) => <li>{note.title}</li>)}"],
      problem:
        "React warns, and when the list changes it can mix up which item is which, like keeping one note's edit box on another.",
      right: [
        "{notes.map((note) => (",
        "  <li key={note.id}>{note.title}</li>",
        "))}",
      ],
      why: "Give each item a stable, unique `key`, usually its id.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "From JSX back to HTML",
      task: "This was copied from a React component. Make it plain HTML: `className` becomes `class` and `htmlFor` becomes `for`.",
      starter: [
        '<label htmlFor="email" className="hint">Email</label>',
        '<input id="email" className="field" type="email">',
      ],
      checks: [
        {
          kind: "attr",
          label: "The label points at the field",
          selector: "label",
          name: "for",
          value: "email",
        },
        { kind: "exists", label: "The label's class", selector: "label.hint" },
        { kind: "exists", label: "The input's class", selector: "input.field" },
        {
          kind: "missing",
          label: "No JSX names left",
          selector: "[classname], [htmlfor]",
        },
      ],
      hint: '`<label for="email" class="hint">Email</label>` and `<input id="email" class="field" type="email">`.',
      solution: [
        '<label for="email" class="hint">Email</label>',
        '<input id="email" class="field" type="email">',
      ],
    }),
    pageYourTurn({
      title: "What a list renders",
      task: 'A component renders `<ul className="notes">{notes.map((n) => <li key={n.id}>{n.title}</li>)}</ul>`, where the notes are `Milk` and `Bread`. Write the HTML that ends up in the page.',
      starter: ["<!-- the HTML React would produce -->"],
      checks: [
        {
          kind: "count",
          label: "Two items in the list",
          selector: "ul.notes > li",
          count: 2,
        },
        {
          kind: "text",
          label: "The first is Milk",
          selector: "ul.notes > li",
          text: "Milk",
        },
        {
          kind: "text",
          label: "The second is Bread",
          selector: "ul.notes > li:nth-child(2)",
          text: "Bread",
        },
        { kind: "missing", label: "No key in the HTML", selector: "[key]" },
      ],
      hint: '`className` becomes `class`, the `map` makes one `<li>` per note, and `key` stays inside React: `<ul class="notes"><li>Milk</li><li>Bread</li></ul>`.',
      solution: [
        '<ul class="notes">',
        "  <li>Milk</li>",
        "  <li>Bread</li>",
        "</ul>",
      ],
    }),
    pageYourTurn({
      title: "A style object, as CSS",
      task: 'A component renders `<p style={{ fontSize: 20, color: "red" }}>Due today</p>`. Write it as HTML with a `style` string, so it shows the same.',
      starter: ["<p>Due today</p>"],
      checks: [
        {
          kind: "style",
          label: "20px text",
          selector: "p",
          property: "font-size",
          value: "20px",
        },
        {
          kind: "style",
          label: "Red text",
          selector: "p",
          property: "color",
          value: "rgb(255, 0, 0)",
        },
        {
          kind: "text",
          label: "The same text",
          selector: "p",
          text: "Due today",
        },
        {
          kind: "attr",
          label: "A style attribute",
          selector: "p",
          name: "style",
        },
      ],
      hint: 'In HTML, `style` is CSS in a string: `style="font-size: 20px; color: red"`. React adds the `px` to a plain number.',
      solution: ['<p style="font-size: 20px; color: red">Due today</p>'],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("HTML in React cheat sheet", [
      [
        "className / htmlFor",
        "class and for, in JSX.",
        '<label htmlFor="e" className="hint">',
      ],
      ["camelCase", "onClick, tabIndex, maxLength.", "onClick={save}"],
      ["aria-* / data-*", "Unchanged.", 'aria-label="Close"'],
      ["{ }", "A JavaScript value or expression.", "<h2>{note.title}</h2>"],
      ["{a && <x/>}", "Show only when a is true.", "{error && <p>…</p>}"],
      [
        "/> and <>…</>",
        "Close everything; one root.",
        '<img src="…" alt="" />',
      ],
      ["style={{ }}", "An object; numbers are px.", "style={{ fontSize: 20 }}"],
      ["key", "For React only; not in the HTML.", "<li key={note.id}>"],
    ]),
    quickCheck(
      "React renders `<button onClick={save}>Save</button>`. What's in the page's HTML?",
      [
        '`<button onclick="save">Save</button>`',
        "`<button>Save</button>`, with the click attached by React",
        "`<div>Save</div>`",
      ],
      1,
      "Event handlers aren't attributes in the real page: React attaches them as listeners.",
    ),
  ),
);
