// Shapes of the learning content. The server stores content in these shapes
// and the API returns them, so client and server always agree.

/** One node of the Learning Tree (spec §4.1). */
export type Topic = {
  /** Stable identifier used by other content to reference this topic. */
  id: string;
  /** URL segment: /learn/<slug>. */
  slug: string;
  /** Position among its siblings, starting at 1. */
  order: number;
  title: string;
  /** One sentence: what this topic is about. */
  summary: string;
  /** Short paragraphs explaining the topic from the basics. */
  overview: string[];
  /** Tells a beginner exactly where to begin (root and first topic). */
  whereToStart?: string;
  children: Topic[];
  /** Concepts taught in this topic (ids into the concept registry). */
  conceptIds: string[];
  /** Build steps where this topic is applied (ids into the build steps). */
  buildStepIds: string[];
};
