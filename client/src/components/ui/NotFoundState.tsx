import { ButtonLink } from "./ButtonLink.tsx";
import { PageHeader } from "./PageHeader.tsx";

type Props = {
  title?: string;
  message?: string;
};

/** Shown when the API says the requested item (topic, concept…) doesn't exist. */
export function NotFoundState({
  title = "Not found",
  message = "We couldn't find what you were looking for.",
}: Props) {
  return (
    <>
      <PageHeader title={title} description={message} />
      <ButtonLink to="/learn">Go to the learning tree</ButtonLink>
    </>
  );
}
