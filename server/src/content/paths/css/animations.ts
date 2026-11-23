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

// Animations and transforms: transforms, the functions and the separate
// properties, order and origin, keyframes, the animation properties, an
// animation frame by frame, fill modes, easing, steps and staggering,
// smooth animation, reduced motion, the Notes App, mistakes, practice and a
// recap.
export const animationsModule = moduleLesson(
  "animations-and-transforms",
  "Animations and transforms",
  45,
  [
    "Move, scale and rotate elements with `transform` without disturbing the layout.",
    "Predict the effect of transform order and `transform-origin`.",
    "Write `@keyframes` and run them with the `animation` properties.",
    "Control what shows before and after an animation with `animation-fill-mode`.",
    "Keep motion smooth, and turn it down for people who ask for less.",
  ],

  part(
    "transforms",
    "Transforms: move, scale, rotate",
    explain(
      "A [[transform]] changes how a box is **drawn**, not where the layout puts it. Moving, growing or turning a box with `transform` never pushes its neighbours, and the browser can redraw it cheaply, which is why it's the first choice for movement. The box's space in the layout stays exactly where it was.",
    ),
    playground("Hover each card", [
      "<style>",
      "  .card { display: inline-block; padding: 16px; margin: 12px; background: #eef3ff;",
      "    border-radius: 8px; transition: transform 200ms ease-out; }",
      "  .lift:hover { transform: translateY(-6px); }",
      "  .grow:hover { transform: scale(1.1); }",
      "  .tilt:hover { transform: rotate(-6deg); }",
      "</style>",
      '<div class="card lift">Lift</div>',
      '<div class="card grow">Grow</div>',
      '<div class="card tilt">Tilt</div>',
      "<p>The text below never moves.</p>",
    ]),
    quickCheck(
      "A card gets `transform: scale(1.5)`. What happens to the cards next to it?",
      [
        "They're pushed aside to make room",
        "Nothing: the bigger card is drawn over them",
        "They shrink to fit",
      ],
      1,
      "Transforms don't change the layout, so the neighbours stay put and the scaled card may overlap them.",
    ),
  ),

  part(
    "functions",
    "Transform functions and properties",
    explain(
      "`transform` takes a list of functions. A `%` in `translate()` is a share of the element's **own** size, so `translateX(-100%)` moves it exactly its own width. Newer separate properties, `translate`, `rotate` and `scale`, each set one thing, so changing one never wipes out the others.",
    ),
    reference("Transforms", [
      [
        "translate()",
        "Move; % of its own size.",
        "transform: translate(10px, -50%);",
      ],
      ["scale()", "Grow or shrink; 1 is normal.", "transform: scale(1.1);"],
      ["rotate()", "Turn; positive is clockwise.", "transform: rotate(8deg);"],
      ["skew()", "Slant.", "transform: skewX(-10deg);"],
      [
        "translate / rotate / scale",
        "Separate properties, one each.",
        "rotate: 8deg; scale: 1.1;",
      ],
      [
        "transform-origin",
        "The point it turns and scales around.",
        "transform-origin: top left;",
      ],
    ]),
    playground("One function at a time", [
      "<style>",
      "  .box { display: inline-block; width: 60px; height: 60px; margin: 24px;",
      "    background: #1d4ed8; color: white; font: 0.8rem system-ui; }",
      "  .t { transform: translate(20px, 10px); }",
      "  .s { scale: 1.3; }",
      "  .r { rotate: 30deg; }",
      "  .k { transform: skewX(-15deg); }",
      "</style>",
      '<div class="box t">move</div><div class="box s">scale</div>',
      '<div class="box r">rotate</div><div class="box k">skew</div>',
    ]),
  ),

  part(
    "order-and-origin",
    "Order and origin",
    explain(
      "In a list, each function works in the space left by the one before it. `translateX(100px) rotate(45deg)` moves right, then turns on the spot. Swap them and the box turns first, taking its x-axis with it, so the move goes off at 45°. Order matters.",
    ),
    anatomy(
      "Three transforms in one",
      ["transform:", "  translateX(100px)", "  rotate(45deg)", "  scale(1.2);"],
      [
        ["translateX(100px)", "first", "Move 100px to the right."],
        [
          "rotate(45deg)",
          "then",
          "Turn 45° clockwise, on the spot where it now is.",
        ],
        ["scale(1.2)", "then", "Grow by a fifth, in its turned direction."],
      ],
    ),
    explain(
      "Rotating and scaling happen around the `transform-origin`, the centre by default. Set it to `top left` and a box swings like a door from its corner; set it to `bottom` and a bar grows upwards.",
    ),
    playground("Origins, then orders", [
      "<style>",
      "  .row { display: flex; gap: 48px; padding: 16px 24px; font: 0.7rem system-ui; }",
      "  .box { width: 44px; height: 44px; background: #93c5fd; color: #172554; }",
      "  .centre { rotate: 30deg; }",
      "  .corner { rotate: 30deg; transform-origin: top left; }",
      "  .move-turn { transform: translateX(30px) rotate(45deg); }",
      "  .turn-move { transform: rotate(45deg) translateX(30px); }",
      "</style>",
      '<div class="row"><div class="box centre">centre</div><div class="box corner">corner</div></div>',
      '<div class="row"><div class="box move-turn">move, turn</div><div class="box turn-move">turn, move</div></div>',
    ]),
    quickCheck(
      "You want a menu to grow down from its top edge, not from its middle. Which do you set?",
      [
        "`transform-origin: top`",
        "`transform: translateY(0)`",
        "`rotate: 180deg`",
      ],
      0,
      "With the origin at the top, `scale` grows the box from its top edge downwards instead of in both directions.",
    ),
  ),

  part(
    "keyframes",
    "Keyframe animations",
    explain(
      "A transition needs a change, like a hover, to start. A [[keyframes|keyframe animation]] runs by itself: `@keyframes` names a sequence of steps in time, from `0%` (or `from`) to `100%` (or `to`), and the `animation` property plays it on an element, once, a few times or forever.",
    ),
    playground("A pulse and a spinner", [
      "<style>",
      "  @keyframes pulse {",
      "    from { opacity: 1; scale: 1; }",
      "    to { opacity: 0.4; scale: 0.9; }",
      "  }",
      "  @keyframes spin { to { rotate: 360deg; } }",
      "  .dot { display: inline-block; width: 24px; height: 24px; border-radius: 50%;",
      "    background: #1d4ed8; animation: pulse 800ms ease-in-out infinite alternate; }",
      "  .spinner { display: inline-block; width: 24px; height: 24px; margin-left: 16px;",
      "    border: 3px solid #d0d7de; border-top-color: #1d4ed8; border-radius: 50%;",
      "    animation: spin 1s linear infinite; }",
      "</style>",
      '<div class="dot"></div><div class="spinner"></div>',
    ]),
    quickCheck(
      "Why does `@keyframes spin { to { rotate: 360deg; } }` work without a `from`?",
      [
        "It doesn't; `from` is required",
        "A missing `from` uses the element's normal value",
        "`to` means both",
      ],
      1,
      "A missing `0%` or `100%` keyframe takes the element's own value, here `rotate: 0deg`.",
    ),
  ),

  part(
    "animation-properties",
    "The animation properties",
    explain(
      "`animation` is a shorthand, like `transition`. The name links it to an `@keyframes` rule, and a typo there fails silently. The first time is the duration and the second the delay. `infinite` repeats forever and `alternate` plays every other run backwards, so a pulse goes smoothly in and out.",
    ),
    reference("animation longhands", [
      ["animation-name", "Which @keyframes to play.", "animation-name: pulse;"],
      ["animation-duration", "One run.", "animation-duration: 800ms;"],
      [
        "animation-timing-function",
        "Easing between keyframes.",
        "animation-timing-function: ease-in-out;",
      ],
      [
        "animation-delay",
        "Wait before the first run.",
        "animation-delay: 200ms;",
      ],
      [
        "animation-iteration-count",
        "How many runs, or infinite.",
        "animation-iteration-count: infinite;",
      ],
      [
        "animation-direction",
        "normal, reverse, alternate.",
        "animation-direction: alternate;",
      ],
      [
        "animation-fill-mode",
        "Hold the first/last frame outside the run.",
        "animation-fill-mode: both;",
      ],
      [
        "animation-play-state",
        "paused or running.",
        "animation-play-state: paused;",
      ],
      [
        "animation",
        "All at once.",
        "animation: pulse 800ms ease-in-out infinite alternate;",
      ],
    ]),
    playground("Pause on hover", [
      "<style>",
      "  @keyframes slide { to { translate: 200px; } }",
      "  .bar { width: 40px; height: 20px; margin: 8px 0; background: #1d4ed8;",
      "    animation: slide 1.5s ease-in-out infinite alternate; }",
      "  .slow { animation-duration: 3s; }",
      "  .bars:hover .bar { animation-play-state: paused; }",
      "</style>",
      '<div class="bars"><div class="bar"></div><div class="bar slow"></div></div>',
    ]),
  ),

  part(
    "frame-by-frame",
    "An animation, frame by frame",
    explain(
      "Between keyframes the browser works out an in-between value for every frame, using the timing function. Step through a badge that “pops” twice, with `linear` timing so the numbers are easy to follow:",
    ),
    trace(
      "A badge that pops twice",
      [
        "<style>",
        "  @keyframes pop {",
        "    0%   { scale: 1; }",
        "    50%  { scale: 1.2; }",
        "    100% { scale: 1; }",
        "  }",
        "  .badge {",
        "    animation: pop 400ms linear 2;",
        "  }",
        "</style>",
        '<span class="badge">3</span>',
      ],
      [
        {
          line: 8,
          note: "The page loads and the animation starts: one run is 400ms, `linear`, and it plays `2` times.",
          vars: [
            ["time", "0ms"],
            ["run", "1 of 2"],
            ["scale", "1"],
          ],
        },
        {
          line: 4,
          note: "100ms is 25% of the run, halfway from the 0% keyframe to the 50% one: halfway from 1 to 1.2.",
          vars: [
            ["time", "100ms (25%)"],
            ["run", "1 of 2"],
            ["scale", "1.1"],
          ],
        },
        {
          line: 4,
          note: "At 200ms it reaches the 50% keyframe exactly.",
          vars: [
            ["time", "200ms (50%)"],
            ["run", "1 of 2"],
            ["scale", "1.2"],
          ],
        },
        {
          line: 5,
          note: "At 400ms the first run ends at the 100% keyframe, and the second run starts again from 0%.",
          vars: [
            ["time", "400ms"],
            ["run", "2 of 2"],
            ["scale", "1"],
          ],
        },
        {
          line: 7,
          note: "At 800ms the second run ends. With no fill mode, the animation lets go and the badge uses its own styles again: no scale.",
          vars: [
            ["time", "800ms"],
            ["run", "done"],
            ["scale", "none (its own value)"],
          ],
          output: "1 → 1.1 → 1.2 → 1.1 → 1, twice",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "Same badge, but `animation: pop 400ms linear 2 alternate`. What changes?",
      [
        "Nothing visible: this animation is the same forwards and backwards",
        "It plays four times",
        "It stops at scale 1.2",
      ],
      0,
      "`alternate` plays the second run backwards, from 100% to 0%. This animation goes 1 → 1.2 → 1 either way, so it looks the same.",
    ),
  ),

  part(
    "fill-mode",
    "Before and after: fill mode",
    explain(
      "Outside its run, an animation normally has no effect: during a delay and after it ends, the element shows its own styles. `animation-fill-mode` changes that. `forwards` holds the last keyframe after the end; `backwards` shows the first keyframe during the delay; `both` does both, which is what an entrance animation usually wants.",
    ),
    playground("Reload the preview (Reset) and watch the first second", [
      "<style>",
      "  @keyframes fade-in { from { opacity: 0; translate: 0 12px; } }",
      "  .note { padding: 8px; margin: 6px 0; background: #eef3ff;",
      "    animation: fade-in 400ms ease-out 600ms; }",
      "  .both { animation-fill-mode: both; }",
      "</style>",
      '<div class="note">No fill mode: shows, vanishes, then fades in</div>',
      '<div class="note both">fill-mode: both: hidden until it fades in</div>',
    ]),
    quickCheck(
      "A toast slides in after a 1s delay, but it's visible in its final place for that second first, then jumps out and slides in. What fixes it?",
      [
        "`animation-fill-mode: backwards` (or `both`)",
        "`animation-fill-mode: forwards`",
        "`animation-direction: reverse`",
      ],
      0,
      "`backwards` applies the first keyframe during the delay, so the toast starts hidden off-screen.",
    ),
  ),

  part(
    "rhythm",
    "Easing, steps and staggering",
    explain(
      "The timing function applies **between each pair** of keyframes, not across the whole animation. `steps(4)` jumps in four equal steps instead of moving smoothly: good for a ticking clock or a typing effect. Giving each item a slightly longer `animation-delay` makes a list arrive one after another, a **stagger**.",
    ),
    playground("Steps and a staggered list (press Reset to replay)", [
      "<style>",
      "  @keyframes tick { to { rotate: 360deg; } }",
      "  @keyframes rise { from { opacity: 0; translate: 0 10px; } }",
      "  .clock { position: relative; width: 90px; height: 90px;",
      "    border: 2px solid #d0d7de; border-radius: 50%; }",
      "  .hand { position: absolute; left: 43px; top: 5px; width: 4px; height: 40px;",
      "    background: #1d4ed8; transform-origin: bottom;",
      "    animation: tick 4s steps(4) infinite; }",
      "  li { animation: rise 300ms ease-out both; }",
      "  li:nth-child(2) { animation-delay: 100ms; }",
      "  li:nth-child(3) { animation-delay: 200ms; }",
      "  li:nth-child(4) { animation-delay: 300ms; }",
      "</style>",
      '<div class="clock"><div class="hand"></div></div>',
      "<ul><li>Milk</li><li>Bread</li><li>Eggs</li><li>Butter</li></ul>",
    ]),
  ),

  part(
    "smooth-and-safe",
    "Smooth motion, and less of it",
    explain(
      "Animate `transform` and `opacity` and motion stays smooth: the browser doesn't lay out the page again on each frame. Some people get dizzy or sick from movement and turn on **reduce motion** in their system settings. [[reduced-motion|`prefers-reduced-motion`]] lets you turn big movement down for them, keeping fades and colour changes.",
    ),
    code(
      "css",
      "less movement when it's asked for",
      [
        ".toast {",
        "  animation: slide-in 300ms ease-out both;",
        "}",
        "",
        "@media (prefers-reduced-motion: reduce) {",
        "  .toast {",
        "    animation-name: fade-in;",
        "  }",
        "  .spinner { animation-duration: 3s; }",
        "}",
      ],
      {
        2: "for most people, it slides in",
        5: "only when the system asks for less motion",
        7: "still shows it arriving, without the movement",
        9: "slow a spinner down rather than freezing it",
      },
    ),
    keyPoints(
      "Animate `transform` and `opacity`; avoid `width`, `top` and `margin`.",
      "Motion should explain something: arriving, leaving, waiting.",
      "Nothing should flash more than three times a second.",
      "Respect reduced motion: swap movement for a fade.",
    ),
    quickCheck(
      "Who is `prefers-reduced-motion: reduce` for?",
      [
        "People whose system asks for less movement",
        "Slow computers",
        "Phones only",
      ],
      0,
      "It's an accessibility setting that people turn on, often because motion makes them unwell. This platform turns its own motion down for it too.",
    ),
  ),

  part(
    "notes-app",
    "Motion in the Notes App",
    explain(
      "The Notes App has no animations at all: while a note saves, the button just fades with `:disabled`. That's a fine choice for a small app. If it grew a slow request, a spinner would be the place to start, using the app's own colours and honouring reduced motion.",
    ),
    code(
      "css",
      "a spinner the Notes App could add",
      [
        "@keyframes spin { to { rotate: 360deg; } }",
        "",
        ".spinner {",
        "  width: 1rem; height: 1rem;",
        "  border: 2px solid var(--color-border);",
        "  border-top-color: var(--color-primary);",
        "  border-radius: 50%;",
        "  animation: spin 800ms linear infinite;",
        "}",
        "",
        "@media (prefers-reduced-motion: reduce) {",
        "  .spinner { animation-duration: 2.4s; }",
        "}",
      ],
      {
        1: "no from: it starts at the element's own 0deg",
        6: "one blue side on a grey ring",
        8: "linear, so it turns at a steady speed",
        12: "slower, but still shows it's working",
      },
    ),
    inTheNotesApp(
      "Its only feedback while saving is `.button:disabled`, at `opacity: 0.6`: a state, not an animation.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A hover transform that undoes another",
      language: "css",
      wrong: [
        ".dialog { transform: translate(-50%, -50%); }",
        ".dialog:hover { transform: scale(1.02); }",
      ],
      problem:
        "`transform` is one value, so the hover replaces the whole list: the centring translate is lost and the dialog jumps.",
      right: [
        ".dialog { translate: -50% -50%; }",
        ".dialog:hover { scale: 1.02; }",
      ],
      why: "The separate `translate` and `scale` properties don't overwrite each other.",
    }),
    mistake({
      title: "Animating layout properties",
      language: "css",
      wrong: ["@keyframes slide { from { left: -300px; } to { left: 0; } }"],
      problem:
        "Changing `left` makes the browser lay out the page again on every frame, which stutters on slower phones.",
      right: ["@keyframes slide { from { translate: -100%; } }"],
      why: "`translate` is drawn without layout, and `-100%` is the element's own width, whatever it is.",
    }),
    mistake({
      title: "A misspelt animation name",
      language: "css",
      wrong: [
        "@keyframes fade-in { from { opacity: 0; } }",
        ".toast { animation: fadein 300ms; }",
      ],
      problem:
        "Nothing happens, and there's no error: no `@keyframes` is called `fadein`.",
      right: [".toast { animation: fade-in 300ms; }"],
      why: "Names must match exactly. DevTools' Animations panel shows which animations actually run.",
    }),
    mistake({
      title: "Endless motion everywhere",
      language: "css",
      wrong: [".logo { animation: wobble 1s infinite; }"],
      problem:
        "Constant movement pulls attention from the content and can make some people feel unwell.",
      right: [
        ".logo:hover { animation: wobble 1s; }",
        "@media (prefers-reduced-motion: reduce) {",
        "  .logo:hover { animation: none; }",
        "}",
      ],
      why: "Save repeating animations for things that are waiting, like spinners, and respect reduced motion.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Tilt the sticker",
      task: "Use the separate transform properties: turn `.sticker` `-8deg` with `rotate` and make it `1.2` times bigger with `scale`.",
      starter: [
        "<style>",
        "  .sticker { display: inline-block; margin: 24px; padding: 8px 16px;",
        "    background: gold; border-radius: 6px; }",
        "</style>",
        '<span class="sticker">New!</span>',
      ],
      checks: [
        {
          kind: "style",
          label: "The sticker is turned -8deg",
          selector: ".sticker",
          property: "rotate",
          value: "-8deg",
        },
        {
          kind: "style",
          label: "It's 1.2 times bigger",
          selector: ".sticker",
          property: "scale",
          value: "1.2",
        },
      ],
      hint: "Inside `.sticker`: `rotate: -8deg; scale: 1.2;`.",
      solution: [
        "<style>",
        "  .sticker { display: inline-block; margin: 24px; padding: 8px 16px;",
        "    background: gold; border-radius: 6px; rotate: -8deg; scale: 1.2; }",
        "</style>",
        '<span class="sticker">New!</span>',
      ],
    }),
    pageYourTurn({
      title: "A pulsing dot",
      task: "Play the `pulse` keyframes on `.dot`: `0.8s` a run, forever (`infinite`), going back and forth (`alternate`).",
      starter: [
        "<style>",
        "  @keyframes pulse { to { opacity: 0.4; scale: 0.9; } }",
        "  .dot { width: 24px; height: 24px; border-radius: 50%; background: #1d4ed8; }",
        "</style>",
        '<div class="dot"></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "It plays pulse",
          selector: ".dot",
          property: "animation-name",
          value: "pulse",
        },
        {
          kind: "style",
          label: "Each run is 0.8s",
          selector: ".dot",
          property: "animation-duration",
          value: "0.8s",
        },
        {
          kind: "style",
          label: "It repeats forever",
          selector: ".dot",
          property: "animation-iteration-count",
          value: "infinite",
        },
        {
          kind: "style",
          label: "It goes back and forth",
          selector: ".dot",
          property: "animation-direction",
          value: "alternate",
        },
      ],
      hint: "`animation: pulse 0.8s infinite alternate;` on `.dot`, or the four `animation-` longhands.",
      solution: [
        "<style>",
        "  @keyframes pulse { to { opacity: 0.4; scale: 0.9; } }",
        "  .dot { width: 24px; height: 24px; border-radius: 50%; background: #1d4ed8;",
        "    animation-name: pulse;",
        "    animation-duration: 0.8s;",
        "    animation-iteration-count: infinite;",
        "    animation-direction: alternate; }",
        "</style>",
        '<div class="dot"></div>',
      ],
    }),
    pageYourTurn({
      title: "An entrance that waits",
      task: "Play `slide-in` on `.toast` for `0.3s` with `ease-out`, after a `0.5s` delay. Set the fill mode so it's hidden during the delay and stays in place after.",
      starter: [
        "<style>",
        "  @keyframes slide-in { from { opacity: 0; translate: 0 20px; } }",
        "  .toast { padding: 12px; background: #1f2328; color: white; }",
        "</style>",
        '<div class="toast">Note saved</div>',
      ],
      checks: [
        {
          kind: "style",
          label: "It plays slide-in",
          selector: ".toast",
          property: "animation-name",
          value: "slide-in",
        },
        {
          kind: "style",
          label: "It eases out",
          selector: ".toast",
          property: "animation-timing-function",
          value: "ease-out",
        },
        {
          kind: "style",
          label: "It waits 0.5s",
          selector: ".toast",
          property: "animation-delay",
          value: "0.5s",
        },
        {
          kind: "style",
          label: "It's held before and after",
          selector: ".toast",
          property: "animation-fill-mode",
          value: "both",
        },
      ],
      hint: "`animation: slide-in 0.3s ease-out 0.5s both;` (the first time is the duration, the second the delay).",
      solution: [
        "<style>",
        "  @keyframes slide-in { from { opacity: 0; translate: 0 20px; } }",
        "  .toast { padding: 12px; background: #1f2328; color: white;",
        "    animation-name: slide-in;",
        "    animation-duration: 0.3s;",
        "    animation-timing-function: ease-out;",
        "    animation-delay: 0.5s;",
        "    animation-fill-mode: both; }",
        "</style>",
        '<div class="toast">Note saved</div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Animations and transforms cheat sheet", [
      [
        "transform",
        "Drawn differently; layout unchanged.",
        "transform: translateY(-4px);",
      ],
      [
        "translate / rotate / scale",
        "One each; don't overwrite.",
        "rotate: 8deg; scale: 1.1;",
      ],
      [
        "order",
        "Each function works after the last.",
        "translateX(100px) rotate(45deg)",
      ],
      [
        "transform-origin",
        "The pivot; centre by default.",
        "transform-origin: top left;",
      ],
      [
        "@keyframes",
        "Named steps from 0% to 100%.",
        "@keyframes pop { 50% { scale: 1.2; } }",
      ],
      [
        "animation",
        "name duration easing delay count direction fill.",
        "animation: pop 400ms ease-out 2;",
      ],
      [
        "fill-mode both",
        "First frame in the delay, last after.",
        "animation-fill-mode: both;",
      ],
      [
        "steps()",
        "Jumps instead of gliding.",
        "animation-timing-function: steps(4);",
      ],
      [
        "reduced motion",
        "Swap movement for a fade.",
        "@media (prefers-reduced-motion: reduce)",
      ],
    ]),
    quickCheck(
      "`@keyframes fade { from { opacity: 0; } }` and `animation: fade 1s 0.5s` (no fill mode). What's the element's opacity at 0.25s, during the delay?",
      ["0", "1", "0.25"],
      1,
      "With no fill mode, the animation has no effect during the delay, so the element shows its own opacity, 1. Then it jumps to 0 and fades in: `backwards` or `both` would fix that.",
    ),
  ),
);
