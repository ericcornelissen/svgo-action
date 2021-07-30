import { Minimatch } from "minimatch";

type FilterFn = (filepath: string) => boolean;

function NewGlobFilter(glob: string): FilterFn {
  const ignoreMatcher = new Minimatch(glob);
  return function(filepath: string): boolean {
    return !ignoreMatcher.match(filepath);
  };
}

export default NewGlobFilter;
