import { Link } from "react-router";

type Props = {
  message: string;
  onRetry?: () => void;
  /**
   * Offer a way back to the learning tree. On by default; turn it off
   * where the error only fills a panel inside a working page.
   */
  homeLink?: boolean;
};

// The API's generic messages, said in a way that helps the learner.
const FRIENDLY: Record<string, string> = {
  "Something went wrong":
    "The server had a problem. It isn't something you did; please try again in a moment.",
  "Something went wrong.":
    "The server had a problem. It isn't something you did; please try again in a moment.",
  "Could not reach the server.":
    "Could not reach the server. Check your internet connection, then try again.",
};

/** Shown when loading failed, with a way to try again. */
export function ErrorState({ message, onRetry, homeLink = true }: Props) {
  return (
    <div role="alert" className="rounded-lg border border-border p-4 text-sm">
      <p className="font-medium">We couldn't load this</p>
      <p className="mt-1 text-muted">{FRIENDLY[message] ?? message}</p>
      {(onRetry || homeLink) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-border px-3 py-1.5 font-medium hover:bg-foreground/5"
            >
              Try again
            </button>
          )}
          {homeLink && (
            <Link to="/learn" className="text-accent hover:underline">
              Go to the learning tree
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
