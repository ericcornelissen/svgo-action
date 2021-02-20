/* eslint-disable security/detect-non-literal-fs-filename */

import * as fs from "fs";
import * as path from "path";

const LIST_FILES_ALWAYS_IGNORE: string[] = [".git"];

export async function readFile(file: FileInfo): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(file.path)) {
      reject(new Error("file not found"));
    } else {
      const buffer = fs.readFileSync(file.path);
      const content = buffer.toString();
      resolve(content);
    }
  });
}

export async function writeFile(
  file: FileInfo,
  content: string,
): Promise<void> {
  return new Promise((resolve, _) => {
    fs.writeFileSync(file.path, content);
    resolve();
  });
}

export function* listFiles(fileOrFolder: string): Iterable<FileInfo> {
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

export type FileInfo = {
  readonly path: string;
  readonly extension: string;
}

export type FileSystem = {
  listFiles(fileOrFolder: string, recursive?: boolean): Iterable<FileInfo>
  readFile(file: FileInfo): Promise<string>;
  writeFile(file: FileInfo, content: string): Promise<void>;
}
