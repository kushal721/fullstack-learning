import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "How the Web Works" topic. Concept
// entries are the short, beginner-sized form of a concept page.
export const howTheWebWorksGlossary: GlossaryEntry[] = [
  {
    id: "how-the-web-works",
    topicId: "how-the-web-works",
    term: "How the web works",
    aliases: ["the web", "web"],
    kind: "concept",
    short:
      "A page reaches your screen through requests and responses between your browser and a server.",
    body: "Your browser (the client) sends a request for a page, and a server sends back a response. The rules for these messages are [[http-request-response|HTTP]], and [[https]] is the encrypted version. A URL says which server to ask and what to ask it for, and [[domain-dns|DNS]] turns the name into the server's address.",
    conceptPageId: "how-the-web-works",
  },
];
