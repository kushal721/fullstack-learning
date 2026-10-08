import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <>
      <title>Page not found · Full-Stack Learning</title>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted">
        There is nothing at this address.{" "}
        <Link to="/learn" className="text-accent underline">
          Go to the learning tree
        </Link>
        .
      </p>
    </>
  );
}
