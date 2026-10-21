import { lazy } from "react";
import { Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import HomePage from "./pages/HomePage.tsx";

// Every page except the home page is its own file, downloaded the first
// time it is visited: the home page doesn't pay for the code viewer, the
// graphs or the practice runner. AppLayout shows a loading state meanwhile.
const LearnPage = lazy(() => import("./pages/LearnPage.tsx"));
const TopicPage = lazy(() => import("./pages/TopicPage.tsx"));
const ConceptsPage = lazy(() => import("./pages/ConceptsPage.tsx"));
const ConceptPage = lazy(() => import("./pages/ConceptPage.tsx"));
const BuildPage = lazy(() => import("./pages/BuildPage.tsx"));
const BuildStepPage = lazy(() => import("./pages/BuildStepPage.tsx"));
const ExplorerPage = lazy(() => import("./pages/ExplorerPage.tsx"));
const ProjectPage = lazy(() => import("./pages/ProjectPage.tsx"));
const FlowPage = lazy(() => import("./pages/FlowPage.tsx"));
const PracticePage = lazy(() => import("./pages/PracticePage.tsx"));
const ExercisePage = lazy(() => import("./pages/ExercisePage.tsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"));

// Every URL of the platform. All pages render inside AppLayout.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:topic" element={<TopicPage />} />
        <Route path="learn/:topic/:step" element={<TopicPage />} />
        <Route path="concepts" element={<ConceptsPage />} />
        <Route path="concepts/:concept" element={<ConceptPage />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="build/:step" element={<BuildStepPage />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="project" element={<ProjectPage />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="practice/:exercise" element={<ExercisePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
