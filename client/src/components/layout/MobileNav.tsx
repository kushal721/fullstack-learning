import { useState } from "react";
import { navItems } from "./nav-items.ts";
import { NavItemLink } from "./NavItemLink.tsx";

// Below the `md` breakpoint the navigation collapses behind a menu button.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden" onKeyDown={(e) => e.key === "Escape" && close()}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-foreground/5 hover:text-foreground"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-border bg-background px-4 py-3 shadow-sm"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavItemLink item={item} onNavigate={close} className="block" />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
