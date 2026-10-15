import { getOrderedSteps, getStepBySlug } from "./build-journey.js";
import { getConceptBySlug, getConceptsInReadingOrder } from "./concepts.js";
import { getFlow, getFlows } from "./flow-tracer.js";
import { getAllTopics, getTopicBySlug } from "./learning-tree.js";
import { getExercise, getExercises } from "./practice.js";

export const SITE_NAME = "Full-Stack Learning";
const MAX_DESCRIPTION = 160;

export type PageMeta = {
  title: string;
  description: string;
  /** 404 for addresses that match no page. */
  status: 200 | 404;
};

// The same words the pages use (client/src/pages/*), so the first load and
// the rendered page agree.
const SECTIONS: Record<string, { title?: string; description: string }> = {
  "/": {
    description:
      "Learn how a real web application works by building one, from an empty project to a deployed app.",
  },
  "/learn": {
    title: "Learn",
    description:
      "The learning tree: every topic of full-stack development in order, from how the web works to deployment.",
  },
  "/concepts": {
    title: "Concepts",
    description:
      "Every concept explained the same way, from the basics, and connected to the Notes App's real code.",
  },
  "/build": {
    title: "Build",
    description:
      "Build the Notes App step by step, from an empty folder to a deployed full-stack app.",
  },
  "/explorer": {
    title: "Explorer",
    description:
      "Read the Notes App's code file by file and trace how every piece connects.",
  },
  "/project": {
    title: "Project",
    description:
      "Watch the Notes App grow: the files each build step adds, changes and removes.",
  },
  "/flow": {
    title: "Flow",
    description:
      "Follow data step by step, from a click in the browser to the database and back to the screen.",
  },
  "/practice": {
    title: "Practice",
    description:
      "Test yourself on the Notes App's real code: predict, trace, find, fix and plan features.",
  },
};

/** One line of plain text, without `backticks`, short enough for a snippet. */
export function plainDescription(text: string): string {
  const plain = text.replace(/`/g, "").replace(/\s+/g, " ").trim();
  return plain.length > MAX_DESCRIPTION
    ? `${plain.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…`
    : plain;
}

function page(title: string | undefined, description: string): PageMeta {
  return {
    title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
    description: plainDescription(description),
    status: 200,
  };
}

const NOT_FOUND: PageMeta = {
  title: `Page not found · ${SITE_NAME}`,
  description: "There is nothing at this address.",
  status: 404,
};

/**
 * Title and description for a page address, from the same content the
 * pages show, so link previews and crawlers see the real page without
 * running JavaScript.
 */
export function pageMeta(pathname: string, search = ""): PageMeta {
  const path = pathname.replace(/\/+$/, "") || "/";
  const section = SECTIONS[path];
  if (section) {
    if (path === "/flow") {
      const flow = getFlow(new URLSearchParams(search).get("flow") ?? "");
      if (flow) return page(`${flow.title} · Flow`, flow.summary);
    }
    return page(section.title, section.description);
  }

  const [, area, slug, extra] = path.split("/");
  if (!slug || extra !== undefined) return NOT_FOUND;
  const decoded = decodeURIComponent(slug);
  switch (area) {
    case "learn": {
      const topic = getTopicBySlug(decoded);
      return topic ? page(topic.title, topic.summary) : NOT_FOUND;
    }
    case "concepts": {
      const concept = getConceptBySlug(decoded);
      return concept ? page(concept.title, concept.summary) : NOT_FOUND;
    }
    case "build": {
      const step = getStepBySlug(decoded);
      return step ? page(`${step.order}. ${step.title}`, step.goal) : NOT_FOUND;
    }
    case "practice": {
      const exercise = getExercise(decoded);
      return exercise
        ? page(`${exercise.title} · Practice`, exercise.prompt)
        : NOT_FOUND;
    }
    default:
      return NOT_FOUND;
  }
}

/** Every page worth listing in the sitemap, as paths. */
export function sitemapPaths(): string[] {
  return [
    ...Object.keys(SECTIONS),
    ...getAllTopics().map((topic) => `/learn/${topic.slug}`),
    ...getConceptsInReadingOrder().map((c) => `/concepts/${c.slug}`),
    ...getOrderedSteps().map((step) => `/build/${step.slug}`),
    ...getFlows().map((flow) => `/flow?flow=${flow.id}`),
    ...getExercises().map((exercise) => `/practice/${exercise.id}`),
  ];
}
