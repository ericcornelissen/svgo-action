// SPDX-License-Identifier: MIT

import type { FilterFn } from "./types";

const SVG_FILE_EXTENSION = ".svg";

function NewSvgsFilter(): FilterFn {
  return (filepath: string): boolean => {
    return filepath.endsWith(SVG_FILE_EXTENSION);
  };
}

export default NewSvgsFilter;
