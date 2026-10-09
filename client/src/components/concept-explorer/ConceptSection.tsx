import type { ReactNode } from "react";
import { RichText } from "../ui/RichText.tsx";

type Props = {
  /** Used for the heading id, so sections can be linked: #why */
  id: string;
  title: string;
  children: ReactNode;
};

/** One titled section of a concept page. Every concept uses the same ones. */
export function ConceptSection({ id, title, children }: Props) {
  return (
    <section aria-labelledby={id} className="scroll-mt-6">
      <h2 id={id} className="mb-3 text-xl font-semibold">
        {title}
      </h2>
      <div className="flex flex-col gap-3 leading-7">{children}</div>
    </section>
  );
}

/** Paragraphs of content text (inline `code` supported). */
export function Paragraphs({ items }: { items: string[] }) {
  return items.map((text, index) => (
    <p key={index}>
      <RichText text={text} />
    </p>
  ));
}

/** A bulleted list of content text. */
export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-6">
      {items.map((text, index) => (
        <li key={index}>
          <RichText text={text} />
        </li>
      ))}
    </ul>
  );
}
