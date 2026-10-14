import { Link } from "react-router";
import { SearchLauncher } from "../search/SearchLauncher.tsx";
import { MobileNav } from "./MobileNav.tsx";
import { navItems } from "./nav-items.ts";
import { NavItemLink } from "./NavItemLink.tsx";

export function SiteHeader() {
  return (
    <header className="relative border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-semibold tracking-tight">
          Full-Stack Learning
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavItemLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <SearchLauncher />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
