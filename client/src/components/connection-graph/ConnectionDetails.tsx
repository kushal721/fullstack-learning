import type {
  FileSummary,
  RelationshipView,
  SymbolResponse,
  SymbolSummary,
} from "@fsl/shared";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { RichText } from "../ui/RichText.tsx";
import { explorerFileHref, explorerSymbolHref } from "./links.ts";

type Props = {
  data: SymbolResponse;
  /** Where a symbol links to (default: its connections in the Explorer). */
  symbolHref?: (symbol: SymbolSummary) => string;
  /** Where a file links to (default: the file in the Explorer, at its line). */
  fileHref?: (file: FileSummary) => string;
};

const linkClass =
  "inline-flex min-h-6 items-center font-mono text-accent [overflow-wrap:anywhere] hover:underline";

/**
 * The six tracer questions for one symbol (spec §13): where it is defined,
 * who uses it, what it uses, which files, what data, and what happens next.
 * Props only, so any page can show it.
 */
export function ConnectionDetails({
  data,
  symbolHref = explorerSymbolHref,
  fileHref = explorerFileHref,
}: Props) {
  const { symbol, definedIn, usedBy, uses, files, next } = data;

  // The kind keeps same-named symbols apart (route vs request "POST /api/notes").
  const symbolLink = (s: SymbolSummary) => (
    <Link to={symbolHref(s)} className={linkClass}>
      <span className="font-sans text-xs text-muted">
        {s.kind === "http-request" ? "request" : s.kind}
      </span>{" "}
      {s.name}
    </Link>
  );
  const fileLink = (f: FileSummary) => (
    <Link to={fileHref(f)} className={linkClass}>
      {f.path}
      {f.line ? `:${f.line}` : ""}
    </Link>
  );
  // How a relationship reads from this symbol's side.
  const phrase = (view: RelationshipView) => {
    const other = symbolLink(view.symbol);
    const verb = (text: string) => <span className="text-muted">{text}</span>;
    if (view.direction === "in")
      return (
        <>
          {other} {verb(view.type)} it
        </>
      );
    if (view.type === "handles")
      return (
        <>
          {other} {verb("triggers")} it
        </>
      );
    if (view.type === "receives")
      return (
        <>
          {other} {verb("arrives at")} it
        </>
      );
    return (
      <>
        It {verb(view.type)} {other}
      </>
    );
  };
  const relation = (view: RelationshipView) => (
    <li key={`${view.direction}:${view.id}`}>
      <p>{phrase(view)}</p>
      <p className="text-sm text-muted">
        <RichText text={view.explanation} />
      </p>
    </li>
  );

  return (
    <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
      <Question title="Where is it defined?">
        {definedIn ? (
          <p>{fileLink(definedIn)}</p>
        ) : symbol.kind === "http-request" ? (
          <p>
            It isn't code in a file: it is the message that travels over the
            network.
          </p>
        ) : (
          <p>Outside the Notes App: the browser or a library provides it.</p>
        )}
      </Question>

      <Question title="What does it handle?">
        <p>
          <RichText text={symbol.dataHandled ?? symbol.summary} />
        </p>
      </Question>

      <Question title="Who calls or uses it?">
        {usedBy.length ? (
          <ul className="flex flex-col gap-3">{usedBy.map(relation)}</ul>
        ) : symbol.kind === "event" ? (
          <p>The browser fires it when the user acts.</p>
        ) : (
          <p>Nothing in the Notes App points to it.</p>
        )}
      </Question>

      <Question title="What does it call or use?">
        {uses.length ? (
          <ul className="flex flex-col gap-3">{uses.map(relation)}</ul>
        ) : (
          <p>Nothing: it does its own work and returns.</p>
        )}
      </Question>

      <Question title="Which files are involved?">
        {files.length ? (
          <ul className="flex flex-col gap-1 text-sm">
            {files.map((f) => (
              <li key={f.id}>{fileLink(f)}</li>
            ))}
          </ul>
        ) : (
          <p>None in the Notes App.</p>
        )}
      </Question>

      <Question title="What happens next?">
        {next.length ? (
          <ol className="flex list-decimal flex-col gap-3 pl-5">
            {next.map((view) => (
              <li key={`next:${view.id}`}>
                {symbolLink(view.symbol)}{" "}
                <span className="text-sm text-muted">
                  <RichText text={view.explanation} />
                </span>
              </li>
            ))}
          </ol>
        ) : symbol.kind === "table" ? (
          <p>The data stays in this table until a query reads or changes it.</p>
        ) : usedBy.length ? (
          <p>
            It finishes and control returns to{" "}
            {usedBy.map((v, i) => (
              <span key={v.id}>
                {i > 0 && (i === usedBy.length - 1 ? " and " : ", ")}
                {symbolLink(v.symbol)}
              </span>
            ))}
            .
          </p>
        ) : (
          <p>Nothing further happens.</p>
        )}
      </Question>
    </div>
  );
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  );
}
