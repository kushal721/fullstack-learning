import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { Loading } from "../ui/Loading.tsx";
import { RouteErrorBoundary } from "./RouteErrorBoundary.tsx";
import { SiteHeader } from "./SiteHeader.tsx";

// The frame around every page: skip link, header, and the current page.
export function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 focus:outline-none"
      >
        <RouteErrorBoundary key={pathname}>
          {/* Pages are downloaded on first visit (see App.tsx). */}
          <Suspense fallback={<Loading label="Loading the page…" />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
