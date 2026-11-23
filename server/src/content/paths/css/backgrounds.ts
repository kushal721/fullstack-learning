import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
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

// A small tile for background examples: a blue dot on a 24px square.
const DOT =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='4' fill='%231d4ed8'/%3E%3C/svg%3E\")";
// A wide "photo": a sky over hills, drawn in SVG so it needs no download.
const PHOTO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 300'%3E%3Crect width='600' height='300' fill='%2393c5fd'/%3E%3Ccircle cx='470' cy='80' r='40' fill='%23fcd34d'/%3E%3Cpath d='M0 220 Q150 140 300 220 T600 200 V300 H0Z' fill='%2316a34a'/%3E%3C/svg%3E\")";

// Backgrounds and decoration: background colour and image, size, repeat and
// position, the shorthand, linear gradients and their stops step by step,
// radial and conic gradients, layers, box shadows, inset and text shadows,
// corners and shapes, the Notes App's flat style, mistakes, practice and a
// recap.
export const backgroundsModule = moduleLesson(
  "backgrounds",
  "Backgrounds and decoration",
  40,
  [
    "Put an image behind a box, and control its size, repeat and position.",
    "Write linear, radial and conic gradients, with colour stops where you want them.",
    "Layer several backgrounds, such as a dark overlay that keeps text readable.",
    "Add depth with `box-shadow` and `text-shadow`, and shape boxes with `border-radius`.",
    "Decorate without hurting contrast or hiding content.",
  ],

  part(
    "background-image",
    "Backgrounds: colour and image",
    explain(
      "`background-color` fills the box behind its content and padding. `background-image` draws a picture on top of that colour, from a `url()` or a gradient. By default the image is shown at its own size and **repeats** to tile the whole box, which suits small patterns. A `url()` in a stylesheet is relative to the CSS file, not the page.",
    ),
    playground("A tiled pattern over a colour", [
      "<style>",
      "  .pattern {",
      "    height: 120px;",
      "    background-color: #eef3ff;",
      `    background-image: ${DOT};`,
      "  }",
      "</style>",
      '<div class="pattern"></div>',
    ]),
    quickCheck(
      "You set `background-image` to a 24px tile on a 300px box and nothing else. What do you see?",
      [
        "One 24px tile in the top-left corner",
        "The tile stretched to 300px",
        "The tile repeated across the whole box",
      ],
      2,
      "`background-repeat` is `repeat` by default, so a small image tiles the box. `no-repeat` shows it once.",
    ),
  ),

  part(
    "size-repeat-position",
    "Size, repeat and position",
    explain(
      "Three properties decide how an image fills its box. `background-size: cover` scales it to cover the whole box, cropping what doesn't fit; `contain` shows all of it, leaving gaps. `background-repeat: no-repeat` stops the tiling. `background-position` says which part stays in view when it's cropped: `center` keeps the middle.",
    ),
    reference("Placing a background image", [
      [
        "background-size: cover",
        "Fill the box; crop the rest.",
        "background-size: cover;",
      ],
      [
        "background-size: contain",
        "Show it all; may leave gaps.",
        "background-size: contain;",
      ],
      ["background-size", "Or an exact size.", "background-size: 40px 40px;"],
      [
        "background-repeat",
        "repeat, no-repeat, repeat-x, repeat-y.",
        "background-repeat: no-repeat;",
      ],
      [
        "background-position",
        "Where it sits; top left by default.",
        "background-position: center;",
      ],
      [
        "background-attachment",
        "fixed stays put while the page scrolls.",
        "background-attachment: fixed;",
      ],
    ]),
    playground("cover versus contain", [
      "<style>",
      "  .box { height: 110px; margin-bottom: 8px; border: 1px solid #d0d7de;",
      `    background-image: ${PHOTO};`,
      "    background-repeat: no-repeat; background-position: center; }",
      "  .cover { background-size: cover; }",
      "  .contain { background-size: contain; background-color: #f6f8fa; }",
      "</style>",
      '<div class="box cover"></div>',
      '<div class="box contain"></div>',
    ]),
    quickCheck(
      "A hero banner must be filled edge to edge whatever the screen shape. Which size?",
      ["`contain`", "`cover`", "`auto`"],
      1,
      "`cover` always fills the box, cropping the edges if the shapes differ. `contain` keeps the whole image and can leave bands of background colour.",
    ),
  ),

  part(
    "shorthand",
    "The background shorthand",
    explain(
      "`background` sets every background property in one go: colour, image, position, size and repeat. The size goes after the position, separated by a `/`. Like every shorthand, it resets whatever you leave out, so a `background` rule after a `background-size` rule undoes that size.",
    ),
    code(
      "css",
      "one shorthand, five properties",
      [
        ".hero {",
        "  background: #1d4ed8 url(hills.jpg) center / cover no-repeat;",
        "}",
        "",
        "/* the same, written out */",
        ".hero {",
        "  background-color: #1d4ed8;",
        "  background-image: url(hills.jpg);",
        "  background-position: center;",
        "  background-size: cover;",
        "  background-repeat: no-repeat;",
        "}",
      ],
      {
        2: "colour, image, position / size, repeat",
        7: "shows while the image loads, or if it fails",
        9: "the size can only follow a position, after a /",
      },
    ),
    keyPoints(
      "`background: white` is a quick way to set just a colour.",
      "Always include a colour, so text is readable before the image arrives.",
      "Put any `background-size` rule after the shorthand, not before.",
    ),
  ),

  part(
    "gradients",
    "Linear gradients",
    explain(
      "A [[css-gradient|gradient]] is an image the browser draws from colours, so it goes in `background-image` (or `background`), never `background-color`. `linear-gradient()` blends along a line: top to bottom by default, or `to right`, or an angle like `45deg`. Gradients scale to any box size and cost no download.",
    ),
    playground("Directions and hard stops", [
      "<style>",
      "  div { height: 48px; margin-bottom: 8px; border-radius: 6px; }",
      "  .down { background: linear-gradient(#1d4ed8, #60a5fa); }",
      "  .right { background: linear-gradient(to right, #1d4ed8, #60a5fa); }",
      "  .angle { background: linear-gradient(45deg, crimson, gold); }",
      "  .stripes { background: linear-gradient(to right, #1d4ed8 50%, gold 50%); }",
      "</style>",
      '<div class="down"></div>',
      '<div class="right"></div>',
      '<div class="angle"></div>',
      '<div class="stripes"></div>',
    ]),
    quickCheck(
      "Why does `background-color: linear-gradient(white, blue)` do nothing?",
      [
        "Gradients need three colours",
        "A gradient is an image, not a colour",
        "It needs a direction first",
      ],
      1,
      "Gradients are images, so they go in `background-image` or the `background` shorthand. The direction is optional; top to bottom is the default.",
    ),
  ),

  part(
    "gradient-stops",
    "Where the colours go, move by move",
    explain(
      "Each colour in a gradient is a **colour stop**, with an optional position. Stops without a position are spread out evenly between their neighbours; the first defaults to 0% and the last to 100%. Step through how the browser places the stops on a 400px-wide box:",
    ),
    trace(
      "Placing the stops",
      [
        "<style>",
        "  .bar {",
        "    width: 400px; height: 40px;",
        "    background: linear-gradient(",
        "      to right,",
        "      #1d4ed8,",
        "      gold 30%,",
        "      white",
        "    );",
        "  }",
        "</style>",
        '<div class="bar"></div>',
      ],
      [
        {
          line: 5,
          note: "`to right`: the gradient line runs from the left edge (0%) to the right edge (100%), 400px long.",
          vars: [["line", "0px → 400px"]],
        },
        {
          line: 6,
          note: "The first stop has no position, so it's placed at 0%.",
          vars: [
            ["line", "0px → 400px"],
            ["#1d4ed8", "0% = 0px"],
          ],
        },
        {
          line: 7,
          note: "Gold says where it goes: 30% of 400px. Between 0 and 120px the blue blends into gold.",
          vars: [
            ["#1d4ed8", "0% = 0px"],
            ["gold", "30% = 120px"],
          ],
        },
        {
          line: 8,
          note: "The last stop has no position, so it goes at 100%. From 120px to 400px gold blends into white.",
          vars: [
            ["#1d4ed8", "0% = 0px"],
            ["gold", "30% = 120px"],
            ["white", "100% = 400px"],
          ],
        },
        {
          line: 7,
          note: "Write `gold 30% 60%` instead and gold is solid from 120px to 240px. Two stops at the same place make a hard line, with no blend.",
          vars: [
            ["#1d4ed8", "0px"],
            ["gold", "120px to 240px"],
            ["white", "400px"],
          ],
          output: "blue → gold by 120px → white by 400px",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "`linear-gradient(red, yellow, green)` with no positions: where is the yellow?",
      ["At 33%", "At 50%", "At 0%"],
      1,
      "The first stop goes at 0% and the last at 100%, and the stops without positions are spread evenly between them, so yellow lands at 50%.",
    ),
  ),

  part(
    "radial-conic",
    "Radial and conic gradients",
    explain(
      "`radial-gradient()` spreads out from a point, like light from a lamp: the first colour is in the middle. `conic-gradient()` sweeps round a centre, like the hands of a clock, which makes pie charts easy. A stop's position of `0` means “start right where the last colour ended”, giving hard edges.",
    ),
    reference("Gradient functions", [
      [
        "linear-gradient()",
        "Along a line.",
        "linear-gradient(to right, #1d4ed8, gold)",
      ],
      [
        "radial-gradient()",
        "Out from a point.",
        "radial-gradient(circle, white, #1d4ed8)",
      ],
      [
        "conic-gradient()",
        "Round a centre.",
        "conic-gradient(#1d4ed8 0 25%, gold 0)",
      ],
      [
        "repeating-linear-gradient()",
        "Repeats its stops: stripes.",
        "repeating-linear-gradient(45deg, #eee 0 10px, #fff 0 20px)",
      ],
    ]),
    playground("A spotlight, a pie chart and stripes", [
      "<style>",
      "  div { display: inline-block; width: 110px; height: 110px; margin: 4px; }",
      "  .spot { background: radial-gradient(circle, white, #1d4ed8); }",
      "  .pie { border-radius: 50%;",
      "    background: conic-gradient(#1d4ed8 0 25%, gold 0 60%, crimson 0); }",
      "  .stripes { background: repeating-linear-gradient(45deg, #eee 0 10px, #fff 0 20px); }",
      "</style>",
      '<div class="spot"></div>',
      '<div class="pie"></div>',
      '<div class="stripes"></div>',
    ]),
  ),

  part(
    "layers",
    "Layering backgrounds",
    explain(
      "`background-image` takes a comma-separated list, and the **first** image is drawn on top. The classic use: white text on a photo is hard to read where the photo is light, so put a see-through dark gradient over it. The `background-color` always sits underneath every image.",
    ),
    playground("A dark overlay keeps the text readable", [
      "<style>",
      "  .hero { padding: 40px 16px; color: white; font: 700 1.5rem system-ui, sans-serif;",
      "    background-color: #1e3a8a;",
      "    background-size: cover; background-position: center; }",
      `  .plain { background-image: ${PHOTO}; }`,
      "  .overlay { background-image:",
      "      linear-gradient(rgb(0 0 0 / 55%), rgb(0 0 0 / 55%)),",
      `      ${PHOTO}; }`,
      "</style>",
      '<div class="hero plain">Hard to read</div>',
      '<div class="hero overlay">Easy to read</div>',
    ]),
    quickCheck(
      "`background-image: url(dots.svg), url(photo.jpg)`. Which is drawn on top?",
      ["`dots.svg`", "`photo.jpg`", "Whichever loads last"],
      0,
      "The first layer in the list is the top one, nearest to you. The background colour is under them all.",
    ),
  ),

  part(
    "box-shadow",
    "Box shadows",
    explain(
      "[[box-shadow|`box-shadow`]] draws a shadow behind the box, which makes it look raised off the page. It follows the box's rounded corners and takes up **no space**, so it never moves anything. Soft, low-contrast shadows look natural; the bigger the offset and blur, the higher the box seems to float.",
    ),
    anatomy(
      "One box shadow",
      ["box-shadow:", "  0 4px 12px 0", "  rgb(0 0 0 / 15%);"],
      [
        [
          "0",
          "x offset",
          "Right (positive) or left (negative). 0 is straight below.",
        ],
        [
          "4px",
          "y offset",
          "Down (positive) or up. Light from above casts shadows down.",
        ],
        ["12px", "blur", "How soft the edge is. 0 is a sharp copy of the box."],
        [
          "0",
          "spread",
          "Optional. Grows (or shrinks, if negative) the shadow before blurring.",
        ],
        [
          "rgb(0 0 0 / 15%)",
          "colour",
          "Black at low alpha looks like a real shadow.",
        ],
      ],
    ),
    playground("Three heights", [
      "<style>",
      "  body { background: #f6f8fa; font-family: system-ui, sans-serif; }",
      "  .card { background: white; border-radius: 8px; padding: 16px; margin: 16px 8px; }",
      "  .low { box-shadow: 0 1px 2px rgb(0 0 0 / 12%); }",
      "  .mid { box-shadow: 0 4px 12px rgb(0 0 0 / 15%); }",
      "  .high { box-shadow: 0 12px 32px rgb(0 0 0 / 20%); }",
      "</style>",
      '<div class="card low">Resting on the page</div>',
      '<div class="card mid">A raised card</div>',
      '<div class="card high">A dialog floating above</div>',
    ]),
  ),

  part(
    "more-shadows",
    "Inset, layered and text shadows",
    explain(
      "Add `inset` and the shadow is drawn inside the box, as if it were pressed in. Several shadows, separated by commas, are drawn first-on-top, and a tight one under a soft one looks more real than either alone. `text-shadow` works on the letters: x, y, blur and colour, with no spread.",
    ),
    reference("More shadows", [
      [
        "inset",
        "Inside the box: pressed in.",
        "box-shadow: inset 0 2px 4px rgb(0 0 0 / 20%);",
      ],
      [
        "several",
        "Comma-separated, first on top.",
        "box-shadow: 0 1px 2px #0002, 0 8px 24px #0001;",
      ],
      [
        "a solid ring",
        "No blur, some spread.",
        "box-shadow: 0 0 0 3px #93c5fd;",
      ],
      [
        "text-shadow",
        "On the letters: x, y, blur, colour.",
        "text-shadow: 0 1px 2px rgb(0 0 0 / 60%);",
      ],
      [
        "drop-shadow()",
        "Follows a transparent image's shape.",
        "filter: drop-shadow(0 2px 4px #0004);",
      ],
    ]),
    playground("Pressed, layered and on text", [
      "<style>",
      "  div { padding: 12px; margin: 12px 8px; border-radius: 8px; background: white; }",
      "  .inset { background: #f6f8fa; box-shadow: inset 0 2px 4px rgb(0 0 0 / 20%); }",
      "  .layered { box-shadow: 0 1px 2px rgb(0 0 0 / 15%), 0 8px 24px rgb(0 0 0 / 10%); }",
      "  .ring { box-shadow: 0 0 0 3px #93c5fd; }",
      "  .text { background: #60a5fa; color: white; font: 700 1.5rem system-ui;",
      "    text-shadow: 0 1px 3px rgb(0 0 0 / 50%); }",
      "</style>",
      '<div class="inset">Pressed in</div>',
      '<div class="layered">Two shadows</div>',
      '<div class="ring">A ring, no blur</div>',
      '<div class="text">White on light blue</div>',
    ]),
    quickCheck(
      "Which shadow draws a crisp 3px ring around a box, like a focus ring?",
      [
        "`box-shadow: 0 0 3px blue`",
        "`box-shadow: 0 0 0 3px blue`",
        "`box-shadow: 3px 3px blue`",
      ],
      1,
      "Zero offsets and zero blur with a 3px spread give a solid ring. The first is a 3px blur, the last a hard shadow offset to the bottom right.",
    ),
  ),

  part(
    "corners",
    "Corners and shapes",
    explain(
      "The box model module rounded corners with [[css-box-model|`border-radius`]]; it can do more. Each corner can differ, a huge radius like `999px` turns any box into a pill, and `50%` on a square makes a circle. Rounded corners don't clip what's inside, so an image in a rounded card needs `overflow: hidden` on the card.",
    ),
    playground("Pill, circle, one corner and a clipped image", [
      "<style>",
      "  .row > * { display: inline-block; margin: 4px; vertical-align: middle; }",
      "  .pill { padding: 4px 12px; background: #eef3ff; border-radius: 999px; }",
      "  .circle { width: 56px; height: 56px; background: teal; border-radius: 50%; }",
      "  .bubble { padding: 8px 12px; background: #1d4ed8; color: white;",
      "    border-radius: 16px 16px 16px 0; }",
      "  .card { width: 140px; border-radius: 12px; overflow: hidden; border: 1px solid #d0d7de; }",
      `  .card div { height: 70px; background: ${PHOTO} center / cover; }`,
      "  .card p { margin: 8px; }",
      "</style>",
      '<div class="row">',
      '  <span class="pill">tag</span>',
      '  <span class="circle"></span>',
      '  <span class="bubble">Hi!</span>',
      '  <div class="card"><div></div><p>Clipped</p></div>',
      "</div>",
    ]),
    quickCheck(
      "A card has `border-radius: 12px`, but the photo at its top still has square corners. What's missing?",
      [
        "`overflow: hidden` on the card",
        "`border-radius: 50%` on the card",
        "`box-shadow` on the photo",
      ],
      0,
      "The radius shapes the card's own background and border. `overflow: hidden` clips its children to that rounded shape too.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App: flat on purpose",
    explain(
      "The Notes App uses almost no decoration: no gradients and no shadows. Cards are white on a pale grey page, separated by a 1px border and softened by small rounded corners. That's a deliberate choice: flat styles are quick to draw, look the same in every browser, and keep the attention on the notes.",
    ),
    code(
      "css",
      "decoration in the Notes App's index.css",
      [
        "body {",
        "  background: var(--color-background);",
        "}",
        "",
        ".note-form {",
        "  background: white;",
        "  border: 1px solid var(--color-border);",
        "  border-radius: 0.5rem;",
        "}",
        "",
        ".button-link {",
        "  background: none;",
        "}",
      ],
      {
        2: "the pale grey #f6f8fa behind everything",
        6: "white cards stand out from the grey without a shadow",
        8: "8px corners, matching the note cards",
        12: "the shorthand clears every background: a button that looks like a link",
      },
    ),
    inTheNotesApp(
      "Every `background` in the app uses the shorthand with one colour (or `none`), so nothing is left over from another rule.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "White text on an image with no colour behind it",
      language: "css",
      wrong: [".hero { color: white; background-image: url(hills.jpg); }"],
      problem:
        "Until the image loads, or if it fails, the text is white on white and can't be read.",
      right: [
        ".hero {",
        "  color: white;",
        "  background: #1e3a8a url(hills.jpg) center / cover;",
        "}",
      ],
      why: "A dark background colour under the image keeps the text readable whatever happens to the image.",
    }),
    mistake({
      title: "The shorthand that undoes a rule above it",
      language: "css",
      wrong: [
        ".hero { background-size: cover; }",
        ".hero { background: url(hills.jpg) no-repeat; }",
      ],
      problem:
        "The image shows at its own size: `background` resets `background-size` to `auto`.",
      right: [
        ".hero { background: url(hills.jpg) no-repeat; }",
        ".hero { background-size: cover; }",
      ],
      why: "Put longhands after the shorthand, or include the size in it: `center / cover`.",
    }),
    mistake({
      title: "A gradient in background-color",
      language: "css",
      wrong: [".card { background-color: linear-gradient(white, #eef3ff); }"],
      problem:
        "The declaration is invalid, so the browser drops it and the card has no background.",
      right: [".card { background-image: linear-gradient(white, #eef3ff); }"],
      why: "Gradients are images. Use `background-image` or the `background` shorthand.",
    }),
    mistake({
      title: "A heavy black shadow",
      language: "css",
      wrong: [".card { box-shadow: 5px 5px 5px black; }"],
      problem:
        "A dark, offset, solid shadow looks like a smudge and draws the eye away from the content.",
      right: [".card { box-shadow: 0 2px 8px rgb(0 0 0 / 12%); }"],
      why: "Real shadows are soft and faint, and fall straight down from light above.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A gradient banner",
      task: "Give `.banner` a `linear-gradient` that runs `to right` from `#1d4ed8` to `#60a5fa`, and make its text white.",
      starter: [
        "<style>",
        "  .banner { padding: 24px; }",
        "</style>",
        '<div class="banner">Welcome back</div>',
      ],
      checks: [
        {
          kind: "style",
          label: "The banner has the blue gradient, left to right",
          selector: ".banner",
          property: "background-image",
          value:
            "linear-gradient(to right, rgb(29, 78, 216), rgb(96, 165, 250))",
        },
        {
          kind: "style",
          label: "The text is white",
          selector: ".banner",
          property: "color",
          value: "rgb(255, 255, 255)",
        },
      ],
      hint: "`background-image: linear-gradient(to right, #1d4ed8, #60a5fa);` and `color: white;`.",
      solution: [
        "<style>",
        "  .banner {",
        "    padding: 24px;",
        "    color: white;",
        "    background-image: linear-gradient(to right, #1d4ed8, #60a5fa);",
        "  }",
        "</style>",
        '<div class="banner">Welcome back</div>',
      ],
    }),
    pageYourTurn({
      title: "One picture, filling the box",
      task: "The `.hero` image tiles. Show it once (`no-repeat`), make it `cover` the box, and give the hero a fallback `background-color` of `#1e3a8a`.",
      starter: [
        "<style>",
        "  .hero {",
        "    height: 160px;",
        `    background-image: ${PHOTO};`,
        "  }",
        "</style>",
        '<div class="hero"></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "The image doesn't repeat",
          selector: ".hero",
          property: "background-repeat",
          value: "no-repeat",
        },
        {
          kind: "style",
          label: "The image covers the box",
          selector: ".hero",
          property: "background-size",
          value: "cover",
        },
        {
          kind: "style",
          label: "There's a dark blue colour behind the image",
          selector: ".hero",
          property: "background-color",
          value: "rgb(30, 58, 138)",
        },
      ],
      hint: "Add `background-repeat: no-repeat;`, `background-size: cover;` and `background-color: #1e3a8a;` to `.hero`.",
      solution: [
        "<style>",
        "  .hero {",
        "    height: 160px;",
        `    background-image: ${PHOTO};`,
        "    background-repeat: no-repeat;",
        "    background-size: cover;",
        "    background-color: #1e3a8a;",
        "  }",
        "</style>",
        '<div class="hero"></div>',
      ],
    }),
    pageYourTurn({
      title: "A readable overlay",
      task: "Put a second layer **on top of** the photo: `linear-gradient(#00000080, #00000080)`, a half-see-through black. Keep the photo as the bottom layer.",
      starter: [
        "<style>",
        "  .hero {",
        "    padding: 32px 16px; color: white;",
        `    background-image: ${PHOTO};`,
        "  }",
        "</style>",
        '<div class="hero">Read me</div>',
      ],
      checks: [
        {
          kind: "style",
          label: "The dark gradient is the top layer, over the photo",
          selector: ".hero",
          property: "background-image",
          value: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), ${PHOTO}`,
        },
        {
          kind: "style",
          label: "The text is still white",
          selector: ".hero",
          property: "color",
          value: "rgb(255, 255, 255)",
        },
      ],
      hint: "List the gradient first, then a comma, then the photo's `url(…)`: the first layer is drawn on top.",
      solution: [
        "<style>",
        "  .hero {",
        "    padding: 32px 16px; color: white;",
        "    background-image:",
        "      linear-gradient(#00000080, #00000080),",
        `      ${PHOTO};`,
        "  }",
        "</style>",
        '<div class="hero">Read me</div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Backgrounds and decoration cheat sheet", [
      [
        "background-color",
        "Under everything; always set one.",
        "background-color: #1e3a8a;",
      ],
      [
        "background-image",
        "url() or a gradient; first layer on top.",
        "background-image: url(a.png);",
      ],
      [
        "background-size",
        "cover fills, contain fits.",
        "background-size: cover;",
      ],
      [
        "background-repeat",
        "Tiles by default.",
        "background-repeat: no-repeat;",
      ],
      [
        "background",
        "All at once; resets the rest.",
        "background: #1e3a8a url(a.png) center / cover;",
      ],
      [
        "linear-gradient()",
        "Blend along a line.",
        "linear-gradient(to right, #1d4ed8, gold)",
      ],
      [
        "radial / conic",
        "From a point / round a centre.",
        "conic-gradient(#1d4ed8 0 25%, gold 0)",
      ],
      [
        "box-shadow",
        "x y blur spread colour; no space taken.",
        "box-shadow: 0 4px 12px rgb(0 0 0 / 15%);",
      ],
      [
        "text-shadow",
        "On letters; no spread.",
        "text-shadow: 0 1px 2px #0008;",
      ],
      ["border-radius", "999px pill, 50% circle.", "border-radius: 999px;"],
    ]),
    quickCheck(
      "A hero has white text over a photo, and the text is hard to read on the light sky. What's the best fix?",
      [
        "`opacity: 0.5` on the hero",
        "A see-through dark gradient layered over the photo",
        "A bigger `box-shadow` on the hero",
      ],
      1,
      "A dark layer between photo and text raises the contrast everywhere. `opacity` would fade the text too, and a box shadow is outside the box.",
    ),
  ),
);
