import type { HealthResponse } from "@fsl/shared";
import { useEffect, useState } from "react";

type ApiStatus = "checking" | "ok" | "unreachable";

export default function App() {
  // Temporary: shows the client can reach the API. Replaced by the app shell.
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<HealthResponse>) : null))
      .then((body) =>
        setApiStatus(body?.status === "ok" ? "ok" : "unreachable"),
      )
      .catch(() => {
        if (!controller.signal.aborted) setApiStatus("unreachable");
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-24">
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
      <p className="text-sm text-muted" role="status">
        API: {apiStatus}
      </p>
    </main>
  );
}
