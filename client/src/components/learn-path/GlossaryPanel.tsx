import type {
  GlossaryEntryResponse,
  GlossaryEntrySummary,
  GlossaryIndexResponse,
  StepResponse,
} from "@fsl/shared";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useApi } from "../../hooks/useApi.ts";
import { apiPaths } from "../../services/api.ts";
import { Badge } from "../ui/Badge.tsx";
import { ErrorState } from "../ui/ErrorState.tsx";
import { Loading } from "../ui/Loading.tsx";
import { searchGlossary } from "./glossary-search.ts";
import { LEVEL_STYLE, glossaryHref, stepHref } from "./levels.ts";
import { useGlossaryView } from "./glossary-view.ts";
import { StepText } from "./StepText.tsx";

type Props = {
  topicSlug: string;
  /** The step being read, for "In this step"; none on the overview. */
  stepId?: string;
};

const kindBadge = (entry: Pick<GlossaryEntrySummary, "kind">) => (
  <Badge tone={entry.kind === "concept" ? "info" : "neutral"}>
    {entry.kind === "concept" ? "Concept" : "Term"}
  </Badge>
);

function EntryRow({ entry }: { entry: GlossaryEntrySummary }) {
  const { search } = useLocation();
  return (
    <li>
      <Link
        to={glossaryHref(search, { term: entry.id })}
        className="flex flex-col gap-0.5 rounded-md px-3 py-2 hover:bg-foreground/5"
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{entry.term}</span>
          {kindBadge(entry)}
        </span>
        <span className="line-clamp-2 text-sm text-muted">{entry.short}</span>
      </Link>
    </li>
  );
}

function Results({
  entries,
  query,
}: {
  entries: GlossaryEntrySummary[];
  query: string;
}) {
  const results = searchGlossary(entries, query);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted" role="status">
        {results.length
          ? `${results.length} result${results.length > 1 ? "s" : ""} for “${query}”`
          : `Nothing called “${query}” yet.`}
      </p>
      {results.length > 0 ? (
        <ul className="-mx-3 flex flex-col">
          {results.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm leading-6">
          Try a shorter word, or one from the step you&apos;re reading. The site
          search (⌘K) also looks through concepts, files and code.
        </p>
      )}
    </div>
  );
}

type Filter = "all" | "concept" | "term";

