import type { ReactNode } from "react";

type Tone = "neutral" | "info" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-foreground/5 text-muted",
  info: "bg-accent/10 text-accent",
  success: "bg-green-600/10 text-green-800 dark:text-green-400",
  warning: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
};

/** A small label for status or category (e.g. "Coming soon", "frontend"). */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
