import type { BuildStep, BuildStepSummary, ConceptSummary } from "@fsl/shared";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { RichText } from "../ui/RichText.tsx";

type Props = {
  step: BuildStep;
  concepts: ConceptSummary[];
  previous?: BuildStepSummary;
  next?: BuildStepSummary;
};

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

const linkClass = "text-accent hover:underline";

/**
 * The end of every step (spec §44): what you just learned and created, what
 * you can now do, and what comes next and why, so a learner never wonders
 * "where am I?".
 */
export function NextStep({ step, concepts, previous, next }: Props) {
  return (
    <>
      <section
        aria-labelledby="summary"
        className="flex scroll-mt-6 flex-col gap-5 rounded-lg border border-border bg-foreground/[0.02] p-5"
      >
        <h2 id="summary" className="text-xl font-semibold">
          Where you are now
        </h2>
        <Part title="You just learned">
          {concepts.length ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {concepts.map((concept) => (
                <li key={concept.id}>
                  <Link to={`/concepts/${concept.slug}`} className={linkClass}>
                    {concept.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new concepts in this step.</p>
          )}
        </Part>
        <Part title="You just created">
          {step.filesCreated.length ? (
            <ul className="flex flex-col gap-1">
              {step.filesCreated.map((path) => (
                <li key={path}>
                  <Link
                    to={`/explorer?file=${encodeURIComponent(path)}`}
                    className={`inline-flex min-h-6 items-center font-mono text-sm [overflow-wrap:anywhere] ${linkClass}`}
                  >
                    {path}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new files: this step was about understanding and changing.</p>
          )}
        </Part>
        <Part title="You are now able to">
          <p>
            <RichText text={step.enables} />
          </p>
        </Part>
        {next ? (
          <>
            <Part title="Next">
              <p>
                <Link
                  to={`/build/${next.slug}`}
                  className={`font-medium ${linkClass}`}
                >
                  {next.order}. {next.title}
                </Link>
              </p>
            </Part>
            {step.nextWhy && (
              <Part title="Why this comes next">
                <p>
                  <RichText text={step.nextWhy} />
                </p>
              </Part>
            )}
          </>
        ) : (
          <Part title="Next">
            <p>
              You have built the whole Notes App. Look back at how it grew on
              the{" "}
              <Link to="/project" className={linkClass}>
                Project
              </Link>{" "}
              page, or explore any file in the{" "}
              <Link to="/explorer" className={linkClass}>
                Explorer
              </Link>
              .
            </p>
          </Part>
        )}
      </section>

      <nav
        aria-label="Build steps navigation"
        className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
      >
        {previous && (
          <Link
            to={`/build/${previous.slug}`}
            rel="prev"
            className="rounded-lg border border-border p-4 hover:border-accent hover:bg-accent/5"
          >
            <span className="block text-sm text-muted">← Previous step</span>
            <span className="font-medium">
              {previous.order}. {previous.title}
            </span>
          </Link>
        )}
        {next && (
          <Link
            to={`/build/${next.slug}`}
            rel="next"
            className="rounded-lg border border-border p-4 text-right hover:border-accent hover:bg-accent/5 sm:col-start-2"
          >
            <span className="block text-sm text-muted">Next step →</span>
            <span className="font-medium">
              {next.order}. {next.title}
            </span>
          </Link>
        )}
      </nav>
    </>
  );
}
