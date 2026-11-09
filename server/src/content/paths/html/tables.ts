import {
  anatomy,
  code,
  explain,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  playground,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Tables in depth: when a table is right, its parts (anatomy), building
// one, header cells and scope, the caption, row groups, cells that span,
// a step-through of how a screen reader reads a cell, styling, small
// screens, mistakes, practice and a recap.
export const tablesModule = moduleLesson(
  "tables",
  "Tables, for data",
  40,
  [
    "Tell when content is a table (data in rows and columns) and when it isn't.",
    "Build a table from `<table>`, `<tr>`, `<th>` and `<td>`, with a `<caption>`.",
    "Use `scope` so every data cell is linked to its headers.",
    "Group rows with `<thead>`, `<tbody>` and `<tfoot>`, and span cells with `colspan` and `rowspan`.",
    "Keep a wide table usable on a phone.",
  ],

  part(
    "why",
    "Tables are for data",
    explain(
      "A [[html-table|table]] is for information that really has rows and columns, where each value means something because of **both** its row and its column: a timetable, prices by size, notes per day. A screen reader can then say “Tuesday, Work: 5”. Tables used to be used for page layout, but that breaks on phones and confuses screen readers: layout is CSS's job.",
    ),
    quickCheck(
      "When should you use a table?",
      [
        "To place things side by side on the page",
        "For data that has rows and columns",
        "Never",
      ],
      1,
      "Tables are for data; layout is CSS's job.",
    ),
  ),

  part(
    "parts",
    "The parts of a table",
    anatomy(
      "A table, row by row",
      [
        "<table>",
        '  <tr><th scope="col">Note</th><th scope="col">Edited</th></tr>',
        "  <tr><td>Shopping</td><td>Today</td></tr>",
        "</table>",
      ],
      [
        ["<table>", "the table", "Holds everything; rows go inside it."],
        ["<tr>", "a table row", "One row, left to right. Cells go inside it."],
        [
          '<th scope="col">',
          "a header cell",
          "Names a column (or a row). Bold and centred by default.",
        ],
        ["<td>", "a data cell", "One value."],
      ],
    ),
    keyPoints(
      "A table is a list of rows; each row is a list of cells.",
      "Every row should have the same number of cells (or spans that add up).",
      "Only `<tr>`s (or row groups) go inside `<table>`; only cells go inside `<tr>`.",
    ),
  ),

  part(
    "build",
    "Build a table",
    explain(
      "Edit the table below: add a row for another note, or a third column. Notice there's no grid drawn: tables have no borders until CSS adds them, which the `<style>` here does.",
    ),
    playground("A table of notes", [
      "<style>",
      "  table { border-collapse: collapse; }",
      "  th, td { border: 1px solid #999; padding: 4px 8px; }",
      "</style>",
      "<table>",
      "  <caption>Your notes</caption>",
      "  <tr>",
      '    <th scope="col">Note</th>',
      '    <th scope="col">Edited</th>',
      "  </tr>",
      "  <tr><td>Shopping</td><td>Today</td></tr>",
      "  <tr><td>Call the bank</td><td>Monday</td></tr>",
      "</table>",
    ]),
  ),

  part(
    "headers-and-scope",
    "Header cells and scope",
    explain(
      'A `<th>` is a header: it names the cells in its column or its row. `scope` says which. Headers along the top get `scope="col"`; headers down the left side get `scope="row"`. That link is what lets a screen reader read out the right headers with each value. Making a `<td>` bold doesn\'t do it.',
    ),
    reference("Kinds of header", [
      [
        '<th scope="col">',
        "Heads the cells below it.",
        '<th scope="col">Price</th>',
      ],
      [
        '<th scope="row">',
        "Heads the cells to its right.",
        '<th scope="row">Small</th>',
      ],
      [
        '<th scope="colgroup">',
        "Heads a group of columns.",
        "used with colspan",
      ],
      ["<td>", "Data: never a header, however it looks.", "<td>₹120</td>"],
    ]),
  ),

  part(
    "caption",
    "A caption: the table's name",
    explain(
      "`<caption>` is the table's title. It goes first, right after `<table>`. It's shown above the table, and screen readers announce it when someone reaches the table, so they know what it is before hearing a single cell. A heading just before the table isn't linked to it in the same way.",
    ),
    code(
      "html",
      "a table with a caption",
      [
        "<table>",
        "  <caption>Coffee prices</caption>",
        '  <tr><th scope="col">Size</th><th scope="col">Price</th></tr>',
        '  <tr><th scope="row">Small</th><td>₹120</td></tr>',
        '  <tr><th scope="row">Large</th><td>₹180</td></tr>',
        "</table>",
      ],
      {
        2: "first inside the table",
        4: "a row header: names this row",
      },
    ),
  ),

  part(
    "row-groups",
    "Head, body and foot",
    explain(
      "Bigger tables group their rows. `<thead>` holds the header rows, `<tbody>` the data and `<tfoot>` totals or notes at the bottom. They help CSS (style the head differently, scroll the body) and printing (the head repeats on every page). If you leave `<tbody>` out, the browser adds one for you, so a selector like `table > tr` never matches.",
    ),
    code(
      "html",
      "rows in groups",
      [
        "<table>",
        "  <caption>Notes this week</caption>",
        '  <thead><tr><th scope="col">Day</th><th scope="col">Notes</th></tr></thead>',
        "  <tbody>",
        '    <tr><th scope="row">Mon</th><td>3</td></tr>',
        '    <tr><th scope="row">Tue</th><td>5</td></tr>',
        "  </tbody>",
        '  <tfoot><tr><th scope="row">Total</th><td>8</td></tr></tfoot>',
        "</table>",
      ],
      { 3: "the header row", 4: "the data", 8: "the total" },
    ),
  ),

  part(
    "spanning",
    "Cells that span",
    explain(
      "A cell can stretch across several columns with `colspan`, or down several rows with `rowspan`. The row then needs fewer cells, because the wide one fills their place. Count carefully: every row must still add up to the same width. Spans are useful in moderation; a table full of them is hard to read for everyone.",
    ),
    playground("A cell across two columns", [
      "<style>",
      "  table { border-collapse: collapse; }",
      "  th, td { border: 1px solid #999; padding: 4px 8px; }",
      "</style>",
      "<table>",
      "  <tr>",
      "    <td></td>",
      '    <th scope="colgroup" colspan="2">Monday</th>',
      "  </tr>",
      "  <tr>",
      "    <td></td>",
      '    <th scope="col">Morning</th>',
      '    <th scope="col">Afternoon</th>',
      "  </tr>",
      "  <tr>",
      '    <th scope="row">Sam</th>',
      '    <td colspan="2">Away all day</td>',
      "  </tr>",
      "</table>",
    ]),
    quickCheck(
      'A row in a 3-column table has a cell with `colspan="2"`. How many more cells does that row need?',
      ["None", "One", "Two"],
      1,
      "The wide cell fills two columns, so one more cell makes three.",
    ),
  ),

  part(
    "how-a-screen-reader-reads",
    "How a screen reader reads a table",
    explain(
      "Someone using a screen reader moves through a table cell by cell with the arrow keys. Each time, it reads the value and the headers that changed. Step through it on this table:",
    ),
    trace(
      "Moving through cells, move by move",
      [
        "<table>",
        "  <caption>Notes per day</caption>",
        '  <tr><td></td><th scope="col">Mon</th><th scope="col">Tue</th></tr>',
        '  <tr><th scope="row">Work</th><td>3</td><td>5</td></tr>',
        '  <tr><th scope="row">Home</th><td>1</td><td>2</td></tr>',
        "</table>",
      ],
      [
        {
          line: 2,
          note: "Reaching the table, it reads the caption and the table's size first.",
          vars: [["hears", "Notes per day, table, 3 rows, 3 columns"]],
          output: "Notes per day, table, 3 rows, 3 columns",
        },
        {
          line: 4,
          note: "Into the first data cell. Both its headers are new, so it reads the row header, the column header, then the value.",
          vars: [
            ["cell", "Work, Mon"],
            ["hears", "Work, Mon, 3"],
          ],
          output: "Work, Mon, 3",
        },
        {
          line: 4,
          note: "Right arrow: still the Work row, so only the new column header is read.",
          vars: [
            ["cell", "Work, Tue"],
            ["hears", "Tue, 5"],
          ],
          output: "Tue, 5",
        },
        {
          line: 5,
          note: "Down arrow: still the Tue column, so only the new row header is read.",
          vars: [
            ["cell", "Home, Tue"],
            ["hears", "Home, 2"],
          ],
          output: "Home, 2",
        },
        {
          line: 5,
          note: "With `<td>`s instead of `<th>`s, every cell would be just a number: “2”. Two of what? The headers are what make it data.",
          vars: [
            ["cell", "Home, Tue"],
            ["without th", "2"],
          ],
          output: "2",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "small-screens",
    "Styling, and tables on a phone",
    explain(
      'Tables start plain, so CSS adds borders (`border-collapse: collapse` joins them), padding and `text-align: right` for numbers. A table wider than a phone should scroll sideways in its own box, not the whole page. Give that box a name and `tabindex="0"` so keyboard users can scroll it too.',
    ),
    code(
      "html",
      "a table that scrolls on its own",
      [
        '<div class="table-scroll" role="region" aria-label="Prices" tabindex="0">',
        "  <table>…</table>",
        "</div>",
        "<style>",
        "  .table-scroll { overflow-x: auto; }",
        "  td.number { text-align: right; }",
        "</style>",
      ],
      {
        1: "a named, focusable box",
        5: "only this box scrolls sideways",
        6: "numbers line up on the right",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A table for layout",
      language: "html",
      wrong: [
        "<table><tr>",
        "  <td><nav>…</nav></td>",
        "  <td><main>…</main></td>",
        "</tr></table>",
      ],
      problem:
        "Screen readers announce a table that isn't data, and on a phone the two columns can't stack.",
      right: [
        '<div class="layout">',
        "  <nav>…</nav>",
        "  <main>…</main>",
        "</div>",
      ],
      why: "Lay out with CSS (flexbox or grid); keep tables for data.",
    }),
    mistake({
      title: "Bold cells instead of headers",
      language: "html",
      wrong: ["<tr><td><b>Size</b></td><td><b>Price</b></td></tr>"],
      problem:
        "It looks like a header row, but it's data: the values below aren't linked to “Size” and “Price”.",
      right: ['<tr><th scope="col">Size</th><th scope="col">Price</th></tr>'],
      why: "Use `<th>` with `scope`; CSS can style it however you like.",
    }),
    mistake({
      title: "A heading instead of a caption",
      language: "html",
      wrong: ["<h3>Coffee prices</h3>", "<table>…</table>"],
      problem:
        "The heading isn't part of the table, so someone who jumps straight to the table doesn't hear what it's about.",
      right: [
        "<table>",
        "  <caption>Coffee prices</caption>",
        "  …",
        "</table>",
      ],
      why: "Name the table with its own `<caption>`.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Headers and a caption",
      task: 'The first row is a header row made of `<td>`s. Make them `<th scope="col">`s, and give the table the caption `Coffee prices`.',
      starter: [
        "<table>",
        "  <tr><td>Size</td><td>Price</td></tr>",
        "  <tr><td>Small</td><td>₹120</td></tr>",
        "  <tr><td>Large</td><td>₹180</td></tr>",
        "</table>",
      ],
      checks: [
        {
          kind: "text",
          label: "The caption",
          selector: "table caption",
          text: "Coffee prices",
        },
        {
          kind: "count",
          label: "Two column headers",
          selector: 'th[scope="col"]',
          count: 2,
        },
        {
          kind: "text",
          label: "The first header is Size",
          selector: 'th[scope="col"]',
          text: "Size",
        },
        {
          kind: "count",
          label: "The four values stay data",
          selector: "td",
          count: 4,
        },
      ],
      hint: 'Put `<caption>Coffee prices</caption>` first in the table, then change the first row to `<th scope="col">Size</th><th scope="col">Price</th>`.',
      solution: [
        "<table>",
        "  <caption>Coffee prices</caption>",
        '  <tr><th scope="col">Size</th><th scope="col">Price</th></tr>',
        "  <tr><td>Small</td><td>₹120</td></tr>",
        "  <tr><td>Large</td><td>₹180</td></tr>",
        "</table>",
      ],
    }),
    pageYourTurn({
      title: "Head, body and foot",
      task: "Put the header row in a `<thead>`, the two days in a `<tbody>` and the total in a `<tfoot>`.",
      starter: [
        "<table>",
        '  <tr><th scope="col">Day</th><th scope="col">Notes</th></tr>',
        "  <tr><td>Mon</td><td>3</td></tr>",
        "  <tr><td>Tue</td><td>5</td></tr>",
        "  <tr><td>Total</td><td>8</td></tr>",
        "</table>",
      ],
      checks: [
        {
          kind: "count",
          label: "The headers in thead",
          selector: "thead th",
          count: 2,
        },
        {
          kind: "count",
          label: "Two days in tbody",
          selector: "tbody tr",
          count: 2,
        },
        {
          kind: "text",
          label: "The total in tfoot",
          selector: "tfoot td",
          text: "Total",
        },
      ],
      hint: "Wrap the first row in `<thead>…</thead>`, the next two in `<tbody>…</tbody>` and the last in `<tfoot>…</tfoot>`.",
      solution: [
        "<table>",
        '  <thead><tr><th scope="col">Day</th><th scope="col">Notes</th></tr></thead>',
        "  <tbody>",
        "    <tr><td>Mon</td><td>3</td></tr>",
        "    <tr><td>Tue</td><td>5</td></tr>",
        "  </tbody>",
        "  <tfoot><tr><td>Total</td><td>8</td></tr></tfoot>",
        "</table>",
      ],
    }),
    pageYourTurn({
      title: "A cell that spans",
      task: 'Sam is away all day. Replace Sam\'s two cells with one cell, `Away all day`, that spans both columns with `colspan="2"`.',
      starter: [
        "<table>",
        '  <tr><td></td><th scope="col">Morning</th><th scope="col">Afternoon</th></tr>',
        '  <tr><th scope="row">Ana</th><td>Office</td><td>Home</td></tr>',
        '  <tr><th scope="row">Sam</th><td>Away</td><td>Away</td></tr>',
        "</table>",
      ],
      checks: [
        {
          kind: "text",
          label: "One wide cell for Sam",
          selector: 'td[colspan="2"]',
          text: "Away all day",
        },
        {
          kind: "count",
          label: "No other cells left for Sam",
          selector: "td:not([colspan])",
          count: 3,
        },
      ],
      hint: 'Sam\'s row becomes `<th scope="row">Sam</th><td colspan="2">Away all day</td>`.',
      solution: [
        "<table>",
        '  <tr><td></td><th scope="col">Morning</th><th scope="col">Afternoon</th></tr>',
        '  <tr><th scope="row">Ana</th><td>Office</td><td>Home</td></tr>',
        '  <tr><th scope="row">Sam</th><td colspan="2">Away all day</td></tr>',
        "</table>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Tables cheat sheet", [
      ["<table>", "Data with rows and columns; not layout.", "a timetable"],
      ["<tr>", "A row of cells.", "<tr><td>…</td></tr>"],
      [
        "<th scope>",
        "A header: col for a column, row for a row.",
        '<th scope="col">Price</th>',
      ],
      ["<td>", "A data cell.", "<td>₹120</td>"],
      [
        "<caption>",
        "The table's name; first inside.",
        "<caption>Coffee prices</caption>",
      ],
      [
        "<thead> <tbody> <tfoot>",
        "Header rows, data, totals.",
        "<tfoot><tr>…</tr></tfoot>",
      ],
      [
        "colspan / rowspan",
        "A cell across columns / rows.",
        '<td colspan="2">',
      ],
      ["scrolling box", "Wide tables on a phone.", "overflow-x: auto"],
    ]),
    quickCheck(
      "A screen reader user hears only “5” in a table cell, with no headers. What's most likely wrong?",
      [
        "The table has no borders",
        "The headers are bold `<td>`s, not `<th>`s",
        "The table has no `<tfoot>`",
      ],
      1,
      "Only real `<th>` headers (with `scope`) are read out with each value.",
    ),
  ),
);
