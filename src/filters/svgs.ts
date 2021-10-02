import type { FilterFn } from "./types";

function NewSvgsFilter(): FilterFn {
  return function(filepath: string): boolean {
    return filepath.endsWith(".svg");
  };
}

export default NewSvgsFilter;
