import type {
  Client,
  Context,
  FileInfo,
  FileSystem,
  ListFilesFn,
} from "./types";

type Path = {
  resolve(...args: string[]): string;
}

async function getPrFiles(
  client: Client,
  context: Context,
): Promise<string[]> {
  const result: string[] = [];
  const perPage = 100;
  let curPage = 0;

  while (true) { // eslint-disable-line no-constant-condition
    curPage++;

    const { data } = await client.rest.pulls.listFiles({
      ...context.repo,
      pull_number: context.payload.pull_request?.number as number,
      per_page: perPage,
      page: curPage,
    });

    const files = data
      .filter((entry) => entry.status !== "removed")
      .map((entry) => entry.filename);
    result.push(...files);

    if (data.length < perPage) {
      return result;
    }
  }
}

function createListFiles(
  fs: FileSystem,
  files: string[],
): ListFilesFn {
  return function*(fileOrFolder: string): Iterable<FileInfo> {
    for (const entry of fs.listFiles(fileOrFolder)) {
      if (files.includes(entry.path)) {
        yield entry;
      }
    }
  };
}

export function createPrFileSystemBuilder(
  fs: FileSystem,
  path: Path,
) {
  return async function(
    client: Client,
    context: Context,
  ): Promise<FileSystem> {
    const prFiles = await getPrFiles(client, context);
    const prFilePaths = prFiles.map((file) => path.resolve(".", file));

    return {
      listFiles: createListFiles(fs, prFilePaths),
      readFile: fs.readFile,
      writeFile: fs.writeFile,
    };
  };
}
