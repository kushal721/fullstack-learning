import type { ReactNode } from "react";
import { Link } from "react-router";

type Props = {
  to: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
};

const variantClasses = {
  primary: "bg-accent text-white hover:opacity-90 dark:text-black",
  secondary: "border border-border hover:bg-foreground/5",
};

/**
 * A link that looks like a button. Use it for navigation ("Start learning");
 * use a real <button> for actions that don't change the page.
 */
export function ButtonLink({ to, variant = "primary", children }: Props) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${variantClasses[variant]}`}
    >
      {children}
    </Link>
  );
}
