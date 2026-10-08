import type { HealthResponse } from "@fsl/shared";
import { navItems } from "../components/layout/nav-items.ts";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Card } from "../components/ui/Card.tsx";
import { useApi } from "../hooks/useApi.ts";

export default function HomePage() {
  const health = useApi<HealthResponse>("/health");
  const apiStatus = health.isLoading
    ? "checking"
    : health.data?.status === "ok"
      ? "ok"
      : "unreachable";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 py-12">
      <title>Full-Stack Learning</title>
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-semibold tracking-tight">
          Full-Stack Learning
        </h1>
        <p className="text-lg leading-8 text-muted">
          Learn how a real web application works by building one — from an empty
          project to a deployed app.
        </p>
        <blockquote className="border-l-4 border-border pl-4 text-lg italic">
          Don&apos;t just learn what to write. Understand what happens when you
          write it.
        </blockquote>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/learn">Start learning</ButtonLink>
          <ButtonLink to="/build" variant="secondary">
            Build the Notes App
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="mb-4 text-xl font-semibold">
          What you&apos;ll find here
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Card title={item.label} to={item.to}>
                {item.description}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-muted" role="status">
        API: {apiStatus}
      </p>
    </div>
  );
}
