import { lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import HomePage from "./pages/HomePage.tsx";

// Every page except the home page is its own file, downloaded the first
// time it is visited: the home page doesn't pay for the code viewer, the
// graphs or the practice runner. AppLayout shows a loading state meanwhile.
const LearnPage = lazy(() => import("./pages/LearnPage.tsx"));
const TopicPage = lazy(() => import("./pages/TopicPage.tsx"));
const CourseMapPage = lazy(() => import("./pages/CourseMapPage.tsx"));
const ConceptPage = lazy(() => import("./pages/ConceptPage.tsx"));
const BuildPage = lazy(() => import("./pages/BuildPage.tsx"));
const BuildStepPage = lazy(() => import("./pages/BuildStepPage.tsx"));
const ExplorerPage = lazy(() => import("./pages/ExplorerPage.tsx"));
const FlowPage = lazy(() => import("./pages/FlowPage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"));

// Every URL of the platform. All pages render inside AppLayout.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        {/* One route for a topic and its guided steps, so moving between
            them keeps the page (and keyboard focus) instead of rebuilding. */}
        <Route path="learn/:topic/:step?" element={<TopicPage />} />
        <Route path="course-map" element={<CourseMapPage />} />
        {/* Sections that moved (#384): concepts live in the glossary panel,
            practice in the checks, the project view in the Explorer. */}
        <Route path="concepts" element={<Moved to="/course-map" />} />
        <Route path="concepts/:concept" element={<ConceptPage />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="build/:step" element={<BuildStepPage />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="project" element={<Moved to="/explorer" />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="practice" element={<Moved to="/course-map" />} />
        <Route path="practice/:exercise" element={<Moved to="/course-map" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/** An old address: go to the new one, keeping ?query (e.g. /project?step=4). */
function Moved({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}
