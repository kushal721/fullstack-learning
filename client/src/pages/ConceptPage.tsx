import { useParams } from "react-router";

export default function ConceptPage() {
  const { concept } = useParams();
  return (
    <>
      <title>Concept · Full-Stack Learning</title>
      <h1 className="text-3xl font-semibold tracking-tight">
        Concept: {concept}
      </h1>
      <p className="mt-2 text-muted">
        One concept, explained from the basics and connected to the Notes App.
      </p>
    </>
  );
}
