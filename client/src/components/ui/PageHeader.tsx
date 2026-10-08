import type { ReactNode } from "react";
import { RichText } from "./RichText.tsx";

type Props = {
  title: string;
  description?: string;
  /** Small element above the title, e.g. a section name or a Badge. */
  eyebrow?: ReactNode;
};

/**
 * The top of every page: one <h1> and a short description, so every page
 * starts the same way and has exactly one main heading.
 */
export function PageHeader({ title, description, eyebrow }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      {eyebrow && <div className="text-sm text-muted">{eyebrow}</div>}
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="max-w-2xl text-lg leading-8 text-muted">
          <RichText text={description} />
        </p>
      )}
    </div>
  );
}
