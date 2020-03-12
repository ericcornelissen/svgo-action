import { existingFiles, svgFiles } from "../src/filters";
import { FileInfo } from "../src/github-api";


const EMPTY_ARRAY = [];

const STATUS_ADDED = "added";
const STATUS_MODIFIED = "modified";
const STATUS_REMOVED = "removed";


describe("::existingFiles", () => {

  test("empty array", () => {
    const result = EMPTY_ARRAY.filter(existingFiles);
    expect(result).toEqual(EMPTY_ARRAY);
  });

  test(`only ${STATUS_ADDED} files`, () => {
    const files: FileInfo[] = [
      { path: "foo.bar", status: STATUS_ADDED },
      { path: "test.svg", status: STATUS_ADDED },
    ];

    const result = files.filter(existingFiles);
    expect(result).toEqual(files);
  });

  test(`only ${STATUS_MODIFIED} files`, () => {
    const files: FileInfo[]  = [
      { path: ".gitignore", status: STATUS_MODIFIED },
      { path: "main.ts", status: STATUS_MODIFIED },
    ];

    const result = files.filter(existingFiles);
    expect(result).toEqual(files);
  });

  test(`only ${STATUS_REMOVED} files`, () => {
    const files: FileInfo[]  = [
      { path: "jest.config.js", status: STATUS_REMOVED },
      { path: "optimized.svg", status: STATUS_REMOVED },
    ];

    const result = files.filter(existingFiles);
    expect(result).toEqual(EMPTY_ARRAY);
  });

  test(`mix of ${STATUS_ADDED}, ${STATUS_MODIFIED}, and ${STATUS_REMOVED} files`, () => {
    const files: FileInfo[]  = [
      { path: "foo.bar", status: STATUS_ADDED },
      { path: "optimized.svg", status: STATUS_REMOVED },
      { path: ".gitignore", status: STATUS_MODIFIED },
      { path: "jest.config.js", status: STATUS_REMOVED },
      { path: "test.svg", status: STATUS_ADDED },
      { path: "main.ts", status: STATUS_MODIFIED },
    ];

    const result = files.filter(existingFiles);
    expect(result).toEqual([
      { path: "foo.bar", status: STATUS_ADDED },
      { path: ".gitignore", status: STATUS_MODIFIED },
      { path: "test.svg", status: STATUS_ADDED },
      { path: "main.ts", status: STATUS_MODIFIED },
    ]);
  });

});

describe("::svgFiles", () => {

  test("empty array", () => {
    const result = EMPTY_ARRAY.filter(svgFiles);
    expect(result).toEqual(EMPTY_ARRAY);
  });

  test("non-empty array with SVGs only", () => {
    const files: FileInfo[]  = [
      { path: "foo.svg", status: STATUS_MODIFIED },
      { path: "bar.svg", status: STATUS_ADDED },
      { path: "test.svg", status: STATUS_REMOVED },
    ];

    const result = files.filter(svgFiles);
    expect(result).toEqual(files);
  });

  test("non-empty array with SVGs and other files", () => {
    const files: FileInfo[]  = [
      { path: "foo.svg", status: STATUS_MODIFIED },
      { path: "guppy.c++", status: STATUS_ADDED },
      { path: "test.svg", status: STATUS_REMOVED },
      { path: "hypnot.oad", status: STATUS_MODIFIED },
    ];

    const result = files.filter(svgFiles);
    expect(result).toEqual([
      { path: "foo.svg", status: STATUS_MODIFIED },
      { path: "test.svg", status: STATUS_REMOVED },
    ]);
  });

  test("non-empty array without SVGs", () => {
    const files: FileInfo[]  = [
      { path: "sapnu.puas", status: STATUS_ADDED },
      { path: "dead.beef", status: STATUS_MODIFIED },
      { path: "this-is-not-an.svg.pdf", status: STATUS_MODIFIED },
      { path: "high.dragun", status: STATUS_ADDED },
    ];

    const result = files.filter(svgFiles);
    expect(result).toEqual(EMPTY_ARRAY);
  });

  test("non-conventional filenames", () => {
    const files: FileInfo[]  = [
      { path: ".dotfile-but.svg", status: STATUS_ADDED },
      { path: ".dotfile-not-svg.txt", status: STATUS_MODIFIED },
    ];

    const result = files.filter(svgFiles);
    expect(result).toEqual([
      { path: ".dotfile-but.svg", status: STATUS_ADDED },
    ]);
  });

  test("filters dotfiles (.*)", () => {
    const files: FileInfo[]  = [
      { path: ".editorconfig", status: STATUS_ADDED },
      { path: ".gitignore", status: STATUS_MODIFIED },
    ];

    const result = files.filter(svgFiles);
    expect(result).toEqual(EMPTY_ARRAY);
  });

});
