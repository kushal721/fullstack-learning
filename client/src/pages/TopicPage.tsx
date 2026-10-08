import { useParams } from "react-router";

export default function TopicPage() {
  const { topic } = useParams();
  return (
    <>
      <title>Topic · Full-Stack Learning</title>
      <h1 className="text-3xl font-semibold tracking-tight">Topic: {topic}</h1>
      <p className="mt-2 text-muted">
        What this topic is, why it matters and where it fits in the whole
        application.
      </p>
    </>
  );
}
