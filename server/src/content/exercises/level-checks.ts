import type { PredictExercise } from "@fsl/shared";

// Questions for the guided paths' level checks. Each is a predict exercise,
// checked on the server like every other; the path says which step it tests.

type Question = {
  id: string;
  title: string;
  prompt: string;
  choices: string[];
  correct: number;
  conceptIds: string[];
  hint: string;
  explanation: string;
};

const question = (q: Question): PredictExercise => ({
  id: q.id,
  mode: "predict",
  title: q.title,
  prompt: q.prompt,
  choices: q.choices.map((text, i) => ({ id: "abcd"[i]!, text })),
  correctChoiceId: "abcd"[q.correct]!,
  conceptIds: q.conceptIds,
  hints: [q.hint],
  explanation: q.explanation,
});

export const levelCheckExercises: PredictExercise[] = [
  // How the Web Works: Basic
  question({
    id: "web-basic-client",
    title: "Who asks?",
    prompt: "What is a client?",
    choices: [
      "The computer that answers requests",
      "The program that asks for things, like your browser",
      "A database",
    ],
    correct: 1,
    conceptIds: ["how-the-web-works"],
    hint: "In a restaurant, are you the kitchen or the customer?",
    explanation:
      "The client is the side that asks: your browser, or a phone app. The server is the always-on computer that answers. Your browser is the client you use most.",
  }),
  question({
    id: "web-basic-query",
    title: "The end of a URL",
    prompt: "In `https://notes.app/notes?sort=new`, what is `?sort=new`?",
    choices: [
      "The server's name",
      "Extra options for the request (a query)",
      "The protocol",
    ],
    correct: 1,
    conceptIds: ["how-the-web-works"],
    hint: "Everything after the `?` is optional.",
    explanation:
      "The part after `?` is the query string: extra options for the request, such as sorting or searching. `notes.app` is the domain and `https` the protocol.",
  }),
  question({
    id: "web-basic-dns-down",
    title: "When DNS fails",
    prompt: "DNS is down. What happens when you open notes.app?",
    choices: [
      "The page loads slowly",
      "The browser can't find the server at all",
      "You see the page without colours",
    ],
    correct: 1,
    conceptIds: ["domain-dns", "how-the-web-works"],
    hint: "What does the browser need before it can send any request?",
    explanation:
      "The browser can only connect to an IP address. Without DNS it never learns the number behind notes.app, so it can't reach the server at all, not even slowly.",
  }),
  question({
    id: "web-basic-status-ok",
    title: "It worked",
    prompt: "Which status code means “it worked”?",
    choices: ["200", "404", "500"],
    correct: 0,
    conceptIds: ["http-status-codes"],
    hint: "Success codes start with a 2.",
    explanation:
      "The first digit gives the kind of answer: 2xx means success, and 200 is plain OK. 404 means the page wasn't found, and 500 means the server itself failed.",
  }),
  question({
    id: "web-basic-no-styles",
    title: "A page without styling",
    prompt:
      "A page shows all its text but no colours or layout. Which file most likely didn't load?",
    choices: ["The HTML", "The CSS", "The DNS answer"],
    correct: 1,
    conceptIds: ["how-the-web-works"],
    hint: "Which file controls how things look?",
    explanation:
      "The text is there, so the HTML arrived. Colours and layout come from the CSS, which is a separate file with its own request, and that one failed.",
  }),
  question({
    id: "web-basic-first-step",
    title: "The first thing that happens",
    prompt:
      "You type `notes.app` and press Enter. What does the browser do first?",
    choices: [
      "Sends `GET /` to the server",
      "Asks DNS for the server's IP address",
      "Draws the page",
    ],
    correct: 1,
    conceptIds: ["how-the-web-works", "domain-dns"],
    hint: "The browser can only connect to a number.",
    explanation:
      "Before any HTTP request can be sent, the browser needs the server's IP address, so it asks DNS first. Only then does it send `GET /` and draw what comes back.",
  }),

  // How the Web Works: Intermediate
  question({
    id: "web-intermediate-port",
    title: "The 3000 in a URL",
    prompt: "The Notes App API runs at `http://localhost:3000`. What is 3000?",
    choices: [
      "A port: which program on the computer gets the request",
      "The number of users",
      "The IP address",
    ],
    correct: 0,
    conceptIds: ["how-the-web-works"],
    hint: "One computer runs many programs; how does a message reach the right one?",
    explanation:
      "`localhost` names the computer, and 3000 is the port the API listens on: it picks which program on that computer gets the request. HTTPS sites use 443.",
  }),
  question({
    id: "web-intermediate-stateless",
    title: "Staying logged in",
    prompt:
      "HTTP doesn't remember earlier requests. How does the server know you're logged in on the next one?",
    choices: [
      "It remembers your IP address",
      "The browser sends a cookie with every request",
      "It doesn't; you log in every time",
    ],
    correct: 1,
    conceptIds: ["secure-cookies", "http-headers"],
    hint: "Something has to travel with every request.",
    explanation:
      "After you log in, the server sets a cookie. The browser sends it back with every later request, and the server uses it to find who you are, request after request.",
  }),
  question({
    id: "web-intermediate-no-store",
    title: "Cache-Control: no-store",
    prompt:
      "A response has `Cache-Control: no-store`. What does the browser do?",
    choices: ["Keeps it for an hour", "Never keeps a copy", "Blocks the page"],
    correct: 1,
    conceptIds: ["http-headers"],
    hint: "Read the value literally.",
    explanation:
      "`no-store` means no copy may be kept anywhere, so the browser fetches it fresh every time. That is right for private, changing data like your notes.",
  }),
  question({
    id: "web-intermediate-api",
    title: "What an API returns",
    prompt: "What does an API usually send back?",
    choices: [
      "JSON data for a program to use",
      "A finished page with styling",
      "An IP address",
    ],
    correct: 0,
    conceptIds: ["rest-endpoint", "json"],
    hint: "APIs are for programs, not people.",
    explanation:
      "Pages are for people; an API is for programs. It returns data, usually JSON, and the client (here the React app) decides how to show it.",
  }),

  // How the Web Works: Advanced
  question({
    id: "web-advanced-certificate",
    title: "What a certificate proves",
    prompt:
      "What does the server's certificate prove during the TLS handshake?",
    choices: [
      "That it really owns the domain",
      "That it has no bugs",
      "That it's fast",
    ],
    correct: 0,
    conceptIds: ["https"],
    hint: "Who signs a certificate, and what do they check?",
    explanation:
      "A certificate authority signs it only after checking who controls the domain, so the browser knows it reached the real site and not an impostor in between.",
  }),
  question({
    id: "web-advanced-cname",
    title: "CNAME records",
    prompt: "What does a CNAME record do?",
    choices: [
      "Points one name at another name",
      "Sets the server's port",
      "Stores the certificate",
    ],
    correct: 0,
    conceptIds: ["domain-dns"],
    hint: "C is for “canonical”: the real name.",
    explanation:
      "A CNAME says “this name is an alias for that one”, for example www.notes.app → notes.app. DNS follows it to the A record and the final IP address.",
  }),
  question({
    id: "web-advanced-cors",
    title: "Who enforces CORS",
    prompt: "Who enforces CORS?",
    choices: ["The server", "The browser", "DNS"],
    correct: 1,
    conceptIds: ["cors"],
    hint: "A request from curl is never blocked by CORS. Why?",
    explanation:
      "The server only sends headers saying which origins are allowed. The browser enforces them, deciding whether the page may read the response; curl ignores them.",
  }),
  question({
    id: "web-advanced-load-balancer",
    title: "Users kept in memory",
    prompt:
      "You run 3 copies of your app behind a load balancer and keep logged-in users in each copy's memory. What goes wrong?",
    choices: [
      "Users seem logged out when a request reaches another copy",
      "Nothing",
      "DNS stops working",
    ],
    correct: 0,
    conceptIds: ["secure-cookies"],
    hint: "Each request may go to a different copy.",
    explanation:
      "The copies don't share memory, so the next request can land on a copy that never saw the login, and the user seems logged out. Keep sessions in shared storage.",
  }),

  // HTML: Basic
  question({
    id: "html-basic-closing-tag",
    title: "A missing closing tag",
    prompt: "Which tag closes `<p>`?",
    choices: ["`<p/>`", "`</p>`", "`<\\p>`"],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Closing tags start with a slash right after the `<`.",
    explanation:
      "A closing tag repeats the element's name after a slash: `</p>`. Together the opening tag, content and closing tag make one element.",
  }),
  question({
    id: "html-basic-nesting",
    title: "Closing in the right order",
    prompt: "Which line is nested correctly?",
    choices: [
      "`<p><em>Hi</p></em>`",
      "`<p><em>Hi</em></p>`",
      "`<em><p>Hi</em></p>`",
    ],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "The last tag you open is the first one you close.",
    explanation:
      "`<em>` opened inside `<p>`, so it must close before `</p>`. Elements fit inside each other like boxes, never overlapping.",
  }),
  question({
    id: "html-basic-head",
    title: "Head or body",
    prompt: "Where does the page's `<title>` go?",
    choices: ["In `<head>`", "In `<body>`", "After `</html>`"],
    correct: 0,
    conceptIds: ["html-document"],
    hint: "The title appears on the browser tab, not on the page.",
    explanation:
      "`<head>` holds information about the page that isn't shown in it, such as the title on the tab, the character set and the viewport setting.",
  }),
  question({
    id: "html-basic-ordered-list",
    title: "Steps in order",
    prompt:
      "You list the steps of a recipe, which must be followed in order. Which element?",
    choices: ["`<ul>`", "`<ol>`", "`<table>`"],
    correct: 1,
    conceptIds: ["html-element", "html-semantic-structure"],
    hint: "One list is “ordered”.",
    explanation:
      "`<ol>` is an ordered list: its numbers tell the reader the order matters. `<ul>` is for items whose order doesn't matter.",
  }),
  question({
    id: "html-basic-alt",
    title: "Describing an image",
    prompt: "What is an image's `alt` text for?",
    choices: [
      "A tooltip with the file name",
      "Words that replace the image when it can't be seen",
      "Making the image load faster",
    ],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Think of someone using a screen reader.",
    explanation:
      "Screen readers read the alt text aloud, and browsers show it when the picture fails to load, so it should say what the image shows.",
  }),
  question({
    id: "html-basic-label",
    title: "Connecting a label",
    prompt: 'How does `<label for="email">` know which field it names?',
    choices: [
      "It names the field right after it, whatever it is",
      "Its `for` matches the field's `id`",
      "Its `for` matches the field's `type`",
    ],
    correct: 1,
    conceptIds: ["html-input", "html-form"],
    hint: "Look for the same word on both elements.",
    explanation:
      '`for="email"` points at the element with `id="email"`. Then clicking the label focuses the field and screen readers announce the label with it.',
  }),

  // HTML: Intermediate
  question({
    id: "html-intermediate-main",
    title: "The main content",
    prompt:
      "Which element marks the page's main content, so people can jump straight to it?",
    choices: ['`<div id="main">`', "`<main>`", "`<section>`"],
    correct: 1,
    conceptIds: ["html-semantic-structure"],
    hint: "Landmarks have names that say what they are.",
    explanation:
      "`<main>` is a landmark: screen readers can jump to it, and there is only one per page. A `<div>` means nothing on its own.",
  }),
  question({
    id: "html-intermediate-required",
    title: "required and the server",
    prompt:
      "A field has `required`. Can an empty value still reach the server?",
    choices: [
      "No, the browser always blocks it",
      "Yes, a request can be sent without using the form",
      "Only in old browsers",
    ],
    correct: 1,
    conceptIds: ["html-form", "input-validation"],
    hint: "Who controls the request: the page, or whoever sends it?",
    explanation:
      "`required` only helps people using the form. Anyone can send a request with other tools, so the server must check every value again.",
  }),
  question({
    id: "html-intermediate-radio",
    title: "Radio groups",
    prompt:
      "What makes several radio buttons one group where only one can be chosen?",
    choices: [
      "Putting them on the same line",
      "Giving them the same `name`",
      "Giving them the same `id`",
    ],
    correct: 1,
    conceptIds: ["html-input"],
    hint: "Ids must be unique; something else must be shared.",
    explanation:
      "Radio buttons with the same `name` form a group, and choosing one unchooses the others. Ids must stay unique so each label can point at its own button.",
  }),
  question({
    id: "html-intermediate-icon-button",
    title: "A button with only an icon",
    prompt:
      "A close button shows only “✕”. What will a screen reader announce without anything else?",
    choices: [
      "“Close, button”",
      "Something like “multiplication sign, button”",
      "Nothing at all",
    ],
    correct: 1,
    conceptIds: ["html-button"],
    hint: "Screen readers read the text that's there.",
    explanation:
      'The button\'s accessible name is its text, “✕”. Adding `aria-label="Close"` or visually hidden text gives it a name that says what it does.',
  }),

  // HTML: Advanced
  question({
    id: "html-intermediate-aria",
    title: "What ARIA does",
    prompt: 'You add `aria-expanded="true"` to a menu button. What happens?',
    choices: [
      "The menu opens",
      "Screen readers announce the menu as open",
      "The button gets an arrow icon",
    ],
    correct: 1,
    conceptIds: ["html-button"],
    hint: "ARIA describes; it doesn't do.",
    explanation:
      "ARIA attributes only change what assistive technology hears. Your code still has to open the menu and update the attribute when it closes.",
  }),
  question({
    id: "html-intermediate-div-button",
    title: "A div that acts as a button",
    prompt:
      'A `<div role="button">` has an onclick. What\'s still missing compared with `<button>`?',
    choices: [
      "Nothing",
      "Focus by Tab and activation by Enter and Space",
      "Only its colour",
    ],
    correct: 1,
    conceptIds: ["html-button", "html-semantic-structure"],
    hint: "Try using it without a mouse.",
    explanation:
      "A real button can be focused and pressed with Enter or Space for free. A div needs tabindex and key handling added by hand, so use `<button>`.",
  }),
  question({
    id: "html-advanced-defer",
    title: "defer",
    prompt: "What does `defer` on a `<script>` do?",
    choices: [
      "Never runs the script",
      "Runs it after the HTML has been read, without blocking it",
      "Runs it before anything else",
    ],
    correct: 1,
    conceptIds: ["html-document"],
    hint: "A plain script stops the browser reading the page.",
    explanation:
      "With `defer` the browser keeps reading the HTML while the script downloads, then runs it once the page is read, in order. Module scripts behave like this by default.",
  }),
  question({
    id: "html-advanced-htmlfor",
    title: "for in React",
    prompt: "In React's JSX, how do you write a label's `for` attribute?",
    choices: ["`for`", "`htmlFor`", "`labelFor`"],
    correct: 1,
    conceptIds: ["jsx", "html-input"],
    hint: "`for` is already a word in JavaScript.",
    explanation:
      "`for` is a JavaScript keyword, so JSX uses `htmlFor` (and `className` for `class`). React writes the normal `for` attribute into the real page.",
  }),
  question({
    id: "html-basic-block-inline",
    title: "Block or inline",
    prompt:
      "You put `<span>One</span><span>Two</span>` in a page. How do they appear?",
    choices: [
      "On two lines",
      "Side by side on one line",
      "Not at all, a span needs a class",
    ],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Is `<span>` a block or an inline element?",
    explanation:
      "`<span>` is inline, so both sit in the same line of text (“OneTwo”). Two `<div>`s, which are block elements, would each start on a new line.",
  }),
  question({
    id: "html-basic-entity",
    title: "Showing a tag as text",
    prompt:
      "A page should show the text `<p>` to the reader. What goes in the HTML?",
    choices: ["`<p>`", "`&lt;p&gt;`", "`<code><p></code>`"],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "The browser reads `<` as the start of a tag.",
    explanation:
      "`&lt;` and `&gt;` are character entities for < and >, so the browser shows them as text instead of starting a new paragraph element.",
  }),
  question({
    id: "html-advanced-custom-element",
    title: "Naming your own element",
    prompt:
      "You register a custom element with `customElements.define`. Which name works?",
    choices: ["`notecard`", "`note-card`", "`NoteCard`"],
    correct: 1,
    conceptIds: ["html-element"],
    hint: "Built-in elements never have one character that custom ones must.",
    explanation:
      "Custom element names must contain a hyphen and be lowercase, so they can never clash with a built-in HTML element. `NoteCard` is how a React component would be named.",
  }),
  question({
    id: "html-advanced-details",
    title: "An FAQ without JavaScript",
    prompt:
      "Which element opens and closes a section on click, with no JavaScript?",
    choices: ["`<section>`", "`<details>`", "`<aside>`"],
    correct: 1,
    conceptIds: ["html-semantic-structure"],
    hint: "Its first child is a `<summary>`.",
    explanation:
      "`<details>` with a `<summary>` opens and closes by itself, and works with the keyboard and screen readers. `<section>` and `<aside>` only describe content.",
  }),

  // CSS
  question({
    id: "css-basic-property",
    title: "Property or value",
    prompt: "In `p { font-size: 18px; }`, what is `18px`?",
    choices: ["The selector", "The property", "The value"],
    correct: 2,
    conceptIds: ["css-selector"],
    hint: "The part after the colon.",
    explanation:
      "`p` is the selector, `font-size` the property and `18px` the value it is set to. Together `font-size: 18px;` is one declaration.",
  }),
  question({
    id: "css-basic-class",
    title: "Sharing a look",
    prompt:
      "Several elements should share the same style. What do you give them?",
    choices: ["The same id", "The same class", "The same tag name only"],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "Ids must be unique on a page.",
    explanation:
      "A class can be used by many elements, and one element can have several classes. Ids are unique, and id selectors are hard to override.",
  }),
  question({
    id: "css-basic-rem",
    title: "Text that grows",
    prompt: "Which unit follows the size people set for text in their browser?",
    choices: ["px", "rem", "vw"],
    correct: 1,
    conceptIds: ["css-responsive"],
    hint: "It is relative to the root font size.",
    explanation:
      "`rem` multiplies the root font size, which grows when someone enlarges text in their browser settings. `px` stays fixed and `vw` follows the window width.",
  }),
  question({
    id: "css-basic-padding",
    title: "Space inside the border",
    prompt:
      "You want more space between a box's border and its text. Which property?",
    choices: ["margin", "padding", "gap"],
    correct: 1,
    conceptIds: ["css-box-model"],
    hint: "Inside or outside the border?",
    explanation:
      "Padding is the space inside the border, around the content. Margin is outside the border and pushes other boxes away; gap spaces flex and grid items.",
  }),
  question({
    id: "css-basic-display-none",
    title: "Hiding an element",
    prompt: "Which hides an element so it takes no space at all?",
    choices: ["`visibility: hidden`", "`display: none`", "`opacity: 0`"],
    correct: 1,
    conceptIds: ["css-box-model"],
    hint: "Two of these leave an empty space behind.",
    explanation:
      "`display: none` removes the box from the layout. `visibility: hidden` and `opacity: 0` make it invisible but it still takes its space.",
  }),
  question({
    id: "css-basic-align",
    title: "Centring in a row",
    prompt: "Flex items are in a row. Which property centres them vertically?",
    choices: ["`justify-content`", "`align-items`", "`text-align`"],
    correct: 1,
    conceptIds: ["css-flexbox"],
    hint: "In a row, vertical is the cross axis.",
    explanation:
      "In a row the main axis is horizontal, so `justify-content` spaces items left to right and `align-items` lines them up top to bottom.",
  }),
  question({
    id: "css-intermediate-fr",
    title: "What fr means",
    prompt: "What does `grid-template-columns: 1fr 1fr 1fr` make?",
    choices: ["Three equal columns", "One column", "Three rows"],
    correct: 0,
    conceptIds: ["css-flexbox"],
    hint: "fr is a share of the free space.",
    explanation:
      "Each `1fr` is one equal share of the space left over, so three of them make three equal columns that grow and shrink with the container.",
  }),
  question({
    id: "css-intermediate-mobile-first",
    title: "Mobile first",
    prompt: "In mobile-first CSS, what do media queries usually add?",
    choices: [
      "Styles for smaller screens",
      "Layout for wider screens",
      "Print styles only",
    ],
    correct: 1,
    conceptIds: ["css-responsive"],
    hint: "The default styles are for phones.",
    explanation:
      "Mobile-first writes the simple phone layout as the default and uses `@media (min-width: …)` to add columns and space as the screen gets wider.",
  }),
  question({
    id: "css-intermediate-absolute",
    title: "An absolute badge",
    prompt:
      "A badge with `position: absolute` sits in the page corner instead of its card's. What fixes it?",
    choices: [
      "`position: relative` on the card",
      "A larger z-index",
      "`display: block` on the badge",
    ],
    correct: 0,
    conceptIds: ["css-box-model"],
    hint: "Absolute positions inside the nearest positioned ancestor.",
    explanation:
      "An absolutely positioned element is placed relative to its nearest positioned ancestor. Without one, that's the page; `position: relative` on the card makes the card the anchor.",
  }),
  question({
    id: "css-intermediate-specificity",
    title: "Which rule wins",
    prompt:
      "`#main h1 { color: blue }` comes first and `.title { color: red }` second. An h1 matches both. Its colour?",
    choices: [
      "Red, because it comes later",
      "Blue, because the id is more specific",
      "Black, because they cancel out",
    ],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "Specificity is checked before order.",
    explanation:
      "Order only decides between equally specific selectors. `#main h1` contains an id, which beats any number of classes, so blue wins.",
  }),
  question({
    id: "css-advanced-var",
    title: "Using a variable",
    prompt: "How do you use the custom property `--brand` as a colour?",
    choices: [
      "`color: --brand;`",
      "`color: var(--brand);`",
      "`color: $brand;`",
    ],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "Custom properties are read with a function.",
    explanation:
      "Custom properties are defined with two dashes and read with `var()`, as in `color: var(--brand);`. Changing `--brand` in one place updates every use.",
  }),
  question({
    id: "css-advanced-has",
    title: "Selecting a parent",
    prompt: "Which selector styles only the cards that contain an image?",
    choices: ["`.card img`", "`.card:has(img)`", "`img + .card`"],
    correct: 1,
    conceptIds: ["css-selector"],
    hint: "One of these selects the image, not the card.",
    explanation:
      "`.card:has(img)` matches the card itself when it contains an image. `.card img` would style the image inside the card instead.",
  }),
  question({
    id: "css-advanced-container",
    title: "Container queries",
    prompt: "What does a container query check?",
    choices: [
      "The size of the browser window",
      "The size of a parent element",
      "The user's device type",
    ],
    correct: 1,
    conceptIds: ["css-responsive"],
    hint: "It's the local version of a media query.",
    explanation:
      "A container query responds to the size of an element marked with `container-type`, so the same component can adapt wherever it is placed.",
  }),
  question({
    id: "css-advanced-dark",
    title: "Dark mode",
    prompt: "Which media feature follows the system's light or dark setting?",
    choices: [
      "`prefers-color-scheme`",
      "`prefers-reduced-motion`",
      "`min-width`",
    ],
    correct: 0,
    conceptIds: ["css-responsive"],
    hint: "Its values are light and dark.",
    explanation:
      "`@media (prefers-color-scheme: dark)` applies when the system is in dark mode, usually by swapping the values of colour custom properties.",
  }),

  // JavaScript
  question({
    id: "js-basic-const",
    title: "const or let",
    prompt:
      "A note's title never changes after it is set. How should you declare it?",
    choices: [
      '`const title = "Milk";`',
      '`let title = "Milk";`',
      '`title = "Milk";`',
    ],
    correct: 0,
    conceptIds: ["js-variable"],
    hint: "Which one refuses a new value?",
    explanation:
      "Use `const` for a value that never gets reassigned and `let` only when it must change. Leaving the keyword out creates an accidental global, which is a bug.",
  }),
  question({
    id: "js-basic-plus",
    title: "Text plus a number",
    prompt: 'What does `"5" + 1` give in JavaScript?',
    choices: ["`6`", '`"51"`', "An error"],
    correct: 1,
    conceptIds: ["js-variable"],
    hint: "With a string on either side, `+` joins text.",
    explanation:
      'When one side of `+` is a string, JavaScript joins the two as text, so the result is `"51"`. Convert first with `Number("5") + 1` to get `6`.',
  }),
  question({
    id: "js-basic-equals",
    title: "Strict equality",
    prompt: 'What does `3 === "3"` give?',
    choices: ["`true`", "`false`", "An error"],
    correct: 1,
    conceptIds: ["js-variable"],
    hint: "`===` compares the type as well as the value.",
    explanation:
      "`===` is strict: a number and a string are different types, so the answer is `false`. The loose `==` would convert and say `true`, which is why code uses `===`.",
  }),
  question({
    id: "js-basic-return",
    title: "Returning a value",
    prompt: "`function double(n) { n * 2; }` — what does `double(4)` give?",
    choices: ["`8`", "`undefined`", "`4`"],
    correct: 1,
    conceptIds: ["js-function"],
    hint: "Does the function hand anything back?",
    explanation:
      "A function with curly braces only gives back what `return` hands it. Without `return`, the result is `undefined`; write `return n * 2;` to get `8`.",
  }),
  question({
    id: "js-basic-filter",
    title: "Choosing an array method",
    prompt:
      "You want only the notes that are done, as a new array. Which method?",
    choices: ["`notes.map(...)`", "`notes.filter(...)`", "`notes.find(...)`"],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "One keeps some items, one changes every item, one returns a single item.",
    explanation:
      "`filter` returns a new array with the items its function returns true for. `map` changes every item, and `find` returns only the first match, not an array.",
  }),
  question({
    id: "js-basic-listener",
    title: "Event listeners",
    prompt: 'What is wrong with `button.addEventListener("click", save());`?',
    choices: [
      "Nothing",
      "It calls `save` straight away and passes its result, not the function",
      "`click` should be `onclick`",
    ],
    correct: 1,
    conceptIds: ["js-event-listener"],
    hint: "Look at the brackets after `save`.",
    explanation:
      "`save()` runs the function immediately and hands its result to `addEventListener`. Pass the function itself, `save`, so the browser can call it on every click.",
  }),
  question({
    id: "js-intermediate-json",
    title: "Reading JSON",
    prompt:
      'A server sends the text `{"id":7}`. How do you get an object you can read `.id` from?',
    choices: ["`JSON.parse(text)`", "`JSON.stringify(text)`", "`text.id`"],
    correct: 0,
    conceptIds: ["json"],
    hint: "Which one turns text into a value?",
    explanation:
      "`JSON.parse` turns JSON text into objects and arrays; `JSON.stringify` goes the other way. With fetch, `response.json()` does the parsing for you.",
  }),
  question({
    id: "js-intermediate-async",
    title: "await",
    prompt: "Where can you use `await`?",
    choices: [
      "Anywhere",
      "Inside an `async` function (or at the top of a module)",
      "Only inside loops",
    ],
    correct: 1,
    conceptIds: ["js-async-await"],
    hint: "It needs a keyword on the function around it.",
    explanation:
      "`await` pauses an `async` function until a promise settles. Modules also allow it at the top level, but inside an ordinary function it is a syntax error.",
  }),
  question({
    id: "js-intermediate-fetch-ok",
    title: "fetch and errors",
    prompt: "`fetch` gets a 404 reply. What happens?",
    choices: [
      "The promise rejects",
      "It resolves; `response.ok` is false",
      "The page reloads",
    ],
    correct: 1,
    conceptIds: ["js-fetch"],
    hint: "The server did answer.",
    explanation:
      "`fetch` only rejects when the request can't be made at all, such as no network. Any HTTP reply resolves the promise, so check `response.ok` or the status yourself.",
  }),
  question({
    id: "js-intermediate-spread",
    title: "Copying with spread",
    prompt: "What is `{ ...note, done: true }`?",
    choices: [
      "`note` itself, changed",
      "A new object: a copy of `note` with `done` set to true",
      "An array",
    ],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "The curly braces make something new.",
    explanation:
      "Spread copies every property of `note` into a new object, then `done: true` overrides one. The original `note` is untouched, which is what React state updates need.",
  }),
  question({
    id: "js-intermediate-nullish",
    title: "Missing values",
    prompt: "`user` has no `address`. What does `user.address?.city` give?",
    choices: ["An error", "`undefined`", '`""`'],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "`?.` stops early instead of failing.",
    explanation:
      'Optional chaining stops at the missing `address` and gives `undefined` instead of throwing. Add `?? "Unknown"` to supply a fallback for display.',
  }),
  question({
    id: "js-advanced-closure",
    title: "Closures",
    prompt:
      "`makeCounter()` returns a function that adds to a `let count` inside it. You make two counters. Do they share `count`?",
    choices: [
      "Yes",
      "No, each call makes its own `count`",
      "Only after the first call",
    ],
    correct: 1,
    conceptIds: ["js-function"],
    hint: "Every call to `makeCounter` runs `let count = 0` again.",
    explanation:
      "Each call to `makeCounter` creates a fresh `count`, and the function it returns closes over that one. The two counters remember separate values.",
  }),
  question({
    id: "js-advanced-event-loop",
    title: "The event loop",
    prompt:
      'In what order do these print? `setTimeout(() => log("A"), 0); Promise.resolve().then(() => log("B")); log("C");`',
    choices: ["A, B, C", "C, B, A", "C, A, B"],
    correct: 1,
    conceptIds: ["js-promise"],
    hint: "Running code first; then promise callbacks; then timers.",
    explanation:
      "Synchronous code finishes first (C). Then the event loop empties the promise queue (B) before taking the next task from the timer queue (A), even with a 0 ms delay.",
  }),
  question({
    id: "js-advanced-reference",
    title: "References",
    prompt:
      "`const b = a;` where `a` is an array, then `b.push(1)`. What happens to `a`?",
    choices: [
      "Nothing",
      "It gets the 1 too: both names point at one array",
      "It's emptied",
    ],
    correct: 1,
    conceptIds: ["js-object-array"],
    hint: "Was the array copied?",
    explanation:
      "Assigning an object or array copies the reference, not the contents. `a` and `b` are the same array, so the push shows through both; copy with `[...a]` to keep them apart.",
  }),
  question({
    id: "js-advanced-optional-type",
    title: "Optional properties",
    prompt:
      "In `type Note = { title: string; content?: string }`, which object fits?",
    choices: [
      '`{ title: "Milk" }`',
      '`{ content: "2 litres" }`',
      "`{ title: 3 }`",
    ],
    correct: 0,
    conceptIds: ["typescript-types"],
    hint: "Which property may be left out?",
    explanation:
      "`content?` is optional, so an object with only a string `title` fits. Leaving out `title` or giving it a number breaks the type, and TypeScript reports it before running.",
  }),

  // Git & GitHub: Basic
  question({
    id: "git-basic-staged",
    title: "Saved isn't committed",
    prompt:
      "You edit `app.js`, save it, and run `git commit`. What does the commit contain?",
    choices: [
      "Your edit to app.js",
      "Nothing new: the edit was never staged with git add",
      "Every file in the folder",
    ],
    correct: 1,
    conceptIds: ["git-repository"],
    hint: "Which command puts a change in the staging area?",
    explanation:
      "Saving only changes the working folder. `git commit` saves what's staged, so without `git add app.js` the edit isn't in the commit.",
  }),
  question({
    id: "git-basic-message",
    title: "A useful message",
    prompt:
      "Which commit message follows the conventional style and says what changed?",
    choices: [
      "`updated stuff`",
      "`fix: show an error when the note title is empty`",
      "`Fixed it!!`",
    ],
    correct: 1,
    conceptIds: ["conventional-commit", "git-commit"],
    hint: "type: what changed, in the imperative.",
    explanation:
      "`fix:` gives the kind of change and the rest says exactly what it does, so nobody needs to open the diff to know.",
  }),
  question({
    id: "git-basic-fast-forward",
    title: "A simple merge",
    prompt:
      "You branch from `main`, make 3 commits, and nobody changes `main`. What does `git merge` on main do?",
    choices: [
      "Creates a merge commit with two parents",
      "Fast-forwards: main's label moves to your last commit",
      "Reports a conflict",
    ],
    correct: 1,
    conceptIds: ["git-branch", "merge"],
    hint: "Has main moved since you branched?",
    explanation:
      "`main` hasn't moved, so there's nothing to combine: its label just slides forward to your newest commit.",
  }),
  question({
    id: "git-basic-rejected",
    title: "A rejected push",
    prompt: "`git push` is rejected with “fetch first”. What's the right fix?",
    choices: [
      "`git push --force`",
      "`git pull`, then `git push`",
      "Delete your branch",
    ],
    correct: 1,
    conceptIds: ["github-remote-push"],
    hint: "Someone pushed before you.",
    explanation:
      "GitHub has commits you don't. Pulling merges them with yours; then your push only adds to the history and is accepted. Forcing would delete their work.",
  }),
  question({
    id: "git-basic-pr-red",
    title: "A failing check",
    prompt: "Your pull request has a failing CI check. What should you do?",
    choices: [
      "Merge anyway; it's probably fine",
      "Fix it on the same branch and push; the checks run again",
      "Open a new pull request",
    ],
    correct: 1,
    conceptIds: ["pull-request"],
    hint: "What happens to a pull request when you push to its branch?",
    explanation:
      "Every push to the branch updates the pull request and re-runs the checks. Merge only when they're green.",
  }),

  // Git & GitHub: Intermediate
  question({
    id: "git-intermediate-conflict",
    title: "Finishing a conflicted merge",
    prompt:
      "You've edited every conflicted file and removed the markers. What finishes the merge?",
    choices: [
      "`git merge --abort`",
      "`git add` the files, then `git commit`",
      "`git push --force`",
    ],
    correct: 1,
    conceptIds: ["merge"],
    hint: "How does Git learn a file is resolved?",
    explanation:
      "`git add` marks each file resolved, and `git commit` creates the merge commit. `--abort` would throw the merge away.",
  }),
  question({
    id: "git-intermediate-revert",
    title: "Undoing on main",
    prompt: "A bad commit is already on `main` on GitHub. How do you undo it?",
    choices: [
      "`git reset --hard` and force-push main",
      "`git revert <hash>`: a new commit that undoes it",
      "Delete the repository",
    ],
    correct: 1,
    conceptIds: ["git-commit"],
    hint: "Others already have that commit.",
    explanation:
      "Rewriting shared history breaks everyone's copy. `git revert` adds a commit doing the opposite, which everyone just pulls.",
  }),
  question({
    id: "git-intermediate-rebase-rule",
    title: "The golden rule",
    prompt: "Which commits is it safe to rebase?",
    choices: [
      "Any, including main",
      "Only your own commits that nobody else has yet",
      "Only merge commits",
    ],
    correct: 1,
    conceptIds: ["git-branch"],
    hint: "Rebasing replaces commits with new ones.",
    explanation:
      "Rebased commits get new hashes. If others already have the old ones, your histories disagree. Rebase only unshared work.",
  }),
  question({
    id: "git-intermediate-gitignore",
    title: "Too late to ignore",
    prompt:
      "You add `.env` to `.gitignore`, but it was committed last week. What else do you need?",
    choices: [
      "Nothing: .gitignore removes it",
      "`git rm --cached .env`, a commit, and rotate the secret",
      "Rename the file",
    ],
    correct: 1,
    conceptIds: ["gitignore"],
    hint: "Does .gitignore affect files Git already tracks?",
    explanation:
      "Ignore rules only apply to untracked files. `git rm --cached` stops tracking it, and since the secret is in history, it must be changed.",
  }),
  question({
    id: "git-intermediate-review",
    title: "A blocking comment",
    prompt:
      "In a review, you notice a query returns every user's notes, not just the logged-in user's. How should you comment?",
    choices: [
      "`nit:` and approve",
      "`blocking:` explain the leak and how to fix it, and request changes",
      "Say nothing; tests will catch it",
    ],
    correct: 1,
    conceptIds: ["pull-request"],
    hint: "Can this be merged as it is?",
    explanation:
      "Leaking other users' data must be fixed before merging: a blocking comment that says why and how, with Request changes.",
  }),

  // Git & GitHub: Advanced
  question({
    id: "git-advanced-bisect",
    title: "Halving the search",
    prompt:
      "About how many tests does `git bisect` need to find a bad commit among 1,000?",
    choices: ["About 10", "About 100", "About 1,000"],
    correct: 0,
    conceptIds: ["git-commit"],
    hint: "Each test halves the range.",
    explanation:
      "Each answer halves the suspects: 1,000 → 500 → 250 → … → 1 takes about ten halvings, so about ten tests instead of a thousand.",
  }),
  question({
    id: "git-advanced-pickaxe",
    title: "Code that's gone",
    prompt:
      "A function was deleted months ago. Which command finds the commit that removed it?",
    choices: ["`git blame`", "`git log -S functionName`", "`git status`"],
    correct: 1,
    conceptIds: ["git-commit"],
    hint: "Blame only shows lines that still exist.",
    explanation:
      "`git log -S` searches the changes themselves, so it finds the commits that added and removed the text.",
  }),
  question({
    id: "git-advanced-ci",
    title: "Where the tests run",
    prompt: "Where should the full test suite run for every pull request?",
    choices: [
      "In a pre-commit hook",
      "In a GitHub Actions workflow",
      "Only on the reviewer's laptop",
    ],
    correct: 1,
    conceptIds: ["ci-cd", "pull-request"],
    hint: "Which one runs for everyone, on a clean machine?",
    explanation:
      "CI runs on a fresh runner for every pull request. Hooks are for quick local checks and can be skipped.",
  }),
  question({
    id: "git-advanced-secret",
    title: "A token in CI",
    prompt: "A deploy step needs a token. Where does it go?",
    choices: [
      "Written in the workflow YAML",
      "In the repository's Settings → Secrets, used as `${{ secrets.NAME }}`",
      "In a comment on the pull request",
    ],
    correct: 1,
    conceptIds: ["ci-cd", "secrets-env-vars"],
    hint: "The workflow file is committed.",
    explanation:
      "Anything in the YAML is in the repository forever. Secrets stored in settings are injected at run time and hidden in logs.",
  }),
  question({
    id: "git-advanced-verified",
    title: "What Verified proves",
    prompt: "What does GitHub's Verified badge on a commit prove?",
    choices: [
      "The code has no bugs",
      "It was signed with a key on the author's account and hasn't changed since",
      "A reviewer approved it",
    ],
    correct: 1,
    conceptIds: ["git-commit"],
    hint: "Identity, not quality.",
    explanation:
      "The author name is just a setting; a signature checked against the author's known key proves who made the commit.",
  }),
];
