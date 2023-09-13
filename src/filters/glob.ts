import type { FilterFn } from "./types";

import { create } from "@actions/glob";

async function NewGlobFilter(glob: string): Promise<FilterFn> {
  const globber = await create(glob, { followSymbolicLinks: false });
  const matchedFiles = await globber.glob();
  return (filepath: string): boolean => {
    return !matchedFiles.some((matchedFile) => matchedFile.endsWith(filepath));
  };
}

export default NewGlobFilter;
