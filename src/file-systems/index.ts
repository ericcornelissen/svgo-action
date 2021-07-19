import type { FileSystem } from "./types";

import * as path from "path";

import { BaseFileSystem } from "./base";
import { createPrFileSystemBuilder } from "./pr";

export const newPullRequest = createPrFileSystemBuilder(BaseFileSystem, path);
export const newStandard = (): FileSystem => BaseFileSystem;

export type { FileInfo, FileSystem } from "./types";
