import type { Scene, SceneStep } from "@fsl/shared";
import { useEffect, useRef, useState } from "react";

type Props = {
  scene: Scene;
  /** Start with the text list folded (for steps; the overview shows it). */
  compact?: boolean;
};

const SPEEDS = [1, 1.5, 0.75];
const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

type Box = { x: number; y: number; cx: number; cy: number };

/** Where each actor's box goes: a row on wide screens, a column on phones. */
function layout(scene: Scene, vertical: boolean) {
  const n = scene.actors.length;
  const boxW = vertical ? 196 : 170;
  const boxH = vertical ? 64 : 74;
  const W = vertical ? 360 : 960;
  const H = vertical ? 24 + n * 118 : 260;
  const boxes = new Map<string, Box>();
  scene.actors.forEach((actor, i) => {
    if (vertical) {
      const x = (W - boxW) / 2;
      const y = 24 + i * 118;
      boxes.set(actor.id, { x, y, cx: W / 2, cy: y + boxH / 2 });
    } else {
      const gap = n > 1 ? (W - 40 - n * boxW) / (n - 1) : 0;
      const x = 20 + i * (boxW + gap);
      const y = (H - boxH) / 2;
      boxes.set(actor.id, { x, y, cx: x + boxW / 2, cy: y + boxH / 2 });
    }
  });
  return { boxes, boxW, boxH, W, H };
}

/** The curve a message travels: requests arc above, answers below. */
function route(
  step: SceneStep,
  { boxes, boxW, boxH, W }: ReturnType<typeof layout>,
  vertical: boolean,
) {
  const a = boxes.get(step.from)!;
  const b = boxes.get(step.to)!;
  if (vertical) {
    const side = b.cy >= a.cy ? 1 : -1;
    const x = W / 2 + side * (boxW / 2);
    const cx = W / 2 + side * (boxW / 2 + 70);
    // A message to itself loops out and back.
    const by = b.cy === a.cy ? a.cy + 40 : b.cy;
    return `M ${x} ${a.cy} C ${cx} ${a.cy} ${cx} ${by} ${x} ${by}`;
  }
  const forward = b.cx >= a.cx;
  const y = forward ? a.y - 4 : a.y + boxH + 4;
  const bulge = forward ? -150 : 150;
  const bx = b.cx === a.cx ? a.cx + 60 : b.cx;
  return `M ${a.cx} ${y} Q ${(a.cx + bx) / 2} ${y + bulge} ${bx} ${y}`;
}

/**
 * A scene as a small animated flowchart: boxes for the actors and one
 * message moving at a time. Play runs it; Previous / Next step by hand;
 * every move is also listed as text. With reduced motion the message
 * jumps instead of gliding.
 */
