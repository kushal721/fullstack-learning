import type { ReactNode } from "react";
import { Link } from "react-router";

type Props = {
  title: string;
  children?: ReactNode;
  /** When set, the whole card is a link to this path. */
  to?: string;
};

const base = "block rounded-lg border border-border p-4 transition-colors";

/** A bordered box for one item in a list of topics, concepts, steps, … */
export function Card({ title, children, to }: Props) {
  const content = (
    <>
      <h3 className="font-medium">{title}</h3>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${base} hover:border-accent hover:bg-accent/5`}>
        {content}
      </Link>
    );
  }
  return <div className={base}>{content}</div>;
}
