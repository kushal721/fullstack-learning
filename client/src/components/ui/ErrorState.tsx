type Props = {
  message: string;
  onRetry?: () => void;
};

/** Shown when loading failed, with a way to try again. */
export function ErrorState({ message, onRetry }: Props) {
  return (
    <div role="alert" className="rounded-lg border border-border p-4 text-sm">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-border px-3 py-1.5 font-medium hover:bg-foreground/5"
        >
          Try again
        </button>
      )}
    </div>
  );
}
