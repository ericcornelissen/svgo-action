import type { FilterFn } from "./types";

import { create } from "@actions/glob";

async function NewGlobFilter(glob: string): Promise<FilterFn> {
  const globber = await create(glob, { followSymbolicLinks: false });
  const ignoreMatcher = await globber.glob();
  return (filepath: string): boolean => {
    return !ignoreMatcher.includes(filepath);
  };
}

export default NewGlobFilter;
