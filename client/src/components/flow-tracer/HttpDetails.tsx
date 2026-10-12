import type { HttpExchange } from "@fsl/shared";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import { CodeBlock } from "../code-viewer/CodeBlock.tsx";
import { Badge } from "../ui/Badge.tsx";
import { RichText } from "../ui/RichText.tsx";
import { formatBody, parseRawResponse, STATUS_TEXT } from "./http.ts";

const TABS = ["exchange", "errors"] as const;
type Tab = (typeof TABS)[number];

/** A labelled part of the exchange, with a "what is this?" link to its concept. */
function Part({
  label,
  concept,
  children,
}: {
  label: string;
  concept?: { slug: string; title: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-semibold">{label}</span>
        {concept && (
          <Link
            to={`/concepts/${concept.slug}`}
            className="text-xs text-accent hover:underline"
          >
            What is {concept.title}?
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

const CONCEPTS = {
  method: { slug: "http-methods", title: "an HTTP method" },
  headers: { slug: "http-headers", title: "a header" },
  status: { slug: "http-status-codes", title: "a status code" },
  json: { slug: "json", title: "JSON" },
};

function HeaderList({ headers }: { headers: [string, string][] }) {
  if (headers.length === 0) return <p className="text-sm text-muted">None.</p>;
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-xs">
      {headers.map(([name, value]) => (
        <div key={name} className="contents">
          <dt className="text-muted">{name}:</dt>
          <dd className="[overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Body({ body }: { body: string }) {
  const { text, isJson } = formatBody(body);
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <CodeBlock example={{ code: text, language: isJson ? "json" : "http" }} />
    </div>
  );
}

/**
 * One endpoint's HTTP exchange (spec §16): the request and the response in
 * labelled parts, and every error answer the backend can give.
 */
export function HttpDetails({ exchange }: { exchange: HttpExchange }) {
  const [tab, setTab] = useState<Tab>("exchange");
  const id = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    exchange: null,
    errors: null,
  });
  const response = parseRawResponse(exchange.response);

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  function onTabKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      TABS[
        (TABS.indexOf(tab) +
          (event.key === "ArrowRight" ? 1 : TABS.length - 1)) %
          TABS.length
      ]!;
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  const tabButton = (value: Tab, label: string) => (
    <button
      key={value}
      ref={(el) => {
        tabRefs.current[value] = el;
      }}
      type="button"
      role="tab"
      id={`${id}-tab-${value}`}
      aria-selected={tab === value}
      aria-controls={`${id}-panel-${value}`}
      tabIndex={tab === value ? 0 : -1}
      onClick={() => setTab(value)}
      onKeyDown={onTabKeyDown}
      className={`border-b-2 px-3 py-2 text-sm font-medium ${
        tab === value
          ? "border-accent text-accent"
          : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          The HTTP request
        </h2>
        <code className="font-mono text-sm">
          {exchange.method} {exchange.path}
        </code>
      </div>
      <p className="text-muted">{exchange.purpose}</p>

      <div
        role="tablist"
        aria-label="HTTP details"
        className="flex gap-1 border-b border-border"
      >
        {tabButton("exchange", "Request and response")}
        {tabButton("errors", `Error cases (${exchange.errorCases.length})`)}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel-exchange`}
        aria-labelledby={`${id}-tab-exchange`}
        hidden={tab !== "exchange"}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="font-semibold">Request: browser → backend</h3>
          <Part label="Method" concept={CONCEPTS.method}>
            <p>
              <Badge tone="info">{exchange.method}</Badge>
            </p>
          </Part>
          <Part label="Path">
            <code className="font-mono text-sm">{exchange.path}</code>
          </Part>
          <Part label="Headers" concept={CONCEPTS.headers}>
            <HeaderList headers={Object.entries(exchange.headers)} />
          </Part>
          <Part
            label="Body"
            concept={exchange.body ? CONCEPTS.json : undefined}
          >
            {exchange.body ? (
              <Body body={exchange.body} />
            ) : (
              <p className="text-sm text-muted">
                No body: this request only asks.
              </p>
            )}
          </Part>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="font-semibold">Response: backend → browser</h3>
          <Part label="Status" concept={CONCEPTS.status}>
            <p>
              <Badge tone="success">
                {exchange.status} {STATUS_TEXT[exchange.status] ?? ""}
              </Badge>
            </p>
          </Part>
          <Part label="Headers" concept={CONCEPTS.headers}>
            <HeaderList headers={response.headers} />
          </Part>
          <Part
            label="Body"
            concept={response.headers.length ? CONCEPTS.json : undefined}
          >
            {response.body.startsWith("(") ? (
              <p className="text-sm text-muted">
                {response.body.replace(/^\(|\)$/g, "")}
              </p>
            ) : (
              <Body body={response.body} />
            )}
          </Part>
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel-errors`}
        aria-labelledby={`${id}-tab-errors`}
        hidden={tab !== "errors"}
      >
        {exchange.errorCases.length === 0 ? (
          <p className="text-muted">This endpoint always succeeds.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {exchange.errorCases.map((error) => (
              <li
                key={`${error.status}:${error.body}`}
                className="flex flex-col gap-1.5"
              >
                <p className="flex flex-wrap items-baseline gap-2">
                  <Badge tone="warning">
                    {error.status} {STATUS_TEXT[error.status] ?? ""}
                  </Badge>
                  <span className="text-sm">
                    <RichText text={error.when} />
                  </span>
                </p>
                <code className="w-fit rounded bg-foreground/5 px-2 py-1 font-mono text-xs [overflow-wrap:anywhere]">
                  {error.body}
                </code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
