/* eslint-disable security/detect-non-literal-fs-filename */

import type { error } from "../types";
import type { FileInfo, FileSystem } from "./types";

import * as fs from "fs";
import * as path from "path";

import errors from "../errors";

const LIST_FILES_ALWAYS_IGNORE: string[] = [
  ".git",
  "node_modules",
  "vendor",
];

function* listFiles(fileOrFolder: string): Iterable<FileInfo> {
  for (const entry of fs.readdirSync(fileOrFolder)) {
    if (LIST_FILES_ALWAYS_IGNORE.includes(entry)) {
      continue;
    }

    const entryPath = path.resolve(fileOrFolder, entry);
    if (!fs.existsSync(entryPath)) {
      continue;
    }

    const lstat = fs.lstatSync(entryPath);
    if (lstat.isFile()) {
      yield {
        path: entryPath,
        extension: path.extname(entryPath),
      };
    } else {
      yield* listFiles(entryPath);
    }
  }
}

async function readFile(file: FileInfo | string): Promise<[string, error]> {
  let filePath: string;
  if (typeof file === "string") {
    filePath = file;
  } else {
    filePath = file.path;
  }

  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      const err = errors.New("file not found");
      resolve(["", err]);
    } else {
      let content = "";
      let err: error = null;

      try {
        const buffer = fs.readFileSync(filePath);
        content = buffer.toString();
      } catch (thrownError) {
        err = errors.New(`could not read file '${filePath}' (${thrownError})`);
      }

      resolve([content, err]);
    }
  });
}

async function writeFile(
  file: FileInfo,
  content: string,
): Promise<error> {
  return new Promise((resolve, _) => {
    let err: error = null;

    try {
      fs.writeFileSync(file.path, content);
    } catch (thrownError) {
      err = errors.New(`could not write file '${file.path}' (${thrownError})`);
    }

    resolve(err);
  });
}

export const BaseFileSystem: FileSystem = {
  listFiles,
  readFile,
  writeFile,
};
