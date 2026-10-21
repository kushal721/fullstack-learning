import type { GlossaryEntry } from "@fsl/shared";

/**
 * A topic's way of writing its glossary entries: id, name, the one-line
 * answer, the body, and optionally aliases, an analogy or kind "concept".
 */
export const termsOf =
  (topicId: string) =>
  (
    id: string,
    name: string,
    short: string,
    body: string,
    extra: Partial<Pick<GlossaryEntry, "aliases" | "analogy" | "kind">> = {},
  ): GlossaryEntry => ({
    id,
    topicId,
    term: name,
    kind: "term",
    short,
    body,
    ...extra,
  });
