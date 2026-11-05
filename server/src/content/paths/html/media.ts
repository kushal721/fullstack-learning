import {
  anatomy,
  code,
  diagram,
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

// Images and media in depth: how a page gets its pictures, the img
// element (anatomy), alt text, a playground, size and lazy loading,
// formats, figure and figcaption, images for every screen with a
// step-through of srcset, video and audio, embedded pages, mistakes,
// practice and a recap.
export const mediaModule = moduleLesson(
  "images-and-media",
  "Images and media",
  45,
  [
    "Add an image with `<img>`, and write alt text that says what matters in it.",
    "Give images a size and lazy loading, and pick the right file format.",
    "Caption an image with `<figure>` and `<figcaption>`.",
    "Offer several sizes with `srcset` and `sizes`, and predict which one the browser picks.",
    "Add video, audio and embedded pages that everyone can use.",
  ],

  part(
    "why",
    "How a page gets its pictures",
    explain(
      "An image isn't inside the HTML file. The HTML only says **where** it is, with a `src`, and the browser fetches it as a separate request, the same way it fetched the page. Video, audio and embedded pages work the same way. That's why images can load after the text, fail on their own, or come in different sizes for different screens.",
    ),
    diagram([
      [
        "the browser reads the HTML",
        '<img src="cat.jpg" alt="A sleeping cat">',
      ],
      ["it asks the server again", "GET /cat.jpg"],
      ["the picture arrives", "and is drawn in its place"],
      ["or it fails", "and the alt text is shown instead"],
    ]),
  ),

  part(
    "img",
    "The img element",
    explain(
      "`<img>` is a [[void-element|void element]]: no content and no closing tag, just [[attribute|attributes]]. `src` says which file to show and `alt` says what it shows, for people who can't see it. `width` and `height` tell the browser its size before it arrives.",
    ),
    anatomy(
      "An image",
      [
        "<img",
        '  src="cat.jpg"',
        '  alt="A cat asleep on a keyboard"',
        '  width="400" height="300">',
      ],
      [
        ["<img", "the element", "Void: no content, no closing tag."],
        [
          'src="cat.jpg"',
          "the file",
          "Where to fetch the picture from: a path or a full URL.",
        ],
        [
          'alt="A cat asleep on a keyboard"',
          "the alt text",
          "What the picture shows, read aloud or shown if it fails.",
        ],
        [
          'width="400" height="300"',
          "the size",
          "In pixels, without units. Saves space before it loads.",
        ],
      ],
    ),
  ),

  part(
    "alt-text",
    "Writing good alt text",
    explain(
      "[[alt-text|Alt text]] replaces the picture, so write what someone would need if they couldn't see it, in a sentence or less. Don't start with “image of”: screen readers already say it's an image. The right text depends on **why** the image is there:",
    ),
    reference("Alt text by purpose", [
      [
        "Shows information",
        "Say what it shows.",
        'alt="Notes per month, rising from 3 to 40"',
      ],
      [
        "Is a link or button",
        "Say where it goes or what it does.",
        'alt="Home"',
      ],
      ["Contains text", "Repeat the text.", 'alt="50% off this week"'],
      ["Just decoration", "Empty alt, so it's skipped.", 'alt=""'],
      [
        "Described nearby",
        "Empty alt, or a short name.",
        'alt="" (the caption says it)',
      ],
    ]),
    quickCheck(
      "A purely decorative swirl sits between two sections. What alt text should it have?",
      ['`alt="swirl.png"`', '`alt=""`', "No alt attribute at all"],
      1,
      'An empty `alt=""` tells screen readers to skip it. With no alt at all, many read out the file name.',
    ),
  ),

  part(
    "try-it",
    "Try it: an image and its alt text",
    explain(
      "The first image's `src` is a tiny picture written right into the attribute (a `data:` address), so it works without a file. The second has no picture at all (its `src` is left out here, standing in for a file that failed to load), so the browser shows its alt text instead: that's what people see when an image fails. Change the alt text, the size, or the colour.",
    ),
    playground("An image, and one that fails", [
      "<img",
      "  src=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='teal'/></svg>\"",
      '  alt="A teal rectangle"',
      '  width="160" height="90">',
      "",
      '<img alt="A cat asleep on a keyboard" width="160" height="90">',
    ]),
  ),

  part(
    "size-and-loading",
    "Size and lazy loading",
    explain(
      "Without `width` and `height`, the browser doesn't know how big an image is until it arrives, so the text below jumps down when it does. With them, the space is saved from the start (CSS can still resize it). `loading=\"lazy\"` waits to fetch images until they're close to the screen, so the first screen loads sooner. Don't make the very first, biggest image lazy.",
    ),
    code(
      "html",
      "a sized, lazy image",
      [
        '<img src="desk.jpg" alt="Notes on a desk"',
        '     width="800" height="600" loading="lazy">',
      ],
      { 2: "space saved from the start; fetched when needed" },
    ),
    quickCheck(
      'What does `loading="lazy"` do?',
      [
        "Loads the image only when it's about to be seen",
        "Makes the image blurry",
        "Loads it before the HTML",
      ],
      0,
      "Images far down the page wait, so the first screen loads sooner.",
    ),
  ),

  part(
    "formats",
    "Which file format?",
    explain(
      "The same picture can be saved in different formats, and the right one can make it many times smaller. Photos and drawings need different kinds:",
    ),
    reference("Image formats", [
      ["JPEG (.jpg)", "Photos. Small, but no transparency.", "a holiday photo"],
      [
        "PNG (.png)",
        "Screenshots, sharp edges, transparency.",
        "an app screenshot",
      ],
      [
        "SVG (.svg)",
        "Icons and logos drawn as shapes: sharp at any size.",
        "a logo",
      ],
      [
        "WebP, AVIF",
        "Modern: smaller than JPEG and PNG.",
        "the same photo, half the size",
      ],
      [
        "GIF (.gif)",
        "Old; short animations. Video is usually smaller.",
        "a tiny animation",
      ],
    ]),
  ),

  part(
    "figure",
    "figure and figcaption",
    explain(
      "When an image (or a chart, a code sample, a quote) comes with a caption, wrap both in `<figure>` and put the caption in `<figcaption>`. The caption is visible to everyone and belongs to the picture, so screen readers announce them together. Alt text and caption do different jobs: the alt replaces the picture, the caption adds to it.",
    ),
    code(
      "html",
      "an image with its caption",
      [
        "<figure>",
        '  <img src="chart.png" alt="Notes per month, rising from 3 to 40">',
        "  <figcaption>Notes written in 2026.</figcaption>",
        "</figure>",
      ],
      {
        2: "the alt replaces the picture",
        3: "the caption is seen by everyone",
      },
    ),
  ),

  part(
    "responsive",
    "Images for every screen",
    explain(
      "A phone doesn't need the 1600-pixel photo a big screen does. [[responsive-images|Responsive images]] list several sizes of one picture in `srcset`, each with its width (`400w`), and say in `sizes` how wide the image will be shown. The browser then downloads the smallest one that looks sharp. `src` stays as the fallback.",
    ),
    code(
      "html",
      "srcset and sizes",
      [
        "<img",
        '  src="photo-800.jpg"',
        '  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"',
        '  sizes="(max-width: 600px) 100vw, 600px"',
        '  alt="Notes on a desk" width="800" height="600">',
      ],
      {
        2: "the fallback",
        3: "the files and their widths",
        4: "phones: full screen width; otherwise 600px",
      },
    ),
    keyPoints(
      "`srcset` lists the files; `sizes` says how wide the image is shown.",
      "The browser chooses; you only describe the options.",
      "`<picture>` with `<source>`s can offer another crop, or AVIF with a JPEG fallback.",
    ),
  ),

  part(
    "how-srcset-picks",
    "How the browser picks from srcset",
    explain(
      "Step through the choice for the image above on a phone 375 pixels wide, whose screen has 2 real pixels for every CSS pixel (most phones do):",
    ),
    trace(
      "Choosing a file, move by move",
      [
        '<img src="photo-800.jpg"',
        '  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"',
        '  sizes="(max-width: 600px) 100vw, 600px"',
        '  alt="Notes on a desk">',
      ],
      [
        {
          line: 3,
          note: "First `sizes`: the screen is 375px, so `(max-width: 600px)` matches and the image is shown at `100vw`, the full width.",
          vars: [["shown at", "375px"]],
        },
        {
          line: 3,
          note: "This screen has 2 real pixels per CSS pixel, so to look sharp the file must be about 375 × 2 = 750 pixels wide.",
          vars: [
            ["shown at", "375px"],
            ["needs", "750px"],
          ],
        },
        {
          line: 2,
          note: "Now `srcset`: 400w is too small for 750. 800w is the smallest file that's wide enough.",
          vars: [
            ["shown at", "375px"],
            ["needs", "750px"],
            ["picks", "photo-800.jpg"],
          ],
          output: "GET photo-800.jpg",
        },
        {
          line: 3,
          note: "On a 1280px laptop with 1 pixel per CSS pixel, `(max-width: 600px)` doesn't match, so the image is shown at 600px.",
          vars: [
            ["shown at", "600px"],
            ["needs", "600px"],
          ],
        },
        {
          line: 2,
          note: "800w is again the smallest that's wide enough. Only a big, sharp screen would get the 1600w file; `src` is used only by browsers that ignore `srcset`.",
          vars: [
            ["shown at", "600px"],
            ["needs", "600px"],
            ["picks", "photo-800.jpg"],
          ],
          output: "GET photo-800.jpg",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "video-and-audio",
    "Video and audio",
    explain(
      "[[media-element|`<video>` and `<audio>`]] play media with the browser's own player. Add `controls`, or people can't play, pause or turn it down. A video can list several `<source>` formats (the browser plays the first it can) and `<track>`s of captions, so people who can't hear it can still follow.",
    ),
    reference("Media tags", [
      [
        "<video>",
        "A video; `controls` shows play, pause and volume.",
        '<video controls width="640">…</video>',
      ],
      [
        "<audio>",
        "Sound with controls.",
        '<audio src="hello.mp3" controls></audio>',
      ],
      [
        "<source>",
        "One format of the media; the first that works plays.",
        '<source src="intro.webm" type="video/webm">',
      ],
      [
        "<track>",
        "Captions for a video, as a text file.",
        '<track kind="captions" src="en.vtt" srclang="en">',
      ],
    ]),
    code(
      "html",
      "a video with captions",
      [
        '<video controls width="640" poster="intro.jpg">',
        '  <source src="intro.webm" type="video/webm">',
        '  <source src="intro.mp4" type="video/mp4">',
        '  <track kind="captions" src="intro-en.vtt" srclang="en" label="English">',
        '  <a href="intro.mp4">Download the video</a>',
        "</video>",
      ],
      {
        1: "poster: the picture shown before it plays",
        4: "captions people can turn on",
        5: "shown only if the browser can't play video",
      },
    ),
  ),

  part(
    "iframes",
    "Embedding other pages",
    explain(
      "An [[iframe]] shows another whole page inside yours: a map, a video from a video site, a payment form. It's a window onto a different page, so it loads separately and its own code runs inside it. Give it a `title` saying what it is, and `loading=\"lazy\"` if it's far down the page. Only embed sites you trust.",
    ),
    code(
      "html",
      "an embedded map",
      [
        "<iframe",
        '  src="https://maps.example.com/embed?q=Kathmandu"',
        '  title="Map of our office in Kathmandu"',
        '  width="600" height="400" loading="lazy">',
        "</iframe>",
      ],
      {
        3: "its name for screen readers",
        4: "fetched when it's near the screen",
      },
    ),
    quickCheck(
      "Why give an `<iframe>` a `title`?",
      [
        "It shows as a heading",
        "Screen readers use it to say what the embedded page is",
        "It makes the frame load faster",
      ],
      1,
      "The `title` is the frame's name for people who can't see what's inside.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Alt text that says nothing",
      language: "html",
      wrong: ['<img src="IMG_2041.jpg" alt="image">'],
      problem:
        "A screen reader says “image, image”. The person learns nothing about what's there.",
      right: [
        '<img src="IMG_2041.jpg" alt="Our team of four at the launch party">',
      ],
      why: "Say what the picture shows and why it's there; skip “image of”.",
    }),
    mistake({
      title: "No width and height",
      language: "html",
      wrong: [
        '<img src="hero.jpg" alt="Notes on a phone">',
        "<p>Start writing…</p>",
      ],
      problem:
        "The paragraph is drawn first, then jumps down when the image arrives, and people click the wrong thing.",
      right: [
        '<img src="hero.jpg" alt="Notes on a phone"',
        '     width="1200" height="800">',
        "<p>Start writing…</p>",
      ],
      why: "Give the real size; CSS can still scale it to fit.",
    }),
    mistake({
      title: "A video without controls or captions",
      language: "html",
      wrong: ['<video src="intro.mp4" autoplay></video>'],
      problem:
        "It starts by itself (most browsers block that with sound), can't be paused, and is useless to people who can't hear it.",
      right: [
        '<video src="intro.mp4" controls>',
        '  <track kind="captions" src="intro-en.vtt" srclang="en">',
        "</video>",
      ],
      why: "Let people start it themselves, and give captions.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Alt text and a caption",
      task: 'Give the chart the alt text `Notes per month, rising from 3 to 40` and wrap it in a `<figure>` with the caption `Notes written in 2026.` The divider is decoration: give it an empty `alt=""`.',
      starter: [
        '<img src="chart.png" width="400" height="200">',
        '<img src="divider.png" width="400" height="10">',
      ],
      checks: [
        {
          kind: "attr",
          label: "The chart's alt text",
          selector: 'img[src="chart.png"]',
          name: "alt",
          value: "Notes per month, rising from 3 to 40",
        },
        {
          kind: "exists",
          label: "The chart is in a figure",
          selector: 'figure img[src="chart.png"]',
        },
        {
          kind: "text",
          label: "The caption",
          selector: "figure figcaption",
          text: "Notes written in 2026.",
        },
        {
          kind: "attr",
          label: "The divider is skipped",
          selector: 'img[src="divider.png"]',
          name: "alt",
          value: "",
        },
      ],
      hint: '`<figure><img src="chart.png" alt="…" width="400" height="200"><figcaption>…</figcaption></figure>`, then `alt=""` on the divider.',
      solution: [
        "<figure>",
        '  <img src="chart.png" alt="Notes per month, rising from 3 to 40" width="400" height="200">',
        "  <figcaption>Notes written in 2026.</figcaption>",
        "</figure>",
        '<img src="divider.png" alt="" width="400" height="10">',
      ],
    }),
    pageYourTurn({
      title: "A video people can use",
      task: 'Give the video `controls`, and add an English captions track: a `<track>` with `kind="captions"`, `src="intro-en.vtt"` and `srclang="en"`.',
      starter: ['<video src="intro.mp4" width="640">', "</video>"],
      checks: [
        {
          kind: "attr",
          label: "It has controls",
          selector: "video",
          name: "controls",
        },
        {
          kind: "attr",
          label: "A captions track",
          selector: 'video track[kind="captions"]',
          name: "src",
          value: "intro-en.vtt",
        },
        {
          kind: "attr",
          label: "In English",
          selector: "video track",
          name: "srclang",
          value: "en",
        },
      ],
      hint: '`<video src="intro.mp4" width="640" controls>`, then inside it `<track kind="captions" src="intro-en.vtt" srclang="en">`.',
      solution: [
        '<video src="intro.mp4" width="640" controls>',
        '  <track kind="captions" src="intro-en.vtt" srclang="en" label="English">',
        "</video>",
      ],
    }),
    pageYourTurn({
      title: "A lazy image with a size",
      task: 'This photo is far down a long page. Give it its size, `width="800"` and `height="600"`, and make it load lazily.',
      starter: ['<img src="desk.jpg" alt="Notes on a desk">'],
      checks: [
        {
          kind: "attr",
          label: "Its width",
          selector: "img",
          name: "width",
          value: "800",
        },
        {
          kind: "attr",
          label: "Its height",
          selector: "img",
          name: "height",
          value: "600",
        },
        {
          kind: "attr",
          label: "Loads lazily",
          selector: "img",
          name: "loading",
          value: "lazy",
        },
        {
          kind: "attr",
          label: "The alt text is kept",
          selector: "img",
          name: "alt",
          value: "Notes on a desk",
        },
      ],
      hint: 'Add `width="800" height="600" loading="lazy"` inside the `<img>` tag.',
      solution: [
        '<img src="desk.jpg" alt="Notes on a desk" width="800" height="600" loading="lazy">',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Images and media cheat sheet", [
      [
        "<img src alt>",
        "A picture; alt says what it shows.",
        '<img src="cat.jpg" alt="…">',
      ],
      [
        'alt=""',
        "Decoration: skipped by screen readers.",
        '<img src="swirl.png" alt="">',
      ],
      [
        "width / height",
        "Saves its space before it loads.",
        'width="800" height="600"',
      ],
      [
        'loading="lazy"',
        "Fetch when it's near the screen.",
        "not on the first image",
      ],
      [
        "<figure>",
        "An image with its <figcaption>.",
        "<figcaption>…</figcaption>",
      ],
      [
        "srcset / sizes",
        "Several files; the browser picks.",
        "photo-800.jpg 800w",
      ],
      [
        "<video> / <audio>",
        "With controls; captions via <track>.",
        "<video controls>",
      ],
      ["<iframe>", "Another page inside; give it a title.", 'title="Map"'],
    ]),
    quickCheck(
      'A phone 400px wide with 2 pixels per CSS pixel shows an image at `100vw`. From `srcset="a-400.jpg 400w, a-800.jpg 800w, a-1600.jpg 1600w"`, which does it fetch?',
      ["`a-400.jpg`", "`a-800.jpg`", "`a-1600.jpg`"],
      1,
      "It needs about 400 × 2 = 800 pixels, and 800w is the smallest file that's wide enough.",
    ),
  ),
);
