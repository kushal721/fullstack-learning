/** Shown while data is loading. Screen readers announce it politely. */
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <p role="status" className="py-8 text-muted">
      {label}
    </p>
  );
}
