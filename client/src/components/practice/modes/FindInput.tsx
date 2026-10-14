import type { FileSymbolsResponse, FileTreeResponse } from "@fsl/shared";
import { useState } from "react";
import { useApi } from "../../../hooks/useApi.ts";
import { apiPaths } from "../../../services/api.ts";
import { FileTree } from "../../file-explorer/FileTree.tsx";
import { ErrorState } from "../../ui/ErrorState.tsx";
import { Loading } from "../../ui/Loading.tsx";
import type { ModeInputProps } from "../mode-inputs.ts";
import { symbolLabel } from "./symbol-label.ts";

const fileName = (path: string) => path.split("/").at(-1) ?? path;

/**
 * Find a file, or a symbol inside one, in the Notes App's file tree. For a
 * symbol, picking a file lists the symbols defined in it to choose from.
 */
export function FindInput({
  exercise,
  answer,
  onChange,
  result,
}: ModeInputProps) {
  const isFind = "target" in exercise;
  const tree = useApi<FileTreeResponse>(isFind ? apiPaths.fileTree() : null);
  const [file, setFile] = useState<string | null>(null);
  const wantsSymbol = isFind && exercise.target === "symbol";
  const symbols = useApi<FileSymbolsResponse>(
    wantsSymbol && file ? apiPaths.fileSymbols(file) : null,
  );
  if (!isFind) return null;

  const chosen = answer && "id" in answer ? answer.id : null;
  const accepted =
    result?.expected && "ids" in result.expected ? result.expected.ids : null;
  const done = result !== null;

  function pickFile(path: string) {
    if (done) return;
    setFile(path);
    // A file is the answer itself, or the place to look for the symbol.
    onChange(wantsSymbol ? null : { id: path });
  }

  const describe = (id: string) =>
    wantsSymbol ? (
      <>
        <span className="text-xs text-muted">{symbolLabel(id).kind}</span>{" "}
        <code className="font-mono">{symbolLabel(id).name}</code>
      </>
    ) : (
      <code className="font-mono [overflow-wrap:anywhere]">{id}</code>
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        {wantsSymbol
          ? "Open the file you think defines it, then pick the function or piece of code."
          : "Pick the file in the Notes App."}
      </p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div className="max-h-[28rem] overflow-auto rounded-lg border border-border p-2">
          {tree.error ? (
            <ErrorState
              message={tree.error.message}
              onRetry={tree.reload}
              homeLink={false}
            />
          ) : tree.data ? (
            <FileTree
              tree={tree.data.tree}
              selectedPath={file}
              onSelect={pickFile}
              label="Pick a file"
            />
          ) : (
            <Loading label="Loading the files…" />
          )}
        </div>

        <div className="flex flex-col gap-3">
          {file && (
            <p>
              Selected file:{" "}
              <code className="font-mono [overflow-wrap:anywhere]">{file}</code>
            </p>
          )}
          {wantsSymbol && file && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 font-semibold">
                Defined in {fileName(file)}
              </legend>
              {symbols.isLoading && (
                <Loading label="Loading what this file defines…" />
              )}
              {symbols.data?.defined.length === 0 && (
                <p className="text-muted">
                  Nothing in this file is in the code graph. Try another file.
                </p>
              )}
              {symbols.data?.defined.map((symbol) => (
                <label
                  key={symbol.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
                >
                  <input
                    type="radio"
                    name={`find-${exercise.id}`}
                    checked={chosen === symbol.id}
                    disabled={done}
                    onChange={() => onChange({ id: symbol.id })}
                    className="accent-accent"
                  />
                  <span>
                    <span className="text-xs text-muted">
                      {symbolLabel(symbol.id).kind}
                    </span>{" "}
                    <code className="font-mono">{symbol.name}</code>
                    {symbol.line && (
                      <span className="text-xs text-muted">
                        {" "}
                        · line {symbol.line}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>
          )}
          {accepted && (
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <p>
                <span className="font-semibold">Right answer: </span>
                {accepted.map((id, i) => (
                  <span key={id}>
                    {i > 0 && " or "}
                    {describe(id)}
                  </span>
                ))}
              </p>
              {chosen && !accepted.includes(chosen) && (
                <p className="text-sm text-muted">
                  Your choice: {describe(chosen)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
