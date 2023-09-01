import type { FileFilter, FileSystem } from "./types";

import * as fs from "node:fs";
import * as path from "node:path";

import NewBaseFileSystem from "./base";
import NewFilteredFileSystem from "./filtered";

interface Params {
  readonly filters: Iterable<FileFilter>;
}

function New({ filters }: Params): FileSystem {
  const baseFs = NewBaseFileSystem({ fs, path });
  const newFs = NewFilteredFileSystem({ fs: baseFs, filters });
  return newFs;
}

export default {
  New,
};

export type {
  FileSystem,
};
