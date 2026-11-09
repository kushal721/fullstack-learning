import type { LevelPlan } from "@fsl/shared";
import {
  code,
  diagram,
  explain,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";
import { accessibleModule } from "./accessible.js";
import { structureModule } from "./structure.js";
import { tablesModule } from "./tables.js";

// Intermediate: steps 8–15. Meaningful structure, real forms, tables,
// accessibility and what the browser builds from HTML.
export const intermediate: LevelPlan = {
  outcome:
    "Structure a page so browsers, search engines and screen readers all understand it, with forms that check themselves.",
  steps: [
    structureModule,
    lesson(
      "form-validation",
      "Forms that check themselves",
      3,
      explain(
        'Browsers do [[form-validation]] for you: `required` stops an empty field, `type="email"` wants an email address, `maxlength` caps the length.',
      ),
      code(
        "html",
        "built-in checks",
        [
          '<input id="title" required maxlength="100">',
          '<input id="email" type="email" required>',
        ],
        {
          1: "must be filled, at most 100 letters",
          2: "must look like an email",
        },
      ),
      quickCheck(
        "The browser checks `required`. Does the server still need to check?",
        [
          "No, the browser already did",
          "Yes: anyone can send a request without the form",
          "Only for passwords",
        ],
        1,
        "Browser checks help the user; only the server's checks protect the data.",
      ),
    ),
    lesson(
      "input-types",
      "All the input types",
      4,
      explain(
        "The `type` [[attribute]] turns one `<input>` into many controls. Each of the [[input-type|input types]] gives the right keyboard on phones and its own built-in check.",
      ),
      reference("Input types", [
        ["text", "One line of any text (the default).", '<input type="text">'],
        [
          "email",
          "An email address; phones show an @ key.",
          '<input type="email">',
        ],
        ["password", "Hidden characters.", '<input type="password">'],
        [
          "number",
          "A number, with up and down arrows.",
          '<input type="number" min="1">',
        ],
        ["date", "A date, with a calendar picker.", '<input type="date">'],
        ["checkbox", "A yes/no tick.", '<input type="checkbox">'],
        [
          "radio",
          "One choice from a group.",
          '<input type="radio" name="sort">',
        ],
        ["file", "Pick a file to upload.", '<input type="file">'],
        [
          "range",
          "A slider between two values.",
          '<input type="range" max="10">',
        ],
        ["search", "A search box.", '<input type="search">'],
        ["url", "A web address.", '<input type="url">'],
        [
          "tel",
          "A phone number; phones show a number pad.",
          '<input type="tel">',
        ],
      ]),
      playground("Try the types: click and type in each", [
        '<label>Email <input type="email"></label><br>',
        '<label>Date <input type="date"></label><br>',
        '<label>Count <input type="number" min="1" max="5"></label><br>',
        '<label>Level <input type="range" max="10"></label><br>',
        '<label><input type="checkbox"> Remember me</label>',
      ]),
      quickCheck(
        "Which type makes a phone show a number pad for a phone number?",
        ['`type="text"`', '`type="tel"`', '`type="number"`'],
        1,
        "`tel` is for phone numbers: a number pad, but no arrows and no maths.",
      ),
    ),
    lesson(
      "choices",
      "Checkboxes, radio buttons and selects",
      3,
      explain(
        "For picking instead of typing, use [[choice-inputs|choice inputs]]: a checkbox for yes or no, radio buttons for one of a few, a `<select>` for one of many.",
      ),
      code(
        "html",
        "a radio group",
        [
          "<fieldset>",
          "  <legend>Sort notes by</legend>",
          '  <label><input type="radio" name="sort" value="new"> Newest</label>',
          '  <label><input type="radio" name="sort" value="title"> Title</label>',
          "</fieldset>",
        ],
        { 2: "names the group", 3: "same name: only one can be chosen" },
      ),
      keyPoints(
        "`<fieldset>` and `<legend>` group related choices.",
        "Radio buttons share a `name`; checkboxes don't have to.",
        "Every choice still needs a label.",
      ),
    ),
    tablesModule,
    accessibleModule,
    lesson(
      "the-dom",
      "From HTML to the DOM",
      3,
      explain(
        "The browser turns the HTML into a tree of objects, the [[dom]]: every element becomes a node, and [[nesting]] becomes parents and children. JavaScript and screen readers work with this tree, not the file.",
      ),
      diagram([
        ["HTML text", "the file"],
        ["DOM tree", "live objects"],
        ["Page", "drawn from the tree"],
      ]),
      quickCheck(
        "JavaScript adds an element to the page. What changes?",
        [
          "The HTML file on the server",
          "The DOM in the browser",
          "Nothing until you reload",
        ],
        1,
        "Scripts change the [[dom]]; the file on the server stays the same.",
      ),
    ),
    levelCheck("intermediate-check", "Intermediate check", [
      ["html-intermediate-main", "semantic-structure"],
      ["html-intermediate-required", "form-validation"],
      ["html-intermediate-radio", "choices"],
      ["html-intermediate-icon-button", "accessible-html"],
      ["html-intermediate-aria", "accessible-html"],
      ["html-intermediate-div-button", "accessible-html"],
    ]),
  ],
};
