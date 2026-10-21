// The main sections of the platform. The header, the mobile menu and the
// home page all read this list, so a section is added or renamed in one place.
export type NavItem = { to: string; label: string; description: string };

export const navItems: NavItem[] = [
  {
    to: "/learn",
    label: "Learn",
    description:
      "Every topic in short, numbered steps, from Basic to Advanced, with every word explained.",
  },
  {
    to: "/course-map",
    label: "Course map",
    description: "The whole course: every topic, its three levels and steps.",
  },
  {
    to: "/flow",
    label: "Flow",
    description: "Follow data from a click to the database and back.",
  },
  {
    to: "/explorer",
    label: "Explorer",
    description:
      "Read the Notes App code, trace how it connects and watch it grow.",
  },
  {
    to: "/build",
    label: "Build",
    description: "Build the Notes App step by step, from an empty folder.",
  },
];