export function ScenePlayer({ scene, compact = false }: Props) {
  const [vertical, setVertical] = useState(
    () => window.matchMedia?.("(max-width: 639px)").matches ?? false,
  );
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pathRef = useRef<SVGPathElement>(null);
  const pillRef = useRef<SVGGElement>(null);

  const geometry = layout(scene, vertical);
  const step = current >= 0 ? scene.steps[current] : undefined;
  const last = scene.steps.length - 1;
  const label = step?.message ?? "";
  const pillW = Math.max(70, label.length * 7.8 + 22);

  // Switch between the row and the column when the screen size changes.
  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 639px)");
    if (!query) return;
    const onChange = () => setVertical(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Move the message along its curve, stopping short of the arrow's end so
  // the label never covers the receiver's name.
  useEffect(() => {
    const path = pathRef.current;
    const pill = pillRef.current;
    if (!step || !path || !pill || typeof path.getTotalLength !== "function") {
      return;
    }
    const length = path.getTotalLength();
    const stopAt = vertical ? 0.62 : 0.82;
    const duration = prefersReducedMotion() ? 0 : 1100 / speed;
    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const p = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      const point = path.getPointAtLength(eased * length * stopAt);
      const half = pillW / 2 + 4;
      const x = Math.min(Math.max(point.x, half), geometry.W - half);
      pill.setAttribute("transform", `translate(${x} ${point.y - 13})`);
      if (p < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [step, vertical, speed, pillW, geometry.W]);

  // Playing: show the next move every 2.4 seconds (at 1×). It stops by
  // itself at the last move, so "playing" is worked out, not stored twice.
  const isPlaying = playing && current < last;
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(
      () => setCurrent((c) => c + 1),
      current < 0 ? 0 : 2400 / speed,
    );
    return () => clearTimeout(timer);
  }, [isPlaying, current, speed]);

  const show = (index: number) => {
    setPlaying(false);
    setCurrent(Math.max(0, Math.min(index, last)));
  };
  const togglePlay = () => {
    if (isPlaying) return setPlaying(false);
    if (current >= last) setCurrent(-1);
    setPlaying(true);
  };

  const button =
    "rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <figure className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-foreground/5 px-4 py-2 text-sm">
        <figcaption className="font-medium">{scene.title}</figcaption>
        <span className="ml-auto text-muted">
          {step
            ? `Step ${current + 1} of ${scene.steps.length}`
            : `${scene.steps.length} steps`}
        </span>
      </div>
      <div className="bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] px-2 py-3">
        <svg
          viewBox={`0 0 ${geometry.W} ${geometry.H}`}
          role="img"
          aria-label={`${scene.title}: an animation with ${scene.steps.length} steps, also listed below as text.`}
          className="block w-full"
        >
          {scene.actors.map((actor) => {
            const box = geometry.boxes.get(actor.id)!;
            const active =
              step && (actor.id === step.from || actor.id === step.to);
            return (
              <g key={actor.id}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={geometry.boxW}
                  height={geometry.boxH}
                  rx={8}
                  fill="var(--background)"
                  stroke={active ? "var(--accent)" : "var(--border)"}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <text
                  x={box.cx}
                  y={box.cy - (actor.sub ? 4 : -6)}
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize={16}
                  fontWeight={600}
                >
                  {actor.label}
                </text>
                {actor.sub && (
                  <text
                    x={box.cx}
                    y={box.cy + 16}
                    textAnchor="middle"
                    fill="var(--muted)"
                    fontSize={13}
                  >
                    {actor.sub}
                  </text>
                )}
              </g>
            );
          })}
          {step && (
            <>
              <path
                ref={pathRef}
                d={route(step, geometry, vertical)}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeDasharray="6 6"
                opacity={0.8}
              />
              <g ref={pillRef}>
                <rect
                  x={-pillW / 2}
                  width={pillW}
                  height={26}
                  rx={6}
                  fill="var(--accent)"
                />
                <text
                  y={17}
                  textAnchor="middle"
                  fill="var(--background)"
                  fontSize={13}
                  fontWeight={600}
                  fontFamily="ui-monospace, monospace"
                >
                  {label}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
      <div className="border-t border-border px-4 py-3" aria-live="polite">
        {step ? (
          <>
            <p className="font-medium">{step.caption}</p>
            {step.detail && <p className="text-sm text-muted">{step.detail}</p>}
          </>
        ) : (
          <>
            <p className="font-medium">Press Play to watch it happen.</p>
            <p className="text-sm text-muted">
              Or step through it one move at a time.
            </p>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          className={button}
          disabled={current <= 0}
          onClick={() => show(current - 1)}
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:text-black"
        >
          {isPlaying ? "⏸ Pause" : current >= last ? "↺ Replay" : "▶ Play"}
        </button>
        <button
          type="button"
          className={button}
          disabled={current >= last}
          onClick={() => show(current + 1)}
        >
          Next →
        </button>
        <button
          type="button"
          className={button}
          aria-label={`Speed: ${speed}×`}
          onClick={() =>
            setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]!)
          }
        >
          {speed}×
        </button>
      </div>
      <details open={!compact} className="border-t border-border">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium hover:bg-foreground/5">
          All {scene.steps.length} steps as text
        </summary>
        <ol className="flex flex-col gap-1 p-2">
          {scene.steps.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => show(i)}
                aria-current={i === current ? "step" : undefined}
                className={`flex w-full gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-foreground/5 ${
                  i === current ? "bg-accent/10" : ""
                }`}
              >
                <span className="w-5 shrink-0 text-right text-muted">
                  {i + 1}.
                </span>
                <span>
                  <span className="font-medium">{s.caption}</span>
                  {s.detail && <span className="text-muted"> {s.detail}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </details>
    </figure>
  );
}
