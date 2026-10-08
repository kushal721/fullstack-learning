import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";

export default function NotFoundPage() {
  return (
    <>
      <title>Page not found · Full-Stack Learning</title>
      <PageHeader
        title="Page not found"
        description="There is nothing at this address."
      />
      <ButtonLink to="/learn">Go to the learning tree</ButtonLink>
    </>
  );
}
