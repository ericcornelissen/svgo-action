/* eslint-disable security/detect-non-literal-fs-filename */

import type { FileInfo, FileSystem } from "./types";

import * as fs from "fs";
import * as path from "path";

const LIST_FILES_ALWAYS_IGNORE: string[] = [
  ".git",
  "node_modules",
  "vendor",
];

async function readFile(file: FileInfo | string): Promise<string> {
  let filePath: string;
  if (typeof file === "string") {
    filePath = file;
  } else {
    filePath = file.path;
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error("file not found"));
    } else {
      const buffer = fs.readFileSync(filePath);
      const content = buffer.toString();
      resolve(content);
    }
  });
}

async function writeFile(
  file: FileInfo,
  content: string,
): Promise<void> {
  return new Promise((resolve, _) => {
    fs.writeFileSync(file.path, content);
    resolve();
  });
}

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

export const BaseFileSystem: FileSystem = {
  listFiles,
  readFile,
  writeFile,
};
