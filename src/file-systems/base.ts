/* eslint-disable security/detect-non-literal-fs-filename */

import type { error } from "../types";
import type {
  FileHandle,
  FileSystem,
  ListFilesFn,
  ReadFileFn,
  WriteFileFn,
} from "./types";

import errors from "../errors";

interface Params {
  fs: {
    existsSync(path: string): boolean;
    lstatSync(path: string): {
      isFile(): boolean;
    };
    readdirSync(path: string): Iterable<string>;
    readFileSync(path: string): Buffer;
    writeFileSync(path: string, content: string): void;
  };
  path: {
    resolve(...paths: string[]): string;
  };
}

const LIST_FILES_ALWAYS_IGNORE: string[] = [
  ".git",
  "node_modules",
];

function newListFiles({ fs, path }: Params): ListFilesFn {
  const projectRoot = path.resolve(".");

  function* helper(fileOrFolder: string): Iterable<FileHandle> {
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
          path: entryPath.replace(`${projectRoot}/`, ""),
        };
      } else {
        yield* helper(entryPath);
      }
    }
  }

  return function*() {
    yield* helper(projectRoot);
  };
}

function newReadFile({ fs }: Params): ReadFileFn {
  return async function(file: FileHandle): Promise<[string, error]> {
    return new Promise((resolve) => {
      if (!fs.existsSync(file.path)) {
        const err = errors.New("file not found");
        resolve(["", err]);
      } else {
        let content = "";
        let err: error = null;

        try {
          const buffer = fs.readFileSync(file.path);
          content = buffer.toString();
        } catch (thrownError) {
          err = errors.New(`cannot read file '${file.path}' (${thrownError})`);
        }

        resolve([content, err]);
      }
    });
  };
}

function newWriteFile({ fs }: Params): WriteFileFn {
  return async function(
    file: FileHandle,
    content: string,
  ): Promise<error> {
    return new Promise((resolve) => {
      let err: error = null;

      try {
        fs.writeFileSync(file.path, content);
      } catch (thrownError) {
        err = errors.New(`cannot write file '${file.path}' (${thrownError})`);
      }

      resolve(err);
    });
  };
}

function NewBaseFileSystem(params: Params): FileSystem  {
  return {
    listFiles: newListFiles(params),
    readFile: newReadFile(params),
    writeFile: newWriteFile(params),
  };
}

export default NewBaseFileSystem;
