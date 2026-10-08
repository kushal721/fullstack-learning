import { NavLink } from "react-router";
import type { NavItem } from "./nav-items.ts";

type Props = { item: NavItem; onNavigate?: () => void; className?: string };

// NavLink sets aria-current="page" on the link for the current section, which
// both styles it and tells screen readers where the learner is.
export function NavItemLink({ item, onNavigate, className = "" }: Props) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-accent/10 text-accent"
            : "text-muted hover:bg-foreground/5 hover:text-foreground"
        } ${className}`
      }
    >
      {item.label}
    </NavLink>
  );
}
