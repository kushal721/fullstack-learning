import type { FileSummary, SymbolSummary } from "@fsl/shared";

// Explorer URLs for symbols and files, shared by the graph and the details.

/** A symbol's connections, with its file open at its line. */
export function explorerSymbolHref(symbol: SymbolSummary) {
  const params = new URLSearchParams({ symbol: symbol.id });
  if (symbol.fileId) params.set("file", symbol.fileId);
  if (symbol.fileId && symbol.line) params.set("line", String(symbol.line));
  return `/explorer?${params}`;
}

/** A file in the Explorer, at its line when known. */
export function explorerFileHref(file: FileSummary) {
  const params = new URLSearchParams({ file: file.id });
  if (file.line) params.set("line", String(file.line));
  return `/explorer?${params}`;
}
