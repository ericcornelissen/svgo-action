import type {
  FileHandle,
  FileSystem,
  ListFilesFn,
  ReadFileFn,
  WriteFileFn,
} from "./types";
import type { error } from "../errors";

import { LIST_FILES_ALWAYS_IGNORE } from "./constants";
import errors from "../errors";

interface Params {
  readonly fs: {
    existsSync(path: string): boolean;
    lstatSync(path: string): {
      isFile(): boolean;
    };
    openSync(path: string, flags: "r" | "w"): number;
    readdirSync(path: string): Iterable<string>;
    readFileSync(handle: number): Buffer;
    writeFileSync(handle: number, content: string): void;
  };
  readonly path: {
    resolve(...paths: string[]): string;
  };
}

function includeInFolderIteration(entryPath: string, { fs }: Params): boolean {
  if (LIST_FILES_ALWAYS_IGNORE.some((file) => entryPath.endsWith(file))) {
    return false;
  }

  if (!fs.existsSync(entryPath)) {
    return false;
  }

  return true;
}

function* listFolderEntries(folder: string, params: Params): Iterable<string> {
  const { fs, path } = params;
  for (const entry of fs.readdirSync(folder)) {
    const entryPath = path.resolve(folder, entry);
    if (includeInFolderIteration(entryPath, params)) {
      yield entryPath;
    }
  }
}

function* iterateFolderRecursively(
  folder: string,
  params: Params,
): Iterable<FileHandle> {
  const { fs } = params;
  for (const entryPath of listFolderEntries(folder, params)) {
    const lstat = fs.lstatSync(entryPath);
    if (lstat.isFile()) {
      yield { path: entryPath };
    } else {
      yield* iterateFolderRecursively(entryPath, params);
    }
  }
}

function newListFiles(params: Params): ListFilesFn {
  const { path } = params;
  const projectRoot = path.resolve(".");
  return function*() {
    for (const entry of iterateFolderRecursively(projectRoot, params)) {
      yield {
        path: entry.path.replace(`${projectRoot}/`, ""),
      };
    }
  };
}

function newReadFile({ fs }: Params): ReadFileFn {
  return async function(file: FileHandle): Promise<[string, error]> {
    return new Promise((resolve) => {
      let content = "";
      let err: error = null;
      try {
        const fileHandle = fs.openSync(file.path, "r");

        try {
          const buffer = fs.readFileSync(fileHandle);
          content = buffer.toString();
        } catch (thrownError) {
          err = errors.New(`cannot read file '${file.path}' (${thrownError})`);
        }
      } catch (thrownError) {
        err = errors.New("file not found");
      }

      resolve([content, err]);
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
        const fileHandle = fs.openSync(file.path, "w");

        try {
          fs.writeFileSync(fileHandle, content);
        } catch (thrownError) {
          err = errors.New(`cannot write file '${file.path}' (${thrownError})`);
        }
      } catch (thrownError) {
        err = errors.New("cannot open file");
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
