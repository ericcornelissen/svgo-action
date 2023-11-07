// SPDX-License-Identifier: MIT

import type { GitFileInfo } from "../../src/clients/types";

function createFilesList(length: number): Iterable<GitFileInfo> {
  const result: GitFileInfo[] = [];
  for (let _ = 0; _ < length; _++) {
    result.push({
      status: "added",
      filename: "foo.bar",
    });
  }

  return result;
}

export {
  createFilesList,
};
