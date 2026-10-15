import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function NotFoundPage() {
  return (
    <>
      <PageMeta
        title="Page not found"
        description="There is nothing at this address."
        noIndex
      />
      <PageHeader
        title="Page not found"
        description="There is nothing at this address."
      />
      <ButtonLink to="/learn">Go to the learning tree</ButtonLink>
    </>
  );
}
