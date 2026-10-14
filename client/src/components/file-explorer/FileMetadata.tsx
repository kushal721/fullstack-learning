import type { FileResponse } from "@fsl/shared";
import { Link } from "react-router";
import { RichText } from "../ui/RichText.tsx";
import { LayerBadge } from "./LayerBadge.tsx";

/**
 * "About this file": what it does, why the project needs it, and the
 * concepts a learner meets in it (spec §42: always answer "why does this
 * file exist?").
 */
export function FileMetadata({ file, concepts }: FileResponse) {
  return (
    <aside
      aria-labelledby="file-about"
      className="flex flex-col gap-4 rounded-lg border border-border p-4 text-sm leading-6"
    >
      <h2 id="file-about" className="text-base font-semibold">
        About this file
      </h2>

      <div className="flex flex-col gap-1">
        <h3 className="font-medium">What it does</h3>
        <p>
          <RichText text={file.purpose} />
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-medium">Why it exists</h3>
        <p>
          <RichText text={file.whyItExists} />
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-medium">Part of</h3>
        <div>
          <LayerBadge layer={file.layer} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-medium">Concepts in this file</h3>
        {concepts.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {concepts.map((concept) => (
              <li key={concept.id}>
                <Link
                  to={`/concepts/${concept.slug}`}
                  className="inline-flex min-h-6 items-center text-accent underline"
                >
                  {concept.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No concepts linked yet.</p>
        )}
      </div>
    </aside>
  );
}
