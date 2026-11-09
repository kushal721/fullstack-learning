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
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// HTML for search and sharing in depth: who else reads a page, the head
// tags they use (anatomy), titles and descriptions, the meta tags worth
// knowing, link previews with Open Graph and a step-through of how a card is
// built, content search engines can read, one address per page, robots.txt
// and sitemaps, how this site does it, mistakes, practice and a recap.
export const searchModule = moduleLesson(
  "search-and-sharing",
  "HTML for search and sharing",
  40,
  [
    "Explain how search engines and link previews read a page's HTML.",
    "Write a title and description for each page that people will click.",
    "Add Open Graph tags so a shared link shows a good preview card.",
    "Give a page one official address with a canonical link, or keep it out with noindex.",
    "Write content search engines can read: real headings, link text, alt and text in HTML.",
  ],

  part(
    "why",
    "Who else reads your page",
    explain(
      "People aren't the only visitors. **Search engines** send programs called crawlers that download your HTML, read it, follow its links and decide what each page is about. **Link previews** do the same when someone pastes your link into a chat: the app fetches the page and builds a card from its `<head>`. Neither clicks buttons or waits around, so what they see is the HTML.",
    ),
    diagram([
      ["a crawler fetches the page", "GET /learn/html"],
      ["it reads the HTML", "title, description, headings, links, alt"],
      ["it follows the links", "and finds more pages"],
      ["it shows a result", "your title, your description"],
    ]),
  ),

  part(
    "the-tags",
    "The tags they read",
    explain(
      "A few lines in `<head>` do most of the work. They're invisible on the page itself, and each page should have its own.",
    ),
    anatomy(
      "A head written for search and sharing",
      [
        "<title>HTML · Full-Stack Learning</title>",
        '<meta name="description" content="The structure of a web page…">',
        '<meta property="og:image" content="https://…/og-image.png">',
        '<link rel="canonical" href="https://…/learn/html">',
      ],
      [
        [
          "<title>",
          "the title",
          "The blue link in a search result, and the tab's text.",
        ],
        [
          '<meta name="description"',
          "the description",
          "Often the grey snippet under the link.",
        ],
        [
          '<meta property="og:image"',
          "the preview picture",
          "The image on a shared link's card.",
        ],
        [
          '<link rel="canonical"',
          "the official address",
          "Which URL to show if several reach this page.",
        ],
      ],
    ),
  ),

  part(
    "title-and-description",
    "Titles and descriptions",
    explain(
      "The title is the most important line: it's the link people click. Make it say what **this** page is, most specific part first, then the site's name, in about 60 characters so it isn't cut off. The [[meta-tag|description]] is a sentence or two (about 150 characters) saying what someone will find. Search engines may show their own snippet instead, but a good description is usually used.",
    ),
    code(
      "html",
      "a title and description that earn the click",
      [
        "<title>Tables, for data · Full-Stack Learning</title>",
        '<meta name="description" content="When to use a table, and how to',
        '  build one that screen readers and phones can use.">',
      ],
      {
        1: "this page first, then the site",
        2: "what you'll find, in a sentence",
      },
    ),
    quickCheck(
      "Every page on a site has the title “Home”. What's the problem?",
      [
        "None; titles don't matter",
        "Search results and tabs can't tell the pages apart",
        "The pages load slower",
      ],
      1,
      "Each page needs its own title: it's what people see in results, tabs and bookmarks.",
    ),
  ),

  part(
    "meta-tags",
    "Meta tags worth knowing",
    explain(
      "[[meta-tag|Meta tags]] describe the page to everyone who isn't a person looking at it. Most use `name`; the Open Graph ones use `property`. Here are the ones you'll actually write:",
    ),
    reference("Meta tags for search and sharing", [
      [
        'name="description"',
        "The search snippet.",
        '<meta name="description" content="…">',
      ],
      [
        'name="robots"',
        "Keep this page out of search results.",
        '<meta name="robots" content="noindex">',
      ],
      [
        'property="og:title"',
        "The preview card's title.",
        '<meta property="og:title" content="Notes">',
      ],
      [
        'property="og:description"',
        "The card's text.",
        'content="Write and keep your notes."',
      ],
      [
        'property="og:image"',
        "The card's picture: a full URL.",
        'content="https://notes.app/preview.png"',
      ],
      [
        'property="og:url"',
        "The page's official address.",
        'content="https://notes.app/"',
      ],
      [
        'name="twitter:card"',
        "Ask for a large picture card.",
        'content="summary_large_image"',
      ],
    ]),
  ),

  part(
    "link-previews",
    "Link previews: Open Graph",
    explain(
      "When a link is shared, the app looks for [[open-graph|Open Graph]] tags: `og:title`, `og:description` and `og:image`. Without them it guesses from the `<title>` and description, or shows a bare address. The image should be a full `https://` address (the app fetches it from its own server) and about 1200×630 pixels.",
    ),
    code(
      "html",
      "describing a page for previews",
      [
        '<meta name="description" content="Write and keep your notes.">',
        '<meta property="og:title" content="Notes">',
        '<meta property="og:description" content="Write and keep your notes.">',
        '<meta property="og:image" content="https://notes.app/preview.png">',
      ],
      {
        1: "the search snippet",
        2: "the shared link's title",
        4: "a full URL, not /preview.png",
      },
    ),
    keyPoints(
      "They're invisible on the page itself.",
      "Each page should have its own title and description.",
      "Preview apps cache cards, so a fix can take a while to show.",
    ),
  ),

  part(
    "how-a-preview-is-built",
    "How a preview card is built",
    explain(
      "Someone pastes `https://notes.app/` into a chat. Step through what the chat app does with the page's head:",
    ),
    trace(
      "Building a link preview, move by move",
      [
        "<head>",
        "  <title>Notes · Write it down</title>",
        '  <meta name="description" content="Write and keep your notes.">',
        '  <meta property="og:title" content="Notes">',
        '  <meta property="og:image" content="https://notes.app/preview.png">',
        "</head>",
      ],
      [
        {
          line: 1,
          note: "The app's server fetches the page, the way a browser would, but it reads only the head: it doesn't run scripts or click anything.",
          vars: [["card", "(empty)"]],
        },
        {
          line: 4,
          note: "It looks for `og:title` first, and finds it. The `<title>` is only a fallback.",
          vars: [["card title", "Notes"]],
        },
        {
          line: 3,
          note: "There's no `og:description`, so it falls back to the normal description.",
          vars: [
            ["card title", "Notes"],
            ["card text", "Write and keep your notes."],
          ],
        },
        {
          line: 5,
          note: "`og:image` is a full address, so it can fetch the picture.",
          vars: [
            ["card title", "Notes"],
            ["card text", "Write and keep your notes."],
            ["card image", "preview.png"],
          ],
        },
        {
          line: 6,
          note: "The card is ready, and is usually cached, so later shares of the same link reuse it.",
          vars: [
            ["card title", "Notes"],
            ["card text", "Write and keep your notes."],
            ["card image", "preview.png"],
          ],
          output: "[preview.png] Notes · Write and keep your notes.",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "readable-content",
    "Content search engines can read",
    explain(
      "[[seo|SEO]] is mostly good HTML. Search engines understand a page from its title, its real [[heading|headings]], its link text, its alt text and its words, so everything earlier in HTML pays off here. Keep the important words as text, not inside a picture, and make content appear without needing a click.",
    ),
    keyPoints(
      "One page, one topic, one `<h1>`.",
      "Every page has its own title and description.",
      "Fast pages rank better and keep visitors.",
    ),
    quickCheck(
      "Which helps search engines most?",
      [
        "Hiding keywords in white text",
        "A clear title and headings that match the content",
        "Many pages with the same title",
      ],
      1,
      "Search engines reward pages whose [[heading|headings]] and title honestly describe them.",
    ),
  ),

  part(
    "one-address",
    "One page, one address",
    explain(
      "The same page is often reachable at several addresses: with `?ref=newsletter` on the end, with or without a trailing slash. A [[canonical-url|canonical link]] says which one is official, so search engines show that one and the copies don't compete. A page that shouldn't be in search results at all, like a “not found” page or a private one, gets `noindex` instead.",
    ),
    code(
      "html",
      "official, or not at all",
      [
        "<!-- on /learn/html?ref=newsletter -->",
        '<link rel="canonical" href="https://example.com/learn/html">',
        "",
        "<!-- on a page that doesn't exist -->",
        '<meta name="robots" content="noindex">',
      ],
      {
        2: "“the real address is this one”",
        5: "“don't show this in results”",
      },
    ),
  ),

  part(
    "robots-and-sitemaps",
    "robots.txt and sitemaps",
    explain(
      "Two files at the root of a site talk to crawlers. `/robots.txt` says which paths they may visit, for example not your API. `/sitemap.xml` lists every page you want found, so they don't have to discover each by following links. Here's what this site's server answers for `/robots.txt`:",
    ),
    code(
      "http",
      "this site's robots.txt",
      [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        "",
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "",
        "Sitemap: https://…/sitemap.xml",
      ],
      {
        4: "these rules are for every crawler",
        6: "the API is data, not pages to show",
        8: "the list of every page",
      },
    ),
    keyPoints(
      "robots.txt is a request, not a lock: never rely on it to hide private pages.",
      "To keep a page out of results, use `noindex` and let crawlers read it.",
      "Keep the sitemap up to date as pages are added.",
    ),
  ),

  part(
    "this-site",
    "How this site does it",
    explain(
      "This platform is a single-page React app, so every address is served the same `index.html`. But crawlers and preview apps don't run JavaScript, so the server writes each page's own tags into that file before sending it. For `/learn/html` it sends:",
    ),
    code(
      "html",
      "the head the server writes for /learn/html",
      [
        "<title>HTML · Full-Stack Learning</title>",
        '<meta name="description" content="The structure of a web page: the elements that tell the browser what each piece of content is.">',
        '<meta property="og:title" content="HTML · Full-Stack Learning">',
        '<meta property="og:description" content="The structure of a web page: …">',
        '<meta property="og:url" content="https://…/learn/html">',
        '<meta property="og:image" content="https://…/og-image.png">',
        '<meta property="og:image:alt" content="Full-Stack Learning: learn by building one real app">',
        '<link rel="canonical" href="https://…/learn/html">',
      ],
      {
        1: "this page's title, then the site",
        2: "the topic's own summary",
        8: "an unknown address gets noindex instead",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "The same title on every page",
      language: "html",
      wrong: ["<title>My App</title> <!-- on every page -->"],
      problem:
        "Results, tabs and bookmarks all say “My App”, so nobody can tell the pages apart.",
      right: [
        "<title>Your notes · My App</title>",
        "<title>Log in · My App</title>",
      ],
      why: "Give each page a title that says what it is, then the site's name.",
    }),
    mistake({
      title: "A relative preview image",
      language: "html",
      wrong: ['<meta property="og:image" content="/preview.png">'],
      problem:
        "The chat app fetches the image from its own server, where `/preview.png` means nothing, so the card has no picture.",
      right: [
        '<meta property="og:image" content="https://notes.app/preview.png">',
      ],
      why: "Open Graph images need a full address.",
    }),
    mistake({
      title: "Words inside a picture",
      language: "html",
      wrong: ['<img src="headline.png" alt="">'],
      problem:
        "The page's main message is pixels: search engines and screen readers can't read it, and nobody can copy it.",
      right: ["<h1>Write it down, find it fast</h1>"],
      why: "Keep important words as real text; use CSS for the look.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Make it shareable",
      task: "Add Open Graph tags to the head: `og:title` with `Notes`, `og:description` with `Write and keep your notes.`, and `og:image` with `https://notes.app/preview.png`.",
      starter: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>Notes</title>",
        "  </head>",
        "  <body><h1>Notes</h1></body>",
        "</html>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The card's title",
          selector: 'head meta[property="og:title"]',
          name: "content",
          value: "Notes",
        },
        {
          kind: "attr",
          label: "The card's text",
          selector: 'head meta[property="og:description"]',
          name: "content",
          value: "Write and keep your notes.",
        },
        {
          kind: "attr",
          label: "A full image address",
          selector: 'head meta[property="og:image"]',
          name: "content",
          value: "https://notes.app/preview.png",
        },
      ],
      hint: 'Three lines in the head, like `<meta property="og:title" content="Notes">`.',
      solution: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>Notes</title>",
        '    <meta property="og:title" content="Notes">',
        '    <meta property="og:description" content="Write and keep your notes.">',
        '    <meta property="og:image" content="https://notes.app/preview.png">',
        "  </head>",
        "  <body><h1>Notes</h1></body>",
        "</html>",
      ],
    }),
    pageYourTurn({
      title: "One official address",
      task: "This page is also reached with `?ref=newsletter`. Add a canonical link to `https://notes.app/help`, and change the title to `Help · Notes`.",
      starter: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>Notes</title>",
        "  </head>",
        "  <body><h1>Help</h1></body>",
        "</html>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The canonical link",
          selector: 'head link[rel="canonical"]',
          name: "href",
          value: "https://notes.app/help",
        },
        {
          kind: "text",
          label: "This page's own title",
          selector: "title",
          text: "Help · Notes",
        },
      ],
      hint: '`<link rel="canonical" href="https://notes.app/help">` in the head, and `<title>Help · Notes</title>`.',
      solution: [
        "<!doctype html>",
        '<html lang="en">',
        "  <head>",
        '    <meta charset="utf-8">',
        "    <title>Help · Notes</title>",
        '    <link rel="canonical" href="https://notes.app/help">',
        "  </head>",
        "  <body><h1>Help</h1></body>",
        "</html>",
      ],
    }),
    pageYourTurn({
      title: "Content a search engine can read",
      task: "Make the big title a real `<h1>`, and change the link text from `click here` to `the setup guide`.",
      starter: [
        '<div class="big-title">Getting started</div>',
        '<p>To install the app, <a href="/setup">click here</a>.</p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A real heading",
          selector: "h1",
          text: "Getting started",
        },
        {
          kind: "text",
          label: "Link text that says where",
          selector: 'a[href="/setup"]',
          text: "the setup guide",
        },
        {
          kind: "missing",
          label: "No fake heading",
          selector: "div.big-title",
        },
      ],
      hint: '`<h1>Getting started</h1>`, then `<p>To install the app, read <a href="/setup">the setup guide</a>.</p>`.',
      solution: [
        "<h1>Getting started</h1>",
        '<p>To install the app, read <a href="/setup">the setup guide</a>.</p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Search and sharing cheat sheet", [
      [
        "<title>",
        "This page first, then the site; ~60 chars.",
        "<title>Help · Notes</title>",
      ],
      [
        "description",
        "A sentence on what's here; ~150 chars.",
        '<meta name="description" content="…">',
      ],
      [
        "og:title / og:image",
        "The preview card; image is a full URL.",
        'property="og:image"',
      ],
      [
        "canonical",
        "The one official address.",
        '<link rel="canonical" href="…">',
      ],
      [
        "noindex",
        "Keep a page out of results.",
        '<meta name="robots" content="noindex">',
      ],
      ["robots.txt", "Which paths crawlers may visit.", "Disallow: /api/"],
      ["sitemap.xml", "Every page you want found.", "Sitemap: …/sitemap.xml"],
      [
        "Readable content",
        "Real headings, link text, alt, text.",
        "<h1>, not a picture",
      ],
    ]),
    quickCheck(
      'A shared link shows no picture. Its head has `<meta property="og:image" content="/card.png">`. Why?',
      [
        "Open Graph doesn't support PNG",
        "The image address isn't a full URL",
        "The tag should use name, not property",
      ],
      1,
      "The preview app fetches the image from its own server, so it needs `https://…/card.png`.",
    ),
  ),
);
