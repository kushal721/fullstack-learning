import { useParams } from "react-router";

export default function BuildStepPage() {
  const { step } = useParams();
  return (
    <>
      <title>Build step · Full-Stack Learning</title>
      <h1 className="text-3xl font-semibold tracking-tight">
        Build step: {step}
      </h1>
      <p className="mt-2 text-muted">
        One step of the build: what we do, why, and what changes in the project.
      </p>
    </>
  );
}
