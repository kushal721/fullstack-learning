import type { GlossaryEntrySummary, TryItWidget } from "@fsl/shared";
import { useState } from "react";
import { Badge } from "../ui/Badge.tsx";
import { StepText } from "./StepText.tsx";

const URL_PARTS = [
  {
    text: "https://",
    info: "**[[protocol|Protocol]]**: how to talk. `https` means an encrypted connection, so nobody in between can read it.",
  },
  {
    text: "notes.app",
    info: "**[[domain|Domain]]**: which server to talk to. [[dns|DNS]] turns this name into the server's [[ip-address|IP address]].",
  },
  {
    text: "/notes/7",
    info: "**[[path|Path]]**: what you want from that server. Here: note number 7.",
  },
  {
    text: "?sort=new",
    info: "**[[query|Query]]**: extra options for the request, like sorting or searching.",
  },
];

/** Click each part of a URL to see what it does. */
function UrlAnatomy({ glossary }: { glossary: GlossaryEntrySummary[] }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <section
      aria-label="Try it: take a URL apart"
      className="rounded-lg border border-border p-4"
    >
      <div className="mb-3">
        <Badge tone="warning">Try it · take a URL apart</Badge>
      </div>
      <div
        role="group"
        aria-label="Parts of the address"
        className="flex flex-wrap gap-1 rounded-md border border-border bg-[var(--code-bg)] p-2 font-mono text-base"
      >
        {URL_PARTS.map((part, i) => (
          <button
            key={part.text}
            type="button"
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
            className={`rounded px-1.5 py-1 ${
              picked === i
                ? "bg-accent text-white dark:text-black"
                : "underline decoration-dotted underline-offset-4 hover:bg-accent/10"
            }`}
          >
            {part.text}
          </button>
        ))}
      </div>
      <p
        aria-live="polite"
        className={`mt-3 min-h-14 leading-7 ${picked === null ? "text-muted" : ""}`}
      >
        {picked === null ? (
          "Click a part of the address to see what it does."
        ) : (
          <StepText text={URL_PARTS[picked]!.info} glossary={glossary} />
        )}
      </p>
    </section>
  );
}

const CASES = [
  {
    situation: "The page exists and you're allowed to see it",
    code: "200",
    name: "OK",
    tone: "text-green-800 dark:text-green-400",
    meaning: "Everything worked; the body is what you asked for.",
  },
  {
    situation: "The page moved to a new address",
    code: "301",
    name: "Moved Permanently",
    tone: "text-accent",
    meaning: "The browser follows the new address on its own.",
  },
  {
    situation: "You're not logged in",
    code: "401",
    name: "Unauthorized",
    tone: "text-amber-700 dark:text-amber-300",
    meaning: "4xx: the request had a problem. Log in and try again.",
  },
  {
    situation: "The page doesn't exist",
    code: "404",
    name: "Not Found",
    tone: "text-amber-700 dark:text-amber-300",
    meaning: "4xx: there is nothing at that path.",
  },
  {
    situation: "The server had a bug",
    code: "500",
    name: "Server Error",
    tone: "text-red-700 dark:text-red-400",
    meaning: "5xx: the server failed. It isn't your fault.",
  },
];

/** Pick a situation and see which status code the server answers with. */
function StatusCodes() {
  const [picked, setPicked] = useState(0);
  const chosen = CASES[picked]!;
  return (
    <section
      aria-label="Try it: what does the server answer?"
      className="rounded-lg border border-border p-4"
    >
      <div className="mb-3">
        <Badge tone="warning">Try it · what does the server answer?</Badge>
      </div>
      <div
        role="group"
        aria-label="Situations"
        className="flex flex-wrap gap-2"
      >
        {CASES.map((c, i) => (
          <button
            key={c.code}
            type="button"
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
            className={`rounded-full border px-3 py-1 text-left text-sm ${
              picked === i
                ? "border-accent bg-accent/10 text-accent"
                : "border-border hover:bg-foreground/5"
            }`}
          >
            {c.situation}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className="mt-3 flex items-center gap-4 rounded-md border border-border p-3"
      >
        <span className={`font-mono text-3xl font-semibold ${chosen.tone}`}>
          {chosen.code}
        </span>
        <span>
          <span className="block font-medium">{chosen.name}</span>
          <span className="block text-sm text-muted">{chosen.meaning}</span>
        </span>
      </div>
    </section>
  );
}

/** One of the fixed set of interactive widgets a step can show. */
export function TryIt({
  widget,
  glossary,
}: {
  widget: TryItWidget;
  glossary: GlossaryEntrySummary[];
}) {
  switch (widget) {
    case "url-anatomy":
      return <UrlAnatomy glossary={glossary} />;
    case "status-codes":
      return <StatusCodes />;
  }
}
