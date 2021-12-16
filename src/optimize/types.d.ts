import type { error } from "../types";

interface FileHandle {
  readonly path: string;
}

interface FileReader {
  listFiles(): Iterable<FileHandle>;
  readFile(file: FileHandle): Promise<[string, error]>;
}

interface FileSystem extends FileReader, FileWriter { }

interface FileWriter {
  writeFile(file: FileHandle, content: string): Promise<error>;
}

interface OptimizeProjectData {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface OptimizedFileHandle extends ReadFileHandle {
  readonly optimizedContent: string;
}

interface Optimizer {
  optimize(s: string): Promise<[string, error]>;
}

interface ReadFileHandle extends FileHandle {
  readonly content: string;
}

export type {
  error,
  FileHandle,
  FileReader,
  FileWriter,
  FileSystem,
  OptimizeProjectData,
  OptimizedFileHandle,
  Optimizer,
  ReadFileHandle,
};
