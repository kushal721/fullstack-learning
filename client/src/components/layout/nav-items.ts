// The main sections of the platform. SiteHeader and MobileNav both read this
// list, so a section is added or renamed in exactly one place.
export type NavItem = { to: string; label: string };

export const navItems: NavItem[] = [
  { to: "/learn", label: "Learn" },
  { to: "/concepts", label: "Concepts" },
  { to: "/build", label: "Build" },
  { to: "/explorer", label: "Explorer" },
  { to: "/project", label: "Project" },
  { to: "/flow", label: "Flow" },
];
