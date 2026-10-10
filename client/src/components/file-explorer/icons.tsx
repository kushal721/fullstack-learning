// Small inline icons (no icon library). Decorative: the item's name is the
// accessible text, so the icons are hidden from screen readers.
const common = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  "aria-hidden": true,
} as const;

export function FolderIcon({ open }: { open: boolean }) {
  return open ? (
    <svg {...common}>
      <path d="M1.5 4.5v8h11l2-5.5H4l-1 2.5" strokeLinejoin="round" />
      <path d="M1.5 4.5v-1h4l1.5 1.5h5.5v2" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M1.5 3.5h4l1.5 1.5h7.5v7.5h-13z" strokeLinejoin="round" />
    </svg>
  );
}

export function FileIcon() {
  return (
    <svg {...common}>
      <path d="M4 1.5h5.5L13 5v9.5H4z" strokeLinejoin="round" />
      <path d="M9.5 1.5V5H13" strokeLinejoin="round" />
    </svg>
  );
}