function Home({
  entries,
  inStep,
  stepNumber,
}: {
  entries: GlossaryEntrySummary[];
  inStep: GlossaryEntrySummary[];
  stepNumber?: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (f: Filter) =>
    entries.filter((e) => f === "all" || e.kind === f).length;
  const shown = entries.filter((e) => filter === "all" || e.kind === filter);
  return (
    <div className="flex flex-col gap-5">
      {inStep.length > 0 && (
        <section aria-labelledby="glossary-in-step">
          <h3
            id="glossary-in-step"
            className="mb-2 text-sm font-medium text-muted"
          >
            In step {stepNumber}
          </h3>
          <ul className="-mx-3 flex flex-col">
            {inStep.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="glossary-all">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 id="glossary-all" className="text-sm font-medium text-muted">
            All terms and concepts
          </h3>
          <div role="group" aria-label="Show" className="ml-auto flex gap-1">
            {(
              [
                ["all", "All"],
                ["concept", "Concepts"],
                ["term", "Terms"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  filter === value
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-foreground/5"
                }`}
              >
                {label} {count(value)}
              </button>
            ))}
          </div>
        </div>
        <ul className="-mx-3 flex flex-col">
          {shown.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function Entry({
  id,
  trail,
  onBack,
  currentStepId,
}: {
  id: string;
  trail: string[];
  onBack: () => void;
  currentStepId?: string;
}) {
  const { search } = useLocation();
  const { data, error, isLoading, reload } = useApi<GlossaryEntryResponse>(
    apiPaths.glossaryEntry(id),
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const terms = useApi<GlossaryIndexResponse>(apiPaths.glossary()).data
    ?.entries;
  const termOf = (other: string) =>
    terms?.find((e) => e.id === other)?.term ?? other;

  // Each new entry is read from its title.
  useEffect(() => {
    if (data) heading.current?.focus({ preventScroll: true });
  }, [data]);

  if (isLoading) return <Loading label="Loading the explanation…" />;
  if (error || !data) {
    return (
      <ErrorState
        message={
          error?.isNotFound
            ? `There is no glossary entry “${id}”.`
            : (error?.message ?? "No data received.")
        }
        onRetry={reload}
        homeLink={false}
      />
    );
  }

  const { entry, introducedIn, usedIn, related, conceptPage } = data;
  const others = usedIn.filter((s) => s.id !== introducedIn?.id);
  const stepLink = (step: (typeof usedIn)[number]) =>
    `${stepHref(step.topic.slug, step.id)}${glossaryHref(search, { term: id })}`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-accent hover:underline"
        >
          ← {trail.length > 1 ? termOf(trail.at(-2)!) : "All words"}
        </button>
        {trail.length > 1 && (
          <nav aria-label="Words you looked up" className="mt-2">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
              {trail.map((other, i) => (
                <li key={other} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true">›</span>}
                  {i === trail.length - 1 ? (
                    <span
                      aria-current="true"
                      className="font-medium text-foreground"
                    >
                      {termOf(other)}
                    </span>
                  ) : (
                    <Link
                      to={glossaryHref(search, { term: other })}
                      className="underline hover:text-accent"
                    >
                      {termOf(other)}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {kindBadge(entry)}
          {introducedIn && (
            <Badge tone={LEVEL_STYLE[introducedIn.level].tone}>
              {LEVEL_STYLE[introducedIn.level].name}
            </Badge>
          )}
        </div>
        <h3
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight"
        >
          {entry.term}
        </h3>
        {entry.aliases && entry.aliases.length > 0 && (
          <p className="text-sm text-muted">
            Also called: {entry.aliases.slice(0, 4).join(", ")}
          </p>
        )}
      </div>

      <p className="text-lg leading-7">
        <StepText text={entry.short} glossary={related} />
      </p>
      <p className="leading-7">
        <StepText text={entry.body} glossary={related} />
      </p>
      {entry.analogy && (
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 leading-7">
          <span className="font-medium">In plain words: </span>
          {entry.analogy}
        </p>
      )}

      {related.length > 0 && (
        <section aria-labelledby="glossary-related">
          <h4
            id="glossary-related"
            className="mb-2 text-sm font-medium text-muted"
          >
            Related
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {related.map((other) => (
              <li key={other.id}>
                <Link
                  to={glossaryHref(search, { term: other.id })}
                  className="inline-flex min-h-8 items-center rounded-full border border-border px-2.5 text-sm hover:border-accent hover:text-accent"
                >
                  {other.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {introducedIn && (
        <section
          aria-labelledby="glossary-taught"
          className="flex flex-col gap-2"
        >
          <h4 id="glossary-taught" className="text-sm font-medium text-muted">
            Where it&apos;s taught
          </h4>
          <Link
            to={stepLink(introducedIn)}
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-accent hover:bg-accent/5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-muted">
                {introducedIn.id === currentStepId
                  ? "You're on this step"
                  : `Introduced in ${introducedIn.topic.title}`}
              </span>
              <span className="font-medium">
                Step {introducedIn.number} · {introducedIn.title}
              </span>
            </span>
            <Badge tone={LEVEL_STYLE[introducedIn.level].tone}>
              {LEVEL_STYLE[introducedIn.level].name}
            </Badge>
          </Link>
          {others.length > 0 && (
            <p className="text-sm text-muted">
              Also used in{" "}
              {others.map((step, i) => (
                <span key={`${step.topic.id}-${step.id}`}>
                  {i > 0 && ", "}
                  <Link to={stepLink(step)} className="text-accent underline">
                    step {step.number}
                    {step.topic.id !== introducedIn.topic.id &&
                      ` of ${step.topic.title}`}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {conceptPage && (
        <Link
          to={`/concepts/${conceptPage.slug}`}
          className="text-sm text-accent underline"
        >
          Read the full concept page: {conceptPage.title} →
        </Link>
      )}

      <p className="rounded-lg bg-foreground/5 p-3 text-sm leading-6 text-muted">
        Still stuck? Every underlined word above opens its own explanation. You
        can also search, or select any text on the page and choose “Look up”.
      </p>
    </div>
  );
}

/**
 * The glossary side panel: explains a word without leaving the step, lets
 * the learner follow words inside the explanation, and searches every term
 * and concept. Not modal: the step stays readable and usable beside it.
 */
export function GlossaryPanel({ topicSlug, stepId }: Props) {
  const view = useGlossaryView();
  const navigate = useNavigate();
  const { search } = useLocation();
  const isOpen = view !== null;
  const index = useApi<GlossaryIndexResponse>(
    isOpen ? apiPaths.glossary() : null,
  );
  // Already loaded by the step player, so this costs nothing.
  const step = useApi<StepResponse>(
    isOpen && stepId ? apiPaths.step(topicSlug, stepId) : null,
  );

  // The words looked up since the panel opened, for the trail and Back.
  // Updated while rendering when the entry changes (no extra effect).
  const [trail, setTrail] = useState<string[]>([]);
  const term = view?.kind === "term" ? view.term : null;
  const viewKey = isOpen ? (term ?? "") : null;
  const [seen, setSeen] = useState<string | null>(null);
  if (viewKey !== seen) {
    setSeen(viewKey);
    if (!isOpen) setTrail([]);
    else if (term !== null) {
      const at = trail.indexOf(term);
      setTrail(at >= 0 ? trail.slice(0, at + 1) : [...trail, term].slice(-6));
    }
  }

  // Remember what opened the panel, so closing it can go back there.
  const opener = useRef<HTMLElement | null>(null);
  const searchBox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    opener.current = document.activeElement as HTMLElement | null;
    if (term === null) searchBox.current?.focus();
    // Only when the panel opens, not on every change of view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function close() {
    navigate(glossaryHref(search, null));
    const back = opener.current;
    requestAnimationFrame(() => back?.isConnected && back.focus());
  }

  function goBack() {
    navigate(
      glossaryHref(
        search,
        trail.length > 1 ? { term: trail.at(-2)! } : { find: "" },
      ),
    );
  }

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // The first Esc in a filled search box only clears it.
      if (event.target === searchBox.current && searchBox.current?.value)
        return;
      close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  if (!isOpen) return null;

  const entries = [...(index.data?.entries ?? [])];
  const query = view.kind === "find" ? view.find : "";

  return (
    <aside
      data-lookup-area
      aria-labelledby="glossary-title"
      className="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[26rem]"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h2 id="glossary-title" className="font-semibold">
          Glossary
        </h2>
        <span className="text-sm text-muted">terms and concepts</span>
        <button
          type="button"
          onClick={close}
          aria-label="Close glossary"
          className="ml-auto flex size-9 items-center justify-center rounded-md text-lg hover:bg-foreground/5"
        >
          ✕
        </button>
      </div>
      <div className="border-b border-border p-3">
        <label htmlFor="glossary-search" className="sr-only">
          Search terms and concepts
        </label>
        <input
          ref={searchBox}
          id="glossary-search"
          type="search"
          autoComplete="off"
          placeholder="Search terms and concepts…"
          value={query}
          onChange={(event) =>
            navigate(glossaryHref(search, { find: event.target.value }), {
              replace: true,
            })
          }
          onKeyDown={(event) => {
            if (event.key !== "Enter" || !query) return;
            const first = searchGlossary(entries, query)[0];
            if (first) navigate(glossaryHref(search, { term: first.id }));
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {view.kind === "term" ? (
          <Entry
            key={view.term}
            id={view.term}
            trail={trail}
            onBack={goBack}
            currentStepId={stepId}
          />
        ) : index.isLoading ? (
          <Loading label="Loading the glossary…" />
        ) : index.error ? (
          <ErrorState
            message={index.error.message}
            onRetry={index.reload}
            homeLink={false}
          />
        ) : query ? (
          <Results entries={entries} query={query} />
        ) : (
          <Home
            entries={entries}
            inStep={step.data?.glossary ?? []}
            stepNumber={step.data?.step.number}
          />
        )}
      </div>
    </aside>
  );
}
