import { Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import BuildPage from "./pages/BuildPage.tsx";
import BuildStepPage from "./pages/BuildStepPage.tsx";
import ConceptPage from "./pages/ConceptPage.tsx";
import ConceptsPage from "./pages/ConceptsPage.tsx";
import ExplorerPage from "./pages/ExplorerPage.tsx";
import FlowPage from "./pages/FlowPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import LearnPage from "./pages/LearnPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import TopicPage from "./pages/TopicPage.tsx";

// Every URL of the platform. All pages render inside AppLayout.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:topic" element={<TopicPage />} />
        <Route path="concepts" element={<ConceptsPage />} />
        <Route path="concepts/:concept" element={<ConceptPage />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="build/:step" element={<BuildStepPage />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="project" element={<ProjectPage />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
