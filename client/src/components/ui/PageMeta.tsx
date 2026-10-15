const SITE = "Full-Stack Learning";
const MAX_DESCRIPTION = 160;

/** Plain text for a meta description: no `backticks`, one line, short. */
function metaDescription(text: string) {
  const plain = text.replace(/`/g, "").replace(/\s+/g, " ").trim();
  return plain.length > MAX_DESCRIPTION
    ? `${plain.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…`
    : plain;
}

type Props = {
  /** The page's own title; the site name is added. None for the home page. */
  title?: string;
  description: string;
  /** Not-found and error pages shouldn't appear in search results. */
  noIndex?: boolean;
};

/**
 * The page's title, description and Open Graph tags. React 19 moves them
 * into <head>. The server puts the same tags into the HTML for the first
 * load (for link previews and crawlers); main.tsx removes those copies, so
 * there is always exactly one of each.
 */
export function PageMeta({ title, description, noIndex = false }: Props) {
  const fullTitle = title ? `${title} · ${SITE}` : SITE;
  const text = metaDescription(description);
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={text} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={text} />
      {noIndex && <meta name="robots" content="noindex" />}
    </>
  );
}
