import {
  anatomy,
  analogy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// SQL injection: text that becomes a command, the classic attack, gluing
// step by step, one family called injection, parameters taken apart, the
// Notes App's queries, column names that can't be parameters, lists,
// limits and searches, what else helps, mistakes, practice and a recap.
export const sqlInjectionModule = moduleLesson(
  "sql-injection",
  "SQL injection",
  40,
  [
    "Explain how text glued into SQL can change what the query does.",
    "Recognise SQL injection as one kind of injection, alongside XSS.",
    "Pass every value as a parameter, including lists, limits and search words.",
    "Choose sort columns and other names from a fixed list, since placeholders can't hold them.",
    "Say why escaping quotes by hand is not the fix.",
  ],

  part(
    "what",
    "Text that becomes a command",
    explain(
      "A SQL query is a small program. If you build it by gluing a user's text into the SQL, that text becomes part of the program. Send the right quotes and keywords, and the query does something else: it returns every user's notes, or deletes them. That is [[sql-injection|SQL injection]]. It's old, well understood and still common.",
    ),
    analogy(
      "You fill in a form letter: “Pay ___ ten pounds.” Someone writes “Bob a thousand pounds, and also”. The blank was meant for a name, not new instructions.",
    ),
    diagram([
      ["User's text", "x' OR '1'='1"],
      ["Glued into SQL", "quotes close the value"],
      ["Database", "runs a different query"],
    ]),
  ),

  part(
    "classic",
    "The classic attack",
    explain(
      "Here is a search that glues the title into the SQL. With a normal title it works. But a title is [[untrusted-input|untrusted input]], and the attacker sends one that starts with a quote. The quote ends the value early, and the rest of their text is read as SQL.",
    ),
    code(
      "js",
      "Gluing the title into the SQL (never do this)",
      [
        "const sql =",
        '  "SELECT id, title FROM notes " +',
        '  "WHERE user_id = 3 AND " +',
        '  "title = \'" + title + "\'";',
      ],
      { 4: "the user's text sits inside the SQL" },
    ),
    code(
      "sql",
      "What runs when title is x' OR '1'='1",
      [
        "SELECT id, title FROM notes",
        " WHERE user_id = 3 AND title = 'x'",
        "    OR '1'='1';",
      ],
      {
        2: "the attacker's quote closed the value",
        3: "always true: every note of every user",
      },
    ),
    quickCheck(
      "Why does the query above return other users' notes?",
      [
        "PostgreSQL ignores user_id",
        "OR '1'='1' is true for every row",
        "The title was too long",
      ],
      1,
      "AND binds tighter than OR, so the query means (user_id = 3 AND title = 'x') OR true. True for every row means every note in the table.",
    ),
  ),

  part(
    "step-by-step",
    "Gluing and parameters, step by step",
    explain(
      "Follow the same nasty title into two functions. `glued` builds one string. `param` returns the SQL and the values apart, the way `pool.query(text, values)` takes them. Watch the SQL text: in the second one it never changes, whatever the title is.",
    ),
    trace(
      "The same title, two ways",
      [
        "function glued(title) {",
        '  return "SELECT id FROM notes WHERE " +',
        '    "user_id = 3 AND title = \'" +',
        '    title + "\'";',
        "}",
        "function param(title) {",
        "  return {",
        '    text: "SELECT id FROM notes WHERE " +',
        '      "user_id = 3 AND title = $1",',
        "    values: [title],",
        "  };",
        "}",
        "const evil = \"x' OR '1'='1\";",
        "const a = glued(evil);",
        "const b = param(evil);",
      ],
      [
        {
          line: 13,
          note: "The attacker's title. It starts with a quote, which is the whole trick.",
          vars: [
            ["glued", "ƒ glued(title)"],
            ["param", "ƒ param(title)"],
            ["evil", "\"x' OR '1'='1\""],
          ],
        },
        {
          line: 2,
          note: "glued pastes the title between two quotes of its own.",
          vars: [["title", "\"x' OR '1'='1\""]],
          stack: ["glued"],
        },
        {
          line: 14,
          note: "The quote in the title closed the value early. OR '1'='1' is now SQL, not text.",
          vars: [
            ["glued", "ƒ glued(title)"],
            ["param", "ƒ param(title)"],
            ["evil", "\"x' OR '1'='1\""],
            [
              "a",
              "\"SELECT id FROM notes WHERE user_id = 3 AND title = 'x' OR '1'='1'\"",
            ],
          ],
        },
        {
          line: 8,
          note: "param never touches the SQL text. The title only goes into the values array.",
          vars: [["title", "\"x' OR '1'='1\""]],
          stack: ["param"],
        },
        {
          line: 15,
          note: "The SQL is the same as for any title. The database will look for a note titled exactly x' OR '1'='1, and find none.",
          vars: [
            ["glued", "ƒ glued(title)"],
            ["param", "ƒ param(title)"],
            ["evil", "\"x' OR '1'='1\""],
            [
              "a",
              "\"SELECT id FROM notes WHERE user_id = 3 AND title = 'x' OR '1'='1'\"",
            ],
            [
              "b",
              "{ text: \"SELECT id FROM notes WHERE user_id = 3 AND title = $1\", values: [\"x' OR '1'='1\"] }",
            ],
          ],
        },
      ],
    ),
  ),

  part(
    "injection",
    "One family: injection",
    explain(
      "SQL injection is one member of a family. An [[injection-attack|injection attack]] happens whenever data is pasted into code and runs as part of it: SQL for the database, HTML for the browser ([[xss|XSS]], the last module), or a shell command. The cure is the same idea each time: keep data and code apart, and never build code by gluing strings.",
    ),
    reference("Injection, and how to keep data apart", [
      [
        "SQL",
        "User text glued into a query.",
        "Placeholders: $1, $2 and a values array.",
      ],
      [
        "HTML (XSS)",
        "User text inserted as markup.",
        "Insert as text: {title} in JSX, textContent.",
      ],
      [
        "Shell",
        "User text in a command line.",
        "An argument list, never one command string.",
      ],
    ]),
    keyPoints(
      "Injection: data crosses into code and runs.",
      "The fix is never to clean the data; it's to keep it apart.",
      "Every language that runs text has its own injection.",
    ),
  ),

  part(
    "parameters",
    "The cure: parameters",
    explain(
      "You met [[parameterized-query|parameterized queries]] in Databases. PostgreSQL receives the SQL text and the values separately. It works out what the SQL means first; only then are the values slotted in, always as data. No value, however strange, can add an OR, end a statement or start a comment.",
    ),
    anatomy(
      "deleteNote's query, rewrapped",
      [
        "await pool.query(",
        '  "DELETE FROM notes WHERE id = $1" +',
        '  " AND user_id = $2",',
        "  [id, req.user.id]);",
      ],
      [
        [
          "pool.query(",
          "two arguments",
          "The SQL text first, the values second. They travel apart.",
        ],
        [
          "$1",
          "first hole",
          "A placeholder for a value. Its meaning is fixed before any value arrives.",
        ],
        ["$2", "second hole", "Numbered, filled in by position."],
        [
          "[id, req.user.id]",
          "the values",
          "$1 is id, $2 is the user's id. Only ever data.",
        ],
      ],
    ),
    keyPoints(
      "Every value from a request goes in the values array.",
      "The SQL text is a fixed string: no + and no ${} with user data.",
      "Quotes, semicolons and -- in a value are just characters.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's queries",
    explain(
      "Every query in the Notes App uses placeholders, and its first comment says so. The note id from the URL is checked to be a positive whole number before any query runs, and the owner always comes from `req.user.id`. Validation is a useful extra layer, but the placeholders are what make injection impossible.",
    ),
    code(
      "js",
      "updateNote, rewrapped",
      [
        "await pool.query(",
        '  "UPDATE notes SET title = $1, " +',
        '  "content = $2, updated_at = now() " +',
        '  "WHERE id = $3 AND user_id = $4",',
        "  [title.trim(), content, id,",
        "   req.user.id]);",
      ],
      {
        4: "four holes, no user text",
        5: "the values, in the same order",
      },
    ),
    inTheNotesApp(
      "notesController.js: “Values are always passed separately ($1, $2…), never glued into the SQL, so user input can never change the query.”",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "identifiers",
    "Column names can't be parameters",
    explain(
      "Placeholders hold values, never names. `ORDER BY $1` doesn't sort by a column. So when a user picks the sort order, a table or a column, you have [[dynamic-identifier|dynamic column names]], and gluing is the only way in. Make it safe: map the user's choice to a fixed list of names written in your code, and fall back to a default for anything else.",
    ),
    code(
      "js",
      "A sort choice mapped to fixed SQL",
      [
        "const SORTS = {",
        '  newest: "created_at DESC",',
        '  oldest: "created_at ASC",',
        '  title: "title ASC",',
        "};",
        "const choice = req.query.sort;",
        "const order = Object.hasOwn(SORTS, choice)",
        "  ? SORTS[choice]",
        "  : SORTS.newest;",
        'const sql = "SELECT id, title FROM notes" +',
        '  " WHERE user_id = $1 ORDER BY " + order;',
      ],
      {
        2: "only text you wrote yourself",
        7: "hasOwn: skips names like constructor",
        11: "glued, but never the user's text",
      },
    ),
    keyPoints(
      "The user picks a key; your code picks the SQL.",
      "Unknown choices get the default, not an error with SQL in it.",
      "The Notes App always sorts by created_at, so it needs none of this.",
    ),
  ),

  part(
    "values",
    "Lists, limits and searches",
    explain(
      "Some values look awkward to pass as parameters, so people glue them. Don't: they all fit. A list of ids becomes one array value with `= ANY($1)`. A page size is a value, so `LIMIT $2` works. A search keeps its `%` wildcards in the value, not in the SQL.",
    ),
    code(
      "js",
      "Three values that still go in the array",
      [
        "pool.query(",
        '  "SELECT * FROM notes WHERE id = ANY($1)",',
        "  [[3, 8, 9]]);",
        "pool.query(",
        '  "SELECT * FROM notes WHERE user_id = $1" +',
        '  " LIMIT $2", [userId, 20]);',
        "pool.query(",
        '  "SELECT * FROM notes WHERE user_id = $1" +',
        '  " AND title ILIKE $2",',
        '  [userId, "%" + word + "%"]);',
      ],
      {
        3: "one array, as one value",
        6: "a number is a value too",
        10: "the wildcards are part of the value",
      },
    ),
  ),

  part(
    "what-else",
    "Escaping is not the fix",
    explain(
      "You could try to escape quotes yourself, doubling every `'`. It's fragile: miss one query, or a number with no quotes around it like `WHERE id = 1 OR 1=1`, and you're open. Parameters leave nothing to remember. Extra layers still help when something slips: validate ids and lengths, give the app's database user only the rights it needs, and never show SQL errors to users (the next module).",
    ),
    mistake({
      title: "Escaping quotes by hand",
      wrong: [
        'const safe = title.replaceAll("\'", "\'\'");',
        'pool.query("... WHERE title = \'" +',
        '  safe + "\'");',
      ],
      problem:
        "It works for this query, until someone forgets it in another, or the value isn't in quotes at all.",
      right: ['pool.query("... WHERE title = $1",', "  [title]);"],
      why: "With a placeholder there's nothing to escape and nothing to forget. The driver keeps the value apart.",
    }),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A template literal with an id",
      wrong: [
        "pool.query(`SELECT * FROM notes",
        "  WHERE id = ${req.params.id}`);",
      ],
      problem:
        "req.params.id is text. /api/notes/1 OR 1=1 sends SQL, and the query returns every note.",
      right: [
        "pool.query(",
        '  "SELECT * FROM notes WHERE id = $1",',
        "  [req.params.id]);",
      ],
      why: "“It's only a number” isn't true until you've checked it. A placeholder is safe either way.",
    }),
    mistake({
      title: "A placeholder for a column",
      wrong: [
        'pool.query("SELECT * FROM notes" +',
        '  " ORDER BY $1", [req.query.sort]);',
      ],
      problem:
        "A placeholder is a value, not a column name, so the rows aren't sorted by that column (or the query fails).",
      right: [
        "const order = pickSort(sort);",
        'pool.query("SELECT * FROM notes" +',
        '  " ORDER BY " + order);',
      ],
      why: "pickSort maps the key to a fixed list in your code, as above. Only the key is chosen by the user.",
    }),
    mistake({
      title: "Trusting a value from your own front end",
      wrong: [
        "// the dropdown only offers 3 options",
        'const sql = "... ORDER BY " +',
        "  req.query.sort;",
      ],
      problem:
        "Anyone can send any query string with curl. The dropdown limits nothing.",
      right: [
        "const order = Object.hasOwn(SORTS, sort)",
        "  ? SORTS[sort] : SORTS.newest;",
      ],
      why: "Every request is untrusted, whatever the page offered. Map it on the server.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A safe search",
      task: 'Write `searchQuery(userId, word)` returning `{ text, values }`. `text` is exactly `"SELECT id, title FROM notes WHERE user_id = $1 AND title ILIKE $2"`. `values` is `[userId, "%" + word + "%"]`. The word must never appear in `text`.',
      starter: [
        "function searchQuery(userId, word) {",
        "  return {",
        '    text: "SELECT id, title FROM notes " +',
        '      "WHERE user_id = " + userId +',
        '      " AND title ILIKE \'%" + word + "%\'",',
        "    values: [],",
        "  };",
        "}",
      ],
      tests: [
        [
          'searchQuery(3, "milk")',
          '{ text: "SELECT id, title FROM notes WHERE user_id = $1 AND title ILIKE $2", values: [3, "%milk%"] }',
        ],
        [
          'searchQuery(3, "\' OR 1=1 --").text',
          '"SELECT id, title FROM notes WHERE user_id = $1 AND title ILIKE $2"',
        ],
        ['searchQuery(5, "\' OR 1=1 --").values', '[5, "%\' OR 1=1 --%"]'],
      ],
      hint: "Write the text as one fixed string with $1 and $2. Put userId and the wrapped word in the values array.",
      solution: [
        "function searchQuery(userId, word) {",
        "  return {",
        '    text: "SELECT id, title FROM notes " +',
        '      "WHERE user_id = $1 AND title ILIKE $2",',
        '    values: [userId, "%" + word + "%"],',
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Sort from a fixed list",
      task: 'Write `orderBy(choice)`. `"newest"` gives `"created_at DESC"`, `"oldest"` gives `"created_at ASC"`, `"title"` gives `"title ASC"`. Anything else, including missing values and names like `"constructor"`, gives `"created_at DESC"`.',
      starter: [
        "function orderBy(choice) {",
        '  return choice || "created_at DESC";',
        "}",
      ],
      tests: [
        ['orderBy("oldest")', '"created_at ASC"'],
        ['orderBy("title")', '"title ASC"'],
        ['orderBy("title; DROP TABLE notes")', '"created_at DESC"'],
        ["orderBy(undefined)", '"created_at DESC"'],
        ['orderBy("constructor")', '"created_at DESC"'],
      ],
      hint: "Put the three choices in an object, then use `Object.hasOwn(SORTS, choice)` to decide between `SORTS[choice]` and the default.",
      solution: [
        "const SORTS = {",
        '  newest: "created_at DESC",',
        '  oldest: "created_at ASC",',
        '  title: "title ASC",',
        "};",
        "function orderBy(choice) {",
        "  return Object.hasOwn(SORTS, choice)",
        "    ? SORTS[choice]",
        "    : SORTS.newest;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("SQL injection cheat sheet", [
      [
        "SQL injection",
        "User text glued into SQL changes the query.",
        "title = 'x' OR '1'='1'",
      ],
      [
        "Injection",
        "Data pasted into code runs as code.",
        "SQL, HTML (XSS), shell commands",
      ],
      [
        "Parameters",
        "SQL text and values travel apart.",
        'pool.query("... id = $1", [id])',
      ],
      [
        "Fixed SQL text",
        "No + or ${} with request data in the SQL.",
        '"WHERE user_id = $1"',
      ],
      ["Lists", "One array value with ANY.", "WHERE id = ANY($1), [[3, 8]]"],
      ["Limits", "A number is a value.", "LIMIT $2, [userId, 20]"],
      ["Search", "Wildcards go in the value.", '"%" + word + "%"'],
      [
        "Column names",
        "Map the choice to a fixed list in code.",
        "hasOwn(SORTS, c) ? SORTS[c] : …",
      ],
      [
        "Escaping by hand",
        "Fragile: one forgotten spot is enough.",
        "use $1 instead",
      ],
    ]),
    quickCheck(
      "A user picks how to sort their notes. Which code is safe?",
      [
        '"ORDER BY " + req.query.sort',
        '"ORDER BY $1" with [req.query.sort]',
        '"ORDER BY " + SORTS[sort] from a fixed list',
      ],
      2,
      "Placeholders can't hold column names, so the name must be glued in. That's only safe when it comes from a list you wrote, with the user choosing just the key.",
    ),
  ),
);
