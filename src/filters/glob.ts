import type { FilterFn } from "./types";

import { Minimatch } from "minimatch";

function NewGlobFilter(glob: string): FilterFn {
  const ignoreMatcher = new Minimatch(glob);
  return (filepath: string): boolean => {
    return !ignoreMatcher.match(filepath);
  };
}

export default NewGlobFilter;
