import { Component, type ErrorInfo, type ReactNode } from "react";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { PageHeader } from "../ui/PageHeader.tsx";
import { PageMeta } from "../ui/PageMeta.tsx";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches a crash while showing a page (a bug, or a part of the app that
 * failed to download), so the header and navigation keep working and the
 * learner gets a way forward instead of a blank screen. AppLayout gives it
 * a new key on every navigation, so the next page starts fresh.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Details for developers; the page itself shows none of them.
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex flex-col gap-4">
        <PageMeta
          title="Something broke"
          description="Something unexpected went wrong while showing this page."
          noIndex
        />
        <PageHeader
          title="This page broke"
          description="Something unexpected went wrong while showing this page. It isn't something you did. Try again, or carry on from the learning tree."
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            Try again
          </button>
          <ButtonLink to="/learn">Go to the learning tree</ButtonLink>
        </div>
      </div>
    );
  }
}
