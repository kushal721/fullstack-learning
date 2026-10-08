import type { TopicSummary } from "@fsl/shared";
import { Link } from "react-router";

type Props = { previous?: TopicSummary; next?: TopicSummary };

/** "Previous / Next topic" links at the end of a topic page. */
export function TopicNav({ previous, next }: Props) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Topics"
      className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {previous && (
        <Link
          to={`/learn/${previous.slug}`}
          rel="prev"
          className="rounded-lg border border-border p-4 hover:border-accent hover:bg-accent/5"
        >
          <span className="block text-sm text-muted">← Previous topic</span>
          <span className="font-medium">{previous.title}</span>
        </Link>
      )}
      {next && (
        <Link
          to={`/learn/${next.slug}`}
          rel="next"
          className="rounded-lg border border-border p-4 text-right hover:border-accent hover:bg-accent/5 sm:col-start-2"
        >
          <span className="block text-sm text-muted">Next topic →</span>
          <span className="font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
