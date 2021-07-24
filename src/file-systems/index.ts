import type { error } from "../types";
import type { FileHandle, FileSystem } from "./types";

import * as fs from "fs";
import * as path from "path";

import NewBaseFileSystem from "./base";
import NewFilteredFileSystem from "./filtered";

interface Params {
  readonly filters: FileFilter[];
}

type FileFilter = (filepath: string) => boolean;

function New(): FileSystem {
  const newFs = NewBaseFileSystem({ fs, path });
  return newFs;
}

function NewFiltered({ filters }: Params): [FileSystem, error] {
  const fs = New();
  const filteredFs = NewFilteredFileSystem({ fs, filters });
  return [filteredFs, null];
}

export default {
  New,
  NewFiltered,
};

export type {
  FileHandle,
  FileSystem,
};
