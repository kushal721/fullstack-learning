// The main sections of the platform. The header, the mobile menu and the
// home page all read this list, so a section is added or renamed in one place.
export type NavItem = { to: string; label: string; description: string };

export const navItems: NavItem[] = [
  {
    to: "/learn",
    label: "Learn",
    description: "The learning tree: a map of everything full-stack.",
  },
  {
    to: "/concepts",
    label: "Concepts",
    description: "Each idea explained from the basics, with real code.",
  },
  {
    to: "/build",
    label: "Build",
    description: "Build the Notes App step by step, from an empty folder.",
  },
  {
    to: "/explorer",
    label: "Explorer",
    description: "Read the Notes App code and trace how it connects.",
  },
  {
    to: "/project",
    label: "Project",
    description: "Watch the project grow file by file.",
  },
  {
    to: "/flow",
    label: "Flow",
    description: "Follow data from a click to the database and back.",
  },
];
